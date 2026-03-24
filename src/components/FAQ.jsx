import { useState } from "react";

export default function FAQ({ items }) {
  const [openSet, setOpenSet] = useState(new Set());

  const toggle = (i) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="faq-section">
      <div className="faq-header">
        <span className="faq-label">Frequently Asked Questions</span>
      </div>
      <div className="faq-list">
        {items.map((item, i) => (
          <div key={i} className={`faq-item ${openSet.has(i) ? "faq-open" : ""}`}>
            <div className="faq-question-row">
              <span className="faq-num">Q{i + 1}</span>
              <span className="faq-question-text">{item.q}</span>
              <button
                className="reveal-btn"
                onClick={() => toggle(i)}
                aria-expanded={openSet.has(i)}
              >
                {openSet.has(i) ? "Hide Answer ↑" : "Reveal Answer ↓"}
              </button>
            </div>
            {openSet.has(i) && (
              <div className="faq-answer">
                {typeof item.a === "string" ? (
                  <p>{item.a}</p>
                ) : (
                  item.a
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
