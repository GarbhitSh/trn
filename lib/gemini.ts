import { GoogleGenerativeAI } from "@google/generative-ai"
import { getPrebuiltBoard } from "./prebuilt-boards"

const genAI = new GoogleGenerativeAI("AIzaSyB4_t1sS8MWf9511mjw_mNxUnIyFQjsN9w")

// Rate limiting - track API calls
let lastApiCall = 0
const API_COOLDOWN = 5000 // 5 seconds between calls

export interface GameTile {
  id: number
  type: "task" | "dare" | "action" | "dilemma" | "bonus" | "start" | "finish"
  title: string
  description: string
  karmaValue: number
  choices?: string[]
  consequence?: string
}

export interface GameBoard {
  tiles: GameTile[]
  theme: string
  storyContext: string
}

// Rate limiting helper
const waitForCooldown = async () => {
  const now = Date.now()
  const timeSinceLastCall = now - lastApiCall
  if (timeSinceLastCall < API_COOLDOWN) {
    const waitTime = API_COOLDOWN - timeSinceLastCall
    console.log(`Rate limiting: waiting ${waitTime}ms before API call`)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }
  lastApiCall = Date.now()
}

export async function generateGameBoard(theme: string, playerCount: number): Promise<GameBoard> {
  try {
    console.log("Checking for prebuilt board for theme:", theme)

    // First check if we have a prebuilt board for this theme
    const prebuiltBoard = getPrebuiltBoard(theme)
    if (prebuiltBoard) {
      console.log("Using prebuilt board for theme:", theme)
      return prebuiltBoard
    }

    console.log("No prebuilt board found, generating with AI...")

    // Rate limiting
    await waitForCooldown()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Create a board game for ${playerCount} players with the theme: "${theme}".

Generate exactly 20 unique game tiles in JSON format. Each tile should have:
- id: number (0-19)
- type: one of ["task", "dare", "action", "dilemma", "bonus", "start", "finish"]
- title: short catchy name
- description: detailed description of what happens
- karmaValue: points gained/lost (-10 to +15)
- choices: array of 2-3 choice options (for dilemma tiles only)
- consequence: what happens based on choices (for dilemma tiles only)

Rules:
- Tile 0 must be type "start" with title "Begin Adventure"
- Tile 19 must be type "finish" with title "Journey's End"
- Include 6 task tiles (riddles, trivia, challenges)
- Include 4 dare tiles (fun activities, social challenges)
- Include 3 action tiles (move spaces, swap positions, special effects)
- Include 4 dilemma tiles (moral choices with consequences)
- Include 2 bonus tiles (karma boosts, special rewards)
- Make everything themed around: ${theme}
- Ensure karma values are balanced (more positive than negative overall)
- Make descriptions engaging and specific to the theme

Also provide:
- storyContext: A 2-sentence background story for this adventure

Return ONLY valid JSON in this exact format:
{
  "tiles": [...],
  "theme": "${theme}",
  "storyContext": "..."
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response")
    }

    const gameBoard = JSON.parse(jsonMatch[0])
    return gameBoard
  } catch (error) {
    console.error("Error generating board:", error)

    // Check if it's a quota error
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      console.log("API quota exceeded, using enhanced fallback board")
      return generateEnhancedFallbackBoard(theme)
    }

    // For other errors, also use fallback
    return generateEnhancedFallbackBoard(theme)
  }
}

export async function generatePlayerStory(
  playerName: string,
  theme: string,
  karma: number,
  actions: string[],
  finalPosition: number,
  isWinner: boolean,
): Promise<string> {
  try {
    // Rate limiting
    await waitForCooldown()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Write a personalized story ending for a player in a board game.

Player Details:
- Name: ${playerName}
- Theme: ${theme}
- Final Karma: ${karma}
- Final Position: ${finalPosition}
- Winner: ${isWinner}
- Key Actions: ${actions.join(", ")}

Write a 3-paragraph story that:
1. Summarizes their journey and character development
2. Highlights their most significant choices and actions
3. Reflects on what their karma score says about their character

Make it personal, engaging, and themed around "${theme}". 
The tone should be positive and celebratory, even if they didn't win.
Keep it under 200 words total.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Error generating story:", error)
    return generateFallbackStory(playerName, theme, karma, isWinner)
  }
}

export async function generateRandomTheme(): Promise<string> {
  try {
    // Rate limiting
    await waitForCooldown()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Generate a creative, fun theme for a multiplayer board game. 
The theme should be:
- Family-friendly and appropriate for all ages
- Engaging and imaginative
- Suitable for 2-4 players
- Something that creates interesting social dynamics

Examples: "Jungle Safari Adventure", "Space Station Mystery", "Medieval Castle Quest"

Return only the theme name, nothing else.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error("Error generating theme:", error)
    const fallbackThemes = [
      "Jungle Safari Adventure",
      "Ghost Town Road Trip",
      "Space Station Mystery",
      "Medieval Castle Quest",
      "Underwater Treasure Hunt",
      "Time Travel Classroom Adventure",
      "Alien Road Trip Across America",
      "Secret Santa Gone Wrong Office Party",
      "Dinosaur Expedition Team Building",
      "Pirate Ship Crew Bonding Experience",
      "Wizard School Study Group",
      "Zombie Apocalypse Survival Team",
      "Arctic Research Station Isolation",
      "Carnival Workers Summer Adventure",
      "Detective Agency Mystery Solving",
    ]
    return fallbackThemes[Math.floor(Math.random() * fallbackThemes.length)]
  }
}

// Enhanced fallback board with theme-specific content
function generateEnhancedFallbackBoard(theme: string): GameBoard {
  const themeKeywords = theme.toLowerCase()

  // Generate theme-appropriate tiles
  const tiles: GameTile[] = [
    { id: 0, type: "start", title: "Begin Adventure", description: "Your journey starts here!", karmaValue: 0 },
  ]

  // Add themed tiles based on keywords
  if (themeKeywords.includes("family") || themeKeywords.includes("sibling")) {
    tiles.push(
      { id: 1, type: "task", title: "Family Memory", description: "Share a favorite family memory", karmaValue: 5 },
      {
        id: 2,
        type: "dare",
        title: "Sibling Challenge",
        description: "Do your best impression of a family member",
        karmaValue: 3,
      },
      {
        id: 3,
        type: "dilemma",
        title: "Family Secret",
        description: "Someone tells you a family secret",
        karmaValue: 0,
        choices: ["Keep it safe", "Share with others"],
        consequence: "Trust is earned or lost",
      },
    )
  } else if (themeKeywords.includes("office") || themeKeywords.includes("work")) {
    tiles.push(
      { id: 1, type: "task", title: "Team Building", description: "Lead a team building exercise", karmaValue: 5 },
      { id: 2, type: "dare", title: "Office Talent", description: "Show off your hidden office talent", karmaValue: 3 },
      {
        id: 3,
        type: "dilemma",
        title: "Deadline Pressure",
        description: "Help a colleague or finish your own work?",
        karmaValue: 0,
        choices: ["Help colleague", "Focus on yourself"],
        consequence: "Teamwork vs individual success",
      },
    )
  } else {
    // Generic adventure tiles
    tiles.push(
      {
        id: 1,
        type: "task",
        title: "First Challenge",
        description: "Prove your worth with a simple task",
        karmaValue: 5,
      },
      { id: 2, type: "dare", title: "Courage Test", description: "Show your bravery", karmaValue: 3 },
      {
        id: 3,
        type: "dilemma",
        title: "Moral Choice",
        description: "Choose between helping others or yourself",
        karmaValue: 0,
        choices: ["Help others", "Help yourself"],
        consequence: "Your choice reveals your character",
      },
    )
  }

  // Add more generic tiles to reach 20
  const remainingTiles: GameTile[] = [
    { id: 4, type: "action", title: "Lucky Break", description: "Move forward 2 spaces", karmaValue: 2 },
    { id: 5, type: "task", title: "Wisdom Test", description: "Answer a riddle", karmaValue: 4 },
    { id: 6, type: "bonus", title: "Karma Boost", description: "Good fortune smiles upon you", karmaValue: 8 },
    { id: 7, type: "dare", title: "Social Challenge", description: "Connect with your fellow players", karmaValue: 3 },
    { id: 8, type: "task", title: "Skill Check", description: "Demonstrate your abilities", karmaValue: 5 },
    {
      id: 9,
      type: "dilemma",
      title: "Trust Test",
      description: "Will you trust or doubt?",
      karmaValue: 0,
      choices: ["Trust", "Doubt"],
      consequence: "Trust builds karma, doubt diminishes it",
    },
    { id: 10, type: "action", title: "Setback", description: "Move back 1 space", karmaValue: -2 },
    { id: 11, type: "task", title: "Memory Lane", description: "Recall something important", karmaValue: 4 },
    { id: 12, type: "dare", title: "Performance", description: "Entertain your companions", karmaValue: 3 },
    { id: 13, type: "bonus", title: "Hidden Treasure", description: "Discover unexpected rewards", karmaValue: 6 },
    {
      id: 14,
      type: "dilemma",
      title: "Final Test",
      description: "Your ultimate moral challenge",
      karmaValue: 0,
      choices: ["Sacrifice for others", "Secure your victory"],
      consequence: "Your final choice defines your legacy",
    },
    { id: 15, type: "task", title: "Last Challenge", description: "One final test of your skills", karmaValue: 7 },
    { id: 16, type: "action", title: "Sprint Ahead", description: "Rush toward the finish", karmaValue: 1 },
    { id: 17, type: "dare", title: "Final Dare", description: "One last act of courage", karmaValue: 4 },
    { id: 18, type: "bonus", title: "Victory Lap", description: "Celebrate your journey", karmaValue: 5 },
    { id: 19, type: "finish", title: "Journey's End", description: "Your adventure concludes here!", karmaValue: 10 },
  ]

  // Fill remaining slots
  for (let i = tiles.length; i < 20; i++) {
    if (remainingTiles[i - tiles.length]) {
      tiles.push(remainingTiles[i - tiles.length])
    }
  }

  return {
    theme,
    storyContext: `Welcome to an adventure themed around ${theme}. Your choices will shape your destiny and determine your karma. Every decision matters in this unique journey.`,
    tiles: tiles.slice(0, 20), // Ensure exactly 20 tiles
  }
}

// Fallback story generator
function generateFallbackStory(playerName: string, theme: string, karma: number, isWinner: boolean): string {
  const stories = [
    `${playerName} embarked on an incredible journey through "${theme}". With ${karma} karma points, they navigated challenges with wisdom and courage. Their adventure showcased the power of good choices and determination.`,
    `In the world of "${theme}", ${playerName} discovered their true character. Earning ${karma} karma through thoughtful decisions, they proved that every choice shapes our destiny. ${isWinner ? "Their victory was well-deserved!" : "Though not the winner, their journey was truly meaningful."}`,
    `${playerName}'s adventure in "${theme}" was filled with meaningful moments. With ${karma} karma points reflecting their moral compass, they showed that the journey matters more than the destination. Their story will inspire others.`,
  ]

  return stories[Math.floor(Math.random() * stories.length)]
}
