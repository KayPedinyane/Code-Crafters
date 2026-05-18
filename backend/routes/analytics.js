const express = require("express");
const router = express.Router();
const db = require("../db");

// ── Province lookup map ───────────────────────────────────────────────────────
const PROVINCE_MAP = {
  // Gauteng
  "johannesburg": "Gauteng",
  "pretoria":     "Gauteng",
  "soweto":       "Gauteng",
  "sandton":      "Gauteng",
  "midrand":      "Gauteng",
  "centurion":    "Gauteng",
  "germiston":    "Gauteng",
  "benoni":       "Gauteng",
  "boksburg":     "Gauteng",
  "roodepoort":   "Gauteng",

  // Western Cape
  "cape town":    "Western Cape",
  "stellenbosch": "Western Cape",
  "paarl":        "Western Cape",
  "george":       "Western Cape",
  "knysna":       "Western Cape",

  // KwaZulu-Natal
  "durban":           "KwaZulu-Natal",
  "pietermaritzburg": "KwaZulu-Natal",
  "richards bay":     "KwaZulu-Natal",
  "newcastle":        "KwaZulu-Natal",

  // Eastern Cape
  "port elizabeth": "Eastern Cape",
  "gqeberha":       "Eastern Cape",
  "east london":    "Eastern Cape",
  "mthatha":        "Eastern Cape",

  // Limpopo
  "polokwane":   "Limpopo",
  "tzaneen":     "Limpopo",
  "thohoyandou": "Limpopo",

  // Mpumalanga
  "nelspruit":  "Mpumalanga",
  "mbombela":   "Mpumalanga",
  "witbank":    "Mpumalanga",
  "emalahleni": "Mpumalanga",

  // North West
  "rustenburg":    "North West",
  "mahikeng":      "North West",
  "klerksdorp":    "North West",
  "potchefstroom": "North West",

  // Free State
  "bloemfontein":   "Free State",
  "welkom":         "Free State",
  "phuthaditjhaba": "Free State",

  // Northern Cape
  "kimberley": "Northern Cape",
  "upington":  "Northern Cape",
  "springbok": "Northern Cape",
};

// ── Province resolver ─────────────────────────────────────────────────────────
function getProvince(location) {
  if (!location) return "Unknown Province";
  const key = location.trim().toLowerCase();
  return PROVINCE_MAP[key] || "Unknown Province";
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.get("/applications", (req, res) => {
  const sql = `
    SELECT
      a.id,
      a.status,
      a.applied_at,
      o.title        AS opportunityTitle,
      o.opportunity_type         AS opportunityType,
      o.sector,
      o.location,
      o.closing_date,
      o.nqf_level
    FROM applications a
    LEFT JOIN opportunities o ON a.opportunity_id = o.id
  `;

  db.query(sql, async (err, results) => {   // ← async here is required
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Analytics failed" });
    }

    const now = new Date();

    const formatted = await Promise.all(
      results.map(async (row) => {
        const province = await getProvince(row.location);
        
        return {
          ...row,
          status:           row.status?.toLowerCase() || "pending",
          sector:           row.sector                || "Unknown",
          opportunityTitle: row.opportunityTitle      || "Unknown",
          opportunityType:  row.opportunityType       || "Unknown Type",
          nqf_level:        row.nqf_level             || null,
          province,
          opportunityStatus:
            row.closing_date && new Date(row.closing_date) > now
              ? "open"
              : "closed",
        };
      })
    );

    res.json(formatted);
  });
});

module.exports = router;