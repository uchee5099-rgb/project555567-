const db = require('../database/db');

// Helper to record audit log
async function logAdminAction(adminId, action, targetType, targetId, details, req) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await db.query(
      'INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
      [adminId, action, targetType, targetId, JSON.stringify(details), ip]
    );
  } catch (err) {
    console.error('[Audit Log Error]', err);
  }
}

// 1. Dashboard Metrics
async function getMetrics(req, res) {
  try {
    const usersRes = await db.query('SELECT * FROM users');
    const users = usersRes.rows;
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;

    const tasksRes = await db.query('SELECT * FROM tasks');
    const tasks = tasksRes.rows;
    const availableTasks = tasks.filter(t => t.is_active).length;

    const subsRes = await db.query('SELECT * FROM task_submissions');
    const submissions = subsRes.rows;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;

    const wthRes = await db.query('SELECT * FROM withdrawals');
    const withdrawals = wthRes.rows;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

    const txRes = await db.query('SELECT * FROM transactions WHERE status = $1', ['completed']);
    const totalRewards = txRes.rows
      .filter(t => t.type === 'task_reward' || t.type === 'referral_reward')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalWithdrawn = txRes.rows
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

    const activationsRes = await db.query('SELECT * FROM account_activations');
    const pendingActivations = activationsRes.rows.filter(a => a.status === 'pending').length;

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        availableTasks,
        pendingSubmissions,
        pendingWithdrawals,
        pendingActivations,
        totalRewards,
        totalWithdrawn
      }
    });
  } catch (err) {
    console.error('[GetMetrics Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to compute admin metrics.' });
  }
}

// 2. User Management
async function getUsers(req, res) {
  try {
    const { search } = req.query;
    const result = await db.query('SELECT * FROM users');
    let users = result.rows.map(u => {
      const copy = { ...u };
      delete copy.password_hash;
      return copy;
    });

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      users = users.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        (u.referral_code && u.referral_code.toLowerCase().includes(q))
      );
    }

    // Attach wallet balances and activation records
    const walletsRes = await db.query('SELECT * FROM wallets');
    const walletMap = {};
    walletsRes.rows.forEach(w => {
      walletMap[w.user_id] = w;
    });

    const actsRes = await db.query('SELECT * FROM account_activations');
    const actMap = {};
    actsRes.rows.forEach(a => {
      if (!actMap[a.user_id] || new Date(a.created_at) > new Date(actMap[a.user_id].created_at)) {
        actMap[a.user_id] = a;
      }
    });

    users = users.map(u => ({
      ...u,
      wallet: walletMap[u.id] || null,
      latestActivation: actMap[u.id] || null
    }));

    return res.json({ success: true, users });
  } catch (err) {
    console.error('[GetUsers Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user list.' });
  }
}

async function toggleUserStatus(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    const updateRes = await db.query('UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *', [isActive, userId]);
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = updateRes.rows[0];
    delete user.password_hash;

    await logAdminAction(req.user.id, isActive ? 'ACTIVATE_USER' : 'SUSPEND_USER', 'user', userId, { isActive, email: user.email }, req);

    return res.json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'suspended'} successfully.`,
      user
    });
  } catch (err) {
    console.error('[ToggleUserStatus Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

// Confirm / Toggle Account Activation Fee status (enabling withdrawals)
async function confirmUserAccountActivation(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const { isAccountActivated, note } = req.body;

    const userRes = await db.query('UPDATE users SET is_account_activated = $1 WHERE id = $2 RETURNING *', [isAccountActivated, userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];
    delete user.password_hash;

    // Update activation records if any
    const actsRes = await db.query('SELECT * FROM account_activations WHERE user_id = $1', [userId]);
    if (actsRes.rows.length > 0) {
      const latestAct = actsRes.rows[0];
      await db.query(
        'UPDATE account_activations SET status = $1, admin_notes = $2, confirmed_by = $3 WHERE id = $4',
        [isAccountActivated ? 'confirmed' : 'rejected', note || 'Updated by Administrator', req.user.id, latestAct.id]
      );
    } else if (isAccountActivated) {
      // Create confirmed activation record
      await db.query(
        'INSERT INTO account_activations (user_id, amount, payment_reference, payment_method, status) VALUES ($1, $2, $3, $4, $5)',
        [userId, 1000.00, `ADMIN-MANUAL-${Date.now()}`, 'admin_grant', 'confirmed']
      );
    }

    // Notify user
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [
        userId,
        isAccountActivated ? 'Account Activated for Withdrawals' : 'Account Activation Revoked',
        isAccountActivated
          ? 'Your account activation has been confirmed by the administration. You can now request withdrawals freely!'
          : 'Your account withdrawal activation has been temporarily revoked. Contact support for details.',
        isAccountActivated ? 'success' : 'warning',
        '/withdraw'
      ]
    );

    // Audit log
    await logAdminAction(req.user.id, 'CONFIRM_ACCOUNT_ACTIVATION', 'user', userId, { isAccountActivated, note, email: user.email }, req);

    return res.json({
      success: true,
      message: `Account activation status updated to ${isAccountActivated ? 'ACTIVE' : 'INACTIVE'}.`,
      user
    });
  } catch (err) {
    console.error('[ConfirmUserAccountActivation Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update account activation status.' });
  }
}

// 3. Task Management
async function getAdminTasks(req, res) {
  try {
    const result = await db.query('SELECT * FROM tasks');
    return res.json({ success: true, tasks: result.rows });
  } catch (err) {
    console.error('[GetAdminTasks Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks.' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, category, rewardAmount, estimatedTime, requirements, instructions, evidenceRequired } = req.body;

    if (!title || !description || !category || !rewardAmount || !estimatedTime) {
      return res.status(400).json({ success: false, message: 'All required task fields must be provided.' });
    }

    const insertRes = await db.query(
      'INSERT INTO tasks (title, description, category, reward_amount, estimated_time, requirements, instructions, evidence_required) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title.trim(), description.trim(), category.trim(), parseFloat(rewardAmount), estimatedTime.trim(), requirements || '', instructions || '', evidenceRequired !== false]
    );

    const task = insertRes.rows[0];
    await logAdminAction(req.user.id, 'CREATE_TASK', 'task', task.id, { title: task.title, reward: task.reward_amount }, req);

    return res.status(201).json({ success: true, message: 'Task created successfully.', task });
  } catch (err) {
    console.error('[CreateTask Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
}

async function updateTask(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { title, description, category, rewardAmount, estimatedTime, requirements, instructions } = req.body;

    const updateRes = await db.query(
      'UPDATE tasks SET title = $1, description = $2, category = $3, reward_amount = $4, estimated_time = $5, requirements = $6, instructions = $7 WHERE id = $8 RETURNING *',
      [title, description, category, parseFloat(rewardAmount), estimatedTime, requirements, instructions, taskId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = updateRes.rows[0];
    await logAdminAction(req.user.id, 'UPDATE_TASK', 'task', taskId, { title: task.title }, req);

    return res.json({ success: true, message: 'Task updated successfully.', task });
  } catch (err) {
    console.error('[UpdateTask Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
}

async function toggleTaskStatus(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { isActive } = req.body;

    const updateRes = await db.query('UPDATE tasks SET is_active = $1 WHERE id = $2 RETURNING *', [isActive, taskId]);
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = updateRes.rows[0];
    await logAdminAction(req.user.id, isActive ? 'ACTIVATE_TASK' : 'DEACTIVATE_TASK', 'task', taskId, { title: task.title }, req);

    return res.json({ success: true, message: `Task ${isActive ? 'activated' : 'deactivated'} successfully.`, task });
  } catch (err) {
    console.error('[ToggleTaskStatus Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
}

async function deleteTask(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const deleteRes = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await logAdminAction(req.user.id, 'DELETE_TASK', 'task', taskId, { taskId }, req);

    return res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('[DeleteTask Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to delete task.' });
  }
}

// 4. Submission Management (Review, Approve -> Credit Wallet, Reject)
async function getSubmissions(req, res) {
  try {
    const result = await db.query('SELECT * FROM task_submissions');
    return res.json({ success: true, submissions: result.rows });
  } catch (err) {
    console.error('[GetSubmissions Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve submissions.' });
  }
}

async function reviewSubmission(req, res) {
  try {
    const submissionId = parseInt(req.params.id, 10);
    const { status, adminFeedback } = req.body; // status: 'approved' | 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status ("approved" or "rejected") is required.' });
    }

    const subRes = await db.query('SELECT * FROM task_submissions WHERE id = $1', [submissionId]);
    if (subRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const sub = subRes.rows[0];
    if (sub.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This submission has already been marked as ${sub.status}.` });
    }

    // Update submission
    const updateRes = await db.query(
      'UPDATE task_submissions SET status = $1, admin_feedback = $2, reviewed_by = $3 WHERE id = $4 RETURNING *',
      [status, adminFeedback || null, req.user.id, submissionId]
    );

    const updatedSub = updateRes.rows[0];

    // Get task details
    const taskRes = await db.query('SELECT * FROM tasks WHERE id = $1', [sub.task_id]);
    const taskTitle = taskRes.rows[0]?.title || 'Task';
    const reward = parseFloat(sub.reward_amount);

    if (status === 'approved') {
      // CREDIT USER WALLET: Move from pending to available & total earned
      await db.query(
        'UPDATE wallets SET available_balance = available_balance + $1, pending_rewards = pending_rewards - $2 WHERE user_id = $3',
        [reward, reward, sub.user_id]
      );

      // Create transaction record
      const ref = `TX-TSK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.query(
        'INSERT INTO transactions (user_id, type, amount, status, description, reference, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          sub.user_id,
          'task_reward',
          reward,
          'completed',
          `Reward for: ${taskTitle}`,
          ref,
          JSON.stringify({ taskId: sub.task_id, submissionId })
        ]
      );

      // Send User Success Notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
        [
          sub.user_id,
          `Task Approved! ₦${reward.toFixed(2)} Credited`,
          `Your submission for "${taskTitle}" has been approved. The reward of ₦${reward.toFixed(2)} has been added to your available balance.`,
          'success',
          '/earnings'
        ]
      );

      // Audit log
      await logAdminAction(req.user.id, 'APPROVE_TASK_SUBMISSION', 'submission', submissionId, {
        reward,
        userId: sub.user_id,
        taskId: sub.task_id
      }, req);
    } else {
      // REJECTED: Deduct from pending rewards
      await db.query(
        'UPDATE wallets SET pending_rewards = pending_rewards - $1 WHERE user_id = $2',
        [reward, sub.user_id]
      );

      // Notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
        [
          sub.user_id,
          `Task Submission Rejected: ${taskTitle}`,
          `Your submission for "${taskTitle}" was rejected. Feedback: ${adminFeedback || 'Evidence does not meet the specified criteria.'}`,
          'warning',
          `/tasks/${sub.task_id}`
        ]
      );

      // Audit log
      await logAdminAction(req.user.id, 'REJECT_TASK_SUBMISSION', 'submission', submissionId, {
        userId: sub.user_id,
        taskId: sub.task_id,
        adminFeedback
      }, req);
    }

    return res.json({
      success: true,
      message: `Submission ${status === 'approved' ? 'approved and reward credited' : 'rejected'}.`,
      submission: updatedSub
    });
  } catch (err) {
    console.error('[ReviewSubmission Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to review submission.' });
  }
}

// 5. Withdrawal Management (Approve, Mark Processing, Mark Completed, Reject)
async function getAdminWithdrawals(req, res) {
  try {
    const result = await db.query('SELECT * FROM withdrawals');
    return res.json({ success: true, withdrawals: result.rows });
  } catch (err) {
    console.error('[GetAdminWithdrawals Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve withdrawals.' });
  }
}

async function updateWithdrawalStatus(req, res) {
  try {
    const withdrawalId = parseInt(req.params.id, 10);
    const { status, adminNote } = req.body; // 'processing', 'completed', 'rejected'

    if (!['processing', 'completed', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required.' });
    }

    const wthRes = await db.query('SELECT * FROM withdrawals WHERE id = $1', [withdrawalId]);
    if (wthRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
    }

    const wth = wthRes.rows[0];

    // If rejected, refund available balance
    if (status === 'rejected' && wth.status !== 'rejected') {
      const amount = parseFloat(wth.amount);
      await db.query('UPDATE wallets SET available_balance = available_balance + $1, total_withdrawn = total_withdrawn - $2 WHERE user_id = $3', [amount, amount, wth.user_id]);

      // Record reversal transaction
      const ref = `REV-WTH-${Date.now()}`;
      await db.query(
        'INSERT INTO transactions (user_id, type, amount, status, description, reference, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          wth.user_id,
          'withdrawal',
          amount,
          'rejected',
          `Withdrawal Refund: ${wth.bank_name} (${adminNote || 'Declined'})`,
          ref,
          JSON.stringify({ originalReference: wth.reference, reason: adminNote })
        ]
      );

      // Notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
        [
          wth.user_id,
          'Withdrawal Request Rejected',
          `Your withdrawal request for ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} was rejected and refunded to your available balance. Note: ${adminNote || 'Please verify account information.'}`,
          'warning',
          '/withdraw'
        ]
      );
    } else if (status === 'completed') {
      // Notification
      await db.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
        [
          wth.user_id,
          'Withdrawal Completed & Disbursed',
          `Your withdrawal of ₦${parseFloat(wth.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} has been settled to your ${wth.bank_name} account. Note: ${adminNote || 'Successful transfer.'}`,
          'success',
          '/earnings'
        ]
      );
    }

    const updateRes = await db.query(
      'UPDATE withdrawals SET status = $1, admin_note = $2 WHERE id = $3 RETURNING *',
      [status, adminNote || null, withdrawalId]
    );

    await logAdminAction(req.user.id, `UPDATE_WITHDRAWAL_${status.toUpperCase()}`, 'withdrawal', withdrawalId, {
      amount: wth.amount,
      userId: wth.user_id,
      bank: wth.bank_name,
      adminNote
    }, req);

    return res.json({
      success: true,
      message: `Withdrawal marked as ${status}.`,
      withdrawal: updateRes.rows[0]
    });
  } catch (err) {
    console.error('[UpdateWithdrawalStatus Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update withdrawal status.' });
  }
}

// 6. Platform Transactions
async function getAdminTransactions(req, res) {
  try {
    const result = await db.query('SELECT * FROM transactions');
    return res.json({ success: true, transactions: result.rows });
  } catch (err) {
    console.error('[GetAdminTransactions Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve transactions.' });
  }
}

// 7. Audit Logs
async function getAuditLogs(req, res) {
  try {
    const result = await db.query('SELECT * FROM audit_logs');
    return res.json({ success: true, auditLogs: result.rows });
  } catch (err) {
    console.error('[GetAuditLogs Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
}

// 8. Settings Management
async function getSettings(req, res) {
  try {
    const result = await db.query('SELECT * FROM system_settings');
    const settings = {};
    result.rows.forEach(s => {
      if (s.key === 'paystack_secret_key') {
        settings[s.key] = s.value ? 'Configured' : '';
      } else {
        settings[s.key] = s.value;
      }
    });

    settings.paystack_public_key = process.env.PAYSTACK_PUBLIC_KEY || settings.paystack_public_key || '';
    settings.has_paystack_secret_key = !!process.env.PAYSTACK_SECRET_KEY;

    return res.json({ success: true, settings });
  } catch (err) {
    console.error('[GetSettings Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
}

async function updateSetting(req, res) {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: 'Key and value are required.' });
    }

    const updateRes = await db.query('UPDATE system_settings SET value = $1 WHERE key = $2 RETURNING *', [String(value), key]);
    await logAdminAction(req.user.id, 'UPDATE_SETTING', 'setting', null, { key, value }, req);

    return res.json({ success: true, message: `Setting ${key} updated.`, setting: updateRes.rows[0] });
  } catch (err) {
    console.error('[UpdateSetting Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update setting.' });
  }
}

module.exports = {
  getMetrics,
  getUsers,
  toggleUserStatus,
  confirmUserAccountActivation,
  getAdminTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getSubmissions,
  reviewSubmission,
  getAdminWithdrawals,
  updateWithdrawalStatus,
  getAdminTransactions,
  getAuditLogs,
  getSettings,
  updateSetting
};
