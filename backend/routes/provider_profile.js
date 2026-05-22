const express = require("express");
const router = express.Router();
const db = require("../db");
const { BrevoClient } = require('@getbrevo/brevo');

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

// POST /provider-profile - save or update provider profile
router.post('/', (req, res) => {
  const {
    email, company_name, contact_person, phone,
    industry, website, address, province
  } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  const sql = `
    INSERT INTO provider_profile (
      email, company_name, contact_person, phone,
      industry, website, address, province
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      company_name = VALUES(company_name),
      contact_person = VALUES(contact_person),
      phone = VALUES(phone),
      industry = VALUES(industry),
      website = VALUES(website),
      address = VALUES(address),
      province = VALUES(province)
  `;

  const values = [
    email, company_name, contact_person, phone,
    industry, website, address, province
  ];

  db.query(sql, values, async (err) => {
    if (err) {
      console.error('DB error saving provider profile:', err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'Provider profile saved successfully' });

    // Send registration confirmation email in background
    try {
      await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: "SkillsBridge SA", email: "skillsbridgesa@gmail.com" },
        to: [{ email, name: contact_person }],
        subject: "Application Received — SkillsBridge SA",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h1 style="color: #0a1628;">SkillsBridge<span style="color: #00c853;">SA</span></h1>
            <p>Dear ${contact_person},</p>
            <p>Thank you for registering as a provider on SkillsBridge SA.</p>
            <p>Your application for <strong>${company_name}</strong> has been received and is currently under review. We will notify you once a decision has been made.</p>
            <p>Kind regards,<br/>The SkillsBridge SA Team</p>
          </div>
        `,
      });
      console.log(`Registration confirmation email sent to ${email}`);
    } catch (mailErr) {
      console.error("Registration email failed:", mailErr?.message || mailErr);
    }
  });
});

// GET ALL PROVIDERS
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      id,
      company_name,
      contact_person,
      phone,
      industry,
      website,
      address,
      province,
      email,
      status
    FROM provider_profile
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET SINGLE PROVIDER BY ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM provider_profile WHERE id = ?";

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!results.length) {
      return res.status(404).json({ error: "Provider not found" });
    }

    res.json(results[0]);
  });
});

// UPDATE PROVIDER STATUS
router.put("/:id/status", (req, res) => {
  const { status } = req.body;

  const updateSql = `UPDATE provider_profile SET status = ? WHERE id = ?`;

  db.query(updateSql, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Undo goes back to New requests — no email needed
    if (status === "new") {
      return res.json({ message: "Status updated successfully" });
    }

    // Respond immediately — don't block on email
    res.json({ message: "Status updated and email sent" });

    // Fetch provider and send email in background
    db.query(
      `SELECT email, contact_person, company_name FROM provider_profile WHERE id = ?`,
      [req.params.id],
      async (err, results) => {
        if (err || !results.length) return;

        const provider = results[0];

        const templates = {
          accepted: {
            subject: "Provider Application Approved — SkillsBridge SA",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h1 style="color: #0a1628;">SkillsBridge<span style="color: #00c853;">SA</span></h1>
                <p>Dear ${provider.contact_person},</p>
                <p>Congratulations! Your provider application for <strong>${provider.company_name}</strong> has been <strong>approved</strong>.</p>
                <p>You are now an active provider on SkillsBridge SA.</p>
                <p>Kind regards,<br/>The SkillsBridge SA Team</p>
              </div>
            `,
          },
          rejected: {
            subject: "Provider Application Update — SkillsBridge SA",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h1 style="color: #0a1628;">SkillsBridge<span style="color: #00c853;">SA</span></h1>
                <p>Dear ${provider.contact_person},</p>
                <p>Thank you for applying. After review, your provider application for <strong>${provider.company_name}</strong> was not approved at this time.</p>
                <p>We encourage you to review your profile and reapply in the future.</p>
                <p>Kind regards,<br/>The SkillsBridge SA Team</p>
              </div>
            `,
          },
        };

        const template = templates[status];
        if (!template) return;

        try {
          await brevo.transactionalEmails.sendTransacEmail({
            sender: { name: "SkillsBridge SA", email: "skillsbridgesa@gmail.com" },
            to: [{ email: provider.email, name: provider.contact_person }],
            subject: template.subject,
            htmlContent: template.html,
          });
          console.log(`Provider status email sent to ${provider.email} — status: ${status}`);
        } catch (mailErr) {
          console.error("Provider email failed:", mailErr?.message || mailErr);
        }
      }
    );
  });
});

    router.delete("/:email", (req, res) => {
      const db = require("../db");
      const email = decodeURIComponent(req.params.email);
      db.query("DELETE FROM provider_profiles WHERE email = ?", [email], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });

module.exports = router;