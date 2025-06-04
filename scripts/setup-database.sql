-- Complete database setup script for StoryForge
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
CREATE INDEX idx_players_created_at ON players(created_at);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can make these more restrictive later)
CREATE POLICY "Allow all operations on games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all operations on chat_messages" ON chat_messages FOR ALL USING (true);

-- Add some helpful functions
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE games SET last_activity = NOW() WHERE id = NEW.game_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update last_activity when players are modified
CREATE TRIGGER update_game_activity_on_player_change
  AFTER INSERT OR UPDATE OR DELETE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Create trigger to update last_activity when chat messages are added
CREATE TRIGGER update_game_activity_on_chat
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Test the setup by inserting and removing a test record
INSERT INTO games (id, theme, board, current_player_id) 
VALUES ('SETUP_TEST', 'Setup Test', '{"tiles": [], "theme": "test", "storyContext": "test"}', 'test-player');

INSERT INTO players (id, game_id, name, avatar, color) 
VALUES ('test-player', 'SETUP_TEST', 'Test Player', '🧙‍♂️', 'bg-blue-500');

-- Clean up test data
DELETE FROM players WHERE id = 'test-player';
DELETE FROM games WHERE id = 'SETUP_TEST';

-- Verify tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('games', 'players', 'chat_messages')
ORDER BY table_name;

-- Success message
SELECT 'Database setup completed successfully! All tables created and configured.' as status;
