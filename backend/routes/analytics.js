const express = require("express");
const router = express.Router();
const db = require("../db");

// ── Province resolver ─────────────────────────────────────────────────────────
// Location format in DB:
// "Johannesburg, Gauteng"

function getProvince(location) {
  if (!location) return "Unknown Province";

  // Split using comma
  const parts = location.split(",");

  // If province exists after comma
  if (parts.length > 1) {
    return parts[1].trim();
  }

  return "Unknown Province";
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.get("/applications", (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.status,
      a.applied_at,
      o.title AS opportunityTitle,
      o.opportunity_type AS opportunityType,
      o.sector,
      o.location,
      o.closing_date,
      o.nqf_level
    FROM applications a
    LEFT JOIN opportunities o 
      ON a.opportunity_id = o.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);

      return res.status(500).json({
        error: "Analytics failed",
      });
    }

    const now = new Date();

    const formatted = results.map((row) => {
      const province = getProvince(row.location);

      return {
        ...row,

        status:
          row.status?.toLowerCase() || "pending",

        sector:
          row.sector || "Unknown",

        opportunityTitle:
          row.opportunityTitle || "Unknown",

        opportunityType:
          row.opportunityType || "Unknown Type",

        nqf_level:
          row.nqf_level || null,

        province,

        opportunityStatus:
          row.closing_date &&
          new Date(row.closing_date) > now
            ? "open"
            : "closed",
      };
    });

    res.json(formatted);
  });
});

module.exports = router;