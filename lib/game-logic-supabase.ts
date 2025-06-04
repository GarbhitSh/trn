import type { GameBoard, GameTile } from "./gemini"
import { supabase } from "./supabase"

export interface Player {
  id: string
  name: string
  avatar: string
  karma: number
  position: number
  isHost: boolean
  isReady: boolean
  isOnline: boolean
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
  createdAt: string
  lastActivity: string
}

export interface ChatMessage {
  id: string
  playerId: string
  playerName: string
  message: string
  timestamp: number
}

// Helper function to serialize errors properly
function serializeError(error: any): string {
  if (!error) return "Unknown error"

  if (typeof error === "string") return error

  if (error.message) return error.message

  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error))
  } catch {
    return String(error)
  }
}

// Helper function to validate game data
function validateGameData(gameData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!gameData.id || typeof gameData.id !== "string") {
    errors.push("Game ID is required and must be a string")
  }

  if (!gameData.theme || typeof gameData.theme !== "string") {
    errors.push("Theme is required and must be a string")
  }

  if (!gameData.board || typeof gameData.board !== "object") {
    errors.push("Board is required and must be an object")
  }

  if (!gameData.current_player_id || typeof gameData.current_player_id !== "string") {
    errors.push("Current player ID is required and must be a string")
  }

  if (gameData.current_player_index !== undefined && typeof gameData.current_player_index !== "number") {
    errors.push("Current player index must be a number")
  }

  if (gameData.game_phase && !["lobby", "playing", "ended"].includes(gameData.game_phase)) {
    errors.push("Game phase must be 'lobby', 'playing', or 'ended'")
  }

  return { isValid: errors.length === 0, errors }
}

// Helper function to validate player data
function validatePlayerData(playerData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!playerData.id || typeof playerData.id !== "string") {
    errors.push("Player ID is required and must be a string")
  }

  if (!playerData.game_id || typeof playerData.game_id !== "string") {
    errors.push("Game ID is required and must be a string")
  }

  if (!playerData.name || typeof playerData.name !== "string") {
    errors.push("Player name is required and must be a string")
  }

  if (!playerData.avatar || typeof playerData.avatar !== "string") {
    errors.push("Player avatar is required and must be a string")
  }

  if (!playerData.color || typeof playerData.color !== "string") {
    errors.push("Player color is required and must be a string")
  }

  if (playerData.karma !== undefined && typeof playerData.karma !== "number") {
    errors.push("Karma must be a number")
  }

  if (playerData.position !== undefined && typeof playerData.position !== "number") {
    errors.push("Position must be a number")
  }

  return { isValid: errors.length === 0, errors }
}

export class GameManagerSupabase {
  private gameId: string
  private playerId: string
  private subscriptions: any[] = []
  private channels: Map<string, any> = new Map() // Add this line
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private pollingInterval: NodeJS.Timeout | null = null
  private connectionStatusCallbacks: ((status: "connected" | "disconnected" | "reconnecting") => void)[] = []

  constructor(gameId: string, playerId: string) {
    this.gameId = gameId
    this.playerId = playerId
  }

  // Test connection and ensure tables exist
  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing Supabase connection...")

      // First try a simple query
      const { data, error } = await supabase.from("games").select("count").limit(1)

      if (error) {
        console.log("Tables don't exist yet, this is expected for first run")
        console.log("Error:", serializeError(error))
        return false
      }

      console.log("✅ Supabase connection successful")
      return true
    } catch (error) {
      console.error("Supabase connection test error:", serializeError(error))
      return false
    }
  }

  // Create a new game
  async createGame(hostPlayer: Player, theme: string, board: GameBoard): Promise<string> {
    try {
      console.log("=== Starting Game Creation ===")
      console.log("Game ID:", this.gameId)
      console.log("Theme:", theme)
      console.log("Host Player:", hostPlayer.name)
      console.log("Board tiles count:", board.tiles.length)

      // Test connection and ensure tables exist
      const connectionOk = await this.testConnection()
      if (!connectionOk) {
        throw new Error(`
          Database tables are not set up yet. Please:
          1. Go to your Supabase Dashboard
          2. Navigate to SQL Editor
          3. Run the create-tables-v2.sql script from the project
          4. Then try creating a game again
        `)
      }

      // Prepare and validate game data
      const gameData = {
        id: this.gameId,
        theme: theme.trim(),
        board: board,
        current_player_index: 0,
        current_player_id: hostPlayer.id,
        game_phase: "lobby" as const,
        dice_value: 1,
        current_event: null,
        game_log: [`${hostPlayer.name} created the game`],
      }

      console.log("Prepared game data:", {
        id: gameData.id,
        theme: gameData.theme,
        current_player_id: gameData.current_player_id,
        game_phase: gameData.game_phase,
        board_tiles: gameData.board.tiles.length,
        game_log_length: gameData.game_log.length,
      })

      // Validate game data
      const gameValidation = validateGameData(gameData)
      if (!gameValidation.isValid) {
        throw new Error(`Game data validation failed: ${gameValidation.errors.join(", ")}`)
      }

      console.log("Game data validation passed")

      // Check if game ID already exists
      const { data: existingGame, error: checkError } = await supabase
        .from("games")
        .select("id")
        .eq("id", this.gameId)
        .maybeSingle()

      if (checkError) {
        console.error("Error checking existing game:", serializeError(checkError))
        throw new Error(`Failed to check existing game: ${serializeError(checkError)}`)
      }

      if (existingGame) {
        console.error("Game ID already exists:", this.gameId)
        throw new Error(`Game with ID ${this.gameId} already exists`)
      }

      console.log("Game ID is unique, proceeding with insertion...")

      // Insert game
      const { data: insertedGame, error: gameError } = await supabase.from("games").insert(gameData).select().single()

      if (gameError) {
        console.error("Game insertion error details:", {
          message: gameError.message,
          details: gameError.details,
          hint: gameError.hint,
          code: gameError.code,
        })
        throw new Error(`Failed to create game: ${serializeError(gameError)}`)
      }

      if (!insertedGame) {
        throw new Error("Game was not created - no data returned")
      }

      console.log("Game created successfully:", insertedGame.id)

      // Prepare and validate player data
      const playerData = {
        id: hostPlayer.id,
        game_id: this.gameId,
        name: hostPlayer.name.trim(),
        avatar: hostPlayer.avatar,
        karma: hostPlayer.karma || 0,
        position: hostPlayer.position || 0,
        is_host: hostPlayer.isHost,
        is_ready: hostPlayer.isReady,
        is_online: hostPlayer.isOnline,
        actions: hostPlayer.actions || [],
        color: hostPlayer.color,
      }

      console.log("Prepared player data:", {
        id: playerData.id,
        game_id: playerData.game_id,
        name: playerData.name,
        avatar: playerData.avatar,
        is_host: playerData.is_host,
        color: playerData.color,
      })

      // Validate player data
      const playerValidation = validatePlayerData(playerData)
      if (!playerValidation.isValid) {
        console.error("Player data validation failed:", playerValidation.errors)
        // Try to clean up the game if player validation fails
        await supabase.from("games").delete().eq("id", this.gameId)
        throw new Error(`Player data validation failed: ${playerValidation.errors.join(", ")}`)
      }

      console.log("Player data validation passed")

      // Insert host player
      const { data: insertedPlayer, error: playerError } = await supabase
        .from("players")
        .insert(playerData)
        .select()
        .single()

      if (playerError) {
        console.error("Player insertion error details:", {
          message: playerError.message,
          details: playerError.details,
          hint: playerError.hint,
          code: playerError.code,
        })
        // Try to clean up the game if player insertion fails
        await supabase.from("games").delete().eq("id", this.gameId)
        throw new Error(`Failed to create player: ${serializeError(playerError)}`)
      }

      if (!insertedPlayer) {
        // Try to clean up the game if player creation failed
        await supabase.from("games").delete().eq("id", this.gameId)
        throw new Error("Player was not created - no data returned")
      }

      console.log("Player created successfully:", insertedPlayer.id)
      console.log("=== Game Creation Completed Successfully ===")

      return this.gameId
    } catch (error) {
      console.error("=== Game Creation Failed ===")
      console.error("Error details:", serializeError(error))

      if (error instanceof Error) {
        throw error
      } else {
        throw new Error(`Unknown error creating game: ${serializeError(error)}`)
      }
    }
  }

  // Join an existing game
  async joinGame(player: Player): Promise<boolean> {
    try {
      console.log("=== Starting Game Join ===")
      console.log("Game ID:", this.gameId)
      console.log("Player:", player.name)

      // Test connection first
      const connectionOk = await this.testConnection()
      if (!connectionOk) {
        throw new Error("Supabase connection failed")
      }

      // Check if game exists and is in lobby phase
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("id, game_phase")
        .eq("id", this.gameId)
        .single()

      if (gameError) {
        console.error("Game lookup error:", serializeError(gameError))
        return false
      }

      if (!gameData) {
        console.error("Game does not exist")
        return false
      }

      if (gameData.game_phase !== "lobby") {
        console.error("Game is not in lobby phase:", gameData.game_phase)
        return false
      }

      // Check if player limit reached
      const { data: existingPlayers, error: playersError } = await supabase
        .from("players")
        .select("id")
        .eq("game_id", this.gameId)

      if (playersError) {
        console.error("Error checking existing players:", serializeError(playersError))
        return false
      }

      if (existingPlayers && existingPlayers.length >= 4) {
        console.error("Game is full")
        return false
      }

      // Prepare player data
      const playerData = {
        id: player.id,
        game_id: this.gameId,
        name: player.name.trim(),
        avatar: player.avatar,
        karma: player.karma || 0,
        position: player.position || 0,
        is_host: player.isHost || false,
        is_ready: player.isReady || true,
        is_online: player.isOnline || true,
        actions: player.actions || [],
        color: player.color,
      }

      // Validate player data
      const playerValidation = validatePlayerData(playerData)
      if (!playerValidation.isValid) {
        console.error("Player data validation failed:", playerValidation.errors)
        return false
      }

      // Insert player
      const { error: playerError } = await supabase.from("players").insert(playerData)

      if (playerError) {
        console.error("Error inserting player:", serializeError(playerError))
        return false
      }

      // Add join message to log
      await this.addToGameLog(`${player.name} joined the game`)

      console.log("=== Game Join Completed Successfully ===")
      return true
    } catch (error) {
      console.error("=== Game Join Failed ===")
      console.error("Error details:", serializeError(error))
      return false
    }
  }

  // Start the game
  async startGame(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("games")
        .update({
          game_phase: "playing",
          last_activity: new Date().toISOString(),
        })
        .eq("id", this.gameId)

      if (error) {
        console.error("Error starting game:", serializeError(error))
        return false
      }

      await this.addToGameLog("Game started! Let the adventure begin!")
      return true
    } catch (error) {
      console.error("Error starting game:", serializeError(error))
      return false
    }
  }

  // Roll dice
  async rollDice(): Promise<number> {
    const diceValue = Math.floor(Math.random() * 6) + 1

    try {
      const { error } = await supabase
        .from("games")
        .update({
          dice_value: diceValue,
          last_activity: new Date().toISOString(),
        })
        .eq("id", this.gameId)

      if (error) {
        console.error("Error updating dice value:", serializeError(error))
      }
      return diceValue
    } catch (error) {
      console.error("Error rolling dice:", serializeError(error))
      return diceValue
    }
  }

  // Move player and trigger events
  async movePlayer(playerId: string, steps: number): Promise<GameTile | null> {
    try {
      const gameState = await this.getGameState()
      if (!gameState) {
        console.error("No game state found")
        return null
      }

      const player = gameState.players[playerId]
      if (!player) {
        console.error("Player not found:", playerId)
        return null
      }

      const newPosition = Math.min(player.position + steps, gameState.board.tiles.length - 1)
      const tile = gameState.board.tiles[newPosition]

      // Update player position
      const { error: playerError } = await supabase.from("players").update({ position: newPosition }).eq("id", playerId)

      if (playerError) {
        console.error("Error updating player position:", serializeError(playerError))
        return null
      }

      // Set current event
      const { error: gameError } = await supabase
        .from("games")
        .update({
          current_event: tile,
          last_activity: new Date().toISOString(),
        })
        .eq("id", this.gameId)

      if (gameError) {
        console.error("Error setting current event:", serializeError(gameError))
      }

      // Add to game log
      await this.addToGameLog(`${player.name} rolled ${steps} and landed on "${tile.title}"`)

      return tile
    } catch (error) {
      console.error("Error moving player:", serializeError(error))
      return null
    }
  }

  // Resolve tile event
  async resolveEvent(playerId: string, success: boolean, choice?: string): Promise<void> {
    try {
      const gameState = await this.getGameState()
      if (!gameState || !gameState.currentEvent) return

      const player = gameState.players[playerId]
      const event = gameState.currentEvent

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
      const newActions = [...player.actions, actionDescription]
      const { error: playerError } = await supabase
        .from("players")
        .update({
          karma: player.karma + karmaChange,
          actions: newActions,
        })
        .eq("id", playerId)

      if (playerError) {
        console.error("Error updating player:", serializeError(playerError))
        return
      }

      // Get all players to determine next player
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", this.gameId)
        .order("created_at")

      if (playersError) {
        console.error("Error getting players:", serializeError(playersError))
        return
      }

      const playerIds = playersData.map((p) => p.id)
      const currentIndex = playerIds.indexOf(gameState.currentPlayerId)
      const nextIndex = (currentIndex + 1) % playerIds.length
      const nextPlayerId = playerIds[nextIndex]

      // Clear current event and move to next player
      const { error: gameError } = await supabase
        .from("games")
        .update({
          current_event: null,
          current_player_index: nextIndex,
          current_player_id: nextPlayerId,
          last_activity: new Date().toISOString(),
        })
        .eq("id", this.gameId)

      if (gameError) {
        console.error("Error updating game state:", serializeError(gameError))
      }

      // Add to game log
      const karmaText = karmaChange > 0 ? `gained ${karmaChange}` : `lost ${Math.abs(karmaChange)}`
      await this.addToGameLog(`${player.name} ${actionDescription} and ${karmaText} karma`)

      // Check if player reached the end
      if (player.position >= gameState.board.tiles.length - 1) {
        await this.endGame()
      }
    } catch (error) {
      console.error("Error resolving event:", serializeError(error))
    }
  }

  // End the game
  async endGame(): Promise<void> {
    try {
      const { error } = await supabase
        .from("games")
        .update({
          game_phase: "ended",
          last_activity: new Date().toISOString(),
        })
        .eq("id", this.gameId)

      if (error) {
        console.error("Error ending game:", serializeError(error))
        return
      }

      await this.addToGameLog("Game ended! Generating stories...")
    } catch (error) {
      console.error("Error ending game:", serializeError(error))
    }
  }

  // Chat functions
  async sendChatMessage(playerId: string, playerName: string, message: string): Promise<void> {
    try {
      const { error } = await supabase.from("chat_messages").insert({
        game_id: this.gameId,
        player_id: playerId,
        player_name: playerName,
        message: message.trim(),
      })

      if (error) {
        console.error("Error sending chat message:", serializeError(error))
      }
    } catch (error) {
      console.error("Error sending chat message:", serializeError(error))
    }
  }

  // Register for connection status updates
  onConnectionStatusChange(callback: (status: "connected" | "disconnected" | "reconnecting") => void): void {
    this.connectionStatusCallbacks.push(callback)

    // Immediately notify of current status
    callback(this.isConnected ? "connected" : "disconnected")
  }

  // Notify all connection status callbacks
  private notifyConnectionStatus(status: "connected" | "disconnected" | "reconnecting"): void {
    this.connectionStatusCallbacks.forEach((callback) => {
      try {
        callback(status)
      } catch (error) {
        console.error("Error in connection status callback:", error)
      }
    })
  }

  // Force immediate state refresh
  async forceStateRefresh(): Promise<GameState | null> {
    console.log("Forcing state refresh...")
    try {
      const gameState = await this.getGameState()
      console.log("Forced refresh result:", gameState ? "success" : "failed")
      return gameState
    } catch (error) {
      console.error("Error in forced refresh:", error)
      return null
    }
  }

  // Improved real-time listeners with fallback polling
  onGameStateChange(callback: (gameState: GameState | null) => void): void {
    console.log("Setting up game state listeners...")

    // Immediate load first
    this.getGameState().then((gameState) => {
      console.log("Initial game state load:", gameState ? "success" : "failed")
      callback(gameState)

      // If we got a game state, we're connected
      if (gameState) {
        this.isConnected = true
        this.notifyConnectionStatus("connected")
      }
    })

    // Try to set up real-time subscription
    this.setupRealtimeSubscription(callback)

    // Set up polling as fallback (faster polling for better responsiveness)
    this.setupPollingFallback(callback)
  }

  private setupRealtimeSubscription(callback: (gameState: GameState | null) => void): void {
    try {
      console.log("Attempting to set up real-time subscription...")

      // Check if we already have a subscription for this game
      const channelName = `game-${this.gameId}`
      if (this.channels.has(channelName)) {
        console.log("Subscription already exists for", channelName)
        return
      }

      // Subscribe to game changes
      const gameSubscription = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "games", filter: `id=eq.${this.gameId}` },
          async (payload) => {
            console.log("Real-time game update:", payload.eventType)
            const gameState = await this.getGameState()
            callback(gameState)
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "players", filter: `game_id=eq.${this.gameId}` },
          async (payload) => {
            console.log("Real-time player update:", payload.eventType)
            const gameState = await this.getGameState()
            callback(gameState)
          },
        )
        .subscribe((status) => {
          console.log("Subscription status:", status)
          if (status === "SUBSCRIBED") {
            this.isConnected = true
            this.reconnectAttempts = 0
            console.log("✅ Real-time subscription established")
            this.notifyConnectionStatus("connected")
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            this.isConnected = false
            console.log("❌ Real-time subscription failed, using polling fallback")
            this.notifyConnectionStatus("disconnected")
            this.handleReconnection(callback)
          }
        })

      // Store the channel
      this.channels.set(channelName, gameSubscription)
      this.subscriptions.push(gameSubscription)
    } catch (error) {
      console.error("Error setting up real-time subscription:", error)
      this.isConnected = false
      this.notifyConnectionStatus("disconnected")
    }
  }

  private setupPollingFallback(callback: (gameState: GameState | null) => void): void {
    // Clear existing polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    // Set up faster polling for better responsiveness
    this.pollingInterval = setInterval(async () => {
      if (!this.isConnected) {
        try {
          const gameState = await this.getGameState()
          callback(gameState)
        } catch (error) {
          console.error("Polling error:", error)
        }
      }
    }, 1000) // Faster polling - every 1 second

    console.log("📡 Polling fallback set up (1s interval)")
  }

  private handleReconnection(callback: (gameState: GameState | null) => void): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached, relying on polling")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`)
    this.notifyConnectionStatus("reconnecting")

    setTimeout(() => {
      this.setupRealtimeSubscription(callback)
    }, delay)
  }

  onChatMessages(callback: (messages: ChatMessage[]) => void): void {
    console.log("Setting up chat message listeners...")

    // Check if we already have a chat subscription
    const chatChannelName = `chat-${this.gameId}`
    if (this.channels.has(chatChannelName)) {
      console.log("Chat subscription already exists for", chatChannelName)
      // Just do initial load
      this.getChatMessages().then(callback)
      return
    }

    // Try real-time subscription
    try {
      const chatSubscription = supabase
        .channel(chatChannelName)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `game_id=eq.${this.gameId}` },
          async (payload) => {
            console.log("Real-time chat update:", payload.eventType)
            const messages = await this.getChatMessages()
            callback(messages)
          },
        )
        .subscribe((status) => {
          console.log("Chat subscription status:", status)
        })

      // Store the channel
      this.channels.set(chatChannelName, chatSubscription)
      this.subscriptions.push(chatSubscription)
    } catch (error) {
      console.error("Error setting up chat subscription:", error)
    }

    // Initial load
    this.getChatMessages().then(callback)

    // Polling fallback for chat
    const chatPolling = setInterval(async () => {
      try {
        const messages = await this.getChatMessages()
        callback(messages)
      } catch (error) {
        console.error("Chat polling error:", error)
      }
    }, 3000)

    // Store polling interval for cleanup
    this.subscriptions.push({ unsubscribe: () => clearInterval(chatPolling) })
  }

  // Helper functions
  async getGameState(): Promise<GameState | null> {
    try {
      // Get game data - use maybeSingle() to handle potential multiple rows
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", this.gameId)
        .maybeSingle()

      if (gameError) {
        console.error("Error getting game data:", serializeError(gameError))
        return null
      }

      if (!gameData) {
        console.error("No game data found for ID:", this.gameId)
        return null
      }

      // Get players data
      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("*")
        .eq("game_id", this.gameId)

      if (playersError) {
        console.error("Error getting players data:", serializeError(playersError))
        return null
      }

      // Convert players array to object
      const players: { [key: string]: Player } = {}
      if (playersData) {
        playersData.forEach((p) => {
          players[p.id] = {
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            karma: p.karma,
            position: p.position,
            isHost: p.is_host,
            isReady: p.is_ready,
            isOnline: p.is_online,
            actions: p.actions || [],
            color: p.color,
          }
        })
      }

      return {
        id: gameData.id,
        theme: gameData.theme,
        board: gameData.board,
        players,
        currentPlayerIndex: gameData.current_player_index,
        currentPlayerId: gameData.current_player_id,
        gamePhase: gameData.game_phase as "lobby" | "playing" | "ended",
        diceValue: gameData.dice_value,
        currentEvent: gameData.current_event,
        gameLog: gameData.game_log || [],
        createdAt: gameData.created_at,
        lastActivity: gameData.last_activity,
      }
    } catch (error) {
      console.error("Error getting game state:", serializeError(error))
      return null
    }
  }

  private async getChatMessages(): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("game_id", this.gameId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error getting chat messages:", serializeError(error))
        return []
      }

      return (data || []).map((msg) => ({
        id: msg.id,
        playerId: msg.player_id,
        playerName: msg.player_name,
        message: msg.message,
        timestamp: new Date(msg.created_at).getTime(),
      }))
    } catch (error) {
      console.error("Error getting chat messages:", serializeError(error))
      return []
    }
  }

  private async addToGameLog(message: string): Promise<void> {
    try {
      // Get current log
      const { data: gameData, error: getError } = await supabase
        .from("games")
        .select("game_log")
        .eq("id", this.gameId)
        .single()

      if (getError) {
        console.error("Error getting game log:", serializeError(getError))
        return
      }

      const currentLog = gameData?.game_log || []
      const newLog = [...currentLog, message]

      // Update log
      const { error: updateError } = await supabase.from("games").update({ game_log: newLog }).eq("id", this.gameId)

      if (updateError) {
        console.error("Error updating game log:", serializeError(updateError))
      }
    } catch (error) {
      console.error("Error adding to game log:", serializeError(error))
    }
  }

  cleanup(): void {
    console.log("Cleaning up game manager...")

    // Clear polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => {
      try {
        if (subscription.unsubscribe) {
          subscription.unsubscribe()
        } else {
          supabase.removeChannel(subscription)
        }
      } catch (error) {
        console.error("Error cleaning up subscription:", error)
      }
    })
    this.subscriptions = []

    // Clear all channels
    this.channels.clear()

    this.isConnected = false
    this.reconnectAttempts = 0
    this.connectionStatusCallbacks = []

    console.log("Game manager cleanup completed")
  }

  // Remove player from game
  async leaveGame(playerId: string): Promise<void> {
    try {
      // Get player name before removing
      const { data: playerData, error: getError } = await supabase
        .from("players")
        .select("name")
        .eq("id", playerId)
        .single()

      if (getError) {
        console.error("Error getting player data:", serializeError(getError))
        return
      }

      // Remove player
      const { error: deleteError } = await supabase.from("players").delete().eq("id", playerId)

      if (deleteError) {
        console.error("Error deleting player:", serializeError(deleteError))
        return
      }

      // Add leave message to log
      if (playerData) {
        await this.addToGameLog(`${playerData.name} left the game`)
      }
    } catch (error) {
      console.error("Error leaving game:", serializeError(error))
    }
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
  return ["🧙‍♂️", "🦸‍♀️", "🤖", "🐉", "🦄", "🎭"]
}
