let chatHistory = [];

export async function POST(req) {
  try {
    const { message } = await req.json();

    chatHistory.push({
      role: "user",
      content: message,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful, intelligent, polite AI assistant. Respond naturally like ChatGPT.",
          },
          ...chatHistory,
        ],
      }),
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return new Response(
        JSON.stringify({ reply: "AI could not respond." }),
        { status: 500 }
      );
    }

    const aiReply = data.choices[0].message.content;

    chatHistory.push({
      role: "assistant",
      content: aiReply,
    });

    // memory limit
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    return new Response(
      JSON.stringify({ reply: aiReply }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("SERVER ERROR:", error);
    return new Response(
      JSON.stringify({ reply: "Something went wrong." }),
      { status: 500 }
    );
  }
}
