import type { GameBoard, GameTile } from "./gemini"

export interface Player {
  id: string
  name: string
  avatar: string
  karma: number
  position: number
  isHost: boolean
  isReady: boolean
  actions: string[]
  color: string
}

export interface GameState {
  id: string
  theme: string
  board: GameBoard
  players: { [key: string]: Player }
  currentPlayerIndex: number
  currentPlayerId: string
  gamePhase: "lobby" | "playing" | "ended"
  diceValue: number
  currentEvent: GameTile | null
  gameLog: string[]
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
}

export class GameManagerLocal {
  private gameState: GameState | null = null
  private chatMessages: ChatMessage[] = []
  private gameStateCallbacks: ((gameState: GameState | null) => void)[] = []
  private chatCallbacks: ((messages: ChatMessage[]) => void)[] = []

  constructor(private gameId: string) {
    console.log("GameManagerLocal created with ID:", gameId)

    // Try to load from localStorage on initialization
    this.tryLoadFromLocalStorage()
  }

  private tryLoadFromLocalStorage() {
    try {
      const savedState = localStorage.getItem("storyforge-local-game-state")
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        if (parsedState.id === this.gameId) {
          this.gameState = parsedState
          console.log("Loaded game state from localStorage on initialization")
        }
      }
    } catch (e) {
      console.error("Failed to load from localStorage on initialization:", e)
    }
  }

  // Load game state from external source
  loadGameState(state: GameState): void {
    if (state.id === this.gameId) {
      this.gameState = state
      this.notifyGameStateChange()
      console.log("Game state loaded externally")
    } else {
      console.error("Cannot load state with different game ID")
    }
  }

  // Create a new game
  async createGame(hostPlayer: Player, theme: string, board: GameBoard): Promise<string> {
    console.log("Creating local game:", { gameId: this.gameId, theme, hostName: hostPlayer.name })

    this.gameState = {
      id: this.gameId,
      theme,
      board,
      players: { [hostPlayer.id]: hostPlayer },
      currentPlayerIndex: 0,
      currentPlayerId: hostPlayer.id,
      gamePhase: "lobby",
      diceValue: 1,
      currentEvent: null,
      gameLog: [`${hostPlayer.name} created the game`],
    }

    console.log("Game state created:", this.gameState)

    // Save to localStorage for persistence
    localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

    this.notifyGameStateChange()
    return this.gameId
  }

  // Add a player to the game
  async addPlayer(player: Player): Promise<boolean> {
    if (!this.gameState) {
      console.error("No game state available")
      return false
    }
    if (Object.keys(this.gameState.players).length >= 4) {
      console.error("Game is full")
      return false
    }
    if (this.gameState.gamePhase !== "lobby") {
      console.error("Game is not in lobby phase")
      return false
    }

    this.gameState.players[player.id] = player
    this.gameState.gameLog.push(`${player.name} joined the game`)

    console.log("Player added:", player.name)

    // Save to localStorage
    localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

    this.notifyGameStateChange()
    return true
  }

  // Start the game
  async startGame(): Promise<boolean> {
    if (!this.gameState) {
      console.error("No game state available")
      return false
    }
    if (this.gameState.gamePhase !== "lobby") {
      console.error("Game is not in lobby phase")
      return false
    }

    this.gameState.gamePhase = "playing"
    this.gameState.gameLog.push("Game started! Let the adventure begin!")

    console.log("Game started")

    // Save to localStorage
    localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

    this.notifyGameStateChange()
    return true
  }

  // Roll dice
  async rollDice(): Promise<number> {
    const diceValue = Math.floor(Math.random() * 6) + 1

    if (this.gameState) {
      this.gameState.diceValue = diceValue
      console.log("Dice rolled:", diceValue)

      // Save to localStorage
      localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

      this.notifyGameStateChange()
    }

    return diceValue
  }

  // Move player and trigger events
  async movePlayer(playerId: string, steps: number): Promise<GameTile | null> {
    if (!this.gameState) {
      console.error("No game state available")
      return null
    }

    const player = this.gameState.players[playerId]
    if (!player) {
      console.error("Player not found:", playerId)
      return null
    }

    const newPosition = Math.min(player.position + steps, this.gameState.board.tiles.length - 1)
    const tile = this.gameState.board.tiles[newPosition]

    // Update player position
    player.position = newPosition

    // Set current event
    this.gameState.currentEvent = tile

    // Add to game log
    this.gameState.gameLog.push(`${player.name} rolled ${steps} and landed on "${tile.title}"`)

    console.log(`Player ${player.name} moved to position ${newPosition}, tile: ${tile.title}`)

    // Save to localStorage
    localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

    this.notifyGameStateChange()
    return tile
  }

  // Resolve tile event
  async resolveEvent(playerId: string, success: boolean, choice?: string): Promise<void> {
    if (!this.gameState || !this.gameState.currentEvent) {
      console.error("No game state or current event available")
      return
    }

    const player = this.gameState.players[playerId]
    const event = this.gameState.currentEvent

    let karmaChange = 0
    let actionDescription = ""

    if (event.type === "dilemma" && choice) {
      karmaChange = choice === event.choices?.[0] ? event.karmaValue + 5 : event.karmaValue - 2
      actionDescription = `chose "${choice}" in ${event.title}`
    } else {
      karmaChange = success ? event.karmaValue : Math.floor(event.karmaValue / 2)
      actionDescription = `${success ? "succeeded" : "failed"} at ${event.title}`
    }

    // Update player karma and actions
    player.karma += karmaChange
    player.actions.push(actionDescription)

    // Get all players to determine next player
    const playerIds = Object.keys(this.gameState.players)
    const currentIndex = playerIds.indexOf(this.gameState.currentPlayerId)
    const nextIndex = (currentIndex + 1) % playerIds.length
    const nextPlayerId = playerIds[nextIndex]

    // Clear current event and move to next player
    this.gameState.currentEvent = null
    this.gameState.currentPlayerIndex = nextIndex
    this.gameState.currentPlayerId = nextPlayerId

    // Add to game log
    const karmaText = karmaChange > 0 ? `gained ${karmaChange}` : `lost ${Math.abs(karmaChange)}`
    this.gameState.gameLog.push(`${player.name} ${actionDescription} and ${karmaText} karma`)

    console.log(`Event resolved for ${player.name}: ${actionDescription}, karma change: ${karmaChange}`)

    // Save to localStorage
    localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

    // Check if player reached the end
    if (player.position >= this.gameState.board.tiles.length - 1) {
      console.log("Player reached the end, ending game")
      this.endGame()
    }

    this.notifyGameStateChange()
  }

  // End the game
  async endGame(): Promise<void> {
    if (!this.gameState) {
      console.error("No game state available")
      return
    }

    this.gameState.gamePhase = "ended"
    this.gameState.gameLog.push("Game ended! Generating stories...")

    console.log("Game ended")

    // Save to localStorage
    localStorage.setItem("storyforge-local-game-state", JSON.stringify(this.gameState))

    // Also save to final game state for story page
    localStorage.setItem("storyforge-final-game", JSON.stringify(this.gameState))

    this.notifyGameStateChange()
  }

  // Chat functions
  async sendChatMessage(playerId: string, playerName: string, message: string): Promise<void> {
    const chatMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2),
      playerId,
      playerName,
      message: message.trim(),
      timestamp: Date.now(),
    }

    this.chatMessages.push(chatMessage)
    console.log("Chat message sent:", chatMessage)
    this.notifyChatChange()
  }

  // Get current game state
  getGameState(): GameState | null {
    return this.gameState
  }

  // Get chat messages
  getChatMessages(): ChatMessage[] {
    return this.chatMessages
  }

  // Subscribe to game state changes
  onGameStateChange(callback: (gameState: GameState | null) => void): void {
    this.gameStateCallbacks.push(callback)
    // Immediately call with current state
    callback(this.gameState)
  }

  // Subscribe to chat messages
  onChatMessages(callback: (messages: ChatMessage[]) => void): void {
    this.chatCallbacks.push(callback)
    // Immediately call with current messages
    callback(this.chatMessages)
  }

  // Notify all subscribers of game state changes
  private notifyGameStateChange(): void {
    console.log("Notifying game state change to", this.gameStateCallbacks.length, "callbacks")
    this.gameStateCallbacks.forEach((callback) => {
      try {
        callback(this.gameState)
      } catch (error) {
        console.error("Error in game state callback:", error)
      }
    })
  }

  // Notify all subscribers of chat changes
  private notifyChatChange(): void {
    this.chatCallbacks.forEach((callback) => {
      try {
        callback(this.chatMessages)
      } catch (error) {
        console.error("Error in chat callback:", error)
      }
    })
  }

  // Cleanup
  cleanup(): void {
    console.log("Cleaning up GameManagerLocal")
    this.gameStateCallbacks = []
    this.chatCallbacks = []
  }
}

// Utility functions
export function generateGameId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function generatePlayerId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function getPlayerColors(): string[] {
  return ["bg-blue-500", "bg-red-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"]
}

export function getPlayerAvatars(): string[] {
  return ["🧙‍♂️", "🦸‍♀️", "🤖", "🐉", "🦄", "🎭", "🦸‍♂️", "🧚‍♀️"]
}
