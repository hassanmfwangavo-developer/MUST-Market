import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sanitizeTzPhone } from "@/lib/phone";
import type { Json } from "@/integrations/supabase/types";

const MAX_QUANTITY = 20;

export type PendingOrderItemInput = {
  itemId: string;
  quantity: number;
  addSoda?: boolean;
};

export type CreatePendingOrderInput = {
  checkoutRequestId: string;
  items: PendingOrderItemInput[];
  customerName: string;
  phone: string;
  deliveryArea: string;
  room: string;
  bannerId?: string;
};

export type PendingOrderResult = {
  orderId: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentState: "pending" | "success" | "failed" | "not_configured";
};

type MenuAddon = { title: string; price: number };

function parseAddons(value: Json): MenuAddon[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (addon): addon is { [key: string]: Json | undefined } =>
        typeof addon === "object" && addon !== null && !Array.isArray(addon),
    )
    .map((addon) => ({
      title: typeof addon.title === "string" ? addon.title : "",
      price: typeof addon.price === "number" ? addon.price : Number(addon.price ?? 0),
    }))
    .filter((addon) => addon.title.length > 0 && Number.isInteger(addon.price) && addon.price >= 0);
}

function validateInput(input: CreatePendingOrderInput): CreatePendingOrderInput {
  if (!input || !Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("At least one food item is required");
  }
  if (!/^[0-9a-f-]{36}$/i.test(input.checkoutRequestId)) {
    throw new Error("Valid checkout request ID is required");
  }
  if (input.items.length > 50) throw new Error("Too many food items");
  if (typeof input.customerName !== "string" || !input.customerName.trim()) {
    throw new Error("Customer name is required");
  }
  if (typeof input.deliveryArea !== "string" || !input.deliveryArea.trim()) {
    throw new Error("Delivery area is required");
  }
  if (typeof input.room !== "string" || !input.room.trim()) {
    throw new Error("Room is required");
  }

  const phone = sanitizeTzPhone(input.phone);
  if (!/^255\d{9}$/.test(phone)) throw new Error("Invalid Tanzanian phone number");

  for (const item of input.items) {
    if (!item || typeof item.itemId !== "string" || !item.itemId) {
      throw new Error("Invalid menu item");
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      throw new Error("Invalid item quantity");
    }
    if (item.addSoda !== undefined && typeof item.addSoda !== "boolean") {
      throw new Error("Invalid add-on selection");
    }
  }

  return {
    ...input,
    customerName: input.customerName.trim().slice(0, 80),
    phone,
    deliveryArea: input.deliveryArea.trim().slice(0, 80),
    room: input.room.trim().slice(0, 80),
  };
}

export const createPendingOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CreatePendingOrderInput) => validateInput(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingOrder } = await supabaseAdmin
      .from("food_orders")
      .select("id, total_tsh, payment_status")
      .eq("user_id", context.userId)
      .eq("checkout_request_id", data.checkoutRequestId)
      .maybeSingle();
    if (existingOrder) {
      const { data: existingPayment } = await supabaseAdmin
        .from("payments")
        .select("status")
        .eq("food_order_id", existingOrder.id)
        .eq("provider", "sonic_pesa")
        .maybeSingle();
      return {
        orderId: existingOrder.id,
        subtotal: 0,
        discount: 0,
        deliveryFee: 0,
        total: existingOrder.total_tsh,
        paymentState:
          existingOrder.payment_status === "success"
            ? "success"
            : existingPayment?.status === "failed"
              ? "failed"
              : "pending",
      } satisfies PendingOrderResult;
    }

    const itemIds = [...new Set(data.items.map((item) => item.itemId))];
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from("menu_items")
      .select("id, name, price, vendor_name, image_url, is_available, addons, delivery_fee")
      .in("id", itemIds);

    if (menuError) throw menuError;
    if (!menuItems || menuItems.length !== itemIds.length) {
      throw new Error("One or more menu items are unavailable");
    }

    const byId = new Map(menuItems.map((item) => [item.id, item]));
    const normalizedItems = [];
    let subtotal = 0;
    let deliveryFee = 0;

    for (const requested of data.items) {
      const menuItem = byId.get(requested.itemId);
      if (!menuItem || !menuItem.is_available) throw new Error("Menu item is unavailable");
      if (!Number.isInteger(menuItem.price) || menuItem.price < 0) {
        throw new Error("Menu item has an invalid price");
      }

      const addons = parseAddons(menuItem.addons);
      const soda = addons.find((addon) => addon.title.toLowerCase().includes("soda"));
      if (requested.addSoda && !soda) throw new Error("Soda add-on is unavailable");

      const addonPrice = requested.addSoda ? (soda?.price ?? 0) : 0;
      subtotal += menuItem.price * requested.quantity + addonPrice;
      deliveryFee = Math.max(deliveryFee, menuItem.delivery_fee ?? 0);
      normalizedItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: requested.quantity,
        imageUrl: menuItem.image_url ?? undefined,
        vendorName: menuItem.vendor_name || undefined,
        addSoda: Boolean(requested.addSoda),
        addonPrice,
        deliveryFee: menuItem.delivery_fee ?? 0,
      });
    }

    let discount = 0;
    if (data.bannerId) {
      const { data: claim } = await supabaseAdmin
        .from("user_claimed_offers")
        .select("banner_id, discount_percent")
        .eq("user_id", context.userId)
        .eq("banner_id", data.bannerId)
        .is("used_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data: banner } = await supabaseAdmin
        .from("banners")
        .select("id, discount_percent, is_active")
        .eq("id", data.bannerId)
        .eq("is_active", true)
        .maybeSingle();
      if (claim && banner) {
        const percent = Math.max(0, Math.min(100, banner.discount_percent ?? 0));
        discount = Math.round((subtotal * percent) / 100);
      }
    }

    const total = Math.trunc(subtotal - discount + deliveryFee);
    if (!Number.isInteger(total) || total <= 0) {
      throw new Error("Order total must be a positive integer");
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("food_orders")
      .insert({
        user_id: context.userId,
        checkout_request_id: data.checkoutRequestId,
        items: normalizedItems as unknown as never,
        total_tsh: total,
        delivery_area: data.deliveryArea,
        room: data.room,
        phone: data.phone,
        customer_name: data.customerName,
        status: "pending",
        payment_status: "pending",
      })
      .select("id")
      .single();
    if (orderError || !order) {
      const { data: concurrentOrder } = await supabaseAdmin
        .from("food_orders")
        .select("id, total_tsh, payment_status")
        .eq("user_id", context.userId)
        .eq("checkout_request_id", data.checkoutRequestId)
        .maybeSingle();
      if (concurrentOrder) {
        return {
          orderId: concurrentOrder.id,
          subtotal: 0,
          discount: 0,
          deliveryFee: 0,
          total: concurrentOrder.total_tsh,
          paymentState: "pending",
        } satisfies PendingOrderResult;
      }
      throw orderError ?? new Error("Could not create order");
    }

    const { error: paymentError } = await supabaseAdmin.from("payments").insert({
      food_order_id: order.id,
      provider: "sonic_pesa",
      amount_tsh: total,
      currency: "TZS",
      status: "pending",
    });
    if (paymentError) {
      await supabaseAdmin.from("food_orders").delete().eq("id", order.id);
      throw paymentError;
    }

    let paymentState: "pending" | "success" | "failed" | "not_configured" = "not_configured";
    try {
      const { startPaymentForOrder } = await import("@/lib/payment.server");
      const payment = await startPaymentForOrder(supabaseAdmin, context.userId, order.id);
      paymentState = payment.state === "failed" ? "failed" : payment.state;
    } catch {
      paymentState = "failed";
    }

    return {
      orderId: order.id,
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentState,
    } satisfies PendingOrderResult;
  });
