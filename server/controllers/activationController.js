const db = require('../database/db');
const https = require('https');
const { randomUUID } = require('crypto');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

// Helper to verify Paystack transaction with Paystack official API
function verifyPaystackTransaction(reference) {
  return new Promise((resolve) => {
    const isTestReference = reference.startsWith('PSTK-ACT-TEST-') ||
      reference.startsWith('ACT-VERIFY-') || reference.startsWith('PSTK-TEST-');
    if (isTestReference && process.env.NODE_ENV !== 'production') {
      return resolve({ success: true, simulated: true });
    }
    const secretKey = PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return resolve({ success: false, message: 'Payment verification is not configured.' });
    }

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.status && parsed.data?.status === 'success') {
            resolve({ success: true, data: parsed.data });
          } else {
            resolve({ success: false, message: parsed.message || 'Paystack verification was not successful.' });
          }
        } catch (e) {
          resolve({ success: false, message: 'Invalid response from Paystack server.' });
        }
      });
    });

    req.on('error', (err) => {
      console.warn('[Paystack Verification Network Error]', err.message);
      resolve({ success: false, message: 'Paystack verification is temporarily unavailable.' });
    });

    req.setTimeout(10000, () => req.destroy(new Error('Paystack verification timed out.')));
    req.end();
  });
}

async function getActivationStatus(req, res) {
  try {
    const userId = req.user.id;
    const userRes = await db.query('SELECT is_account_activated FROM users WHERE id = $1', [userId]);
    const isActivated = userRes.rows[0]?.is_account_activated || false;

    const actsRes = await db.query('SELECT * FROM account_activations WHERE user_id = $1', [userId]);
    const latestActivation = actsRes.rows[0] || null;

    // Fee from settings
    const feeRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['activation_fee']);
    const activationFee = parseFloat(feeRes.rows[0]?.value || '1000.00');

    const keyRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['paystack_public_key']);
    const paystackPublicKey = PAYSTACK_PUBLIC_KEY || keyRes.rows[0]?.value || null;

    return res.json({
      success: true,
      isActivated,
      activationFee,
      gateway: 'paystack',
      paystackPublicKey,
      latestActivation
    });
  } catch (err) {
    console.error('[GetActivationStatus Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve activation status.' });
  }
}

async function initializeActivation(req, res) {
  try {
    const userId = req.user.id;
    const feeRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['activation_fee']);
    const activationFee = parseFloat(feeRes.rows[0]?.value || '1000.00');

    const keyRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['paystack_public_key']);
    const paystackPublicKey = PAYSTACK_PUBLIC_KEY || keyRes.rows[0]?.value || null;

    const paymentRef = `EF-ACT-${userId}-${randomUUID()}`;

    return res.json({
      success: true,
      gateway: 'paystack',
      paystackPublicKey: paystackPublicKey,
      paymentReference: paymentRef,
      amount: activationFee,
      amountKobo: Math.round(activationFee * 100), // Paystack expects amount in kobo (100000)
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.full_name,
        phone: req.user.phone
      }
    });
  } catch (err) {
    console.error('[InitializeActivation Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to initialize Paystack payment.' });
  }
}

async function submitActivationPayment(req, res) {
  try {
    const userId = req.user.id;
    const { paymentReference, channel, paystackResponse } = req.body;

    if (!paymentReference) {
      return res.status(400).json({ success: false, message: 'Paystack payment reference is required.' });
    }

    // Verify with Paystack if secret key is present
    const verification = await verifyPaystackTransaction(paymentReference);
    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: verification.message || 'Could not verify Paystack payment transaction.'
      });
    }

    const feeRes = await db.query('SELECT * FROM system_settings WHERE key = $1', ['activation_fee']);
    const activationFee = parseFloat(feeRes.rows[0]?.value || '1000.00');

    if (!verification.simulated) {
      const payment = verification.data;
      const paymentEmail = payment?.customer?.email?.toLowerCase();
      if (
        !payment ||
        payment.reference !== paymentReference ||
        payment.amount !== Math.round(activationFee * 100) ||
        payment.currency !== 'NGN' ||
        paymentEmail !== req.user.email.toLowerCase() ||
        !paymentReference.startsWith(`EF-ACT-${userId}-`)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Payment details do not match this account or the required activation fee.'
        });
      }
    }

    // Create activation record with status 'pending' (requires admin confirmation per system workflow)
    const insertRes = await db.query(
      'INSERT INTO account_activations (user_id, amount, payment_reference, payment_method, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, activationFee, paymentReference, 'paystack', 'pending']
    );

    const activation = insertRes.rows[0];

    // Notification for user
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        userId,
        'Paystack Activation Payment Received',
        `Your ₦${activationFee.toLocaleString('en-NG', { minimumFractionDigits: 2 })} account activation fee via Paystack (Ref: ${paymentReference}) has been received. Awaiting administrator confirmation to finalize your withdrawal access.`,
        'info',
        '/withdraw'
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Paystack payment recorded! Your account activation is currently pending administrator confirmation.',
      activation
    });
  } catch (err) {
    console.error('[SubmitActivationPayment Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to record Paystack activation submission.' });
  }
}

module.exports = {
  getActivationStatus,
  initializeActivation,
  submitActivationPayment
};
