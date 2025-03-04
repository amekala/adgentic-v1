export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campaigns: {
        Row: {
          campaign_name: string
          campaign_notes: string | null
          campaign_status: Database["public"]["Enums"]["campaign_status"]
          clicks_last_7_days: number | null
          created_at: string
          created_by: string | null
          ctr_last_7_days: number | null
          daily_budget: number
          goals_description: string | null
          id: string
          impressions_last_7_days: number | null
          platform: Database["public"]["Enums"]["retail_platform"]
          product_asins: string[] | null
          roas_last_7_days: number | null
          sales_last_7_days: number | null
          sales_lift_last_7_days: number | null
          spend_last_7_days: number | null
          targeting_type: Database["public"]["Enums"]["targeting_type"]
        }
        Insert: {
          campaign_name?: string
          campaign_notes?: string | null
          campaign_status?: Database["public"]["Enums"]["campaign_status"]
          clicks_last_7_days?: number | null
          created_at?: string
          created_by?: string | null
          ctr_last_7_days?: number | null
          daily_budget?: number
          goals_description?: string | null
          id?: string
          impressions_last_7_days?: number | null
          platform?: Database["public"]["Enums"]["retail_platform"]
          product_asins?: string[] | null
          roas_last_7_days?: number | null
          sales_last_7_days?: number | null
          sales_lift_last_7_days?: number | null
          spend_last_7_days?: number | null
          targeting_type?: Database["public"]["Enums"]["targeting_type"]
        }
        Update: {
          campaign_name?: string
          campaign_notes?: string | null
          campaign_status?: Database["public"]["Enums"]["campaign_status"]
          clicks_last_7_days?: number | null
          created_at?: string
          created_by?: string | null
          ctr_last_7_days?: number | null
          daily_budget?: number
          goals_description?: string | null
          id?: string
          impressions_last_7_days?: number | null
          platform?: Database["public"]["Enums"]["retail_platform"]
          product_asins?: string[] | null
          roas_last_7_days?: number | null
          sales_last_7_days?: number | null
          sales_lift_last_7_days?: number | null
          spend_last_7_days?: number | null
          targeting_type?: Database["public"]["Enums"]["targeting_type"]
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          actionbuttons: Json | null
          chat_id: string | null
          content: string
          created_at: string | null
          id: string
          metrics: Json | null
          role: string
        }
        Insert: {
          actionbuttons?: Json | null
          chat_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          role: string
        }
        Update: {
          actionbuttons?: Json | null
          chat_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metrics?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          campaign_id: string | null
          chat_type: string
          created_at: string | null
          created_by: string | null
          id: string
          title: string
        }
        Insert: {
          campaign_id?: string | null
          chat_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
        }
        Update: {
          campaign_id?: string | null
          chat_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          company_name: string | null
          country: string | null
          created_at: string
          first_name: string
          id: string
          job_role: string | null
          last_name: string
          monthly_ad_spend: string | null
          phone_number: string | null
          retailers: string[] | null
          solutions_of_interest: string[] | null
          work_email: string
        }
        Insert: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          first_name: string
          id?: string
          job_role?: string | null
          last_name: string
          monthly_ad_spend?: string | null
          phone_number?: string | null
          retailers?: string[] | null
          solutions_of_interest?: string[] | null
          work_email: string
        }
        Update: {
          company_name?: string | null
          country?: string | null
          created_at?: string
          first_name?: string
          id?: string
          job_role?: string | null
          last_name?: string
          monthly_ad_spend?: string | null
          phone_number?: string | null
          retailers?: string[] | null
          solutions_of_interest?: string[] | null
          work_email?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      campaign_status: "live" | "paused" | "draft"
      retail_platform: "amazon_sp" | "walmart_sp" | "instacart_sp"
      targeting_type: "automatic" | "manual_keyword" | "manual_product"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
