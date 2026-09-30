const db = require('../database/db');

async function getReferralData(req, res) {
  try {
    const userId = req.user.id;
    const userRes = await db.query('SELECT referral_code FROM users WHERE id = $1', [userId]);
    const referralCode = userRes.rows[0]?.referral_code || '';

    const refsRes = await db.query('SELECT * FROM referrals WHERE referrer_id = $1', [userId]);
    const referrals = refsRes.rows;

    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.status === 'completed').length;
    const totalRewards = referrals
      .filter(r => r.status === 'completed')
      .reduce((acc, r) => acc + parseFloat(r.reward_amount || 0), 0);

    const bonusSetting = await db.query('SELECT value FROM system_settings WHERE key = $1', ['referral_bonus']);
    const rewardPerReferral = parseFloat(bonusSetting.rows[0]?.value || '250.00');

    return res.json({
      success: true,
      referralCode,
      rewardPerReferral,
      stats: {
        totalReferrals,
        successfulReferrals,
        referralRewards: totalRewards
      },
      referralHistory: referrals
    });
  } catch (err) {
    console.error('[GetReferralData Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve referral information.' });
  }
}

module.exports = {
  getReferralData
};
