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
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [showReactions, setShowReactions] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const detectCodeInMessage = (text: string): boolean => {
    const codePatterns = [
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /class\s+\w+/,
      /import\s+.*from/,
      /export\s+(default|const)/,
      /<\/?\w+>/,
      /\w+\s*\([^)]*\)\s*{/,
    ];
    return codePatterns.some((pattern) => pattern.test(text));
  };

  const generateSuggestions = (botResponse: string): string[] => {
    const suggestions = [];
    
    if (botResponse.includes("?")) {
      suggestions.push("Yes", "No", "Tell me more");
    } else if (botResponse.toLowerCase().includes("help")) {
      suggestions.push("Show examples", "Explain further", "Try something else");
    } else {
      suggestions.push("Continue", "Got it!", "Show more");
    }
    
    return suggestions.slice(0, 3);
  };

  async function sendMessage(messageText?: string) {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: textToSend,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setSuggestions([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      setTimeout(() => {
        const botMessage: Message = {
          role: "bot",
          text: data.reply,
          timestamp: new Date(),
          reactions: [],
          isCode: detectCodeInMessage(data.reply),
        };
        
        setMessages((prev) => [...prev, botMessage]);
        setSuggestions(generateSuggestions(data.reply));
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

  const addReaction = (messageIndex: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg, idx) => {
        if (idx === messageIndex) {
          const reactions = msg.reactions || [];
          return {
            ...msg,
            reactions: reactions.includes(emoji)
              ? reactions.filter((r) => r !== emoji)
              : [...reactions, emoji],
          };
        }
        return msg;
      })
    );
    setShowReactions(null);
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Code copied to clipboard!");
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const theme = isDarkTheme
    ? {
        bg: "#111b21",
        chatBg: "#0b141a",
        headerBg: "#202c33",
        messageBg: "#2a3942",
        userBubble: "#005c4b",
        botBubble: "#202c33",
        text: "#e9edef",
        subText: "#8696a0",
        inputBg: "#2a3942",
        pattern: "0.15",
      }
    : {
        bg: "#f0f2f5",
        chatBg: "#efeae2",
        headerBg: "#008069",
        messageBg: "#ffffff",
        userBubble: "#d9fdd3",
        botBubble: "#ffffff",
        text: "#111b21",
        subText: "#667781",
        inputBg: "#f0f2f5",
        pattern: "0.08",
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: ${isDarkTheme ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"};
          border-radius: 3px;
        }

        .hover-button:active {
          opacity: 0.7;
          transform: scale(0.95);
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
          border-left: 10px solid ${theme.userBubble};
          border-bottom: 10px solid transparent;
        }

        .bot-message::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: -8px;
          width: 0;
          height: 0;
          border-right: 10px solid ${theme.botBubble};
          border-bottom: 10px solid transparent;
        }

        .checkmark {
          display: inline-block;
          font-size: 12px;
          margin-left: 4px;
          color: #53bdeb;
        }

        .reaction-picker {
          animation: slideUp 0.2s ease-out;
        }

        .suggestion-chip {
          animation: slideUp 0.3s ease-out;
        }

        .voice-pulse {
          animation: pulse 1.5s infinite;
        }

        .code-block {
          background: ${isDarkTheme ? "#1e1e1e" : "#f6f8fa"};
          border: 1px solid ${isDarkTheme ? "#333" : "#d0d7de"};
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          overflow-x: auto;
          position: relative;
        }

        .code-block::-webkit-scrollbar {
          height: 6px;
        }

        .code-block::-webkit-scrollbar-thumb {
          background: ${isDarkTheme ? "#555" : "#ccc"};
          border-radius: 3px;
        }

        .copy-button {
          position: absolute;
          top: 8px;
          right: 8px;
          background: ${isDarkTheme ? "#333" : "#e1e4e8"};
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          color: ${theme.text};
        }

        .copy-button:hover {
          background: ${isDarkTheme ? "#444" : "#d0d7de"};
        }

        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          background: ${theme.bg};
          padding: 0;
          margin: 0;
        }

        .chat-box {
          width: 100%;
          height: 100%;
          background: ${theme.chatBg};
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        @media (min-width: 768px) {
          .container {
            padding: 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          }

          .chat-box {
            max-width: 520px;
            height: 740px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          }
        }
      `}</style>

      <div className="container">
        <div className="chat-box">
          {/* Header */}
          <div
            style={{
              background: theme.headerBg,
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#00a884",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: "400",
                    color: isDarkTheme ? "#e9edef" : "#ffffff",
                  }}
                >
                  AI Assistant
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: isDarkTheme ? "#8696a0" : "#d1f4cc",
                    marginTop: "2px",
                  }}
                >
                  online
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={toggleTheme}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  transition: "background 0.2s",
                }}
                className="hover-button"
              >
                {isDarkTheme ? "☀️" : "🌙"}
              </button>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: isDarkTheme ? "#aebac1" : "#ffffff",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                }}
                className="hover-button"
              >
                ⋮
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              overflowY: "auto",
              padding: "20px 12px",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDarkTheme ? "182229" : "d9d9d9"}' fill-opacity='${theme.pattern}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: theme.chatBg,
            }}
            className="messages-container"
          >
            {messages.length === 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  padding: "40px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "16px", opacity: 0.5 }}>
                  🔒
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: theme.subText,
                    lineHeight: "20px",
                  }}
                >
                  Messages are end-to-end encrypted. No one outside of this chat can
                  read them.
                </p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className="message-wrapper"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    position: "relative",
                  }}
                >
                  <div
                    className={m.role === "user" ? "user-message" : "bot-message"}
                    style={{
                      padding: "6px 7px 8px 9px",
                      maxWidth: "75%",
                      fontSize: "14.2px",
                      lineHeight: "19px",
                      borderRadius: "8px",
                      wordWrap: "break-word",
                      boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                      background: m.role === "user" ? theme.userBubble : theme.botBubble,
                      color: theme.text,
                      position: "relative",
                    }}
                    onClick={() => setShowReactions(showReactions === i ? null : i)}
                  >
                    {m.isCode ? (
                      <div className="code-block">
                        <button
                          className="copy-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCode(m.text);
                          }}
                        >
                          📋 Copy
                        </button>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{m.text}</pre>
                      </div>
                    ) : (
                      m.text
                    )}
                    
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        marginTop: "4px",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: theme.subText }}>
                        {m.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {m.role === "user" && <span className="checkmark">✓✓</span>}
                    </div>

                    {m.reactions && m.reactions.length > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-12px",
                          right: "8px",
                          background: theme.botBubble,
                          borderRadius: "12px",
                          padding: "2px 6px",
                          fontSize: "14px",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          display: "flex",
                          gap: "2px",
                        }}
                      >
                        {m.reactions.map((r, idx) => (
                          <span key={idx}>{r}</span>
                        ))}
                      </div>
                    )}

                    {showReactions === i && (
                      <div
                        className="reaction-picker"
                        style={{
                          position: "absolute",
                          bottom: "100%",
                          left: m.role === "user" ? "auto" : "0",
                          right: m.role === "user" ? "0" : "auto",
                          background: theme.botBubble,
                          borderRadius: "24px",
                          padding: "8px 12px",
                          marginBottom: "8px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          display: "flex",
                          gap: "8px",
                          zIndex: 10,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {["👍", "❤️", "😂", "😮", "😢", "🙏"].map((emoji) => (
                          <button
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              addReaction(i, emoji);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              fontSize: "20px",
                              cursor: "pointer",
                              padding: "4px",
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-wrapper" style={{ display: "flex" }}>
                <div
                  className="bot-message"
                  style={{
                    background: theme.botBubble,
                    padding: "10px 12px",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "4px",
                    boxShadow: "0 1px 0.5px rgba(0, 0, 0, 0.13)",
                    position: "relative",
                  }}
                >
                  <span className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.subText, display: "inline-block" }}></span>
                  <span className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.subText, display: "inline-block", animationDelay: "0.2s" }}></span>
                  <span className="typing-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", background: theme.subText, display: "inline-block", animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px" }}>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => sendMessage(suggestion)}
                    style={{
                      background: theme.messageBg,
                      border: `1px solid ${theme.subText}`,
                      borderRadius: "16px",
                      padding: "8px 16px",
                      fontSize: "13px",
                      color: theme.text,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              background: theme.headerBg,
              padding: "10px 16px 6px",
              flexShrink: 0,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                background: theme.inputBg,
                borderRadius: "24px",
                padding: "5px 8px",
                maxWidth: "100%",
              }}
            >
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  padding: "5px",
                  flexShrink: 0,
                  minWidth: "32px",
                }}
                className="hover-button"
              >
                😊
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message"
                style={{
                  flex: 1,
                  padding: "9px 8px",
                  border: "none",
                  background: "transparent",
                  fontSize: "15px",
                  outline: "none",
                  color: theme.text,
                  minWidth: 0,
                  width: "100%",
                }}
              />
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "5px",
                  flexShrink: 0,
                  minWidth: "32px",
                }}
                className="hover-button"
              >
                📎
              </button>
              {input.trim() ? (
                <button
                  onClick={() => sendMessage()}
                  style={{
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
                    cursor: "pointer",
                    flexShrink: 0,
                    marginLeft: "-2px",
                  }}
                >
                  <span style={{ color: "#111b21", fontSize: "20px", fontWeight: "bold" }}>
                    ➤
                  </span>
                </button>
              ) : (
                <button
                  onClick={toggleVoiceInput}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: "22px",
                    cursor: "pointer",
                    padding: "5px",
                    flexShrink: 0,
                    minWidth: "32px",
                  }}
                  className={isListening ? "voice-pulse" : "hover-button"}
                >
                  {isListening ? "🔴" : "🎤"}
                </button>
              )}
            </div>
            <div
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: theme.subText,
                marginTop: "8px",
              }}
            >
              Made by <span style={{ fontWeight: "600", color: "#00a884" }}>SaHid</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
