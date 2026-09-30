const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Moniepoint MFB',
  'OPay (PayCom)',
  'PalmPay',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Taj Bank',
  'Titan Trust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'Wema Bank / ALAT',
  'Zenith Bank'
];

async function getWallet(req, res) {
  try {
    const userId = req.user.id;
    const walletRes = await db.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    const wallet = walletRes.rows[0] || {
      available_balance: 0.00,
      total_earned: 0.00,
      pending_rewards: 0.00,
      referral_rewards: 0.00,
      total_withdrawn: 0.00
    };

    const userRes = await db.query('SELECT is_account_activated FROM users WHERE id = $1', [userId]);
    const isActivated = userRes.rows[0]?.is_account_activated || false;

    // Fetch minimum withdrawal setting
    const settingsRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['min_withdrawal']);
    const minWithdrawal = parseFloat(settingsRes.rows[0]?.value || '1000.00');

    // Fetch activation fee setting
    const feeRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['activation_fee']);
    const activationFee = parseFloat(feeRes.rows[0]?.value || '1000.00');

    return res.json({
      success: true,
      wallet: {
        availableBalance: parseFloat(wallet.available_balance || 0),
        totalEarned: parseFloat(wallet.total_earned || 0),
        pendingRewards: parseFloat(wallet.pending_rewards || 0),
        referralRewards: parseFloat(wallet.referral_rewards || 0),
        totalWithdrawn: parseFloat(wallet.total_withdrawn || 0)
      },
      isAccountActivated: isActivated,
      minWithdrawal,
      activationFee,
      supportedBanks: NIGERIAN_BANKS
    });
  } catch (err) {
    console.error('[GetWallet Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve wallet details.' });
  }
}

async function getTransactions(req, res) {
  try {
    const userId = req.user.id;
    const { type, status } = req.query;

    const txRes = await db.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
    let transactions = txRes.rows;

    if (type && type !== 'All') {
      transactions = transactions.filter(t => t.type.toLowerCase() === type.toLowerCase());
    }

    if (status && status !== 'All') {
      transactions = transactions.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }

    return res.json({ success: true, transactions });
  } catch (err) {
    console.error('[GetTransactions Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve transactions.' });
  }
}

async function getWithdrawals(req, res) {
  try {
    const userId = req.user.id;
    const wthRes = await db.query('SELECT * FROM withdrawals WHERE user_id = $1', [userId]);
    return res.json({ success: true, withdrawals: wthRes.rows });
  } catch (err) {
    console.error('[GetWithdrawals Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve withdrawal history.' });
  }
}

async function requestWithdrawal(req, res) {
  try {
    const userId = req.user.id;
    const { amount, bankName, accountName, accountNumber } = req.body;

    // Check account activation FIRST (Core requirement!)
    const userRes = await db.query('SELECT is_account_activated FROM users WHERE id = $1', [userId]);
    const isActivated = userRes.rows[0]?.is_account_activated || false;

    if (!isActivated) {
      return res.status(403).json({
        success: false,
        error_code: 'ACCOUNT_NOT_ACTIVATED',
        message: 'account not activated'
      });
    }

    // Input validation
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Withdrawal amount must be greater than zero.' });
    }

    // Min withdrawal check
    const settingsRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['min_withdrawal']);
    const minWithdrawal = parseFloat(settingsRes.rows[0]?.value || '1000.00');

    if (numAmount < minWithdrawal) {
      return res.status(400).json({
        success: false,
        message: `Withdrawal amount must meet the minimum of ₦${minWithdrawal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}.`
      });
    }

    // Bank details check
    if (!bankName || !bankName.trim()) {
      return res.status(400).json({ success: false, message: 'Bank name is required.' });
    }
    if (!accountName || !accountName.trim()) {
      return res.status(400).json({ success: false, message: 'Account name is required.' });
    }
    if (!accountNumber || !/^\d{10}$/.test(accountNumber.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Nigerian NUBAN account number.' });
    }

    // Wallet balance check
    const walletRes = await db.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    const wallet = walletRes.rows[0];
    const available = parseFloat(wallet?.available_balance || 0);

    if (numAmount > available) {
      return res.status(400).json({
        success: false,
        message: `Requested amount (₦${numAmount.toFixed(2)}) exceeds your available balance (₦${available.toFixed(2)}).`
      });
    }

    // Deduct available balance
    await db.query('UPDATE wallets SET available_balance = available_balance - $1 WHERE user_id = $2', [numAmount, userId]);

    // Create withdrawal record
    const ref = `WTH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const wthRes = await db.query(
      'INSERT INTO withdrawals (user_id, amount, bank_name, account_name, account_number, reference) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, numAmount, bankName.trim(), accountName.trim(), accountNumber.trim(), ref]
    );

    // Create transaction record
    await db.query(
      'INSERT INTO transactions (user_id, type, amount, status, description, reference, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        userId,
        'withdrawal',
        -numAmount,
        'pending',
        `Withdrawal to ${bankName.trim()} (${accountNumber.trim()})`,
        ref,
        JSON.stringify({ bankName, accountName, accountNumber })
      ]
    );

    // Notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'Withdrawal Request Submitted', `Your request for ₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} has been received and is pending administrative approval.`, 'info', '/withdraw']
    );

    return res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted.',
      withdrawal: wthRes.rows[0]
    });
  } catch (err) {
    console.error('[RequestWithdrawal Error]', err);
    return res.status(500).json({ success: false, message: 'Server error while processing withdrawal request.' });
  }
}

module.exports = {
  getWallet,
  getTransactions,
  getWithdrawals,
  requestWithdrawal,
  NIGERIAN_BANKS
};
