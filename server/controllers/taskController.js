const db = require('../database/db');

async function getTasks(req, res) {
  try {
    const { category, search } = req.query;
    const result = await db.query('SELECT * FROM tasks WHERE is_active = true');
    let tasks = result.rows;

    if (category && category !== 'All') {
      tasks = tasks.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    // If user is logged in, attach their submission status for each task
    if (req.user) {
      const submissionsResult = await db.query('SELECT * FROM task_submissions WHERE user_id = $1', [req.user.id]);
      const submissionsMap = {};
      submissionsResult.rows.forEach(s => {
        submissionsMap[s.task_id] = s;
      });

      tasks = tasks.map(t => {
        const sub = submissionsMap[t.id];
        return {
          ...t,
          userSubmission: sub ? {
            id: sub.id,
            status: sub.status,
            createdAt: sub.created_at,
            adminFeedback: sub.admin_feedback
          } : null
        };
      });
    }

    return res.json({ success: true, tasks });
  } catch (err) {
    console.error('[GetTasks Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks.' });
  }
}

async function getTaskById(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const result = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = result.rows[0];

    let userSubmission = null;
    if (req.user) {
      const subResult = await db.query('SELECT * FROM task_submissions WHERE task_id = $1 AND user_id = $2', [taskId, req.user.id]);
      if (subResult.rows.length > 0) {
        userSubmission = subResult.rows[0];
      }
    }

    return res.json({
      success: true,
      task: {
        ...task,
        userSubmission
      }
    });
  } catch (err) {
    console.error('[GetTaskById Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve task details.' });
  }
}

async function submitTask(req, res) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { evidenceText, evidenceUrl } = req.body;

    // Check if task exists and is active
    const taskResult = await db.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const task = taskResult.rows[0];
    if (!task.is_active) {
      return res.status(400).json({ success: false, message: 'This task is no longer accepting submissions.' });
    }

    // Check existing submission
    const existingResult = await db.query('SELECT * FROM task_submissions WHERE task_id = $1 AND user_id = $2', [taskId, userId]);
    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0];
      if (existing.status === 'pending') {
        return res.status(400).json({ success: false, message: 'You already have a pending submission for this task.' });
      }
      if (existing.status === 'approved') {
        return res.status(400).json({ success: false, message: 'You have already completed and received rewards for this task.' });
      }
    }

    if (task.evidence_required && (!evidenceText || !evidenceText.trim()) && (!evidenceUrl || !evidenceUrl.trim())) {
      return res.status(400).json({ success: false, message: 'Evidence (notes, transaction reference, or screenshot URL) is required.' });
    }

    // Insert submission
    const submissionResult = await db.query(
      'INSERT INTO task_submissions (task_id, user_id, evidence_text, evidence_url, reward_amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [taskId, userId, (evidenceText || '').trim(), (evidenceUrl || '').trim(), task.reward_amount]
    );

    const submission = submissionResult.rows[0];

    // Create user notification
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'Task Submitted for Review', `Your submission for "${task.title}" was received and is currently under review.`, 'info', `/tasks/${taskId}`]
    );

    return res.status(201).json({
      success: true,
      message: 'Task submitted successfully! Rewards will be credited once verified by our team.',
      submission
    });
  } catch (err) {
    console.error('[SubmitTask Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to submit task evidence.' });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  submitTask
};
