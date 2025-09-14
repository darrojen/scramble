// src/app/main/chatbot/page.tsx
"use client";

import { useState } from "react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, `You: ${input}`, `Bot: I received "${input}"`]);
    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chatbot</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        style={{ padding: "8px", width: "70%" }}
      />
      <button onClick={handleSend} style={{ padding: "8px 12px", marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
}
