"use client"

// Re-export the Supabase version as the default hook
import { useGameSupabase } from "./use-game-supabase"

export const useGame = useGameSupabase
