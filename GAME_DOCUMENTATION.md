# 🎲 Storyforge: Complete Game Documentation

## Table of Contents
1. [Game Concept & Vision](#game-concept--vision)
2. [Core Gameplay Mechanics](#core-gameplay-mechanics)
3. [Technical Architecture](#technical-architecture)
4. [Game Flow & States](#game-flow--states)
5. [Board System](#board-system)
6. [Player System](#player-system)
7. [Event System](#event-system)
8. [AI Integration](#ai-integration)
9. [Real-time Multiplayer](#real-time-multiplayer)
10. [User Interface Design](#user-interface-design)
11. [Data Models](#data-models)
12. [API Reference](#api-reference)
13. [Development Guide](#development-guide)
14. [Deployment & Operations](#deployment--operations)
15. [Future Roadmap](#future-roadmap)

---

## Game Concept & Vision

### 🎯 Core Concept
Storyforge is a digital board game that combines traditional board game mechanics with dynamic, AI-powered storytelling. Players navigate through a procedurally generated board where each tile represents a unique story event, moral dilemma, or challenge that affects their character's karma and overall narrative.

### 🌟 Vision Statement
"To create an engaging multiplayer experience where every game tells a unique story, fostering meaningful social interactions through shared narrative experiences."

### 🎮 Target Audience
- **Primary**: Families and friend groups (ages 12+)
- **Secondary**: Board game enthusiasts
- **Tertiary**: Casual gamers interested in storytelling

### 🏆 Unique Selling Points
1. **Dynamic Storytelling**: AI-generated narratives based on player choices
2. **Dual Play Modes**: Local same-device and online multiplayer
3. **Karma System**: Moral choices affect gameplay and story outcomes
4. **Theme Flexibility**: Customizable game themes for different experiences
5. **Real-time Synchronization**: Seamless multiplayer experience

---

## Core Gameplay Mechanics

### 🎲 Basic Game Loop
1. **Turn Order**: Players take turns in sequence
2. **Dice Roll**: Current player rolls a 6-sided die
3. **Movement**: Player moves forward by the rolled amount
4. **Event Trigger**: Landing on a tile triggers an event
5. **Choice Resolution**: Player makes choices affecting karma
6. **Turn End**: Next player's turn begins
7. **Win Condition**: First player to reach the end tile wins

### ⚖️ Karma System
- **Range**: -50 to +100 karma points
- **Sources**: 
  - Successful task completion: +3 to +15 karma
  - Failed attempts: +1 to +7 karma (partial credit)
  - Moral choices: -5 to +10 karma based on decision
  - Bonus events: +5 to +20 karma
- **Impact**: Affects final story generation and player ranking

### 🎯 Victory Conditions
- **Primary**: First player to reach the final tile (position 19)
- **Secondary**: Highest karma score if multiple players finish
- **Narrative**: All players receive personalized story endings

### 🎪 Game Themes
#### Pre-built Themes (Instant Play)
1. **Family Game Night**: Wholesome family activities and bonding
2. **Office Team Building**: Professional scenarios and workplace dynamics
3. **College Roommates Reunion**: Nostalgia and friendship themes
4. **Sibling Adventure Day**: Family dynamics and sibling relationships
5. **Friends Night Out**: Social scenarios and friendship challenges

#### AI-Generated Themes
- Custom themes based on user input
- Generated using Gemini AI with specific prompts
- Fallback themes available if AI generation fails

---

## Technical Architecture

### 🏗️ System Overview
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│   (Gemini AI)   │
│                 │    │                 │    │                 │
│ • React UI      │    │ • PostgreSQL    │    │ • Story Gen     │
│ • Game Logic    │    │ • Real-time     │    │ • Theme Gen     │
│ • State Mgmt    │    │ • Auth          │    │ • Board Gen     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### 🛠️ Technology Stack

#### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks + custom game managers

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth (optional)
- **File Storage**: Supabase Storage (for assets)

#### External Services
- **AI**: Google Gemini API for story/theme generation
- **Graphics**: Placeholder image generation
- **Deployment**: Vercel

### 🔄 Data Flow Architecture
\`\`\`
User Action → Game Manager → Database Update → Real-time Broadcast → UI Update
     ↑                                                                    ↓
     └────────────────── State Synchronization ←─────────────────────────┘
\`\`\`

---

## Game Flow & States

### 🎮 Game Phases

#### 1. Setup Phase
- **Player Creation**: Name, avatar, color selection
- **Theme Selection**: Choose pre-built or generate custom theme
- **Game Mode**: Local vs Online multiplayer

#### 2. Lobby Phase
- **Player Management**: Add/remove players (max 4)
- **Game Configuration**: Theme confirmation, rules display
- **Real-time Chat**: Pre-game communication
- **Ready Check**: All players must be ready to start

#### 3. Playing Phase
- **Turn Management**: Sequential player turns
- **Dice Rolling**: Animated dice roll with sound effects
- **Movement**: Animated player token movement
- **Event Resolution**: Interactive story events
- **Progress Tracking**: Visual board state and player stats

#### 4. Ending Phase
- **Victory Detection**: Check win conditions
- **Story Generation**: AI-generated personalized endings
- **Results Display**: Final scores, karma rankings
- **Replay Options**: Start new game or return to menu

### 🔄 State Transitions
\`\`\`
Setup → Lobby → Playing → Ending
  ↑       ↑        ↑        ↓
  └───────┴────────┴────────┘
        (Return to Setup)
\`\`\`

### 📊 State Management

#### Game State Structure
\`\`\`typescript
interface GameState {
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
\`\`\`

#### Player State Structure
\`\`\`typescript
interface Player {
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
\`\`\`

---

## Board System

### 🗺️ Board Layout
- **Total Tiles**: 20 tiles per board
- **Layout Pattern**: Snake-like path (4 rows × 5 columns)
- **Movement**: Left-to-right, then right-to-left alternating
- **Visual Design**: Gradient backgrounds with thematic imagery

### 🎯 Tile Types

#### 1. Start Tile (Position 0)
- **Purpose**: Game beginning point
- **Karma**: 0 points
- **Special**: All players start here

#### 2. Task Tiles (6 per board)
- **Purpose**: Skill-based challenges
- **Examples**: Riddles, trivia, memory games
- **Karma**: +3 to +8 points (success), +1 to +4 points (failure)
- **Interaction**: Success/Fail choice

#### 3. Dare Tiles (4 per board)
- **Purpose**: Social challenges and activities
- **Examples**: Performances, impressions, physical challenges
- **Karma**: +2 to +6 points (success), +1 to +3 points (failure)
- **Interaction**: Success/Fail choice

#### 4. Action Tiles (3 per board)
- **Purpose**: Game state modifications
- **Examples**: Move extra spaces, swap positions, bonus turns
- **Karma**: -2 to +3 points
- **Interaction**: Automatic resolution

#### 5. Dilemma Tiles (4 per board)
- **Purpose**: Moral choice scenarios
- **Examples**: Ethical decisions, resource allocation
- **Karma**: Variable based on choice alignment
- **Interaction**: Multiple choice selection

#### 6. Bonus Tiles (2 per board)
- **Purpose**: Positive events and rewards
- **Examples**: Lucky discoveries, helpful encounters
- **Karma**: +5 to +15 points
- **Interaction**: Automatic positive outcome

#### 7. Finish Tile (Position 19)
- **Purpose**: Game completion point
- **Karma**: +10 points
- **Special**: Triggers game end sequence

### 🎨 Visual Design

#### Tile Appearance
- **Shape**: Rounded rectangles with gradient backgrounds
- **Colors**: Type-specific color schemes
- **Icons**: Lucide React icons for tile types
- **Animation**: Hover effects, current tile highlighting
- **Player Tokens**: Circular avatars with player colors

#### Board Background
- **Base**: Gradient from purple to blue
- **Overlay**: Thematic imagery (optional)
- **Effects**: Animated background elements
- **Responsive**: Adapts to different screen sizes

---

## Player System

### 👤 Player Creation

#### Attributes
- **Name**: 1-20 characters, unique per game
- **Avatar**: Emoji selection from predefined set
- **Color**: Background color for player token
- **Role**: Host (game creator) or Player (joiner)

#### Avatar Options
\`\`\`typescript
const avatars = ["🧙‍♂️", "🦸‍♀️", "🤖", "🐉", "🦄", "🎭", "🦸‍♂️", "🧚‍♀️"]
\`\`\`

#### Color Options
\`\`\`typescript
const colors = [
  "bg-blue-500", "bg-red-500", "bg-green-500", 
  "bg-yellow-500", "bg-purple-500", "bg-pink-500"
]
\`\`\`

### 🎮 Player Management

#### Local Mode
- **Storage**: localStorage for persistence
- **Limits**: 1-4 players per game
- **Turn Passing**: Manual device handoff
- **State**: Shared game state on single device

#### Online Mode
- **Storage**: Supabase database
- **Limits**: 1-4 players per game
- **Real-time**: Live synchronization
- **Connection**: Individual player connections

### 📊 Player Statistics

#### Game Stats
- **Position**: Current board position (0-19)
- **Karma**: Accumulated karma points
- **Actions**: List of completed actions/choices
- **Turn Order**: Determined by join order

#### Performance Tracking
- **Success Rate**: Percentage of successful task/dare attempts
- **Choice Alignment**: Moral choice consistency
- **Participation**: Active engagement metrics

---

## Event System

### 🎭 Event Types & Resolution

#### Task Events
\`\`\`typescript
interface TaskEvent {
  type: "task"
  title: string
  description: string
  karmaValue: number
  difficulty: "easy" | "medium" | "hard"
}
\`\`\`

**Resolution Flow:**
1. Display task description
2. Player attempts task
3. Success/failure determination
4. Karma adjustment
5. Action logging

#### Dare Events
\`\`\`typescript
interface DareEvent {
  type: "dare"
  title: string
  description: string
  karmaValue: number
  socialLevel: "individual" | "group"
}
\`\`\`

**Resolution Flow:**
1. Present dare challenge
2. Player performs dare
3. Group/self evaluation
4. Karma assignment
5. Social interaction bonus

#### Dilemma Events
\`\`\`typescript
interface DilemmaEvent {
  type: "dilemma"
  title: string
  description: string
  choices: string[]
  karmaValue: number
  consequence: string
}
\`\`\`

**Resolution Flow:**
1. Present moral scenario
2. Display choice options
3. Player selects choice
4. Karma calculation based on choice
5. Consequence display

### ⚡ Event Generation

#### Pre-built Events
- **Source**: Hardcoded in theme files
- **Quality**: Hand-crafted for optimal experience
- **Consistency**: Thematically aligned
- **Performance**: Instant loading

#### AI-Generated Events
- **Source**: Gemini AI with structured prompts
- **Variety**: Unique content per generation
- **Fallback**: Pre-built events if AI fails
- **Rate Limiting**: Managed API usage

### 🎯 Event Balancing

#### Karma Distribution
- **Positive Bias**: More positive than negative karma
- **Progressive Difficulty**: Later tiles more challenging
- **Choice Impact**: Meaningful decision consequences
- **Recovery Opportunities**: Bonus tiles for struggling players

#### Engagement Factors
- **Variety**: Different event types per game
- **Relevance**: Theme-appropriate content
- **Interaction**: Social elements in multiplayer
- **Pacing**: Balanced challenge progression

---

## AI Integration

### 🤖 Gemini AI Implementation

#### API Configuration
\`\`\`typescript
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
\`\`\`

#### Rate Limiting
- **Cooldown**: 5 seconds between API calls
- **Tracking**: Last call timestamp monitoring
- **Fallback**: Pre-built content when rate limited
- **Error Handling**: Graceful degradation

### 🎨 Content Generation

#### Game Board Generation
\`\`\`typescript
async function generateGameBoard(theme: string, playerCount: number): Promise<GameBoard>
\`\`\`

**Process:**
1. Check for pre-built board first
2. Construct detailed prompt with theme and requirements
3. Send request to Gemini API
4. Parse and validate JSON response
5. Return structured GameBoard object
6. Fallback to enhanced template if AI fails

#### Story Generation
\`\`\`typescript
async function generatePlayerStory(
  playerName: string,
  theme: string,
  karma: number,
  actions: string[],
  finalPosition: number,
  isWinner: boolean
): Promise<string>
\`\`\`

**Process:**
1. Compile player journey data
2. Create personalized prompt
3. Generate narrative summary
4. Return formatted story text
5. Fallback to template story if needed

#### Theme Generation
\`\`\`typescript
async function generateRandomTheme(): Promise<string>
\`\`\`

**Process:**
1. Request creative theme from AI
2. Validate theme appropriateness
3. Return theme string
4. Fallback to predefined themes

### 🛡️ Content Safety

#### Input Validation
- **Theme Filtering**: Inappropriate content detection
- **Length Limits**: Reasonable content size restrictions
- **Format Validation**: JSON structure verification

#### Output Sanitization
- **Content Review**: Family-friendly content enforcement
- **Error Handling**: Malformed response management
- **Fallback Content**: Safe default alternatives

---

## Real-time Multiplayer

### 🔄 Supabase Integration

#### Database Schema
\`\`\`sql
-- Games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  board JSONB NOT NULL,
  current_player_index INTEGER DEFAULT 0,
  current_player_id TEXT NOT NULL,
  game_phase TEXT DEFAULT 'lobby',
  dice_value INTEGER DEFAULT 1,
  current_event JSONB,
  game_log TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  karma INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT TRUE,
  actions TEXT[] DEFAULT '{}',
  color TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Real-time Subscriptions
\`\`\`typescript
// Game state changes
supabase
  .channel(`game-${gameId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'games',
    filter: `id=eq.${gameId}`
  }, handleGameUpdate)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'players',
    filter: `game_id=eq.${gameId}`
  }, handlePlayerUpdate)
  .subscribe()
\`\`\`

### 🔗 Connection Management

#### Hybrid Approach
1. **Primary**: Supabase real-time subscriptions
2. **Fallback**: Polling at 1-second intervals
3. **Status Monitoring**: Connection quality indicators
4. **Reconnection**: Automatic retry with exponential backoff

#### Connection States
- **Connected**: Real-time subscriptions active
- **Disconnected**: Using polling fallback
- **Reconnecting**: Attempting to restore real-time
- **Error**: Connection failed, manual intervention needed

#### Error Handling
\`\`\`typescript
// Connection status management
private handleConnectionError(error: any) {
  this.isConnected = false
  this.notifyConnectionStatus("disconnected")
  this.setupPollingFallback()
  this.attemptReconnection()
}
\`\`\`

### 📡 Data Synchronization

#### State Updates
- **Optimistic Updates**: Immediate UI feedback
- **Server Reconciliation**: Authoritative server state
- **Conflict Resolution**: Last-write-wins strategy
- **Rollback**: Revert on server rejection

#### Message Broadcasting
- **Game Events**: Player moves, dice rolls, event resolutions
- **Chat Messages**: Real-time communication
- **Status Updates**: Player online/offline, ready states
- **System Messages**: Game phase changes, errors

---

## User Interface Design

### 🎨 Design System

#### Color Palette
\`\`\`css
/* Primary Colors */
--purple-900: #581c87;
--blue-900: #1e3a8a;
--indigo-900: #312e81;

/* Accent Colors */
--yellow-400: #facc15;
--green-400: #4ade80;
--red-400: #f87171;
--pink-400: #f472b6;

/* Neutral Colors */
--white: #ffffff;
--gray-200: #e5e7eb;
--gray-800: #1f2937;
\`\`\`

#### Typography
- **Primary Font**: System font stack
- **Headings**: Bold, large sizes for hierarchy
- **Body Text**: Regular weight, readable sizes
- **UI Text**: Medium weight for buttons and labels

#### Spacing System
- **Base Unit**: 4px (0.25rem)
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- **Consistent**: Applied throughout all components

### 🖼️ Component Library

#### Core Components
- **Button**: Primary, secondary, outline variants
- **Card**: Container with backdrop blur effects
- **Badge**: Status indicators and labels
- **Input**: Form inputs with validation states
- **Modal**: Overlay dialogs for events

#### Game-Specific Components
- **GameBoard**: Visual board representation
- **PlayerToken**: Animated player pieces
- **DiceAnimation**: 3D dice rolling effect
- **EventModal**: Interactive story event dialogs
- **ConnectionStatus**: Real-time connection indicator

### 📱 Responsive Design

#### Breakpoints
\`\`\`css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
\`\`\`

#### Layout Adaptations
- **Mobile**: Single column, stacked components
- **Tablet**: Two-column layout, larger touch targets
- **Desktop**: Multi-column, sidebar navigation
- **Large Screens**: Expanded board view, more details

### ♿ Accessibility

#### WCAG Compliance
- **Color Contrast**: 4.5:1 minimum ratio
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML and ARIA labels
- **Focus Management**: Visible focus indicators

#### Inclusive Design
- **Text Alternatives**: Alt text for images
- **Error Messages**: Clear, actionable feedback
- **Loading States**: Progress indicators
- **Reduced Motion**: Respect user preferences

---

## Data Models

### 🗃️ Database Models

#### Game Model
\`\`\`typescript
interface GameModel {
  id: string                    // Unique game identifier
  theme: string                 // Game theme name
  board: GameBoard             // Complete board configuration
  current_player_index: number // Index of current player
  current_player_id: string    // ID of current player
  game_phase: GamePhase        // Current game state
  dice_value: number           // Last rolled dice value
  current_event: GameTile | null // Active event tile
  game_log: string[]           // Game action history
  created_at: string           // Game creation timestamp
  last_activity: string        // Last activity timestamp
}
\`\`\`

#### Player Model
\`\`\`typescript
interface PlayerModel {
  id: string           // Unique player identifier
  game_id: string      // Associated game ID
  name: string         // Player display name
  avatar: string       // Player avatar emoji
  karma: number        // Current karma score
  position: number     // Current board position
  is_host: boolean     // Host privileges flag
  is_ready: boolean    // Ready to play flag
  is_online: boolean   // Online status flag
  actions: string[]    // Completed actions list
  color: string        // Player color class
  created_at: string   // Player creation timestamp
}
\`\`\`

#### Chat Message Model
\`\`\`typescript
interface ChatMessageModel {
  id: string           // Unique message identifier
  game_id: string      // Associated game ID
  player_id: string    // Message author ID
  player_name: string  // Message author name
  message: string      // Message content
  created_at: string   // Message timestamp
}
\`\`\`

### 🎮 Game Logic Models

#### Game Board
\`\`\`typescript
interface GameBoard {
  theme: string           // Board theme
  storyContext: string    // Background story
  tiles: GameTile[]       // Array of 20 tiles
}
\`\`\`

#### Game Tile
\`\`\`typescript
interface GameTile {
  id: number                    // Tile position (0-19)
  type: TileType               // Tile category
  title: string                // Tile name
  description: string          // Tile description
  karmaValue: number           // Base karma reward
  choices?: string[]           // Dilemma choices
  consequence?: string         // Choice outcome
}

type TileType = "start" | "task" | "dare" | "action" | "dilemma" | "bonus" | "finish"
\`\`\`

### 💾 Local Storage Models

#### Player Data
\`\`\`typescript
interface PlayerData {
  playerName: string    // Player name
  theme?: string        // Selected theme
  gameId?: string       // Joined game ID
  playerId?: string     // Player identifier
  isHost: boolean       // Host status
  gameMode?: string     // "local" | "online"
}
\`\`\`

#### Game State Cache
\`\`\`typescript
interface GameStateCache {
  gameId: string        // Game identifier
  phase: string         // Current phase
  lastUpdate: number    // Cache timestamp
}
\`\`\`

---

## API Reference

### 🔌 Game Manager API

#### GameManagerSupabase
\`\`\`typescript
class GameManagerSupabase {
  constructor(gameId: string, playerId: string)
  
  // Game lifecycle
  async createGame(hostPlayer: Player, theme: string, board: GameBoard): Promise<string>
  async joinGame(player: Player): Promise<boolean>
  async startGame(): Promise<boolean>
  async endGame(): Promise<void>
  
  // Gameplay actions
  async rollDice(): Promise<number>
  async movePlayer(playerId: string, steps: number): Promise<GameTile | null>
  async resolveEvent(playerId: string, success: boolean, choice?: string): Promise<void>
  
  // Communication
  async sendChatMessage(playerId: string, playerName: string, message: string): Promise<void>
  
  // State management
  onGameStateChange(callback: (gameState: GameState | null) => void): void
  onChatMessages(callback: (messages: ChatMessage[]) => void): void
  onConnectionStatusChange(callback: (status: ConnectionStatus) => void): void
  
  // Utilities
  async forceStateRefresh(): Promise<GameState | null>
  cleanup(): void
}
\`\`\`

#### GameManagerLocal
\`\`\`typescript
class GameManagerLocal {
  constructor(gameId: string)
  
  // Game lifecycle
  async createGame(hostPlayer: Player, theme: string, board: GameBoard): Promise<string>
  async addPlayer(player: Player): Promise<boolean>
  async startGame(): Promise<boolean>
  async endGame(): Promise<void>
  
  // Gameplay actions
  async rollDice(): Promise<number>
  async movePlayer(playerId: string, steps: number): Promise<GameTile | null>
  async resolveEvent(playerId: string, success: boolean, choice?: string): Promise<void>
  
  // Communication
  async sendChatMessage(playerId: string, playerName: string, message: string): Promise<void>
  
  // State management
  onGameStateChange(callback: (gameState: GameState | null) => void): void
  onChatMessages(callback: (messages: ChatMessage[]) => void): void
  getGameState(): GameState | null
  loadGameState(state: GameState): void
  
  // Utilities
  cleanup(): void
}
\`\`\`

### 🤖 AI API

#### Gemini Integration
\`\`\`typescript
// Board generation
async function generateGameBoard(theme: string, playerCount: number): Promise<GameBoard>

// Story generation
async function generatePlayerStory(
  playerName: string,
  theme: string,
  karma: number,
  actions: string[],
  finalPosition: number,
  isWinner: boolean
): Promise<string>

// Theme generation
async function generateRandomTheme(): Promise<string>
\`\`\`

### 🗄️ Database API

#### Supabase Operations
\`\`\`typescript
// Game operations
const { data, error } = await supabase
  .from('games')
  .insert(gameData)
  .select()
  .single()

// Player operations
const { data, error } = await supabase
  .from('players')
  .update({ position: newPosition })
  .eq('id', playerId)

// Real-time subscriptions
const subscription = supabase
  .channel('game-updates')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'games'
  }, handleUpdate)
  .subscribe()
\`\`\`

---

## Development Guide

### 🛠️ Development Setup

#### Prerequisites
\`\`\`bash
# Required software
Node.js 18+
npm or yarn
Git
Code editor (VS Code recommended)

# Optional
Supabase CLI
Vercel CLI
\`\`\`

#### Environment Setup
\`\`\`bash
# Clone repository
git clone https://github.com/yourusername/storyforge.git
cd storyforge

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
\`\`\`

#### Environment Variables
\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Configuration (Optional)
GEMINI_API_KEY=your_gemini_api_key

# Development
NODE_ENV=development
\`\`\`

### 🏗️ Project Structure

\`\`\`
storyforge/
├── app/                          # Next.js App Router
│   ├── game/                     # Online multiplayer routes
│   │   ├── join/                 # Game joining page
│   │   ├── lobby/                # Game lobby
│   │   ├── play/                 # Gameplay page
│   │   └── story/                # Story results
│   ├── local/                    # Local multiplayer routes
│   │   ├── lobby/                # Local lobby
│   │   ├── play/                 # Local gameplay
│   │   └── story/                # Local story results
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── client-wrapper.tsx        # Client-side wrapper
│   ├── connection-status.tsx     # Connection indicator
│   ├── database-setup-guide.tsx  # Setup instructions
│   ├── dice-roll-animation.tsx   # Dice animation
│   ├── game-board-visual.tsx     # Board visualization
│   ├── game-state-provider.tsx   # State context
│   └── player-movement-animation.tsx # Movement effects
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── use-game.ts              # Generic game hook
│   ├── use-game-local.ts        # Local game logic
│   ├── use-game-supabase.ts     # Online game logic
│   └── use-mobile.tsx           # Mobile detection
├── lib/                         # Utility libraries
│   ├── game-logic-local.ts     # Local game manager
│   ├── game-logic-supabase.ts  # Online game manager
│   ├── gemini.ts               # AI integration
│   ├── graphics-api.ts         # Image generation
│   ├── prebuilt-boards.ts      # Pre-made boards
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Utility functions
├── public/                      # Static assets
│   └── images/                  # Game images
├── scripts/                     # Database scripts
│   ├── create-tables.sql        # Initial schema
│   ├── create-tables-v2.sql     # Updated schema
│   ├── debug-tables.sql         # Debug queries
│   └── setup-database.sql       # Setup script
├── sql/                         # Additional SQL
│   └── scripts/                 # Maintenance scripts
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── next.config.mjs              # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
\`\`\`

### 🧪 Testing Strategy

#### Unit Testing
\`\`\`typescript
// Example test structure
describe('GameManagerLocal', () => {
  test('should create game successfully', async () => {
    const manager = new GameManagerLocal('test-game')
    const result = await manager.createGame(mockPlayer, 'test-theme', mockBoard)
    expect(result).toBe('test-game')
  })
})
\`\`\`

#### Integration Testing
- **Database Operations**: Test Supabase interactions
- **Real-time Features**: Test subscription handling
- **AI Integration**: Test Gemini API calls
- **Game Logic**: Test complete game flows

#### End-to-End Testing
- **User Journeys**: Complete game sessions
- **Multiplayer Scenarios**: Multiple player interactions
- **Error Handling**: Network failures, API errors
- **Performance**: Load testing with multiple games

### 🔧 Development Tools

#### Code Quality
\`\`\`json
{
  "scripts": {
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
\`\`\`

#### Debugging
- **React DevTools**: Component inspection
- **Supabase Dashboard**: Database monitoring
- **Network Tab**: API call debugging
- **Console Logging**: Strategic log placement

---

## Deployment & Operations

### 🚀 Deployment Process

#### Vercel Deployment
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add GEMINI_API_KEY
\`\`\`

#### Environment Configuration
\`\`\`javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  images: {
    domains: ['your-image-domain.com'],
  },
}

export default nextConfig
\`\`\`

### 🗄️ Database Setup

#### Supabase Configuration
1. **Create Project**: New Supabase project
2. **Run Scripts**: Execute SQL scripts in order
3. **Configure RLS**: Set up Row Level Security
4. **API Keys**: Copy project URL and anon key

#### Database Scripts Execution Order
\`\`\`sql
-- 1. Create tables
\i scripts/create-tables-v2.sql

-- 2. Setup database
\i scripts/setup-database.sql

-- 3. Debug (if needed)
\i scripts/debug-tables.sql
\`\`\`

### 📊 Monitoring & Analytics

#### Performance Monitoring
- **Vercel Analytics**: Page load times, user interactions
- **Supabase Metrics**: Database performance, API usage
- **Error Tracking**: Runtime error monitoring
- **User Behavior**: Game completion rates, session duration

#### Health Checks
\`\`\`typescript
// API health endpoint
export async function GET() {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('games')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    return Response.json({ status: 'healthy' })
  } catch (error) {
    return Response.json({ status: 'unhealthy', error }, { status: 500 })
  }
}
\`\`\`

### 🔒 Security Considerations

#### Data Protection
- **Input Validation**: Sanitize all user inputs
- **SQL Injection**: Use parameterized queries
- **XSS Prevention**: Escape output data
- **CSRF Protection**: Implement CSRF tokens

#### API Security
- **Rate Limiting**: Prevent API abuse
- **Authentication**: Secure user sessions
- **Authorization**: Role-based access control
- **HTTPS**: Encrypt data in transit

#### Privacy Compliance
- **Data Minimization**: Collect only necessary data
- **User Consent**: Clear privacy policies
- **Data Retention**: Automatic cleanup policies
- **Right to Deletion**: User data removal

---

## Future Roadmap

### 🎯 Short-term Goals (1-3 months)

#### Performance Improvements
- **Optimize Bundle Size**: Code splitting, lazy loading
- **Database Optimization**: Query optimization, indexing
- **Caching Strategy**: Redis integration, CDN usage
- **Mobile Performance**: Touch responsiveness, battery optimization

#### User Experience Enhancements
- **Tutorial System**: Interactive onboarding
- **Accessibility Improvements**: Screen reader support, keyboard navigation
- **Offline Mode**: Service worker implementation
- **Progressive Web App**: PWA features

#### Bug Fixes & Stability
- **Connection Reliability**: Improved reconnection logic
- **State Synchronization**: Conflict resolution
- **Error Handling**: Better error messages
- **Cross-browser Compatibility**: Safari, Firefox testing

### 🚀 Medium-term Goals (3-6 months)

#### New Features
- **Spectator Mode**: Watch games in progress
- **Game Replays**: Review completed games
- **Custom Avatars**: User-uploaded images
- **Voice Chat**: WebRTC integration
- **Tournaments**: Multi-game competitions

#### AI Enhancements
- **Smarter Story Generation**: Context-aware narratives
- **Dynamic Difficulty**: Adaptive challenge levels
- **Personality Modeling**: Player behavior analysis
- **Content Moderation**: AI-powered safety filters

#### Social Features
- **Friend System**: Add and invite friends
- **Leaderboards**: Global and friend rankings
- **Achievements**: Unlock system
- **Social Sharing**: Share game results

### 🌟 Long-term Vision (6+ months)

#### Platform Expansion
- **Mobile Apps**: Native iOS/Android apps
- **Desktop App**: Electron-based application
- **Console Versions**: Nintendo Switch, Steam Deck
- **VR Support**: Virtual reality gameplay

#### Advanced Gameplay
- **Campaign Mode**: Linked story adventures
- **Character Progression**: Persistent player growth
- **Guild System**: Team-based competitions
- **Mod Support**: User-generated content

#### Business Features
- **Premium Themes**: Paid content packs
- **Custom Branding**: White-label solutions
- **Analytics Dashboard**: Game master tools
- **API Platform**: Third-party integrations

### 🔬 Research & Development

#### Emerging Technologies
- **Blockchain Integration**: NFT collectibles, decentralized hosting
- **Machine Learning**: Predictive player behavior
- **Augmented Reality**: AR board overlay
- **Cloud Gaming**: Server-side rendering

#### Experimental Features
- **Procedural Music**: Dynamic soundtrack generation
- **Emotion Recognition**: Facial expression analysis
- **Gesture Controls**: Hand tracking input
- **Brain-Computer Interface**: Thought-based interaction

---

## Conclusion

Storyforge represents a unique fusion of traditional board game mechanics with modern technology, creating an engaging multiplayer experience that adapts to each group of players. The combination of AI-generated content, real-time multiplayer capabilities, and thoughtful game design creates endless replayability while maintaining the social connection that makes board games special.

The technical architecture supports both casual local play and competitive online multiplayer, ensuring accessibility across different play styles and technical capabilities. With a robust foundation in place, Storyforge is positioned for continuous evolution and expansion into new platforms and features.

This documentation serves as both a comprehensive reference for the current implementation and a roadmap for future development, ensuring that the vision of dynamic, AI-powered storytelling in a multiplayer board game format continues to evolve and improve.

---

*Last Updated: January 2025*
*Version: 1.0.0*
*Authors: Storyforge Development Team*
