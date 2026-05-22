const db = require('../db');
const { createNotification } = require('../routes/notifications');
const { sendStatusEmail } = require('./emailSender');

async function checkAndNotifyUser(userEmail) {
  console.log("checkAndNotifyUser called for:", userEmail);
  try {
    const [profileRows] = await db.promise().query(
      'SELECT * FROM profile WHERE email = ?', [userEmail]
    );
    const profile = profileRows[0];
    console.log("Profile found:", profile ? "yes" : "no — stopping here");
    if (!profile) return;

    // Get all approved opportunities
    const [allJobs] = await db.promise().query(
      `SELECT o.*, pp.company_name 
       FROM opportunities o
       LEFT JOIN users u ON u.id = o.provider_id
       LEFT JOIN provider_profile pp ON pp.email = u.email
       WHERE o.status = 'approved'`
    );

    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    // ── Keys to track what we've already notified ──
    const notifiedMatchKey  = `notified_match_${userEmail}`;
    const notifiedCloseKey  = `notified_closing_${userEmail}`;

    const [matchRows] = await db.promise().query(
      'SELECT notified_job_ids FROM notification_tracker WHERE user_email = ? AND type = ?',
      [userEmail, 'match']
    );
    const [closeRows] = await db.promise().query(
      'SELECT notified_job_ids FROM notification_tracker WHERE user_email = ? AND type = ?',
      [userEmail, 'closing']
    );

    const alreadyNotifiedMatch   = matchRows[0]  ? JSON.parse(matchRows[0].notified_job_ids)  : [];
    const alreadyNotifiedClosing = closeRows[0]  ? JSON.parse(closeRows[0].notified_job_ids)  : [];

    for (const job of allJobs) {
      const closingDate = job.closing_date ? new Date(job.closing_date) : null;

      // ── Check matching opportunity ──
      const nqfMatch    = profile.nqf_level && job.nqf_level === profile.nqf_level;
      const sectorMatch = profile.qualification && job.sector
        .toLowerCase()
        .includes((profile.qualification || '').toLowerCase().split(' ')[0]);

      if ((nqfMatch || sectorMatch) && !alreadyNotifiedMatch.includes(job.id)) {
        const message = `🎯 New opportunity matching your profile: "${job.title}" in ${job.sector} (${job.nqf_level}).`;

        // In-app
        createNotification(userEmail, message, () => {});

        // Email
        await sendStatusEmail(userEmail, profile.full_name, job.title, 'match')
          .catch(e => console.error('Match email error:', e));

        alreadyNotifiedMatch.push(job.id);
      }

      // ── Check closing deadline ──
      if (
        closingDate &&
        closingDate >= today &&
        closingDate <= threeDaysLater &&
        !alreadyNotifiedClosing.includes(job.id)
      ) {
        const daysLeft = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));
        const message  = `⏰ "${job.title}" closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Don't miss out!`;

        // In-app
        createNotification(userEmail, message, () => {});

        // Email
        await sendStatusEmail(userEmail, profile.full_name, job.title, 'closing')
          .catch(e => console.error('Closing email error:', e));

        alreadyNotifiedClosing.push(job.id);
      }
    }

    // ── Save updated notified IDs back to DB ──
    await db.promise().query(
      `INSERT INTO notification_tracker (user_email, type, notified_job_ids)
       VALUES (?, 'match', ?)
       ON DUPLICATE KEY UPDATE notified_job_ids = VALUES(notified_job_ids)`,
      [userEmail, JSON.stringify(alreadyNotifiedMatch)]
    );
    console.log("notification_tracker updated successfully for:", userEmail);

    await db.promise().query(
      `INSERT INTO notification_tracker (user_email, type, notified_job_ids)
       VALUES (?, 'closing', ?)
       ON DUPLICATE KEY UPDATE notified_job_ids = VALUES(notified_job_ids)`,
      [userEmail, JSON.stringify(alreadyNotifiedClosing)]
    );

  } catch (err) {
    console.error('Notification checker error:', err);
  }
}

module.exports = { checkAndNotifyUser };