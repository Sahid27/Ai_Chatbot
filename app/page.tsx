"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "bot";
  text: string;
  timestamp: Date;
  reactions?: string[];
  isCode?: boolean;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const detectCodeInMessage = (text: string) => {
    return /(function|const|let|class|import|export|\{|\};)/.test(text);
  };

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      text: input,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const conversationHistory = messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          conversationHistory,
        }),
      });

      const data = await res.json();

      // Messenger-style delay (human typing feel)
      setTimeout(() => {
        const botMsg: Message = {
          role: "bot",
          text: data.reply,
          timestamp: new Date(),
          reactions: [],
          isCode: detectCodeInMessage(data.reply),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 700);
    } catch {
      setIsTyping(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        background: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          width: 420,
          height: "90vh",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          borderRadius: 10,
          boxShadow: "0 2px 12px rgba(0,0,0,.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid #ddd",
            fontWeight: 600,
          }}
        >
          🤖 AI Assistant · online
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: 12,
            overflowY: "auto",
            background: "#e5ddd5",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent:
                  m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background:
                    m.role === "user" ? "#0084ff" : "#fff",
                  color: m.role === "user" ? "#fff" : "#000",
                  padding: "8px 12px",
                  borderRadius: 18,
                  maxWidth: "75%",
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
                <div
                  style={{
                    fontSize: 10,
                    opacity: 0.6,
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  {m.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.role === "user" && " ✓✓"}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ fontSize: 13, opacity: 0.7 }}>AI is typing…</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          style={{
            borderTop: "1px solid #ddd",
            padding: 10,
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Message"
            style={{
              flex: 1,
              borderRadius: 20,
              border: "1px solid #ccc",
              padding: "8px 12px",
              outline: "none",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              background: "#0084ff",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              cursor: "pointer",
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
