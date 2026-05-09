const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
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

  db.query(sql, values, (err) => {
    if (err) {
      console.error('DB error saving provider profile:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Provider profile saved successfully' });
  });
});

// GET ALL PROVIDERS
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      id,
      company_name AS name,
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

router.put("/:id/status", (req, res) => {
  const { status } = req.body;

  const updateSql = `
    UPDATE provider_profile
    SET status = ?
    WHERE id = ?
  `;

  db.query(updateSql, [status, req.params.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }

    // Undo goes back to New requests — no email needed
    if (status === "new") {
      return res.json({
        message: "Status updated successfully"
      });
    }

    // fetch provider info for email
    const getProviderSql = `
      SELECT email, contact_person, company_name
      FROM provider_profile
      WHERE id = ?
    `;

    db.query(getProviderSql, [req.params.id], async (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }

      if (!results.length) {
        return res.status(404).json({
          error: "Provider not found"
        });
      }

      const provider = results[0];

      let subject = "";
      let text = "";

      if (status === "accepted") {
        subject = "Provider Application Approved";

        text = `
Hello ${provider.contact_person},

Congratulations!

Your provider application for
${provider.company_name}
has been approved.

You are now an active provider.

Regards,
Admin Team
`;
      }

      if (status === "rejected") {
        subject = "Provider Application Update";

        text = `
Hello ${provider.contact_person},

Thank you for applying.

After review, your provider application for
${provider.company_name}
was not approved at this time.

Regards,
Admin Team
`;
      }

      try {

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: provider.email,
          subject,
          text
        });

        res.json({
          message: "Status updated and email sent"
        });

      } catch (mailErr) {

        console.error(mailErr);

        res.json({
          message: "Status updated but email failed"
        });
      }

    });
  });
});

module.exports = router;