import { useState } from "react";
import { FiX } from "react-icons/fi";
import "./MoodQuestionnaire.css";

// New categorized questions for more accurate mood detection
const categorizedQuestions = [
  {
    category: "joy",
    text: "Reflecting on your day, what brought a genuine smile to your face?",
    options: [
      { text: "Several things! It was a great day.", score: 2 },
      { text: "A few nice moments.", score: 1 },
      { text: "Not much, honestly.", score: 0 },
      { text: "Nothing at all.", score: -1 },
    ],
  },
  {
    category: "anger",
    text: "Have you felt easily irritated or frustrated by people or situations today?",
    options: [
      { text: "Yes, I've been feeling very on-edge.", score: 2 },
      { text: "More than usual, yes.", score: 1 },
      { text: "A little, but it passed quickly.", score: 0 },
      { text: "No, I've been feeling patient.", score: -1 },
    ],
  },
  {
    category: "sadness",
    text: "How connected have you felt to the people around you today?",
    options: [
      { text: "Felt very isolated or disconnected.", score: 2 },
      { text: "A bit distant.", score: 1 },
      { text: "Fairly connected.", score: 0 },
      { text: "Very connected and supported.", score: -1 },
    ],
  },
  {
    category: "fear",
    text: "Is there anything you've been avoiding because it makes you feel worried or anxious?",
    options: [
      { text: "Yes, I'm actively avoiding something.", score: 2 },
      { text: "I've been procrastinating on it.", score: 1 },
      { text: "It's on my mind, but I'll face it.", score: 0 },
      { text: "No, I feel confident and prepared.", score: -1 },
    ],
  },
  {
    category: "joy",
    text: "How much have you been able to enjoy your usual hobbies or interests?",
    options: [
      { text: "I've really enjoyed them!", score: 2 },
      { text: "Somewhat, but not fully.", score: 1 },
      { text: "I haven't had the energy for them.", score: 0 },
      { text: "They feel like a chore.", score: -1 },
    ],
  },
  {
    category: "sadness",
    text: "How would you describe your energy levels throughout the day?",
    options: [
      { text: "Completely drained or exhausted.", score: 2 },
      { text: "Lower than usual, feeling sluggish.", score: 1 },
      { text: "Pretty average, I'm doing okay.", score: 0 },
      { text: "High! I feel energetic and motivated.", score: -1 },
    ],
  },
  {
    category: "anger",
    text: "Are you holding onto any feelings of resentment or unfairness?",
    options: [
      { text: "Yes, something feels very unfair.", score: 2 },
      { text: "A little, it's nagging at me.", score: 1 },
      { text: "I'm working on letting it go.", score: 0 },
      { text: "No, my mind feels clear and at peace.", score: -1 },
    ],
  },
  {
    category: "fear",
    text: "What has your inner voice been telling you today?",
    options: [
      { text: "It's been critical or worried about the future.", score: 2 },
      { text: "It's been quiet or distracted.", score: 1 },
      { text: "It's been neutral and observant.", score: 0 },
      { text: "It's been encouraging and positive.", score: -1 },
    ],
  },
  {
    category: "surprise",
    text: "How open do you feel to new experiences or unexpected events right now?",
    options: [
      { text: "I'm craving something new and exciting!", score: 2 },
      { text: "I'm open to whatever comes my way.", score: 1 },
      { text: "I'd prefer to stick to my routine.", score: 0 },
      { text: "I really need stability and no surprises.", score: -1 },
    ],
  },
];


export default function MoodQuestionnaire({ onSubmit, onClose }) {
  // Store the entire option object {text, score, category}
  const [answers, setAnswers] = useState(Array(categorizedQuestions.length).fill(null));

  const handleChange = (qIndex, option) => {
    const updated = [...answers];
    updated[qIndex] = { ...option, category: categorizedQuestions[qIndex].category };
    setAnswers(updated);
  };

  const handleSubmit = () => {
    if (answers.includes(null)) {
      alert("Please answer all questions to get your mood analysis.");
      return;
    }
    // Send an array of answers, each with its score and category
    const answerPayload = answers.map(ans => ({ score: ans.score, category: ans.category }));
    onSubmit(answerPayload);
  };

  return (
    <div className="questionnaire-overlay">
      <div className="questionnaire-modal">
        <button onClick={onClose} className="close-button"><FiX /></button>
        <h2 className="questionnaire-title">How Are You Feeling Today?</h2>
        <div className="questions-container">
          {categorizedQuestions.map((q, index) => (
            <div key={index} className="question-block">
              <p className="question-text">{index + 1}. {q.text}</p>
              <div className="options-group">
                {q.options.map((opt, optIndex) => (
                  <label key={optIndex} className="option-label">
                    <input
                      type="radio"
                      name={`q${index}`}
                      onChange={() => handleChange(index, opt)}
                      checked={answers[index]?.text === opt.text}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={answers.includes(null)} className="submit-button">
          Analyze My Mood
        </button>
      </div>
    </div>
  );
}