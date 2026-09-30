const bcrypt = require('bcryptjs');
const db = require('../database/db');

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, phone, avatarUrl } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!phone || !/^[0-9+]{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    const updateRes = await db.query(
      'UPDATE users SET full_name = $1, phone = $2, avatar_url = $3 WHERE id = $4 RETURNING *',
      [fullName.trim(), phone.trim(), avatarUrl || null, userId]
    );

    const updatedUser = updateRes.rows[0];
    delete updatedUser.password_hash;

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('[UpdateProfile Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match.' });
    }

    const userRes = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    // Create notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
      [userId, 'Security Alert: Password Changed', 'Your account password was updated successfully. If you did not make this change, please contact support immediately.', 'warning']
    );

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('[ChangePassword Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
}

module.exports = {
  updateProfile,
  changePassword
};
