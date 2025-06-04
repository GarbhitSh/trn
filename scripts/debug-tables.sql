-- Check if tables exist and their structure
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('games', 'players', 'chat_messages')
ORDER BY table_name, ordinal_position;

-- Check table constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name IN ('games', 'players', 'chat_messages')
ORDER BY tc.table_name, tc.constraint_name;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('games', 'players', 'chat_messages');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('games', 'players', 'chat_messages');

-- Test basic insert capability
INSERT INTO games (id, theme, board, current_player_id) 
VALUES ('TEST123', 'Test Theme', '{"tiles": []}', 'test-player-id')
ON CONFLICT (id) DO NOTHING;

-- Check if the test insert worked
SELECT id, theme, current_player_id, created_at 
FROM games 
WHERE id = 'TEST123';

-- Clean up test data
DELETE FROM games WHERE id = 'TEST123';
