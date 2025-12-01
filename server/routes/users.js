import express from 'express';
import pool from '../db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users (for finding chat contacts)
router.get('/search', authenticateToken, async (req, res) => {
    const { query } = req.query;

    if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    try {
        const result = await pool.query(
            `SELECT id, username, email, created_at 
       FROM users 
       WHERE (username ILIKE $1 OR email ILIKE $1) 
       AND id != $2
       LIMIT 20`,
            [`%${query}%`, req.user.userId]
        );

        res.json({ users: result.rows });
    } catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (for chat list)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, username, email, created_at FROM users WHERE id != $1 ORDER BY username',
            [req.user.userId]
        );

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
