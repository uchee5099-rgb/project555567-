const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

// Optional auth helper
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length > 0) {
          req.user = result.rows[0];
        }
      }
    }
  } catch (e) {
    // Ignore invalid token for optional auth
  }
  next();
}

router.get('/', optionalAuth, taskController.getTasks);
router.get('/:id', optionalAuth, taskController.getTaskById);
router.post('/:id/submit', authenticate, taskController.submitTask);

module.exports = router;
