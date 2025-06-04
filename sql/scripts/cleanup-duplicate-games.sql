-- Add a script to clean up any duplicate games that might be causing the multiple rows issue

-- Check for duplicate games
SELECT id, COUNT(*) as count 
FROM games 
GROUP BY id 
HAVING COUNT(*) > 1;

-- If there are duplicates, keep only the most recent one
DELETE FROM games 
WHERE ctid NOT IN (
  SELECT MAX(ctid) 
  FROM games 
  GROUP BY id
);

-- Check for orphaned players (players without games)
DELETE FROM players 
WHERE game_id NOT IN (SELECT id FROM games);

-- Check for orphaned chat messages
DELETE FROM chat_messages 
WHERE game_id NOT IN (SELECT id FROM games);

-- Verify cleanup
SELECT 'Games' as table_name, COUNT(*) as count FROM games
UNION ALL
SELECT 'Players' as table_name, COUNT(*) as count FROM players
UNION ALL
SELECT 'Chat Messages' as table_name, COUNT(*) as count FROM chat_messages;
