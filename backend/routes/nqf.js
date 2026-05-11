const express = require("express");
const router = express.Router();
const nqfData = require('../data/nqf.json');

router.get('/', (req, res) => {
    res.json(nqfData)
})

module.exports = router;