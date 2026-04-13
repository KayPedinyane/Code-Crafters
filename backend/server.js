import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import fs from "fs";
import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",//beya database password
  database: ""//'' database name
});

async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
}

app.post("/api/login", verifyToken, async (req, res) => {
  const uid = req.uid;

  const [rows] = await db.query(
    "SELECT role FROM user WHERE firebase_uid = ?",
    [uid]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    role: rows[0].role
  });
});

  app.get("/admin", verifyToken, async (req, res) => {
  const uid = req.uid; 

  const [rows] = await db.query(
    "SELECT role FROM user WHERE firebase_uid = ?",
    [uid]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  if (rows[0].role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json({ message: "Welcome admin" });
}); 

app.post("/api/create", verifyToken, async (req, res) => {
  const uid = req.uid;
  const email = req.body.email;
  const role = req.body.role;

  try {
    const [result] = await db.query(
      "INSERT INTO user (firebase_uid, email, role) VALUES (?, ?, ?)",
      [uid, email, role]
    );

    res.json({ message: "User saved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).send("DB error");
  }
});



app.listen(8080, () => {
  console.log("Server running on http://localhost:8080");
});