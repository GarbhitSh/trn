"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      setLoading(false)
      return
    }

    // Get current session
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setError("Authentication error")
        } else {
          setUser(data.session?.user || null)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error in auth:", err)
        setError("Authentication error")
        setLoading(false)
      }
    }

    getSession()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const signInAnonymous = async () => {
    try {
      setLoading(true)

      // Generate a random email and password for anonymous auth
      const randomId = Math.random().toString(36).substring(2, 15)
      const email = `anonymous-${randomId}@storyforge.game`
      const password = `anon-${Math.random().toString(36).substring(2, 15)}`

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Error signing in anonymously:", error)
        setError("Failed to sign in")
      } else {
        console.log("Anonymous sign in successful:", data.user?.id)
      }
    } catch (err) {
      console.error("Error signing in:", err)
      setError("Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        setError("Failed to sign out")
      }
    } catch (err) {
      console.error("Error signing out:", err)
      setError("Failed to sign out")
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    signInAnonymous,
    signOut,
  }
}
