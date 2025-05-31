export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          updated_at: string | null;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
        };
        Insert: {
          id: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
        Update: {
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      inventory_items: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          sku: string;
          unit_price: number;
          quantity_on_hand: number;
          low_stock_threshold: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          sku: string;
          unit_price: number;
          quantity_on_hand: number;
          low_stock_threshold: number;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          sku?: string;
          unit_price?: number;
          quantity_on_hand?: number;
          low_stock_threshold?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_items_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
    };
    Functions: {
    };
    Enums: {
    };
    CompositeTypes: {
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
  