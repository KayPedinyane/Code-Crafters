const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

router.post('/', upload.single('cv'), (req, res) => {
  const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;