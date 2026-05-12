const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * GET /api/analytics/applications
 * Returns joined + enriched analytics dataset
 */
router.get("/applications", (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.status,
      a.applied_at,

      o.title AS opportunityTitle,
      o.sector,
      o.closing_date

    FROM applications a
    LEFT JOIN opportunities o
      ON a.opportunity_id = o.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Analytics failed" });
    }

    const now = new Date();

    const formatted = results.map((row) => ({
      ...row,
      status: row.status?.toLowerCase() || "pending",
      sector: row.sector || "Unknown",
      opportunityTitle: row.opportunityTitle || "Unknown",

      opportunityStatus:
        row.closing_date && new Date(row.closing_date) > now
          ? "open"
          : "closed",
    }));

    res.json(formatted);
  });
});

module.exports = router;