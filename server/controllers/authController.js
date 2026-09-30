const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateReferralCode(name) {
  const cleanName = (name || 'USER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${cleanName}${random}`;
}

async function register(req, res) {
  try {
    const { fullName, email, phone, password, confirmPassword, referralCode } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!phone || !/^[0-9+]{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Check referral code if provided
    let referrer = null;
    if (referralCode && referralCode.trim()) {
      const refResult = await db.query('SELECT * FROM users WHERE referral_code = $1', [referralCode.trim().toUpperCase()]);
      if (refResult.rows.length > 0) {
        referrer = refResult.rows[0];
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const newRefCode = generateReferralCode(fullName);

    // Insert user
    const insertResult = await db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by, role, is_account_activated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [fullName.trim(), cleanEmail, phone.trim(), passwordHash, newRefCode, referrer ? referrer.referral_code : null, 'user', false]
    );

    const newUser = insertResult.rows[0];

    // If referred, create a referral record
    if (referrer) {
      await db.query(
        'INSERT INTO referrals (referrer_id, referee_id, reward_amount, status) VALUES ($1, $2, $3, $4)',
        [referrer.id, newUser.id, 250.00, 'pending']
      );

      // Add a notification for referrer
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
        [referrer.id, 'New Referral Signup!', `${newUser.full_name} registered using your referral code. Bonus will be credited upon task completion.`, 'info', '/referrals']
      );
    }

    // Welcome notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [newUser.id, 'Welcome to EarnFlow!', 'Explore high-paying tasks, invite your friends, and start earning today.', 'success', '/tasks']
    );

    // Sign JWT
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    delete newUser.password_hash;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to EarnFlow.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('[Register Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during registration. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const result = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account suspended. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    delete user.password_hash;

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during sign in.' });
  }
}

async function getMe(req, res) {
  try {
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];
    delete user.password_hash;

    const walletResult = await db.query('SELECT * FROM wallets WHERE user_id = $1', [user.id]);
    const wallet = walletResult.rows[0] || {
      available_balance: 0.00,
      total_earned: 0.00,
      pending_rewards: 0.00,
      referral_rewards: 0.00,
      total_withdrawn: 0.00
    };

    const notifsResult = await db.query('SELECT * FROM notifications WHERE user_id = $1', [user.id]);
    const unreadCount = notifsResult.rows.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      user,
      wallet,
      unreadNotifications: unreadCount
    });
  } catch (err) {
    console.error('[GetMe Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

function logout(req, res) {
  return res.json({ success: true, message: 'Signed out successfully.' });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
