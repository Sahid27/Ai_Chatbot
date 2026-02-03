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
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }

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
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        .hover-button:active {
          opacity: 0.7;
          transform: scale(0.95);
        }

        .input-field::placeholder {
          color: #667781;
        }

        .attach-button:active,
        .emoji-button:active {
          background: rgba(0, 0, 0, 0.1);
        }

        .send-button:active {
          background: #00a884;
          transform: scale(0.95);
        }

        .icon-button:active {
          background: rgba(255, 255, 255, 0.15);
        }

        .message-wrapper {
          animation: slideIn 0.3s ease-out;
        }

        .typing-dot {
          animation: bounce 1.4s infinite ease-in-out;
        }

        .user-message::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: -8px;
          width: 0;
          height: 0;
          border-left: 10px solid #d9fdd3;
          border-bottom: 10px solid transparent;
        }

        .bot-message::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-right: 10px solid #ffffff;
          border-bottom: 10px solid transparent;
        }

        .checkmark {
          display: inline-block;
          font-size: 12px;
          margin-left: 4px;
          color: #53bdeb;
        }

        /* Universal mobile-first approach */
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background: #111b21;
          padding: 0;
          margin: 0;
        }

        .chat-box {
          width: 100%;
          height: 100%;
          background: #0b141a;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        /* Input box fixed positioning for all devices */
        .input-container {
          position: relative;
          background: #202c33;
          padding: 8px;
          flex-shrink: 0;
          width: 100%;
        }

        .input-box {
          display: flex;
          gap: 6px;
          align-items: center;
          background: #2a3942;
          border-radius: 24px;
          padding: 4px 6px;
          width: 100%;
          min-height: 44px;
        }

        .send-button,
        .mic-button {
          flex-shrink: 0;
          min-width: 40px;
          min-height: 40px;
          display: flex !important;
          align-items: center;
          justify-content: center;
        }

        /* Small phones (< 375px) */
        @media (max-width: 374px) {
          .header {
            padding: 6px 8px !important;
          }

          .avatar {
            width: 32px !important;
            height: 32px !important;
            font-size: 16px !important;
          }

          .header-title {
            font-size: 14px !important;
          }

          .header-subtitle {
            font-size: 11px !important;
          }

          .icon-button {
            width: 32px !important;
            height: 32px !important;
            font-size: 16px !important;
            padding: 4px !important;
          }

          .message {
            font-size: 13px !important;
            padding: 5px 6px 7px 8px !important;
          }

          .input-box {
            gap: 4px;
            padding: 3px 4px;
            min-height: 40px;
          }

          .send-button,
          .mic-button {
            min-width: 36px;
            min-height: 36px;
            font-size: 20px !important;
          }

          .emoji-button,
          .attach-button {
            font-size: 18px !important;
            min-width: 32px;
          }

          .input-field {
            font-size: 14px !important;
            padding: 6px 8px !important;
          }

          .footer {
            font-size: 9px !important;
          }
        }

        /* Standard mobile phones (375px - 480px) */
        @media (min-width: 375px) and (max-width: 480px) {
          .header {
            padding: 8px 10px !important;
          }

          .avatar {
            width: 36px !important;
            height: 36px !important;
            font-size: 18px !important;
          }

          .header-title {
            font-size: 15px !important;
          }

          .header-subtitle {
            font-size: 12px !important;
          }

          .icon-button {
            width: 36px !important;
            height: 36px !important;
            font-size: 18px !important;
          }

          .input-box {
            gap: 5px;
            padding: 4px 5px;
          }

          .send-button,
          .mic-button {
            min-width: 38px;
            min-height: 38px;
          }
        }

        /* Large phones (481px - 767px) */
        @media (min-width: 481px) and (max-width: 767px) {
          .header {
            padding: 10px 12px !important;
          }

          .input-box {
            gap: 6px;
            padding: 5px 6px;
          }
        }

        /* Tablets (768px - 1024px) */
        @media (min-width: 768px) and (max-width: 1024px) {
          .container {
            padding: 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          }

          .chat-box {
            max-width: 600px;
            height: 85vh;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          }

          .input-container {
            padding: 10px 12px 8px;
          }

          .input-box {
            padding: 5px 8px;
            gap: 8px;
          }
        }

        /* Desktop (> 1024px) */
        @media (min-width: 1025px) {
          .container {
            padding: 30px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          }

          .chat-box {
            max-width: 520px;
            height: 740px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          }

          .input-container {
            padding: 10px 16px 6px;
          }

          .input-box {
            padding: 5px 10px;
            gap: 8px;
          }

          .hover-button:hover {
            opacity: 0.8;
          }

          .send-button:hover {
            background: #00a884;
            transform: scale(1.05);
          }

          .icon-button:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .emoji-button:hover,
          .attach-button:hover {
            background: rgba(0, 0, 0, 0.05);
          }
        }

        /* Landscape orientation fix for phones */
        @media (max-height: 500px) and (orientation: landscape) {
          .chat-box {
            height: 100vh;
          }

          .messages {
            padding: 10px 8px !important;
          }

          .input-container {
            padding: 6px 8px 4px !important;
          }

          .footer {
            margin-top: 4px !important;
          }
        }

        /* iOS safe area support */
        @supports (padding: max(0px)) {
          .chat-box {
            padding-bottom: env(safe-area-inset-bottom);
          }

          .input-container {
            padding-bottom: max(8px, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      <div className="container">
        <div className="chat-box">
          {/* Header */}
          <div style={styles.header} className="header">
            <div style={styles.headerContent}>
              <div style={styles.avatarContainer}>
                <div style={styles.avatar} className="avatar">
                  <span style={styles.avatarText}>🤖</span>
                </div>
              </div>
              <div>
                <h3 style={styles.headerTitle} className="header-title">
                  AI Assistant
                </h3>
                <p style={styles.headerSubtitle} className="header-subtitle">
                  online
                </p>
              </div>
            </div>
            <div style={styles.headerActions}>
              <button style={styles.iconButton} className="icon-button">
                📹
              </button>
              <button style={styles.iconButton} className="icon-button">
                📞
              </button>
              <button style={styles.iconButton} className="icon-button">
                ⋮
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={styles.messages} className="messages messages-container">
            {messages.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>🔒</div>
                <p style={styles.emptyStateText}>
                  Messages are end-to-end encrypted. No one outside of this chat
                  can read them.
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
                <div
                  className={
                    m.role === "user" ? "user-message message" : "bot-message message"
                  }
                  style={{
                    ...styles.message,
                    background: m.role === "user" ? "#d9fdd3" : "#ffffff",
                    color: "#111b21",
                    marginLeft: m.role === "user" ? "auto" : "0",
                    marginRight: m.role === "user" ? "0" : "auto",
                    position: "relative",
                  }}
                >
                  {m.text}
                  <div style={styles.messageFooter}>
                    <span style={styles.timestamp}>
                      {m.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {m.role === "user" && <span className="checkmark">✓✓</span>}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={styles.messageWrapper} className="message-wrapper">
                <div style={styles.typingIndicator} className="bot-message">
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
          <div className="input-container">
            <div className="input-box">
              <button
                style={styles.emojiButton}
                className="emoji-button hover-button"
                type="button"
              >
                😊
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                style={styles.input}
                className="input-field"
              />
              <button
                style={styles.attachButton}
                className="attach-button hover-button"
                type="button"
              >
                📎
              </button>
              {input.trim() ? (
                <button
                  onClick={sendMessage}
                  style={styles.sendButton}
                  className="send-button"
                  type="button"
                >
                  <span style={styles.sendIcon}>➤</span>
                </button>
              ) : (
                <button
                  style={styles.micButton}
                  className="mic-button hover-button"
                  type="button"
                >
                  🎤
                </button>
              )}
            </div>
            <div style={styles.footer} className="footer">
              Made by <span style={styles.footerName}>SaHid</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: "#202c33",
    padding: "10px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0,
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
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#00a884",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: "20px",
  },
  headerTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "400",
    color: "#e9edef",
  },
  headerSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#8696a0",
    marginTop: "2px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  iconButton: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    color: "#aebac1",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "50%",
    transition: "background 0.2s",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
    overflowX: "hidden",
    padding: "20px 12px",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23182229' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    backgroundColor: "#0b141a",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    padding: "40px 60px",
  },
  emptyStateIcon: {
    fontSize: "32px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyStateText: {
    margin: 0,
    fontSize: "14px",
    color: "#8696a0",
    lineHeight: "20px",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-end",
  },
  message: {
    padding: "6px 7px 8px 9px",
    maxWidth: "75%",
    fontSize: "14.2px",
    lineHeight: "19px",
    borderRadius: "8px",
    wordWrap: "break-word",
    wordBreak: "break-word",
    boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
  },
  messageFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: "4px",
    gap: "4px",
  },
  timestamp: {
    fontSize: "11px",
    color: "#667781",
  },
  typingIndicator: {
    background: "#ffffff",
    padding: "10px 12px",
    borderRadius: "8px",
    display: "flex",
    gap: "4px",
    boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
    position: "relative",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#667781",
    display: "inline-block",
  },
  emojiButton: {
    background: "transparent",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    padding: "5px",
    borderRadius: "50%",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    minWidth: "36px",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    border: "none",
    background: "transparent",
    fontSize: "15px",
    outline: "none",
    color: "#e9edef",
    minWidth: 0,
  },
  attachButton: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "5px",
    borderRadius: "50%",
    transition: "background 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    minWidth: "36px",
  },
  sendButton: {
    background: "#00a884",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    minWidth: "40px",
    minHeight: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    cursor: "pointer",
    flexShrink: 0,
  },
  micButton: {
    background: "transparent",
    border: "none",
    fontSize: "22px",
    cursor: "pointer",
    padding: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    minWidth: "40px",
    minHeight: "40px",
  },
  sendIcon: {
    color: "#111b21",
    fontSize: "20px",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    fontSize: "11px",
    color: "#8696a0",
    marginTop: "8px",
  },
  footerName: {
    fontWeight: "600",
    color: "#00a884",
  },
};
