const http = require('http');

function request(method, path, body, token, port = 5000) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Length': Buffer.byteLength(postData) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(rawData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: rawData });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE EARNFLOW VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, extraInfo = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName} ${extraInfo}`);
    } else {
      console.error(`❌ [FAIL] ${testName} ${extraInfo}`);
    }
  }

  // 1. Healthcheck
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.data?.status === 'ok', '1. API Health Check', `-> ${health.data?.service}`);

  // 2. User Registration
  const testEmail = `tunde_${Date.now()}@example.com`;
  const reg = await request('POST', '/api/auth/register', {
    fullName: 'Tunde Bakare',
    email: testEmail,
    phone: '08023456789',
    password: 'UserPass123!',
    confirmPassword: 'UserPass123!',
    referralCode: 'CHIDI88' // Referred by Chidi
  });
  assert(reg.status === 201 && reg.data?.success, '2. User Registration & Referral Linkage', `-> User ID: ${reg.data?.user?.id}`);
  const userToken = reg.data?.token;
  const userId = reg.data?.user?.id;

  // 3. User Me / Wallet Profile
  const me = await request('GET', '/api/auth/me', null, userToken);
  assert(me.status === 200 && me.data?.wallet?.available_balance === 0, '3. New User Profile & Zero Balance', `-> Available: ₦${me.data?.wallet?.available_balance}`);

  // 4. Browse Available Tasks
  const tasksRes = await request('GET', '/api/tasks', null, userToken);
  const tasks = tasksRes.data?.tasks || [];
  assert(tasks.length >= 7, '4. Task Marketplace Query', `-> Found ${tasks.length} active tasks`);

  // 5. Submit Evidence for Task 1
  const subRes = await request('POST', '/api/tasks/1/submit', {
    evidenceText: 'Completed mobile banking feedback survey. Confirmation code: NAIJA-BANK-9912.',
    evidenceUrl: 'https://postimg.cc/demo-survey-receipt.png'
  }, userToken);
  assert(subRes.status === 201 && subRes.data?.success, '5. Task Evidence Submission', `-> Submission ID: ${subRes.data?.submission?.id}`);
  const submissionId = subRes.data?.submission?.id;

  // 6. Test Withdrawal Gate Before Activation (EXPECT ERROR 'account not activated')
  const withdrawAttempt = await request('POST', '/api/wallet/withdraw', {
    amount: 1000,
    bankName: 'GTBank',
    accountName: 'Tunde Bakare',
    accountNumber: '0123456789'
  }, userToken);
  const activationBlocked = withdrawAttempt.status === 403 && withdrawAttempt.data?.message === 'account not activated';
  assert(activationBlocked, '6. Withdrawal Gate Enforcement (Strict "account not activated" error)', `-> Status: ${withdrawAttempt.status}, Msg: "${withdrawAttempt.data?.message}"`);

  // 7. Submit ₦1,000 Activation Payment
  const actSubmit = await request('POST', '/api/activations/submit', {
    paymentReference: `ACT-VERIFY-${Date.now()}`,
    paymentMethod: 'bank_transfer',
    evidenceNote: 'Transferred ₦1,000 via Moniepoint gateway'
  }, userToken);
  assert(actSubmit.status === 201 && actSubmit.data?.success, '7. Account Activation Fee Payment Recorded', `-> Status: ${actSubmit.data?.activation?.status}`);

  // 8. Admin Login
  const adminAuth = await request('POST', '/api/auth/login', {
    email: 'uchennamister@gmail.com',
    password: 'Uchman1472#'
  });
  assert(adminAuth.status === 200 && adminAuth.data?.user?.role === 'admin', '8. Admin Authentication & Role Authorization', `-> Role: ${adminAuth.data?.user?.role}`);
  const adminToken = adminAuth.data?.token;

  // 9. Admin Review & Approve Task Submission
  const reviewRes = await request('PUT', `/api/admin/submissions/${submissionId}/review`, {
    status: 'approved',
    adminFeedback: 'Survey confirmation code verified and validated.'
  }, adminToken);
  assert(reviewRes.status === 200 && reviewRes.data?.submission?.status === 'approved', '9. Admin Approve Task & Credit Wallet Balance', `-> ${reviewRes.data?.message}`);

  // 10. Admin Confirm ₦1,000 Account Activation
  const confirmRes = await request('PUT', `/api/admin/users/${userId}/activation`, {
    isAccountActivated: true,
    note: 'Payment verified via Moniepoint settlement'
  }, adminToken);
  assert(confirmRes.status === 200 && confirmRes.data?.user?.is_account_activated === true, '10. Admin Confirm ₦1,000 Account Activation', `-> Status: ${confirmRes.data?.user?.is_account_activated}`);

  // 11. User Balance & Activation State Verification
  const meAfter = await request('GET', '/api/auth/me', null, userToken);
  const balanceCredited = meAfter.data?.wallet?.available_balance === 250;
  const activated = meAfter.data?.user?.is_account_activated === true;
  assert(balanceCredited && activated, '11. User Balance Credited & Activation Status Active', `-> Available: ₦${meAfter.data?.wallet?.available_balance}, Activated: ${activated}`);

  // 12. Referrer Tracking (Chidi earned referral)
  const chidiAuth = await request('POST', '/api/auth/login', {
    email: 'chidi@example.com',
    password: 'UserPass123!'
  });
  const chidiRefs = await request('GET', '/api/referrals', null, chidiAuth.data?.token);
  assert(chidiRefs.data?.stats?.totalReferrals >= 2, '12. Referral Tracking & Attribution', `-> Total Referrals for Chidi: ${chidiRefs.data?.stats?.totalReferrals}`);

  // 13. Audit Log Recorded
  const auditRes = await request('GET', '/api/admin/audit-logs', null, adminToken);
  assert(auditRes.data?.auditLogs?.length >= 3, '13. Administrative Audit Trail Integrity', `-> Total Audit Records: ${auditRes.data?.auditLogs?.length}`);

  // 14. Frontend Web Server Serving
  const frontRes = await request('GET', '/', null, null, 3000);
  assert(frontRes.status === 200 && frontRes.raw?.includes('EarnFlow'), '14. Client Frontend Live on Port 3000', `-> HTML Served with title "EarnFlow"`);

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passed}/${total} TESTS PASSED (${Math.round(passed/total*100)}%)`);
  console.log('====================================================');
}

run().catch(console.error);
