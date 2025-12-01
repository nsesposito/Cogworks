import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get message history with a specific user
router.get('/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const result = await pool.query(
            `SELECT m.id, m.sender_id, m.recipient_id, m.content, m.timestamp, m.read_status,
              u.username as sender_username
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.timestamp DESC
       LIMIT $3 OFFSET $4`,
            [currentUserId, userId, limit, offset]
        );

        // Reverse to show oldest first
        const messages = result.rows.reverse();

        res.json({ messages });
    } catch (error) {
        console.error('Message fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send a message
router.post('/', authenticateToken, async (req, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user.userId;

    if (!recipientId || !content) {
        return res.status(400).json({ error: 'Recipient and content are required' });
    }

    if (content.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (content.length > 5000) {
        return res.status(400).json({ error: 'Message too long (max 5000 characters)' });
    }

    try {
        // Verify recipient exists
        const recipientCheck = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [recipientId]
        );

        if (recipientCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        // Insert message
        const result = await pool.query(
            `INSERT INTO messages (sender_id, recipient_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, recipient_id, content, timestamp, read_status`,
            [senderId, recipientId, content.trim()]
        );

        const message = result.rows[0];

        res.status(201).json({
            message: 'Message sent',
            data: message
        });
    } catch (error) {
        console.error('Message send error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mark message as read
router.put('/:messageId/read', authenticateToken, async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `UPDATE messages 
       SET read_status = TRUE 
       WHERE id = $1 AND recipient_id = $2
       RETURNING id`,
            [messageId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get conversations list (users with whom current user has exchanged messages)
router.get('/conversations/list', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT DISTINCT 
         CASE 
           WHEN m.sender_id = $1 THEN m.recipient_id
           ELSE m.sender_id
         END as user_id,
         u.username,
         u.email,
         (SELECT content FROM messages 
          WHERE (sender_id = $1 AND recipient_id = user_id) 
             OR (sender_id = user_id AND recipient_id = $1)
          ORDER BY timestamp DESC LIMIT 1) as last_message,
         (SELECT timestamp FROM messages 
          WHERE (sender_id = $1 AND recipient_id = user_id) 
             OR (sender_id = user_id AND recipient_id = $1)
          ORDER BY timestamp DESC LIMIT 1) as last_message_time,
         (SELECT COUNT(*) FROM messages 
          WHERE sender_id = user_id AND recipient_id = $1 AND read_status = FALSE) as unread_count
       FROM messages m
       JOIN users u ON (
         CASE 
           WHEN m.sender_id = $1 THEN m.recipient_id
           ELSE m.sender_id
         END = u.id
       )
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY last_message_time DESC`,
            [userId]
        );

        res.json({ conversations: result.rows });
    } catch (error) {
        console.error('Conversations fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
