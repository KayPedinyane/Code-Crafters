const express = require("express");
const router = express.Router();
const db = require("../db");

// ======================
// CREATE / UPDATE ADMIN PROFILE
// ======================
router.put("/", (req, res) => {
  const { email, name, surname } = req.body;

  const sql = `
    UPDATE admin_profile
    SET name = ?, surname = ?
    WHERE email = ?
  `;

  db.query(sql, [name, surname, email], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Profile updated" });
  });
});
// ======================
// GET ADMIN PROFILE BY EMAIL
// ======================
router.get("/:email", (req, res) => {
  const sql = `SELECT * FROM admin_profile WHERE email = ?`;

  db.query(sql, [req.params.email], (err, results) => {
    if (err) {
      console.error("DB error fetching admin profile:", err.message);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Admin profile not found" });
    }

    res.json(results[0]);
  });
});


module.exports = router;