import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://ocwvygzctrdlnmkkmnhg.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd3Z5Z3pjdHJkbG5ta2ttbmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5Nzk0NjYsImV4cCI6MjA2NDU1NTQ2Nn0.wUxzRROblANriRMbBgo2IpJ3vWVuRiv39nSz_RbNKw8"

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable auth persistence since we're not using auth
  },
})

// Database types
export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          theme: string
          board: any
          current_player_index: number
          current_player_id: string
          game_phase: "lobby" | "playing" | "ended"
          dice_value: number
          current_event: any
          game_log: string[]
          created_at: string
          last_activity: string
        }
        Insert: {
          id: string
          theme: string
          board: any
          current_player_index?: number
          current_player_id: string
          game_phase?: "lobby" | "playing" | "ended"
          dice_value?: number
          current_event?: any
          game_log?: string[]
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          theme?: string
          board?: any
          current_player_index?: number
          current_player_id?: string
          game_phase?: "lobby" | "playing" | "ended"
          dice_value?: number
          current_event?: any
          game_log?: string[]
          created_at?: string
          last_activity?: string
        }
      }
      players: {
        Row: {
          id: string
          game_id: string
          name: string
          avatar: string
          karma: number
          position: number
          is_host: boolean
          is_ready: boolean
          is_online: boolean
          actions: string[]
          color: string
          created_at: string
          last_seen: string
        }
        Insert: {
          id: string
          game_id: string
          name: string
          avatar: string
          karma?: number
          position?: number
          is_host?: boolean
          is_ready?: boolean
          is_online?: boolean
          actions?: string[]
          color: string
          created_at?: string
          last_seen?: string
        }
        Update: {
          id?: string
          game_id?: string
          name?: string
          avatar?: string
          karma?: number
          position?: number
          is_host?: boolean
          is_ready?: boolean
          is_online?: boolean
          actions?: string[]
          color?: string
          created_at?: string
          last_seen?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          game_id: string
          player_id: string
          player_name: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          player_id: string
          player_name: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          player_id?: string
          player_name?: string
          message?: string
          created_at?: string
        }
      }
    }
  }
}
