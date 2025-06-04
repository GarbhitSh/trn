import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface GameModeCardProps {
  title: string
  description: string
  href: string
  icon?: React.ReactNode
}

export function GameModeCard({ title, description, href, icon }: GameModeCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm text-blue-300">Start playing</span>
          <ArrowRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
        </CardContent>
      </Card>
    </Link>
  )
}
