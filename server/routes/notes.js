import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all notes for current user
router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `SELECT id, title, content, created_at, updated_at 
       FROM notes 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
            [userId]
        );

        res.json({ notes: result.rows });
    } catch (error) {
        console.error('Notes fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new note
router.post('/', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
        return res.status(400).json({ error: 'Title and content cannot be empty' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO notes (user_id, title, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, title, content, created_at, updated_at`,
            [userId, title.trim(), content.trim()]
        );

        res.status(201).json({
            message: 'Note created',
            note: result.rows[0]
        });
    } catch (error) {
        console.error('Note creation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a note
router.put('/:noteId', authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    try {
        const result = await pool.query(
            `UPDATE notes 
       SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 AND user_id = $4 
       RETURNING id, title, content, created_at, updated_at`,
            [title.trim(), content.trim(), noteId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found or unauthorized' });
        }

        res.json({
            message: 'Note updated',
            note: result.rows[0]
        });
    } catch (error) {
        console.error('Note update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a note
router.delete('/:noteId', authenticateToken, async (req, res) => {
    const { noteId } = req.params;
    const userId = req.user.userId;

    try {
        const result = await pool.query(
            `DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id`,
            [noteId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found or unauthorized' });
        }

        res.json({ message: 'Note deleted' });
    } catch (error) {
        console.error('Note deletion error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
