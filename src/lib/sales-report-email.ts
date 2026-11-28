import { formatOrderStamp } from "./order-stamp";
import { ORDER_COMMISSION_TSH, type DailySalesReport } from "./sales-report";

// Semantic email tokens mirror the app's emerald, amber and neutral surfaces.
const theme = { background: "#ffffff", surface: "#f4f7f6", ink: "#20332b", muted: "#52675e", primary: "#006b4b", border: "#dce5df", warningSurface: "#fff7df", warningInk: "#6b4b00" };
const esc = (value: unknown) => String(value ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
const money = (amount: number) => `TSh ${amount.toLocaleString("en-GB")}`;

export function renderSalesReportEmail(report: DailySalesReport): { subject: string; html: string; text: string } {
  const { paid, preorders, latePaid, latePreorders, window: w } = report;
  const table = (headers: string[], rows: unknown[][]) => `<table role="table" style="width:100%;table-layout:fixed;border-collapse:collapse;margin:12px 0;font-size:13px"><thead><tr>${headers.map((h) => `<th scope="col" style="text-align:left;overflow-wrap:anywhere;padding:10px 8px;background:${theme.surface};border-bottom:2px solid ${theme.border}">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td style="padding:10px 8px;vertical-align:top;border-bottom:1px solid ${theme.border};overflow-wrap:anywhere">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  const allocation = (p: typeof paid) => p.groups.length ? p.groups.map((g) => `<h3 style="font-size:16px;margin:20px 0 4px">${esc(g.vendor)}</h3>${table(["Kipengele", "Mgawanyo"], [["Oda", g.count], ["Mapato", money(g.gross)], ["Jero lako", money(g.commission)], ["Mgao wa mgahawa", money(g.restaurant)]])}`).join("") : "<p>Hakuna oda zilizolipwa kwenye kipindi hiki.</p>";
  const preorderTable = (p: typeof preorders) => table(["Aina", "Idadi"], [["Hostel / Batch", p.batch], ["Book Now", p.direct], ["Jumla ya pre-orders", p.count]]);
  const warnings = [...paid.warnings, ...latePaid.warnings];
  const subject = `MUST Market · Ripoti ya ${w.date} · Oda ${paid.count} · ${money(paid.gross)}`;
  const text = [
    `MUST Market — Ripoti ya ${w.date}, 00:00 hadi kabla ya 23:58 (EAT).`,
    `Paid orders: ${paid.count}. Mapato: ${money(paid.gross)}. Jero lako: ${money(paid.commission)}. Migahawa: ${money(paid.restaurant)}.`,
    ...paid.groups.map((g) => `${g.vendor}: oda ${g.count}; mapato ${money(g.gross)}; jero ${money(g.commission)}; mgahawa ${money(g.restaurant)}.`),
    `Pre-orders (si mapato): ${preorders.count}; Batch ${preorders.batch}; Book Now ${preorders.direct}.`,
    `Nyongeza tofauti ya ${w.previousDate}, 23:58–23:59:59: oda ${latePaid.count}, mapato ${money(latePaid.gross)}, jero ${money(latePaid.commission)}, migahawa ${money(latePaid.restaurant)}; pre-orders ${latePreorders.count}.`,
    "Mapato haya si salio halisi la Sonic Pesa. Ada, withdrawals, refunds na salio la mwanzo havijalinganishwa.",
    ...warnings,
  ].join("\n");
  const html = `<!DOCTYPE html><html lang="sw"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:${theme.background};color:${theme.ink};font-family:Arial,sans-serif;line-height:1.5"><main style="max-width:680px;margin:0 auto;padding:24px 16px">
    <header style="border-bottom:3px solid ${theme.primary};padding-bottom:16px"><p style="color:${theme.primary};font-weight:bold;margin:0">MUST MARKET · MSOSI FASTA</p><h1 style="font-size:24px;margin:8px 0">Ripoti ya mauzo · ${esc(w.date)}</h1><p style="margin:0;color:${theme.muted}">Saa za Tanzania (EAT): 00:00 hadi kabla ya 23:58</p></header>
    <section><h2 style="font-size:18px;color:${theme.primary}">1. Oda zilizolipwa kupitia Sonic Pesa</h2>${table(["Kipengele", "Jumla"], [["Oda zilizolipwa", paid.count], ["Mapato yaliyorekodiwa", money(paid.gross)], ["Jero lako — TSh 500 kwa kila oda", money(paid.commission)], ["Mgao wa migahawa", money(paid.restaurant)]])}<p style="font-weight:bold">${money(paid.gross)} = ${money(paid.commission)} + ${money(paid.restaurant)}</p>${allocation(paid)}</section>
    <p style="padding:12px;background:${theme.warningSurface};color:${theme.warningInk}"><strong>Hili si salio halisi la Sonic Pesa.</strong> Haya ni mapato yaliyorekodiwa kwa kipindi hiki, kabla ya ada, fedha ulizotoa au kurudisha, na salio la mwanzo. Salio halisi linahitaji kulinganishwa na taarifa ya Sonic Pesa.</p>
    ${warnings.length ? `<section><h2 style="font-size:18px">Yanayohitaji uhakiki kabla ya malipo</h2><ul>${warnings.map((warning) => `<li>${esc(warning)}</li>`).join("")}</ul></section>` : ""}
    <section style="border-top:1px solid ${theme.border};margin-top:24px"><h2 style="font-size:18px">2. Pre-orders zilizowekwa leo — si mapato</h2><p>Hazijaongezwa kwenye mapato, jero lako, au mgao wa migahawa.</p>${preorderTable(preorders)}${preorders.statuses.length ? table(["Hali", "Idadi"], preorders.statuses.map((s) => [s.status, s.count])) : ""}</section>
    <section style="border-top:1px solid ${theme.border};margin-top:24px"><h2 style="font-size:18px">3. Nyongeza tofauti ya ${esc(w.previousDate)}</h2><p>Oda za jana, 23:58–23:59:59. Hazipo kwenye jumla ya leo iliyo juu, wala kwenye ripoti ya jana ya 23:58.</p>${table(["Kipengele", "Nyongeza ya jana"], [["Oda zilizolipwa", latePaid.count], ["Mapato", money(latePaid.gross)], ["Jero lako", money(latePaid.commission)], ["Mgao wa migahawa", money(latePaid.restaurant)]])}${latePaid.count ? allocation(latePaid) : ""}${preorderTable(latePreorders)}</section>
    <section style="border-top:1px solid ${theme.border};margin-top:24px"><h2 style="font-size:18px">4. Oda za leo kwa uhakiki</h2>${table(["Muda / Mteja", "Oda / Rejea ya malipo", "Jumla / Jero / Mgahawa"], paid.orders.map((o) => [`${formatOrderStamp(o.created_at)} · ${o.customer_name ?? "Mteja"}`, `${o.id}\n${o.payment_reference}`, `${money(o.total_tsh)} / ${money(ORDER_COMMISSION_TSH)} / ${money(o.total_tsh - ORDER_COMMISSION_TSH)}`]))}${latePaid.count ? `<h3 style="font-size:16px">Rejea za nyongeza ya jana</h3>${table(["Muda", "Oda / Rejea", "Jumla"], latePaid.orders.map((o) => [formatOrderStamp(o.created_at), `${o.id}\n${o.payment_reference}`, money(o.total_tsh)]))}` : ""}</section>
    <footer style="font-size:12px;color:${theme.muted};border-top:1px solid ${theme.border};padding-top:16px">MUST Market · Ripoti ya kumbukumbu za oda, si uthibitisho wa salio la wallet. Oda za leo baada ya 23:58 zitaingia kwenye nyongeza ya ripoti inayofuata.</footer>
  </main></body></html>`;
  return { subject, html, text };
}