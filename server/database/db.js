const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = process.env.EARNFLOW_STORE_FILE || path.join(__dirname, 'earnflow_store.json');

let pool = null;
let usePg = false;

// Attempt PostgreSQL pool if configured
if (process.env.DATABASE_URL || process.env.PGHOST) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      database: process.env.PGDATABASE || 'earnflow',
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED !== 'false' }
        : false
    });
  } catch (err) {
    console.warn('[DB] Could not initialize PostgreSQL Pool, falling back to local store:', err.message);
  }
}

// In-memory / File-backed Database Store matching PostgreSQL schema
class LocalPostgresStore {
  constructor() {
    this.data = {
      users: [],
      wallets: [],
      tasks: [],
      task_submissions: [],
      transactions: [],
      withdrawals: [],
      account_activations: [],
      referrals: [],
      notifications: [],
      audit_logs: [],
      system_settings: []
    };
    this.sequences = {
      users: 1,
      wallets: 1,
      tasks: 1,
      task_submissions: 1,
      transactions: 1,
      withdrawals: 1,
      account_activations: 1,
      referrals: 1,
      notifications: 1,
      audit_logs: 1
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed.data };
        this.sequences = { ...this.sequences, ...parsed.sequences };
      } else {
        this.seedInitial();
      }
    } catch (e) {
      console.error('[DB-Store] Error loading local store:', e.message);
      this.seedInitial();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ data: this.data, sequences: this.sequences }, null, 2), 'utf8');
    } catch (e) {
      console.error('[DB-Store] Error saving store:', e.message);
    }
  }

  seedInitial() {
    const adminPasswordHash = bcrypt.hashSync('Uchman1472#', 10);
    const userPasswordHash = bcrypt.hashSync('UserPass123!', 10);
    const now = new Date().toISOString();

    // Users
    this.data.users = [
      {
        id: 1,
        full_name: 'Uchenna Administrator',
        email: 'uchennamister@gmail.com',
        phone: '+2348012345678',
        password_hash: adminPasswordHash,
        referral_code: 'ADMIN2026',
        referred_by: null,
        role: 'admin',
        is_active: true,
        is_account_activated: true,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: now,
        updated_at: now
      },
      {
        id: 99,
        full_name: 'System Admin Alias',
        email: 'admin@earnflow.ng',
        phone: '+2348000000000',
        password_hash: adminPasswordHash,
        referral_code: 'SYSADMIN',
        referred_by: null,
        role: 'admin',
        is_active: true,
        is_account_activated: true,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        full_name: 'Chidi Okafor',
        email: 'chidi@example.com',
        phone: '+2348031234567',
        password_hash: userPasswordHash,
        referral_code: 'CHIDI88',
        referred_by: null,
        role: 'user',
        is_active: true,
        is_account_activated: true, // Activated account
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        full_name: 'Amina Bello',
        email: 'amina@example.com',
        phone: '+2348098765432',
        password_hash: userPasswordHash,
        referral_code: 'AMINA99',
        referred_by: 'CHIDI88',
        role: 'user',
        is_active: true,
        is_account_activated: false, // NOT activated yet to test ₦1,000 activation gate
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        created_at: now,
        updated_at: now
      }
    ];
    this.sequences.users = 4;

    // Wallets
    this.data.wallets = [
      {
        id: 1,
        user_id: 1,
        available_balance: 50000.00,
        total_earned: 50000.00,
        pending_rewards: 0.00,
        referral_rewards: 0.00,
        total_withdrawn: 0.00,
        updated_at: now
      },
      {
        id: 2,
        user_id: 2,
        available_balance: 2450.00,
        total_earned: 3450.00,
        pending_rewards: 650.00,
        referral_rewards: 500.00,
        total_withdrawn: 1000.00,
        updated_at: now
      },
      {
        id: 3,
        user_id: 3,
        available_balance: 450.00,
        total_earned: 450.00,
        pending_rewards: 250.00,
        referral_rewards: 0.00,
        total_withdrawn: 0.00,
        updated_at: now
      }
    ];
    this.sequences.wallets = 4;

    // Tasks (Realistic Nigerian task marketplace)
    this.data.tasks = [
      {
        id: 1,
        title: 'Complete Product Survey: Mobile Banking Usability',
        description: 'Provide your genuine feedback on mobile banking app speed, transaction receipt clarity, and customer support responsiveness in Nigeria.',
        category: 'Surveys',
        reward_amount: 250.00,
        estimated_time: '4 mins',
        requirements: 'Must have an active Nigerian bank account (e.g. Kuda, OPay, GTBank, Zenith) and access to its mobile app.',
        instructions: '1. Click Start Task.\n2. Fill out the 8-question feedback form.\n3. Take a screenshot of the survey completion screen.\n4. Submit the screenshot and survey confirmation code as evidence.',
        evidence_required: true,
        max_submissions: 500,
        current_submissions: 142,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        title: 'Test OPay & PalmPay In-App Transfer Flow',
        description: 'Test the transaction flow when initiating a micro-transfer of ₦100 between fintech apps and report any latency or UI glitches.',
        category: 'Apps',
        reward_amount: 450.00,
        estimated_time: '6 mins',
        requirements: 'Smartphone with either OPay or PalmPay installed.',
        instructions: '1. Open your fintech app and initiate a transfer.\n2. Note the seconds it takes to generate receipt.\n3. Take a screenshot of the transaction success screen with timestamp visible.\n4. Paste the transaction reference ID and upload the receipt screenshot.',
        evidence_required: true,
        max_submissions: 300,
        current_submissions: 89,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        title: 'Join & Verify Telegram Rewards Community',
        description: 'Join the official EarnFlow community channel on Telegram for daily task drop alerts and promotional codes.',
        category: 'Social',
        reward_amount: 150.00,
        estimated_time: '2 mins',
        requirements: 'Active Telegram account.',
        instructions: '1. Join @EarnFlowCommunity on Telegram.\n2. Post a greeting message in the chat with your EarnFlow username.\n3. Submit your Telegram handle and screenshot of your greeting.',
        evidence_required: true,
        max_submissions: 1000,
        current_submissions: 620,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        title: 'Download & Review NaijaRide Mobility App',
        description: 'Install the new NaijaRide transport hailing application from Google Play or App Store and leave a constructive 5-star review.',
        category: 'Apps',
        reward_amount: 500.00,
        estimated_time: '5 mins',
        requirements: 'Android or iOS device with Google Play Store or Apple App Store account.',
        instructions: '1. Search NaijaRide on the app store.\n2. Download and open the app to home screen.\n3. Post an honest review mentioning app simplicity.\n4. Take a screenshot showing your review under your name and upload here.',
        evidence_required: true,
        max_submissions: 400,
        current_submissions: 150,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 5,
        title: 'Social Engagement: Repost EarnFlow Launch',
        description: 'Share our official launch banner on X (Twitter) or Facebook with your referral link to earn immediate bonus credit.',
        category: 'Social',
        reward_amount: 200.00,
        estimated_time: '3 mins',
        requirements: 'Public social media account with at least 50 followers.',
        instructions: '1. Repost the pinned EarnFlow announcement.\n2. Include your personal referral link in the post body.\n3. Paste the direct URL of your public post in the evidence box.',
        evidence_required: true,
        max_submissions: 800,
        current_submissions: 410,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 6,
        title: 'Fintech Consumer Savings Habits Questionnaire',
        description: 'Participate in our consumer research study on inflation hedging, dollar savings apps, and cooperative thrift systems in Nigeria.',
        category: 'Surveys',
        reward_amount: 350.00,
        estimated_time: '5 mins',
        requirements: 'Ages 18-50 residing in Nigeria.',
        instructions: '1. Complete all 12 survey questions thoughtfully.\n2. Copy the final verification hash at the end of the survey.\n3. Submit the hash code below.',
        evidence_required: true,
        max_submissions: 600,
        current_submissions: 290,
        is_active: true,
        created_at: now,
        updated_at: now
      },
      {
        id: 7,
        title: 'Website Performance & Bug Reporting Feedback',
        description: 'Navigate across EarnFlow pages on your mobile device and submit any layout or performance observations.',
        category: 'Other',
        reward_amount: 600.00,
        estimated_time: '8 mins',
        requirements: 'Must test on mobile web browser (Chrome, Safari, or Samsung Internet).',
        instructions: '1. Browse Tasks, Profile, and Earnings pages.\n2. Note device model and browser version.\n3. Provide minimum 3 constructive sentences with screenshot.',
        evidence_required: true,
        max_submissions: 200,
        current_submissions: 45,
        is_active: true,
        created_at: now,
        updated_at: now
      }
    ];
    this.sequences.tasks = 8;

    // Seed Task Submissions
    this.data.task_submissions = [
      {
        id: 1,
        task_id: 1,
        user_id: 2,
        evidence_text: 'Completed survey. Confirmation Code: SURVEY-OKAFOR-8921. Device: Samsung A54.',
        evidence_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        status: 'approved',
        admin_feedback: 'Verification confirmed. Thank you!',
        reward_amount: 250.00,
        reviewed_by: 1,
        reviewed_at: now,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 2,
        task_id: 2,
        user_id: 2,
        evidence_text: 'Transfer tested on OPay. Latency: 1.8s. Reference: OPAY-TRX-99418.',
        evidence_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
        status: 'approved',
        admin_feedback: 'Clear evidence provided.',
        reward_amount: 450.00,
        reviewed_by: 1,
        reviewed_at: now,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        task_id: 7,
        user_id: 2,
        evidence_text: 'Tested on Safari iOS 17. Navigation smoothly collapsed. Found no broken links.',
        evidence_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        status: 'pending',
        admin_feedback: null,
        reward_amount: 600.00,
        reviewed_by: null,
        reviewed_at: null,
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        task_id: 1,
        user_id: 3,
        evidence_text: 'Survey completed from Kaduna. Code: SURVEY-AMINA-4412.',
        evidence_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        status: 'pending',
        admin_feedback: null,
        reward_amount: 250.00,
        reviewed_by: null,
        reviewed_at: null,
        created_at: now,
        updated_at: now
      }
    ];
    this.sequences.task_submissions = 5;

    // Seed Transactions
    this.data.transactions = [
      {
        id: 1,
        user_id: 2,
        type: 'task_reward',
        amount: 250.00,
        status: 'completed',
        description: 'Reward for: Complete Product Survey: Mobile Banking Usability',
        reference: 'TX-TSK-1001',
        metadata: { taskId: 1 },
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 2,
        user_id: 2,
        type: 'task_reward',
        amount: 450.00,
        status: 'completed',
        description: 'Reward for: Test OPay & PalmPay In-App Transfer Flow',
        reference: 'TX-TSK-1002',
        metadata: { taskId: 2 },
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        user_id: 2,
        type: 'referral_reward',
        amount: 250.00,
        status: 'completed',
        description: 'Referral reward for inviting Amina Bello',
        reference: 'TX-REF-1003',
        metadata: { refereeId: 3 },
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 4,
        user_id: 2,
        type: 'withdrawal',
        amount: -1000.00,
        status: 'completed',
        description: 'Withdrawal to Access Bank (0123456789)',
        reference: 'TX-WTH-1004',
        metadata: { withdrawalId: 1 },
        created_at: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ];
    this.sequences.transactions = 5;

    // Seed Withdrawals
    this.data.withdrawals = [
      {
        id: 1,
        user_id: 2,
        amount: 1000.00,
        bank_name: 'Access Bank',
        account_name: 'Chidi Okafor',
        account_number: '0123456789',
        status: 'completed',
        admin_note: 'Approved and settled via NIP transfer.',
        reference: 'WD-2026-001',
        processed_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
      }
    ];
    this.sequences.withdrawals = 2;

    // Seed Account Activations
    this.data.account_activations = [
      {
        id: 1,
        user_id: 2,
        amount: 1000.00,
        payment_reference: 'ACT-REF-CHIDI-001',
        payment_method: 'bank_transfer',
        status: 'confirmed',
        admin_notes: 'Payment verified via Moniepoint settlement.',
        confirmed_by: 1,
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 9).toISOString()
      }
    ];
    this.sequences.account_activations = 2;

    // Seed Referrals
    this.data.referrals = [
      {
        id: 1,
        referrer_id: 2,
        referee_id: 3,
        reward_amount: 250.00,
        status: 'completed',
        created_at: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ];
    this.sequences.referrals = 2;

    // Seed Notifications
    this.data.notifications = [
      {
        id: 1,
        user_id: 2,
        title: 'Task Approved! ₦450.00 Added',
        message: 'Your submission for "Test OPay & PalmPay In-App Transfer Flow" has been approved.',
        type: 'success',
        link: '/earnings',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 2,
        user_id: 2,
        title: 'Account Activated Successfully',
        message: 'Your account activation fee (₦1,000) was confirmed. You can now request withdrawals!',
        type: 'success',
        link: '/withdraw',
        is_read: true,
        created_at: new Date(Date.now() - 86400000 * 9).toISOString()
      },
      {
        id: 3,
        user_id: 3,
        title: 'Welcome to EarnFlow!',
        message: 'Start exploring tasks today. Activate your account (₦1,000) whenever you are ready to withdraw.',
        type: 'info',
        link: '/tasks',
        is_read: false,
        created_at: now
      }
    ];
    this.sequences.notifications = 4;

    // System Settings
    this.data.system_settings = [
      { key: 'min_withdrawal', value: '1000.00', description: 'Minimum allowed withdrawal amount in NGN' },
      { key: 'activation_fee', value: '1000.00', description: 'One-time account activation fee in NGN' },
      { key: 'referral_bonus', value: '250.00', description: 'Referral reward credited per qualified referee in NGN' },
      { key: 'platform_name', value: 'EarnFlow', description: 'Brand Name' },
      { key: 'support_email', value: 'support@earnflow.ng', description: 'Customer Support Email' }
    ];

    // Audit logs
    this.data.audit_logs = [
      {
        id: 1,
        admin_id: 1,
        action: 'CONFIRM_ACCOUNT_ACTIVATION',
        target_type: 'user',
        target_id: 2,
        details: { fee: 1000.00, userEmail: 'chidi@example.com' },
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - 86400000 * 9).toISOString()
      }
    ];
    this.sequences.audit_logs = 2;

    this.save();
    console.log('[DB-Store] Initial demo data seeded successfully.');
  }
}

const localStore = process.env.NODE_ENV === 'production' ? null : new LocalPostgresStore();

async function initialize() {
  if (!pool) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL or PostgreSQL connection settings are required in production.');
    }
    return false;
  }

  try {
    const result = await pool.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
      ['public']
    );
    const existingTables = new Set(result.rows.map((row) => row.table_name));
    const requiredTables = [
      'users', 'wallets', 'tasks', 'task_submissions', 'transactions', 'withdrawals',
      'account_activations', 'referrals', 'notifications', 'audit_logs', 'system_settings'
    ];
    const missingTables = requiredTables.filter((table) => !existingTables.has(table));

    if (missingTables.length > 0) {
      throw new Error(`Database schema is missing tables: ${missingTables.join(', ')}`);
    }

    usePg = true;
    return true;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Production PostgreSQL initialization failed: ${err.message}`);
    }

    console.warn('[DB] PostgreSQL unavailable; using the local development store:', err.message);
    await pool.end().catch(() => {});
    pool = null;
    return false;
  }
}

// Universal Query Interface
async function query(text, params = []) {
  if (usePg && pool) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (err) {
      console.error('[PostgreSQL Error]', err);
      throw err;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Production database is not initialized.');
  }

  // Local Store Query Adapter
  return executeLocalQuery(text, params);
}

// Emulates SQL operations for the local store cleanly and reliably
function executeLocalQuery(sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // USERS QUERIES
  if (/^SELECT .* FROM users WHERE email =/i.test(cleanSql)) {
    const email = (params[0] || '').toLowerCase().trim();
    const user = localStore.data.users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  if (/^SELECT .* FROM users WHERE id =/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const user = localStore.data.users.find(u => u.id === id);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  if (/^SELECT .* FROM users WHERE referral_code =/i.test(cleanSql)) {
    const code = (params[0] || '').toUpperCase().trim();
    const user = localStore.data.users.find(u => (u.referral_code || '').toUpperCase() === code);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  if (/^INSERT INTO users/i.test(cleanSql)) {
    const id = localStore.sequences.users++;
    const [full_name, email, phone, password_hash, referral_code, referred_by, role, is_account_activated] = params;
    const now = new Date().toISOString();
    const newUser = {
      id,
      full_name,
      email: email.toLowerCase().trim(),
      phone,
      password_hash,
      referral_code,
      referred_by: referred_by || null,
      role: role || 'user',
      is_active: true,
      is_account_activated: !!is_account_activated,
      avatar_url: null,
      created_at: now,
      updated_at: now
    };
    localStore.data.users.push(newUser);

    // Automatically create a wallet for the new user
    const walletId = localStore.sequences.wallets++;
    localStore.data.wallets.push({
      id: walletId,
      user_id: id,
      available_balance: 0.00,
      total_earned: 0.00,
      pending_rewards: 0.00,
      referral_rewards: 0.00,
      total_withdrawn: 0.00,
      updated_at: now
    });

    localStore.save();
    return { rows: [{ ...newUser }], rowCount: 1 };
  }

  if (/^UPDATE users/i.test(cleanSql)) {
    // Check if updating password or profile
    if (/password_hash =/i.test(cleanSql)) {
      const [newHash, userId] = params;
      const user = localStore.data.users.find(u => u.id === parseInt(userId, 10));
      if (user) {
        user.password_hash = newHash;
        user.updated_at = new Date().toISOString();
        localStore.save();
        return { rows: [{ ...user }], rowCount: 1 };
      }
    } else if (/is_account_activated =/i.test(cleanSql)) {
      const [isActivated, userId] = params;
      const user = localStore.data.users.find(u => u.id === parseInt(userId, 10));
      if (user) {
        user.is_account_activated = !!isActivated;
        user.updated_at = new Date().toISOString();
        localStore.save();
        return { rows: [{ ...user }], rowCount: 1 };
      }
    } else if (/is_active =/i.test(cleanSql)) {
      const [isActive, userId] = params;
      const user = localStore.data.users.find(u => u.id === parseInt(userId, 10));
      if (user) {
        user.is_active = !!isActive;
        user.updated_at = new Date().toISOString();
        localStore.save();
        return { rows: [{ ...user }], rowCount: 1 };
      }
    } else if (/full_name =/i.test(cleanSql)) {
      const [name, phone, avatar, userId] = params;
      const user = localStore.data.users.find(u => u.id === parseInt(userId, 10));
      if (user) {
        if (name) user.full_name = name;
        if (phone) user.phone = phone;
        if (avatar !== undefined) user.avatar_url = avatar;
        user.updated_at = new Date().toISOString();
        localStore.save();
        return { rows: [{ ...user }], rowCount: 1 };
      }
    }
    return { rows: [], rowCount: 0 };
  }

  // WALLETS QUERIES
  if (/^SELECT \* FROM wallets WHERE user_id =/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    let wallet = localStore.data.wallets.find(w => w.user_id === userId);
    if (!wallet) {
      wallet = {
        id: localStore.sequences.wallets++,
        user_id: userId,
        available_balance: 0.00,
        total_earned: 0.00,
        pending_rewards: 0.00,
        referral_rewards: 0.00,
        total_withdrawn: 0.00,
        updated_at: new Date().toISOString()
      };
      localStore.data.wallets.push(wallet);
      localStore.save();
    }
    return { rows: [{ ...wallet }], rowCount: 1 };
  }

  if (/^UPDATE wallets/i.test(cleanSql)) {
    const userId = parseInt(params[params.length - 1], 10);
    const wallet = localStore.data.wallets.find(w => w.user_id === userId);
    if (wallet) {
      if (/available_balance = available_balance \+/i.test(cleanSql)) {
        const amount = parseFloat(params[0]);
        wallet.available_balance = parseFloat((wallet.available_balance + amount).toFixed(2));
        wallet.total_earned = parseFloat((wallet.total_earned + amount).toFixed(2));
        if (params.length > 2 && /pending_rewards = pending_rewards -/i.test(cleanSql)) {
          const pendingDeduct = parseFloat(params[1]);
          wallet.pending_rewards = Math.max(0, parseFloat((wallet.pending_rewards - pendingDeduct).toFixed(2)));
        }
      } else if (/available_balance = available_balance -/i.test(cleanSql)) {
        const amount = parseFloat(params[0]);
        wallet.available_balance = parseFloat((wallet.available_balance - amount).toFixed(2));
        wallet.total_withdrawn = parseFloat((wallet.total_withdrawn + amount).toFixed(2));
      } else if (/pending_rewards = pending_rewards \+/i.test(cleanSql)) {
        const amount = parseFloat(params[0]);
        wallet.pending_rewards = parseFloat((wallet.pending_rewards + amount).toFixed(2));
      } else if (/referral_rewards = referral_rewards \+/i.test(cleanSql)) {
        const amount = parseFloat(params[0]);
        wallet.referral_rewards = parseFloat((wallet.referral_rewards + amount).toFixed(2));
        wallet.available_balance = parseFloat((wallet.available_balance + amount).toFixed(2));
        wallet.total_earned = parseFloat((wallet.total_earned + amount).toFixed(2));
      }
      wallet.updated_at = new Date().toISOString();
      localStore.save();
      return { rows: [{ ...wallet }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // TASKS QUERIES
  if (/^SELECT \* FROM tasks/i.test(cleanSql)) {
    let tasks = [...localStore.data.tasks];
    if (/WHERE id =/i.test(cleanSql)) {
      const id = parseInt(params[0], 10);
      const task = tasks.find(t => t.id === id);
      return { rows: task ? [{ ...task }] : [], rowCount: task ? 1 : 0 };
    }
    // Filter active if not admin
    if (/WHERE is_active = true/i.test(cleanSql)) {
      tasks = tasks.filter(t => t.is_active);
    }
    return { rows: tasks, rowCount: tasks.length };
  }

  if (/^INSERT INTO tasks/i.test(cleanSql)) {
    const id = localStore.sequences.tasks++;
    const [title, description, category, reward_amount, estimated_time, requirements, instructions, evidence_required] = params;
    const now = new Date().toISOString();
    const newTask = {
      id,
      title,
      description,
      category,
      reward_amount: parseFloat(reward_amount),
      estimated_time,
      requirements,
      instructions,
      evidence_required: evidence_required !== false,
      max_submissions: 500,
      current_submissions: 0,
      is_active: true,
      created_at: now,
      updated_at: now
    };
    localStore.data.tasks.unshift(newTask);
    localStore.save();
    return { rows: [{ ...newTask }], rowCount: 1 };
  }

  if (/^UPDATE tasks/i.test(cleanSql)) {
    const id = parseInt(params[params.length - 1], 10);
    const task = localStore.data.tasks.find(t => t.id === id);
    if (task) {
      if (/is_active =/i.test(cleanSql)) {
        task.is_active = !!params[0];
      } else {
        const [title, description, category, reward_amount, estimated_time, requirements, instructions] = params;
        if (title) task.title = title;
        if (description) task.description = description;
        if (category) task.category = category;
        if (reward_amount) task.reward_amount = parseFloat(reward_amount);
        if (estimated_time) task.estimated_time = estimated_time;
        if (requirements) task.requirements = requirements;
        if (instructions) task.instructions = instructions;
      }
      task.updated_at = new Date().toISOString();
      localStore.save();
      return { rows: [{ ...task }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (/^DELETE FROM tasks WHERE id =/i.test(cleanSql)) {
    const id = parseInt(params[0], 10);
    const idx = localStore.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      localStore.data.tasks.splice(idx, 1);
      localStore.save();
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // TASK SUBMISSIONS QUERIES
  if (/^SELECT .* FROM task_submissions/i.test(cleanSql)) {
    if (/WHERE user_id = \$\d+ AND task_id = \$\d+/i.test(cleanSql) || /WHERE task_id = \$\d+ AND user_id = \$\d+/i.test(cleanSql)) {
      const [p1, p2] = params;
      const sub = localStore.data.task_submissions.find(s => 
        (s.task_id === parseInt(p1, 10) && s.user_id === parseInt(p2, 10)) ||
        (s.task_id === parseInt(p2, 10) && s.user_id === parseInt(p1, 10))
      );
      return { rows: sub ? [{ ...sub }] : [], rowCount: sub ? 1 : 0 };
    }
    if (/WHERE user_id =/i.test(cleanSql)) {
      const userId = parseInt(params[0], 10);
      const subs = localStore.data.task_submissions
        .filter(s => s.user_id === userId)
        .map(s => {
          const task = localStore.data.tasks.find(t => t.id === s.task_id) || {};
          return { ...s, task_title: task.title, task_category: task.category };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: subs, rowCount: subs.length };
    }
    // Admin list submissions
    const allSubs = localStore.data.task_submissions
      .map(s => {
        const task = localStore.data.tasks.find(t => t.id === s.task_id) || {};
        const user = localStore.data.users.find(u => u.id === s.user_id) || {};
        return {
          ...s,
          task_title: task.title,
          task_category: task.category,
          user_name: user.full_name,
          user_email: user.email
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: allSubs, rowCount: allSubs.length };
  }

  if (/^INSERT INTO task_submissions/i.test(cleanSql)) {
    const id = localStore.sequences.task_submissions++;
    const [task_id, user_id, evidence_text, evidence_url, reward_amount] = params;
    const now = new Date().toISOString();
    const newSub = {
      id,
      task_id: parseInt(task_id, 10),
      user_id: parseInt(user_id, 10),
      evidence_text,
      evidence_url,
      status: 'pending',
      admin_feedback: null,
      reward_amount: parseFloat(reward_amount),
      reviewed_by: null,
      reviewed_at: null,
      created_at: now,
      updated_at: now
    };
    localStore.data.task_submissions.push(newSub);
    
    // Update task submission count
    const task = localStore.data.tasks.find(t => t.id === parseInt(task_id, 10));
    if (task) task.current_submissions = (task.current_submissions || 0) + 1;

    // Add pending rewards to wallet
    const wallet = localStore.data.wallets.find(w => w.user_id === parseInt(user_id, 10));
    if (wallet) {
      wallet.pending_rewards = parseFloat((wallet.pending_rewards + parseFloat(reward_amount)).toFixed(2));
      wallet.updated_at = now;
    }

    localStore.save();
    return { rows: [{ ...newSub }], rowCount: 1 };
  }

  if (/^UPDATE task_submissions/i.test(cleanSql)) {
    const id = parseInt(params[params.length - 1], 10);
    const sub = localStore.data.task_submissions.find(s => s.id === id);
    if (sub) {
      const [status, feedback, reviewerId] = params;
      sub.status = status;
      sub.admin_feedback = feedback;
      sub.reviewed_by = parseInt(reviewerId, 10);
      sub.reviewed_at = new Date().toISOString();
      sub.updated_at = new Date().toISOString();
      localStore.save();
      return { rows: [{ ...sub }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // TRANSACTIONS QUERIES
  if (/^SELECT \* FROM transactions/i.test(cleanSql)) {
    if (/WHERE user_id =/i.test(cleanSql)) {
      const userId = parseInt(params[0], 10);
      const txs = localStore.data.transactions
        .filter(t => t.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: txs, rowCount: txs.length };
    }
    const allTxs = [...localStore.data.transactions].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: allTxs, rowCount: allTxs.length };
  }

  if (/^INSERT INTO transactions/i.test(cleanSql)) {
    const id = localStore.sequences.transactions++;
    const [user_id, type, amount, status, description, reference, metadata] = params;
    const now = new Date().toISOString();
    const newTx = {
      id,
      user_id: parseInt(user_id, 10),
      type,
      amount: parseFloat(amount),
      status: status || 'completed',
      description,
      reference,
      metadata: typeof metadata === 'string' ? JSON.parse(metadata) : (metadata || null),
      created_at: now
    };
    localStore.data.transactions.unshift(newTx);
    localStore.save();
    return { rows: [{ ...newTx }], rowCount: 1 };
  }

  // WITHDRAWALS QUERIES
  if (/^SELECT .* FROM withdrawals/i.test(cleanSql)) {
    if (/WHERE user_id =/i.test(cleanSql)) {
      const userId = parseInt(params[0], 10);
      const wths = localStore.data.withdrawals
        .filter(w => w.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: wths, rowCount: wths.length };
    }
    const allWths = localStore.data.withdrawals
      .map(w => {
        const user = localStore.data.users.find(u => u.id === w.user_id) || {};
        return {
          ...w,
          user_name: user.full_name,
          user_email: user.email,
          user_phone: user.phone
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: allWths, rowCount: allWths.length };
  }

  if (/^INSERT INTO withdrawals/i.test(cleanSql)) {
    const id = localStore.sequences.withdrawals++;
    const [user_id, amount, bank_name, account_name, account_number, reference] = params;
    const now = new Date().toISOString();
    const newWth = {
      id,
      user_id: parseInt(user_id, 10),
      amount: parseFloat(amount),
      bank_name,
      account_name,
      account_number,
      status: 'pending',
      admin_note: null,
      reference,
      processed_at: null,
      created_at: now,
      updated_at: now
    };
    localStore.data.withdrawals.unshift(newWth);
    localStore.save();
    return { rows: [{ ...newWth }], rowCount: 1 };
  }

  if (/^UPDATE withdrawals/i.test(cleanSql)) {
    const id = parseInt(params[params.length - 1], 10);
    const wth = localStore.data.withdrawals.find(w => w.id === id);
    if (wth) {
      const [status, note] = params;
      wth.status = status;
      wth.admin_note = note || wth.admin_note;
      if (status === 'completed') {
        wth.processed_at = new Date().toISOString();
      }
      wth.updated_at = new Date().toISOString();
      localStore.save();
      return { rows: [{ ...wth }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // ACCOUNT ACTIVATIONS QUERIES (₦1,000 fee flow)
  if (/^SELECT .* FROM account_activations/i.test(cleanSql)) {
    if (/WHERE user_id =/i.test(cleanSql)) {
      const userId = parseInt(params[0], 10);
      const acts = localStore.data.account_activations
        .filter(a => a.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: acts, rowCount: acts.length };
    }
    const allActs = localStore.data.account_activations
      .map(a => {
        const user = localStore.data.users.find(u => u.id === a.user_id) || {};
        return {
          ...a,
          user_name: user.full_name,
          user_email: user.email,
          user_phone: user.phone
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: allActs, rowCount: allActs.length };
  }

  if (/^INSERT INTO account_activations/i.test(cleanSql)) {
    const id = localStore.sequences.account_activations++;
    const [user_id, amount, payment_reference, payment_method, status] = params;
    const now = new Date().toISOString();
    const newAct = {
      id,
      user_id: parseInt(user_id, 10),
      amount: parseFloat(amount || 1000.00),
      payment_reference,
      payment_method: payment_method || 'bank_transfer',
      status: status || 'pending',
      admin_notes: null,
      confirmed_by: null,
      created_at: now,
      updated_at: now
    };
    localStore.data.account_activations.unshift(newAct);
    localStore.save();
    return { rows: [{ ...newAct }], rowCount: 1 };
  }

  if (/^UPDATE account_activations/i.test(cleanSql)) {
    const id = parseInt(params[params.length - 1], 10);
    const act = localStore.data.account_activations.find(a => a.id === id);
    if (act) {
      const [status, note, adminId] = params;
      act.status = status;
      act.admin_notes = note;
      act.confirmed_by = parseInt(adminId, 10);
      act.updated_at = new Date().toISOString();

      // If confirmed, update user account status to true!
      if (status === 'confirmed') {
        const user = localStore.data.users.find(u => u.id === act.user_id);
        if (user) {
          user.is_account_activated = true;
          user.updated_at = new Date().toISOString();
        }
      }
      localStore.save();
      return { rows: [{ ...act }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // REFERRALS QUERIES
  if (/^SELECT .* FROM referrals/i.test(cleanSql)) {
    if (/WHERE referrer_id =/i.test(cleanSql)) {
      const refId = parseInt(params[0], 10);
      const refs = localStore.data.referrals
        .filter(r => r.referrer_id === refId)
        .map(r => {
          const referee = localStore.data.users.find(u => u.id === r.referee_id) || {};
          return {
            ...r,
            referee_name: referee.full_name,
            referee_email: referee.email,
            referee_joined: referee.created_at
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return { rows: refs, rowCount: refs.length };
    }
    return { rows: localStore.data.referrals, rowCount: localStore.data.referrals.length };
  }

  if (/^INSERT INTO referrals/i.test(cleanSql)) {
    const id = localStore.sequences.referrals++;
    const [referrer_id, referee_id, reward_amount, status] = params;
    const now = new Date().toISOString();
    const newRef = {
      id,
      referrer_id: parseInt(referrer_id, 10),
      referee_id: parseInt(referee_id, 10),
      reward_amount: parseFloat(reward_amount || 250.00),
      status: status || 'pending',
      created_at: now
    };
    localStore.data.referrals.push(newRef);
    localStore.save();
    return { rows: [{ ...newRef }], rowCount: 1 };
  }

  // NOTIFICATIONS QUERIES
  if (/^SELECT \* FROM notifications/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    const notifs = localStore.data.notifications
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: notifs, rowCount: notifs.length };
  }

  if (/^INSERT INTO notifications/i.test(cleanSql)) {
    const id = localStore.sequences.notifications++;
    const [user_id, title, message, type, link] = params;
    const now = new Date().toISOString();
    const newNotif = {
      id,
      user_id: parseInt(user_id, 10),
      title,
      message,
      type: type || 'info',
      link: link || null,
      is_read: false,
      created_at: now
    };
    localStore.data.notifications.unshift(newNotif);
    localStore.save();
    return { rows: [{ ...newNotif }], rowCount: 1 };
  }

  if (/^UPDATE notifications SET is_read = true/i.test(cleanSql)) {
    const userId = parseInt(params[0], 10);
    localStore.data.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = true;
    });
    localStore.save();
    return { rows: [], rowCount: 1 };
  }

  // AUDIT LOGS QUERIES
  if (/^SELECT .* FROM audit_logs/i.test(cleanSql)) {
    const logs = localStore.data.audit_logs
      .map(l => {
        const admin = localStore.data.users.find(u => u.id === l.admin_id) || {};
        return {
          ...l,
          admin_name: admin.full_name,
          admin_email: admin.email
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: logs, rowCount: logs.length };
  }

  if (/^INSERT INTO audit_logs/i.test(cleanSql)) {
    const id = localStore.sequences.audit_logs++;
    const [admin_id, action, target_type, target_id, details, ip_address] = params;
    const now = new Date().toISOString();
    const newLog = {
      id,
      admin_id: admin_id ? parseInt(admin_id, 10) : null,
      action,
      target_type,
      target_id: target_id ? parseInt(target_id, 10) : null,
      details: typeof details === 'string' ? JSON.parse(details) : (details || null),
      ip_address: ip_address || '127.0.0.1',
      created_at: now
    };
    localStore.data.audit_logs.unshift(newLog);
    localStore.save();
    return { rows: [{ ...newLog }], rowCount: 1 };
  }

  // SYSTEM SETTINGS QUERIES
  if (/^SELECT .* FROM system_settings/i.test(cleanSql)) {
    if (/WHERE key =/i.test(cleanSql)) {
      const key = params[0];
      const setting = localStore.data.system_settings.find(s => s.key === key);
      return { rows: setting ? [{ ...setting }] : [], rowCount: setting ? 1 : 0 };
    }
    return { rows: localStore.data.system_settings, rowCount: localStore.data.system_settings.length };
  }

  if (/^UPDATE system_settings/i.test(cleanSql)) {
    const [value, key] = params;
    const setting = localStore.data.system_settings.find(s => s.key === key);
    if (setting) {
      setting.value = value;
      setting.updated_at = new Date().toISOString();
      localStore.save();
      return { rows: [{ ...setting }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Fallback for unrecognized query
  console.warn('[DB-Store] Unhandled query pattern:', cleanSql);
  return { rows: [], rowCount: 0 };
}

module.exports = {
  initialize,
  query,
  pool,
  localStore
};
