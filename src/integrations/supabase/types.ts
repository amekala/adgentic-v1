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
      ad_platforms: {
        Row: {
          api_base_url: string
          created_at: string | null
          display_name: string
          icon_url: string | null
          id: string
          name: string
        }
        Insert: {
          api_base_url: string
          created_at?: string | null
          display_name: string
          icon_url?: string | null
          id?: string
          name: string
        }
        Update: {
          api_base_url?: string
          created_at?: string | null
          display_name?: string
          icon_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      advertiser_user_roles: {
        Row: {
          advertiser_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          advertiser_id: string
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          advertiser_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertiser_user_roles_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisers: {
        Row: {
          company_email: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          company_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          company_email?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_metrics: {
        Row: {
          campaign_id: string
          clicks: number | null
          conversions: number | null
          created_at: string | null
          date: string
          id: string
          impressions: number | null
          other_metrics: Json | null
          sales: number | null
          spend: number | null
        }
        Insert: {
          campaign_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          date: string
          id?: string
          impressions?: number | null
          other_metrics?: Json | null
          sales?: number | null
          spend?: number | null
        }
        Update: {
          campaign_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          impressions?: number | null
          other_metrics?: Json | null
          sales?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          advertiser_id: string | null
          campaign_name: string
          campaign_notes: string | null
          campaign_status: Database["public"]["Enums"]["campaign_status"]
          clicks_last_7_days: number | null
          created_at: string
          created_by: string | null
          creation_method: string | null
          ctr_last_7_days: number | null
          daily_budget: number
          goals_description: string | null
          id: string
          impressions_last_7_days: number | null
          platform: Database["public"]["Enums"]["retail_platform"]
          platform_campaign_id: string | null
          platform_id: string | null
          product_asins: string[] | null
          roas_last_7_days: number | null
          sales_last_7_days: number | null
          sales_lift_last_7_days: number | null
          source_chat_id: string | null
          spend_last_7_days: number | null
          targeting_type: Database["public"]["Enums"]["targeting_type"]
        }
        Insert: {
          advertiser_id?: string | null
          campaign_name?: string
          campaign_notes?: string | null
          campaign_status?: Database["public"]["Enums"]["campaign_status"]
          clicks_last_7_days?: number | null
          created_at?: string
          created_by?: string | null
          creation_method?: string | null
          ctr_last_7_days?: number | null
          daily_budget?: number
          goals_description?: string | null
          id?: string
          impressions_last_7_days?: number | null
          platform?: Database["public"]["Enums"]["retail_platform"]
          platform_campaign_id?: string | null
          platform_id?: string | null
          product_asins?: string[] | null
          roas_last_7_days?: number | null
          sales_last_7_days?: number | null
          sales_lift_last_7_days?: number | null
          source_chat_id?: string | null
          spend_last_7_days?: number | null
          targeting_type?: Database["public"]["Enums"]["targeting_type"]
        }
        Update: {
          advertiser_id?: string | null
          campaign_name?: string
          campaign_notes?: string | null
          campaign_status?: Database["public"]["Enums"]["campaign_status"]
          clicks_last_7_days?: number | null
          created_at?: string
          created_by?: string | null
          creation_method?: string | null
          ctr_last_7_days?: number | null
          daily_budget?: number
          goals_description?: string | null
          id?: string
          impressions_last_7_days?: number | null
          platform?: Database["public"]["Enums"]["retail_platform"]
          platform_campaign_id?: string | null
          platform_id?: string | null
          product_asins?: string[] | null
          roas_last_7_days?: number | null
          sales_last_7_days?: number | null
          sales_lift_last_7_days?: number | null
          source_chat_id?: string | null
          spend_last_7_days?: number | null
          targeting_type?: Database["public"]["Enums"]["targeting_type"]
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "ad_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_source_chat_id_fkey"
            columns: ["source_chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
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
          advertiser_id: string | null
          campaign_id: string | null
          category: string | null
          chat_type: string
          created_at: string | null
          created_by: string | null
          has_api_actions: boolean | null
          id: string
          intent: string | null
          title: string
        }
        Insert: {
          advertiser_id?: string | null
          campaign_id?: string | null
          category?: string | null
          chat_type: string
          created_at?: string | null
          created_by?: string | null
          has_api_actions?: boolean | null
          id?: string
          intent?: string | null
          title: string
        }
        Update: {
          advertiser_id?: string | null
          campaign_id?: string | null
          category?: string | null
          chat_type?: string
          created_at?: string | null
          created_by?: string | null
          has_api_actions?: boolean | null
          id?: string
          intent?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
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
          assigned_to: string | null
          company_name: string | null
          conversion_date: string | null
          converted_to_advertiser: boolean | null
          country: string | null
          created_at: string
          first_name: string
          id: string
          interested_in_advertiser_id: string | null
          interested_platforms: string[] | null
          job_role: string | null
          last_name: string
          lead_source: string | null
          lead_status: string | null
          monthly_ad_spend: string | null
          phone_number: string | null
          retailers: string[] | null
          solutions_of_interest: string[] | null
          utm_parameters: Json | null
          work_email: string
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          conversion_date?: string | null
          converted_to_advertiser?: boolean | null
          country?: string | null
          created_at?: string
          first_name: string
          id?: string
          interested_in_advertiser_id?: string | null
          interested_platforms?: string[] | null
          job_role?: string | null
          last_name: string
          lead_source?: string | null
          lead_status?: string | null
          monthly_ad_spend?: string | null
          phone_number?: string | null
          retailers?: string[] | null
          solutions_of_interest?: string[] | null
          utm_parameters?: Json | null
          work_email: string
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          conversion_date?: string | null
          converted_to_advertiser?: boolean | null
          country?: string | null
          created_at?: string
          first_name?: string
          id?: string
          interested_in_advertiser_id?: string | null
          interested_platforms?: string[] | null
          job_role?: string | null
          last_name?: string
          lead_source?: string | null
          lead_status?: string | null
          monthly_ad_spend?: string | null
          phone_number?: string | null
          retailers?: string[] | null
          solutions_of_interest?: string[] | null
          utm_parameters?: Json | null
          work_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_interested_in_advertiser_id_fkey"
            columns: ["interested_in_advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_credentials: {
        Row: {
          advertiser_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          platform_id: string
          profile_id: string | null
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          advertiser_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_id: string
          profile_id?: string | null
          refresh_token: string
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform_id?: string
          profile_id?: string | null
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_credentials_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_credentials_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "ad_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_operation_logs: {
        Row: {
          advertiser_id: string
          campaign_id: string | null
          chat_id: string | null
          created_at: string | null
          id: string
          operation_type: string
          platform_id: string
          request_payload: Json | null
          response_payload: Json | null
          success: boolean | null
        }
        Insert: {
          advertiser_id: string
          campaign_id?: string | null
          chat_id?: string | null
          created_at?: string | null
          id?: string
          operation_type: string
          platform_id: string
          request_payload?: Json | null
          response_payload?: Json | null
          success?: boolean | null
        }
        Update: {
          advertiser_id?: string
          campaign_id?: string | null
          chat_id?: string | null
          created_at?: string | null
          id?: string
          operation_type?: string
          platform_id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_operation_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_operation_logs_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          advertiser_id: string | null
          avatar_url: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          advertiser_id?: string | null
          avatar_url?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          advertiser_id?: string | null
          avatar_url?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_advertiser_memberships: {
        Row: {
          advertiser_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          role: string
          user_id: string
        }
        Insert: {
          advertiser_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string
          user_id: string
        }
        Update: {
          advertiser_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_advertiser_memberships_advertiser_id_fkey"
            columns: ["advertiser_id"]
            isOneToOne: false
            referencedRelation: "advertisers"
            referencedColumns: ["id"]
          },
        ]
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
