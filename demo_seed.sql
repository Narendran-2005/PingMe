SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE messages;
TRUNCATE TABLE conversation_members;
TRUNCATE TABLE conversations;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert 4 demo users
INSERT INTO users (id, username, email, display_name, avatar_color, password_hash, status, created_at) VALUES 
(1, 'ajay', 'ajay@pingme.dev', 'Ajay Kumar', '#1FD89C', '$2a$10$zPInoqBTRJ.UgY/5R9snfuy4jjIScT.LcgxMEfJLEJGOiMkmvBvFO', 'OFFLINE', NOW()),
(2, 'bala', 'bala@pingme.dev', 'Balaji', '#67C9E0', '$2a$10$zPInoqBTRJ.UgY/5R9snfuy4jjIScT.LcgxMEfJLEJGOiMkmvBvFO', 'OFFLINE', NOW()),
(3, 'chandra', 'chandra@pingme.dev', 'Chandra Rajan', '#38BFA0', '$2a$10$zPInoqBTRJ.UgY/5R9snfuy4jjIScT.LcgxMEfJLEJGOiMkmvBvFO', 'OFFLINE', NOW()),
(4, 'dinesh', 'dinesh@pingme.dev', 'Dinesh', '#F0B232', '$2a$10$zPInoqBTRJ.UgY/5R9snfuy4jjIScT.LcgxMEfJLEJGOiMkmvBvFO', 'OFFLINE', NOW());

-- 2. Insert Conversations
INSERT INTO conversations (id, type, name, created_by, created_at) VALUES 
(1, 'DIRECT', NULL, 1, NOW()),
(2, 'DIRECT', NULL, 1, NOW()),
(3, 'GROUP', 'Final year Project', 1, NOW());

-- 3. Insert Conversation Members
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at) VALUES 
(1, 1, 'MEMBER', NOW()),
(1, 2, 'MEMBER', NOW()),
(2, 1, 'MEMBER', NOW()),
(2, 3, 'MEMBER', NOW()),
(3, 1, 'ADMIN', NOW()),
(3, 2, 'MEMBER', NOW()),
(3, 3, 'MEMBER', NOW()),
(3, 4, 'MEMBER', NOW());

-- 4. Insert Messages
INSERT INTO messages (conversation_id, sender_id, content, status, is_deleted, created_at) VALUES 
-- Direct 1 (Ajay  Bala)
(1, 1, 'Hey Bala, have you started on the database schema?', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 2, 'Just getting to it now. Are we still using MySQL?', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 115 MINUTE)),
(1, 1, 'Yeah, let''s stick with MySQL. Let me know if you need help with the Spring Data JPA part.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 110 MINUTE)),
(1, 2, 'Will do, thanks!', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 105 MINUTE)),

-- Direct 2 (Ajay  Chandra)
(2, 3, 'Ajay, review the PR I just sent when you have a minute.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 'Looks good. I left a couple of minor comments on the auth filter.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(2, 3, 'Ah good catch, I will push a fix for the circular dependency.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 22 HOUR)),
(2, 1, 'Awesome, merge it when tests pass.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 21 HOUR)),

-- Group 3 (Final year Project)
(3, 1, 'Welcome everyone! We should decide on our tech stack today.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 2, 'I vote React Native so we can hit iOS and Android.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 47 HOUR)),
(3, 4, 'React Native works for me. Any thoughts on the backend?', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(3, 3, 'Let''s do Spring Boot. We all know Java well enough from last semester.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 45 HOUR)),
(3, 1, 'Perfect. Spring Boot + MySQL + React Native it is.', 'READ', FALSE, DATE_SUB(NOW(), INTERVAL 40 HOUR));
