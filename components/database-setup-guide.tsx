"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, ExternalLink, Copy, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function DatabaseSetupGuide() {
  const [copied, setCopied] = useState(false)

  const sqlScript = `-- Complete database setup script for StoryForge
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS games CASCADE;

-- Create games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  board JSONB NOT NULL,
  current_player_index INTEGER DEFAULT 0,
  current_player_id TEXT NOT NULL,
  game_phase TEXT DEFAULT 'lobby' CHECK (game_phase IN ('lobby', 'playing', 'ended')),
  dice_value INTEGER DEFAULT 1,
  current_event JSONB,
  game_log TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  karma INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  is_host BOOLEAN DEFAULT FALSE,
  is_ready BOOLEAN DEFAULT TRUE,
  is_online BOOLEAN DEFAULT TRUE,
  actions TEXT[] DEFAULT '{}',
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_chat_messages_game_id ON chat_messages(game_id);
CREATE INDEX idx_games_last_activity ON games(last_activity);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations on games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true);

-- Success message
SELECT 'Database setup completed successfully!' as status;`

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Database Setup Required</h1>
          <p className="text-xl text-blue-200">
            Your Supabase database needs to be configured before you can play StoryForge
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="w-5 h-5" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">1</Badge>
                <div>
                  <p className="text-white font-medium">Open your Supabase Dashboard</p>
                  <p className="text-blue-200 text-sm">Go to your project at supabase.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">2</Badge>
                <div>
                  <p className="text-white font-medium">Navigate to SQL Editor</p>
                  <p className="text-blue-200 text-sm">Find the SQL Editor in the left sidebar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-1">3</Badge>
                <div>
                  <p className="text-white font-medium">Copy and run the setup script</p>
                  <p className="text-blue-200 text-sm">Paste the SQL script below and click "Run"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1">4</Badge>
                <div>
                  <p className="text-white font-medium">Refresh this page</p>
                  <p className="text-blue-200 text-sm">Once the script runs successfully, refresh to continue</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>SQL Setup Script</span>
              <Button
                onClick={copyScript}
                size="sm"
                className={`${copied ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Script"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/30 p-4 rounded-lg border border-white/10 overflow-x-auto">
              <pre className="text-sm text-green-300 whitespace-pre-wrap font-mono">{sqlScript}</pre>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Button
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Supabase Dashboard
          </Button>

          <p className="text-blue-200 text-sm">
            After running the script, refresh this page to continue with your StoryForge adventure!
          </p>
        </div>
      </div>
    </div>
  )
}
