const { BrevoClient } = require('@getbrevo/brevo');

const apiInstance = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const STATUS_MESSAGES = {
  pending: {
    subject: "Application Received — SkillsBridge SA",
    body: (name, title) => `
Dear ${name || "Applicant"},

Thank you for applying for the <strong>${title}</strong> opportunity on SkillsBridge SA.

We have successfully received your application and it is currently under review. You will be notified of any updates regarding your application status.

Kind regards,
The SkillsBridge SA Team
    `,
  },
  shortlisted: {
    subject: "You Have Been Shortlisted — SkillsBridge SA",
    body: (name, title) => `
Dear ${name || "Applicant"},

Congratulations! We are pleased to inform you that you have been <strong>shortlisted</strong> for the <strong>${title}</strong> opportunity.

The provider will be in touch with you shortly regarding the next steps in the selection process. Please ensure your contact details are up to date on your profile.

Kind regards,
The SkillsBridge SA Team
    `,
  },
  accepted: {
    subject: "Congratulations — You Have Been Accepted! SkillsBridge SA",
    body: (name, title) => `
Dear ${name || "Applicant"},

We are delighted to inform you that your application for <strong>${title}</strong> has been <strong>accepted</strong>!

The provider will contact you directly with further details regarding your start date, onboarding process, and any documentation required. We encourage you to respond promptly.

Congratulations on this achievement and best of luck with your new opportunity!

Kind regards,
The SkillsBridge SA Team
    `,
  },
  rejected: {
    subject: "Application Outcome — SkillsBridge SA",
    body: (name, title) => `
Dear ${name || "Applicant"},

Thank you for your interest in the <strong>${title}</strong> opportunity on SkillsBridge SA.

After careful consideration, we regret to inform you that your application has been <strong>unsuccessful</strong> at this time. This decision does not reflect your potential, and we encourage you to continue applying for other opportunities that match your profile.

Please keep your profile updated so we can match you with future opportunities.

Kind regards,
The SkillsBridge SA Team
    `,
  },
  match: {
    subject: "New Opportunity Matching Your Profile — SkillsBridge SA",
    body: (name, title) => `
Dear ${name || "Applicant"},

A new opportunity matching your profile has been posted: <strong>${title}</strong>.

Log in to SkillsBridge SA to view the full details and apply before the closing date.

Kind regards,
The SkillsBridge SA Team
    `,
  },
  closing: {
    subject: "Opportunity Closing Soon — SkillsBridge SA",
    body: (name, title) => `
Dear ${name || "Applicant"},

This is a reminder that <strong>${title}</strong> is closing soon.

Log in to SkillsBridge SA to apply before it's too late.

Kind regards,
The SkillsBridge SA Team
    `,
  },
};

async function sendStatusEmail(toEmail, applicantName, opportunityTitle, status) {
  const template = STATUS_MESSAGES[status.toLowerCase()];
  if (!template) {
    console.warn(`No email template found for status: ${status}`);
    return;
  }

  try {
    const result = await apiInstance.transactionalEmails.sendTransacEmail({
      sender: { name: 'SkillsBridge SA', email: 'skillsbridgesa@gmail.com' },
      to: [{ email: toEmail, name: applicantName || 'Applicant' }],
      subject: template.subject,
      htmlContent: `
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
      `,
    });

    console.log(`Status email sent to ${toEmail} — status: ${status}, messageId: ${result?.messageId}`);
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error?.message || error);
    throw new Error(error?.message || 'Failed to send email');
  }
}

async function sendEmail({ to, subject, html }) {
  try {
    const result = await apiInstance.transactionalEmails.sendTransacEmail({
      sender: { name: 'SkillsBridge SA', email: 'skillsbridgesa@gmail.com' },
      to: [{ email: to }],
      subject: subject,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #0a1628; font-size: 24px; margin: 0;">
              SkillsBridge<span style="color: #00c853;">SA</span>
            </h1>
          </div>
          <div style="color: #4a5568; font-size: 15px; line-height: 1.8;">
            ${html}
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #718096; font-size: 12px; text-align: center;">
            This email was sent by SkillsBridge SA. Please do not reply to this email.
          </p>
        </div>
      `,
    });
    console.log(`Email sent to ${to} — subject: ${subject}, messageId: ${result?.messageId}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error?.message || error);
    throw new Error(error?.message || 'Failed to send email');
  }
}

module.exports = { sendStatusEmail, sendEmail };