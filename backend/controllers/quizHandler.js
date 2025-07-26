// controllers/quizHandler.js

const recommendHandler = require('./recommendHandler');

/**
 * Handles the /analyze-quiz request using a category-based scoring system.
 */
const quizHandler = async (req, res) => {
  try {
    // The payload is now an array of objects: [{ score, category }, ...]
    const { answers } = req.body;

    // 1. Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid input. "answers" must be a non-empty array.' });
    }

    // 2. Aggregate scores for each emotion category
    const emotionScores = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      // 'disgust' and 'anticipation' can be added here if you create questions for them
    };

    for (const answer of answers) {
      if (emotionScores.hasOwnProperty(answer.category)) {
        emotionScores[answer.category] += answer.score;
      }
    }

    console.log("Aggregated Emotion Scores:", emotionScores);

    // 3. Determine the dominant emotion
    let determinedMood = 'anticipation'; // Default to neutral
    let maxScore = 0;

    for (const emotion in emotionScores) {
      if (emotionScores[emotion] > maxScore) {
        maxScore = emotionScores[emotion];
        determinedMood = emotion;
      }
    }

    // A simple threshold to prevent a single low-score answer from dominating.
    // If the highest score is still very low, we stay neutral.
    if (maxScore < 2) {
      determinedMood = 'anticipation';
    }

    console.log(`Determined Dominant Mood: ${determinedMood}`);

    // 4. Modify the request body for the recommendHandler
    req.body.emotion = determinedMood;
    if (determinedMood === 'sadness' && emotionScores.sadness > 2) {
      console.log("High intensity sadness detected.");
      req.isHighIntensity = true; // Attach the flag for the next handler
    }
    // 5. Pass control to the existing recommendHandler
    return recommendHandler(req, res);

  } catch (err) {
    console.error("Error in /analyze-quiz:", err);
    res.status(500).json({ error: "Something went wrong during quiz analysis." });
  }
};

module.exports = quizHandler;