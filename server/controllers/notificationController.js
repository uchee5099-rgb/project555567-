const db = require('../database/db');

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT * FROM notifications WHERE user_id = $1', [userId]);
    return res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.error('[GetNotifications Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
}

async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;
    await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
    return res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (err) {
    console.error('[MarkAllAsRead Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
}

module.exports = {
  getNotifications,
  markAllAsRead
};
