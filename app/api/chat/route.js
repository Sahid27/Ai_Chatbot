let chatHistory = [];

const systemPrompt = {
  role: "system",
  content: `
You are a friendly, intelligent, human-like AI chatbot.

LANGUAGE RULES (VERY IMPORTANT):
- Default language is English
- If the user writes in Bangla → reply in Bangla
- If the user asks to reply in Bangla → reply in Bangla
- Otherwise → reply in English
- Never switch language unless the user does

PERSONALITY RULES:
- Be friendly by default
- Be funny if the user jokes
- Be serious if the user is serious
- Be supportive if the user is emotional
- Do not give confusing or opposite answers
- Remember previous messages and respond naturally
`,
};

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Add user message
    chatHistory.push({
      role: "user",
      content: message,
    });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [systemPrompt, ...chatHistory],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return new Response(
        JSON.stringify({ reply: "AI is confused 😕" }),
        { status: 500 }
      );
    }

    const aiReply = data.choices[0].message.content;

    // Add assistant reply
    chatHistory.push({
      role: "assistant",
      content: aiReply,
    });

    // Memory limit
    if (chatHistory.length > 12) {
      chatHistory = chatHistory.slice(-12);
    }

    return new Response(
      JSON.stringify({ reply: aiReply }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return new Response(
      JSON.stringify({ reply: "Server error 😥" }),
      { status: 500 }
    );
  }
}
