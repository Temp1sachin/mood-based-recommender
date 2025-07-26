// routes/mood.js

const express = require('express');
const router = express.Router();

// Import both handlers
const recommendHandler = require('../controllers/recommendHandler');
const quizHandler = require('../controllers/quizHandler');

// Route for direct mood selection
router.post('/recommend', recommendHandler);

// Route for questionnaire-based mood analysis
router.post('/analyze-quiz', quizHandler);

module.exports = router;