import { useState } from "react";

export default function QuestionBox({ question, answer }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="question-box">
      <div className="question-label">🤔 Quick Check</div>
      <div className="question-text">{question}</div>
      {!revealed ? (
        <button className="reveal-btn" onClick={() => setRevealed(true)}>Reveal Answer</button>
      ) : (
        <div className="answer-box">{answer}</div>
      )}
    </div>
  );
}