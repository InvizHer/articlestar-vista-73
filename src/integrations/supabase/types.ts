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
      admins: {
        Row: {
          created_at: string
          id: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_avatar: string | null
          author_name: string
          category: string
          content: string
          cover_image: string | null
          created_at: string
          date: string
          excerpt: string
          id: string
          published: boolean
          read_time: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_avatar?: string | null
          author_name: string
          category: string
          content: string
          cover_image?: string | null
          created_at?: string
          date?: string
          excerpt: string
          id?: string
          published?: boolean
          read_time: string
          slug: string
          tags: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_avatar?: string | null
          author_name?: string
          category?: string
          content?: string
          cover_image?: string | null
          created_at?: string
          date?: string
          excerpt?: string
          id?: string
          published?: boolean
          read_time?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      comment_replies: {
        Row: {
          admin_username: string | null
          comment_id: string
          content: string
          created_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          name: string
        }
        Insert: {
          admin_username?: string | null
          comment_id: string
          content: string
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name: string
        }
        Update: {
          admin_username?: string | null
          comment_id?: string
          content?: string
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          article_id: string
          content: string
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          default_theme: string
          default_theme_color: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_theme?: string
          default_theme_color?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_theme?: string
          default_theme_color?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      unified_comments: {
        Row: {
          admin_username: string | null
          article_id: string
          content: string
          created_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          name: string
          parent_id: string | null
        }
        Insert: {
          admin_username?: string | null
          article_id: string
          content: string
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name: string
          parent_id?: string | null
        }
        Update: {
          admin_username?: string | null
          article_id?: string
          content?: string
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "unified_comments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_settings_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_like_count: {
        Args: {
          p_article_id: string
        }
        Returns: number
      }
      increment_view_count: {
        Args: {
          article_id: string
        }
        Returns: undefined
      }
      remove_like: {
        Args: {
          p_article_id: string
        }
        Returns: number
      }
      toggle_like:
        | {
            Args: {
              p_article_id: string
            }
            Returns: number
          }
        | {
            Args: {
              p_article_id: string
              p_user_email: string
            }
            Returns: boolean
          }
    }
    Enums: {
      [_ in never]: never
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
