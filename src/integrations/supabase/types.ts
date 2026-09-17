export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          banner_type: string
          countdown_ends_at: string | null
          created_at: string
          discount_percent: number | null
          id: string
          image_url: string | null
          is_active: boolean
          menu_item_id: string | null
          promo_code: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_type?: string
          countdown_ends_at?: string | null
          created_at?: string
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          menu_item_id?: string | null
          promo_code?: string | null
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_type?: string
          countdown_ends_at?: string | null
          created_at?: string
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          menu_item_id?: string | null
          promo_code?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      campus_services: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_path: string | null
          image_url: string | null
          is_active: boolean
          is_verified: boolean
          location: string
          operating_hours: string | null
          phone_number: string
          portfolio_images: string[]
          provider_name: string
          rating: number
          review_count: number
          starting_price: number
          title: string
          whatsapp_number: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean
          is_verified?: boolean
          location?: string
          operating_hours?: string | null
          phone_number?: string
          portfolio_images?: string[]
          provider_name?: string
          rating?: number
          review_count?: number
          starting_price?: number
          title: string
          whatsapp_number?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_path?: string | null
          image_url?: string | null
          is_active?: boolean
          is_verified?: boolean
          location?: string
          operating_hours?: string | null
          phone_number?: string
          portfolio_images?: string[]
          provider_name?: string
          rating?: number
          review_count?: number
          starting_price?: number
          title?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      food_categories: {
        Row: {
          created_at: string
          display_order: number
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_orders: {
        Row: {
          created_at: string
          customer_name: string
          delivery_area: string
          eta_minutes: number
          id: string
          items: Json
          payment_reference: string | null
          payment_status: string
          phone: string
          reward_points_awarded: boolean
          room: string
          status: string
          total_tsh: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string
          delivery_area?: string
          eta_minutes?: number
          id?: string
          items?: Json
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          reward_points_awarded?: boolean
          room?: string
          status?: string
          total_tsh?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string
          delivery_area?: string
          eta_minutes?: number
          id?: string
          items?: Json
          payment_reference?: string | null
          payment_status?: string
          phone?: string
          reward_points_awarded?: boolean
          room?: string
          status?: string
          total_tsh?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      homepage_shelves: {
        Row: {
          category: string | null
          created_at: string
          display_name: string
          id: string
          is_visible: boolean
          position_order: number
          shelf_key: string
          subtitle: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_visible?: boolean
          position_order?: number
          shelf_key: string
          subtitle?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_visible?: boolean
          position_order?: number
          shelf_key?: string
          subtitle?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_banners: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_path: string | null
          image_url: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          image_url: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_path?: string | null
          image_url?: string
          is_active?: boolean
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          addons: Json
          category: string
          cook_phone: string | null
          created_at: string
          day_badge: string | null
          delivery_fee: number
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          is_popular: boolean
          name: string
          prep_time: string
          price: number
          rating: number
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          addons?: Json
          category?: string
          cook_phone?: string | null
          created_at?: string
          day_badge?: string | null
          delivery_fee?: number
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_popular?: boolean
          name: string
          prep_time?: string
          price: number
          rating?: number
          vendor_id?: string | null
          vendor_name?: string
        }
        Update: {
          addons?: Json
          category?: string
          cook_phone?: string | null
          created_at?: string
          day_badge?: string | null
          delivery_fee?: number
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_popular?: boolean
          name?: string
          prep_time?: string
          price?: number
          rating?: number
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      msosi_pre_orders: {
        Row: {
          created_at: string
          customer_name: string
          delivery_location: string
          id: string
          item_id: string | null
          item_name: string
          message: string
          phone_number: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string
          delivery_location?: string
          id?: string
          item_id?: string | null
          item_name?: string
          message: string
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string
          delivery_location?: string
          id?: string
          item_id?: string | null
          item_name?: string
          message?: string
          phone_number?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "msosi_pre_orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_reviews: {
        Row: {
          comment: string
          created_at: string
          id: string
          order_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          id?: string
          order_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          delivery_timeframe: string
          description: string
          featured_shelf: string | null
          id: string
          images: string[]
          location: string
          price_tsh: number
          seller_id: string
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
          view_count: number
          whatsapp_clicks_count: number
          whatsapp_number: string
        }
        Insert: {
          category_id?: string | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          delivery_timeframe?: string
          description: string
          featured_shelf?: string | null
          id?: string
          images?: string[]
          location: string
          price_tsh: number
          seller_id: string
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
          view_count?: number
          whatsapp_clicks_count?: number
          whatsapp_number: string
        }
        Update: {
          category_id?: string | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          delivery_timeframe?: string
          description?: string
          featured_shelf?: string | null
          id?: string
          images?: string[]
          location?: string
          price_tsh?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
          view_count?: number
          whatsapp_clicks_count?: number
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          email: string | null
          full_name: string | null
          hostel: string | null
          id: string
          is_verified_student: boolean
          last_login_date: string | null
          last_order_date: string | null
          referral_code: string | null
          referral_count: number
          referred_by: string | null
          reward_points: number
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          full_name?: string | null
          hostel?: string | null
          id: string
          is_verified_student?: boolean
          last_login_date?: string | null
          last_order_date?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          reward_points?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          email?: string | null
          full_name?: string | null
          hostel?: string | null
          id?: string
          is_verified_student?: boolean
          last_login_date?: string | null
          last_order_date?: string | null
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          reward_points?: number
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          invited_id: string
          inviter_id: string
          order_counted: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          invited_id: string
          inviter_id: string
          order_counted?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          invited_id?: string
          inviter_id?: string
          order_counted?: boolean
        }
        Relationships: []
      }
      user_claimed_offers: {
        Row: {
          banner_id: string | null
          created_at: string
          discount_percent: number
          id: string
          promo_code: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          banner_id?: string | null
          created_at?: string
          discount_percent?: number
          id?: string
          promo_code?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          banner_id?: string | null
          created_at?: string
          discount_percent?: number
          id?: string
          promo_code?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_claimed_offers_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          area: string
          created_at: string
          id: string
          is_default: boolean
          label: string
          room: string
          user_id: string
        }
        Insert: {
          area?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          room?: string
          user_id: string
        }
        Update: {
          area?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          room?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_featured: boolean
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_featured?: boolean
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_view: {
        Args: { _product_id: string }
        Returns: undefined
      }
      increment_whatsapp_click: {
        Args: { _product_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      product_condition: "Like New" | "Good" | "Fair"
      product_status: "active" | "sold" | "hidden"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      product_condition: ["Like New", "Good", "Fair"],
      product_status: ["active", "sold", "hidden"],
    },
  },
} as const
