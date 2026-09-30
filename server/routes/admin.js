const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/metrics', adminController.getMetrics);

// Users
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.put('/users/:id/activation', adminController.confirmUserAccountActivation);

// Tasks
router.get('/tasks', adminController.getAdminTasks);
router.post('/tasks', adminController.createTask);
router.put('/tasks/:id', adminController.updateTask);
router.put('/tasks/:id/status', adminController.toggleTaskStatus);
router.delete('/tasks/:id', adminController.deleteTask);

// Submissions
router.get('/submissions', adminController.getSubmissions);
router.put('/submissions/:id/review', adminController.reviewSubmission);

// Withdrawals
router.get('/withdrawals', adminController.getAdminWithdrawals);
router.put('/withdrawals/:id/status', adminController.updateWithdrawalStatus);

// Transactions & Audit Logs
router.get('/transactions', adminController.getAdminTransactions);
router.get('/audit-logs', adminController.getAuditLogs);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSetting);

module.exports = router;
