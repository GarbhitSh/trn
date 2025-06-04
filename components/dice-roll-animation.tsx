"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react"

interface DiceRollAnimationProps {
  finalValue: number
  onAnimationComplete?: () => void
  isVisible: boolean
  playerName?: string
}

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6]

export default function DiceRollAnimation({
  finalValue,
  onAnimationComplete,
  isVisible,
  playerName,
}: DiceRollAnimationProps) {
  const [currentValue, setCurrentValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    setIsRolling(true)
    setShowResult(false)

    // Animate through random values rapidly
    const rollInterval = setInterval(() => {
      setCurrentValue(Math.floor(Math.random() * 6) + 1)
    }, 80)

    // Stop rolling and show final value
    const stopTimer = setTimeout(() => {
      clearInterval(rollInterval)
      setCurrentValue(finalValue)
      setIsRolling(false)
      setShowResult(true)
    }, 2000)

    // Complete animation after showing final value
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.()
    }, 3500)

    return () => {
      clearInterval(rollInterval)
      clearTimeout(stopTimer)
      clearTimeout(completeTimer)
    }
  }, [finalValue, onAnimationComplete, isVisible])

  const DiceIcon = diceIcons[currentValue - 1]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Dice Container */}
          <motion.div
            className="relative"
            initial={{ scale: 0, y: -100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 100 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
          >
            {/* Dice Shadow */}
            <motion.div
              className="absolute top-32 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-black/30 rounded-full blur-md"
              animate={{
                scale: isRolling ? [1, 1.2, 1] : 1,
                opacity: isRolling ? [0.3, 0.6, 0.3] : 0.4,
              }}
              transition={{
                duration: 0.3,
                repeat: isRolling ? Number.POSITIVE_INFINITY : 0,
              }}
            />

            {/* Main Dice */}
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-2xl border-4 border-gray-200 relative overflow-hidden"
              animate={
                isRolling
                  ? {
                      rotateX: [0, 360, 720, 1080],
                      rotateY: [0, 180, 360, 540],
                      rotateZ: [0, 90, 180, 270],
                      scale: [1, 1.1, 0.9, 1.05, 1],
                    }
                  : showResult
                    ? {
                        scale: [1, 1.2, 1],
                        rotateZ: [0, 5, -5, 0],
                      }
                    : {}
              }
              transition={
                isRolling
                  ? {
                      duration: 2,
                      ease: "easeOut",
                    }
                  : showResult
                    ? {
                        duration: 0.6,
                        ease: "easeOut",
                      }
                    : {}
              }
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Sparkle Effects */}
              {(isRolling || showResult) && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1,
                        repeat: isRolling ? Number.POSITIVE_INFINITY : 0,
                      }}
                    />
                  ))}
                </>
              )}

              {/* Dice Icon */}
              <motion.div
                className="relative z-10"
                animate={
                  isRolling
                    ? {
                        rotate: [0, 360],
                        scale: [1, 1.3, 0.8, 1.1, 1],
                      }
                    : {}
                }
                transition={
                  isRolling
                    ? {
                        rotate: { duration: 0.15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                        scale: { duration: 0.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                      }
                    : {}
                }
              >
                <DiceIcon
                  className={`w-32 h-32 mx-auto transition-colors duration-300 ${
                    showResult ? "text-green-600" : "text-blue-600"
                  }`}
                />
              </motion.div>
            </motion.div>

            {/* Player Name */}
            {playerName && (
              <motion.div
                className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full font-bold"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {playerName}'s Turn
              </motion.div>
            )}

            {/* Rolling Text */}
            <motion.div
              className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence mode="wait">
                {isRolling ? (
                  <motion.div
                    key="rolling"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h3 className="text-3xl font-bold text-white mb-2">Rolling the dice...</h3>
                    <div className="flex justify-center space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-yellow-400 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : showResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <motion.h3
                      className="text-4xl font-bold text-yellow-400 mb-2"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: 2,
                      }}
                    >
                      You rolled {finalValue}!
                    </motion.h3>
                    <motion.p
                      className="text-xl text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Move {finalValue} space{finalValue !== 1 ? "s" : ""} forward!
                    </motion.p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Background Particles */}
          {isRolling && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
