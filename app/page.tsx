"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string; timestamp: Date }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = {
      role: "user" as const,
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: data.reply, timestamp: new Date() },
        ]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error("Error:", error);
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        .hover-button:hover {
          opacity: 0.8;
        }

        .input-field::placeholder {
          color: #9ca3af;
        }

        .attach-button:hover {
          opacity: 1;
        }

        .send-button:hover:not(:disabled) {
          background: #4338ca;
          transform: scale(1.05);
        }

        .icon-button:hover {
          background: #f3f4f6;
        }

        .message-wrapper {
          animation: slideIn 0.3s ease-out;
        }

        .typing-dot {
          animation: bounce 1.4s infinite ease-in-out;
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.chatBox}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div style={styles.avatarContainer}>
                <div style={styles.avatar}>
                  <span style={styles.avatarText}>AI</span>
                </div>
                <div style={styles.statusIndicator}></div>
              </div>
              <div>
                <h3 style={styles.headerTitle}>AI Assistant</h3>
                <p style={styles.headerSubtitle}>Online</p>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.iconButton} className="icon-button">
                ⋮
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messages} className="messages-container">
            {messages.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>💬</div>
                <h4 style={styles.emptyStateTitle}>Start a conversation</h4>
                <p style={styles.emptyStateText}>
                  Send a message to begin chatting with AI
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className="message-wrapper"
                style={{
                  ...styles.messageWrapper,
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {m.role === "bot" && (
                  <div style={styles.botAvatar}>
                    <span style={styles.botAvatarText}>AI</span>
                  </div>
                )}
                <div
                  style={{
                    ...styles.message,
                    background: m.role === "user" ? "#4f46e5" : "#ffffff",
                    color: m.role === "user" ? "#ffffff" : "#1f2937",
                    borderRadius:
                      m.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    boxShadow:
                      m.role === "user"
                        ? "0 1px 2px rgba(79, 70, 229, 0.2)"
                        : "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {m.text}
                  <div
                    style={{
                      ...styles.timestamp,
                      color: m.role === "user" ? "#e0e7ff" : "#9ca3af",
                    }}
                  >
                    {m.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={styles.messageWrapper} className="message-wrapper">
                <div style={styles.botAvatar}>
                  <span style={styles.botAvatarText}>AI</span>
                </div>
                <div style={styles.typingIndicator}>
                  <span style={styles.typingDot} className="typing-dot"></span>
                  <span
                    style={{ ...styles.typingDot, animationDelay: "0.2s" }}
                    className="typing-dot"
                  ></span>
                  <span
                    style={{ ...styles.typingDot, animationDelay: "0.4s" }}
                    className="typing-dot"
                  ></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={styles.inputContainer}>
            <div style={styles.inputBox}>
              <button
                style={styles.attachButton}
                className="attach-button hover-button"
              >
                📎
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={styles.input}
                className="input-field"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                style={{
                  ...styles.sendButton,
                  opacity: input.trim() ? 1 : 0.5,
                  cursor: input.trim() ? "pointer" : "not-allowed",
                }}
                className="send-button"
              >
                <span style={styles.sendIcon}>➤</span>
              </button>
            </div>
            <div style={styles.footer}>
              Made by <span style={styles.footerName}>SaHid</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  chatBox: {
    width: "100%",
    maxWidth: "440px",
    height: "680px",
    background: "#f9fafb",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
  header: {
    background: "#ffffff",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
  },
  statusIndicator: {
    position: "absolute",
    bottom: "2px",
    right: "2px",
    width: "10px",
    height: "10px",
    background: "#10b981",
    border: "2px solid white",
    borderRadius: "50%",
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
  },
  headerSubtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#10b981",
    marginTop: "2px",
  },
  headerActions: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    color: "#6b7280",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "background 0.2s",
  },
  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
    padding: "20px",
    background: "#f9fafb",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    padding: "40px",
  },
  emptyStateIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyStateTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#374151",
  },
  emptyStateText: {
    margin: 0,
    fontSize: "14px",
    color: "#9ca3af",
  },
  messageWrapper: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  botAvatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  botAvatarText: {
    color: "white",
    fontSize: "11px",
    fontWeight: "600",
  },
  message: {
    padding: "10px 16px",
    maxWidth: "75%",
    fontSize: "14px",
    lineHeight: "1.5",
    wordWrap: "break-word",
  },
  timestamp: {
    fontSize: "10px",
    marginTop: "4px",
    textAlign: "right",
  },
  typingIndicator: {
    background: "#ffffff",
    padding: "12px 16px",
    borderRadius: "18px 18px 18px 4px",
    display: "flex",
    gap: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#9ca3af",
    display: "inline-block",
  },
  inputContainer: {
    background: "#ffffff",
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
  },
  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#9ca3af",
    marginTop: "8px",
  },
  footerName: {
    fontWeight: "600",
    color: "#4f46e5",
  },
  inputBox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    background: "#f3f4f6",
    borderRadius: "24px",
    padding: "4px 4px 4px 12px",
  },
  attachButton: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
    transition: "opacity 0.2s",
  },
  input: {
    flex: 1,
    padding: "10px 8px",
    border: "none",
    background: "transparent",
    fontSize: "14px",
    outline: "none",
    color: "#1f2937",
  },
  sendButton: {
    background: "#4f46e5",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
  },
  sendIcon: {
    color: "white",
    fontSize: "16px",
  },
};
