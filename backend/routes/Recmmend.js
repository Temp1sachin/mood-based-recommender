// routes/recommend.js
const express = require('express');
const router = express.Router();
const recommendHandler = require('../controllers/recommendHandler');

router.post('/recommend', recommendHandler);

module.exports = router;
