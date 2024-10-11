
export type Database = {
  public: {
    Tables: {
      albums: {
        Row: {
          artist_id: string | null
          create_at: string | null
          genre: string | null
          id: string
          release_date: string | null
          title: string | null
        }
        Insert: {
          artist_id?: string | null
          create_at?: string | null
          genre?: string | null
          id?: string
          release_date?: string | null
          title?: string | null
        }
        Update: {
          artist_id?: string | null
          create_at?: string | null
          genre?: string | null
          id?: string
          release_date?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "albums_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      artists: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          name: string
          artist_album_url:string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          artist_album_url:string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          artist_album_url:string
        }
        Relationships: []
      }
      audio_fingerprints: {
        Row: {
          created_at: string | null
          fingerprint: string
          id: string
          song_id: string
        }
        Insert: {
          created_at?: string | null
          fingerprint: string
          id?: string
          song_id: string
        }
        Update: {
          created_at?: string | null
          fingerprint?: string
          id?: string
          song_id?: string
        }
        Relationships: []
      }
      fingerprints: {
        Row: {
          created_at: string | null
          fingerprint_data: string
          id: string
          song_id: string | null
        }
        Insert: {
          created_at?: string | null
          fingerprint_data: string
          id?: string
          song_id?: string | null
        }
        Update: {
          created_at?: string | null
          fingerprint_data?: string
          id?: string
          song_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fingerprints_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          album_art_url: string | null
          album_id: string | null
          artist: string
          artist_id: string | null
          created_at: string | null
          duration: number | null
          genre: string | null
          id: string
          release_date: string | null
          song_url: string | null
          title: string
          track_number: number | null
        }
        
        Insert: {
          album_art_url?: string | null
          album_id?: string | null
          artist: string
          artist_id?: string | null
          created_at?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          release_date?: string | null
          song_url?: string | null
          title: string
          track_number?: number | null
        }
        Update: {
          album_art_url?: string | null
          album_id?: string | null
          artist?: string
          artist_id?: string | null
          created_at?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          release_date?: string | null
          song_url?: string | null
          title?: string
          track_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "songs_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "songs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
        ]
      }
      user_history: {
        Row: {
          action: string
          id: string
          played_at: string | null
          song_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          played_at?: string | null
          song_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          played_at?: string | null
          song_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_history_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export interface Song {
  id:string;
  artist:string;
  title:string;
  song_url:string;
  album_art_url:string; 
}
export interface Artist {
  id: number;
  name: string;
  bio?: string; // optional fields
  image_url?: string; // optional fields
}

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
