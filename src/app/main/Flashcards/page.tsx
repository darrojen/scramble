// src/app/main/flashcards/page.tsx
"use client";

import { useState } from "react";

const flashcards = [
  { question: "What is React?", answer: "A JavaScript library for building UIs." },
  { question: "What is Next.js?", answer: "A React framework for server-side rendering and routing." },
  { question: "What is TypeScript?", answer: "A typed superset of JavaScript." },
];

export default function FlashcardsPage() {
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const nextCard = () => {
    setShowAnswer(false);
    setCurrent((prev) => (prev + 1) % flashcards.length);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Flashcards</h1>
      <div
        style={{
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          width: "300px",
          margin: "0 auto",
          cursor: "pointer",
        }}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {showAnswer ? (
          <p>{flashcards[current].answer}</p>
        ) : (
          <p>{flashcards[current].question}</p>
        )}
      </div>
      <button onClick={nextCard} style={{ marginTop: "15px", padding: "8px 12px" }}>
        Next
      </button>
    </div>
  );
}
