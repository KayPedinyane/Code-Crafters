const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_MESSAGES = {
  pending: {
    subject: "Application Received — SkillsBridge SA",
    body: (name, title) => `<p>Dear ${name || "Applicant"},</p><p>Thank you for applying for <strong>${title}</strong>. Your application is under review.</p><p>Kind regards,<br/>The SkillsBridge SA Team</p>`,
  },
  shortlisted: {
    subject: "You Have Been Shortlisted — SkillsBridge SA",
    body: (name, title) => `<p>Dear ${name || "Applicant"},</p><p>Congratulations! You have been <strong>shortlisted</strong> for <strong>${title}</strong>. The provider will contact you shortly.</p><p>Kind regards,<br/>The SkillsBridge SA Team</p>`,
  },
  accepted: {
    subject: "Congratulations — You Have Been Accepted! SkillsBridge SA",
    body: (name, title) => `<p>Dear ${name || "Applicant"},</p><p>We are delighted to inform you that your application for <strong>${title}</strong> has been <strong>accepted</strong>! The provider will contact you with further details.</p><p>Kind regards,<br/>The SkillsBridge SA Team</p>`,
  },
  rejected: {
    subject: "Application Outcome — SkillsBridge SA",
    body: (name, title) => `<p>Dear ${name || "Applicant"},</p><p>Thank you for applying for <strong>${title}</strong>. Unfortunately your application was unsuccessful at this time. We encourage you to keep applying.</p><p>Kind regards,<br/>The SkillsBridge SA Team</p>`,
  },
  match: {
    subject: "New Opportunity Matching Your Profile — SkillsBridge SA",
    body: (name, title) => `<p>Dear ${name || "Applicant"},</p><p>A new opportunity matching your profile has been posted: <strong>${title}</strong>. Log in to apply before the closing date.</p><p>Kind regards,<br/>The SkillsBridge SA Team</p>`,
  },
  closing: {
    subject: "Opportunity Closing Soon — SkillsBridge SA",
    body: (name, title) => `<p>Dear ${name || "Applicant"},</p><p><strong>${title}</strong> is closing soon. Log in to apply before it's too late.</p><p>Kind regards,<br/>The SkillsBridge SA Team</p>`,
  },
};

async function sendStatusEmail(toEmail, applicantName, opportunityTitle, status) {
  const template = STATUS_MESSAGES[status.toLowerCase()];
  if (!template) return;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #0a1628; font-size: 24px; margin: 0;">
          SkillsBridge<span style="color: #00c853;">SA</span>
        </h1>
      </div>
      <div style="color: #4a5568; font-size: 15px; line-height: 1.8;">
        ${template.body(applicantName, opportunityTitle)}
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      <p style="color: #718096; font-size: 12px; text-align: center;">
        This email was sent by SkillsBridge SA. Please do not reply to this email.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: 'SkillsBridge SA <onboarding@resend.dev>',
    to: toEmail,
    subject: template.subject,
    html,
  });

  console.log(`Status email sent to ${toEmail} — status: ${status}`);
}

module.exports = { sendStatusEmail };