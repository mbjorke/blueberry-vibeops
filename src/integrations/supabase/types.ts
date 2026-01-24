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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          created_at: string
          description: string
          id: string
          metadata: Json | null
          project_id: string
          severity: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          project_id: string
          severity?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          severity?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      client_projects: {
        Row: {
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: []
      }
      client_repos: {
        Row: {
          client_id: string
          created_at: string
          environment: string | null
          id: string
          repo_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          environment?: string | null
          id?: string
          repo_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          environment?: string | null
          id?: string
          repo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_repos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_repos_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_email: string | null
          created_at: string
          created_by: string | null
          id: string
          industry: string | null
          logo_color: string
          logo_initial: string
          monthly_rate: number | null
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          logo_color?: string
          logo_initial: string
          monthly_rate?: number | null
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          industry?: string | null
          logo_color?: string
          logo_initial?: string
          monthly_rate?: number | null
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      deployments: {
        Row: {
          commit_hash: string | null
          commit_message: string | null
          created_at: string
          deployed_by: string | null
          deployed_by_name: string | null
          duration_seconds: number | null
          environment: string
          id: string
          project_id: string
          status: string
          version: string
        }
        Insert: {
          commit_hash?: string | null
          commit_message?: string | null
          created_at?: string
          deployed_by?: string | null
          deployed_by_name?: string | null
          duration_seconds?: number | null
          environment: string
          id?: string
          project_id: string
          status: string
          version: string
        }
        Update: {
          commit_hash?: string | null
          commit_message?: string | null
          created_at?: string
          deployed_by?: string | null
          deployed_by_name?: string | null
          duration_seconds?: number | null
          environment?: string
          id?: string
          project_id?: string
          status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gdpr_checklist_items: {
        Row: {
          category: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          priority: string | null
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          priority?: string | null
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          priority?: string | null
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gdpr_checklist_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          assigned_projects: string[]
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_projects?: string[]
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_projects?: string[]
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          deployment_updates: boolean
          email: string
          email_notifications: boolean
          full_name: string | null
          id: string
          onboarding_completed: boolean
          onboarding_step: number
          security_alerts: boolean
          updated_at: string
          user_id: string
          welcome_email_sent: boolean
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          deployment_updates?: boolean
          email: string
          email_notifications?: boolean
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          security_alerts?: boolean
          updated_at?: string
          user_id: string
          welcome_email_sent?: boolean
        }
        Update: {
          company_name?: string | null
          created_at?: string
          deployment_updates?: boolean
          email?: string
          email_notifications?: boolean
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          security_alerts?: boolean
          updated_at?: string
          user_id?: string
          welcome_email_sent?: boolean
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          default_branch: string | null
          description: string | null
          environments: Json
          full_name: string | null
          gdpr_compliant: boolean | null
          gdpr_warning: boolean | null
          github_repo_id: number | null
          github_url: string | null
          id: string
          industry: string | null
          issues: string[] | null
          language: string | null
          last_deploy: string | null
          logo_color: string
          logo_initial: string
          name: string
          private: boolean | null
          security_score: number | null
          stars_count: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_branch?: string | null
          description?: string | null
          environments?: Json
          full_name?: string | null
          gdpr_compliant?: boolean | null
          gdpr_warning?: boolean | null
          github_repo_id?: number | null
          github_url?: string | null
          id?: string
          industry?: string | null
          issues?: string[] | null
          language?: string | null
          last_deploy?: string | null
          logo_color?: string
          logo_initial: string
          name: string
          private?: boolean | null
          security_score?: number | null
          stars_count?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_branch?: string | null
          description?: string | null
          environments?: Json
          full_name?: string | null
          gdpr_compliant?: boolean | null
          gdpr_warning?: boolean | null
          github_repo_id?: number | null
          github_url?: string | null
          id?: string
          industry?: string | null
          issues?: string[] | null
          language?: string | null
          last_deploy?: string | null
          logo_color?: string
          logo_initial?: string
          name?: string
          private?: boolean | null
          security_score?: number | null
          stars_count?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      repositories: {
        Row: {
          created_at: string
          created_by: string | null
          default_branch: string | null
          description: string | null
          environments: Json
          full_name: string | null
          github_repo_id: number | null
          github_url: string | null
          id: string
          issues: string[] | null
          language: string | null
          last_deploy: string | null
          name: string
          private: boolean | null
          security_score: number | null
          stars_count: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_branch?: string | null
          description?: string | null
          environments?: Json
          full_name?: string | null
          github_repo_id?: number | null
          github_url?: string | null
          id?: string
          issues?: string[] | null
          language?: string | null
          last_deploy?: string | null
          name: string
          private?: boolean | null
          security_score?: number | null
          stars_count?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_branch?: string | null
          description?: string | null
          environments?: Json
          full_name?: string | null
          github_repo_id?: number | null
          github_url?: string | null
          id?: string
          issues?: string[] | null
          language?: string | null
          last_deploy?: string | null
          name?: string
          private?: boolean | null
          security_score?: number | null
          stars_count?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_findings: {
        Row: {
          category: string | null
          created_at: string
          description: string
          file_path: string | null
          id: string
          line_number: number | null
          project_id: string
          recommendation: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          file_path?: string | null
          id?: string
          line_number?: number | null
          project_id: string
          recommendation?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          file_path?: string | null
          id?: string
          line_number?: number | null
          project_id?: string
          recommendation?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_findings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
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
      app_role: ["admin", "client"],
    },
  },
} as const
