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
      analytics_events: {
        Row: {
          country_code: string | null
          course_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          country_code?: string | null
          course_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          country_code?: string | null
          course_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          order_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          source: Database["public"]["Enums"]["enrollment_source"]
          user_id: string
        }
        Insert: {
          course_id: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          order_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          source?: Database["public"]["Enums"]["enrollment_source"]
          user_id: string
        }
        Update: {
          course_id?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          order_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          source?: Database["public"]["Enums"]["enrollment_source"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          last_position: number | null
          section_id: string
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          section_id: string
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          last_position?: number | null
          section_id?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          blocks: Json
          course_id: string
          created_at: string
          description: string | null
          estimated_minutes: number | null
          id: string
          is_published: boolean
          position: number
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          course_id: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean
          position: number
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          course_id?: string
          created_at?: string
          description?: string | null
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean
          position?: number
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_image_url: string | null
          created_at: string
          currency: string
          description: string | null
          estimated_total_minutes: number | null
          id: string
          is_featured: boolean
          is_published: boolean
          old_price_cents: number | null
          position: number
          price_cents: number
          slug: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          estimated_total_minutes?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          old_price_cents?: number | null
          position?: number
          price_cents: number
          slug: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          estimated_total_minutes?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          old_price_cents?: number | null
          position?: number
          price_cents?: number
          slug?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          course_id: string | null
          created_at: string
          id: string
          is_published: boolean
          position: number
          question: string
        }
        Insert: {
          answer: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          position?: number
          question: string
        }
        Update: {
          answer?: string
          course_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          position?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_cents: number
          course_id: string
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          id: string
          metadata: Json | null
          promo_code: string | null
          refund_reason: string | null
          refunded_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          course_id: string
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          promo_code?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          course_id?: string
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          id?: string
          metadata?: Json | null
          promo_code?: string | null
          refund_reason?: string | null
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          notes: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          notes?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applies_to: Database["public"]["Enums"]["promo_applies_to"]
          code: string
          course_id: string | null
          created_at: string
          current_uses: number
          description: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          stripe_coupon_id: string | null
          updated_at: string
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["promo_applies_to"]
          code: string
          course_id?: string | null
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          stripe_coupon_id?: string | null
          updated_at?: string
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["promo_applies_to"]
          code?: string
          course_id?: string | null
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          stripe_coupon_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          city: string | null
          course_id: string | null
          created_at: string
          id: string
          is_published: boolean
          name: string
          position: number
          rating: number
          tag: string | null
          text: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          position?: number
          rating: number
          tag?: string | null
          text: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          position?: number
          rating?: number
          tag?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_course_progress_percent: {
        Args: { course_uuid: string; user_uuid: string }
        Returns: number
      }
      is_admin: { Args: never; Returns: boolean }
      user_active_course_ids: { Args: { user_uuid: string }; Returns: string[] }
    }
    Enums: {
      discount_type: "percent" | "fixed"
      enrollment_source: "purchase" | "manual" | "promo" | "gift"
      order_status: "pending" | "completed" | "failed" | "refunded"
      promo_applies_to: "specific" | "all"
      user_role: "student" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      discount_type: ["percent", "fixed"],
      enrollment_source: ["purchase", "manual", "promo", "gift"],
      order_status: ["pending", "completed", "failed", "refunded"],
      promo_applies_to: ["specific", "all"],
      user_role: ["student", "admin"],
    },
  },
} as const
