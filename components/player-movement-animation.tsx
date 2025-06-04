"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface PlayerMovementAnimationProps {
  playerId: string
  fromPosition: number
  toPosition: number
  playerAvatar: string
  playerColor: string
  onAnimationComplete?: () => void
}

export default function PlayerMovementAnimation({
  playerId,
  fromPosition,
  toPosition,
  playerAvatar,
  playerColor,
  onAnimationComplete,
}: PlayerMovementAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false)
      onAnimationComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  if (!isAnimating) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`
            w-16 h-16 rounded-full border-4 border-white shadow-2xl
            flex items-center justify-center text-2xl font-bold
            ${playerColor}
          `}
          initial={{
            scale: 0.5,
            rotate: 0,
            y: 0,
          }}
          animate={{
            scale: [0.5, 1.2, 1],
            rotate: [0, 360, 720],
            y: [-20, -40, -20, 0],
          }}
          transition={{
            duration: 2,
            times: [0, 0.3, 0.6, 1],
            ease: "easeInOut",
          }}
        >
          {playerAvatar}
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-center">
            <div className="text-sm font-semibold">Moving!</div>
            <div className="text-xs text-blue-200">
              From #{fromPosition} to #{toPosition}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
