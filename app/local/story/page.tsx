import { LocalStoryContent } from "@/components/local-story-content"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Local Story",
}

export default function Page() {
  const cookieStore = cookies()
  const gameState = cookieStore.get("game_state")

  if (!gameState) {
    redirect("/")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <LocalStoryContent />
    </div>
  )
}
