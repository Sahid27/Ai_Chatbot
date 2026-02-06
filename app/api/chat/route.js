let chatHistory = [];

const systemPrompt = {
  role: "system",
  content: `
তুমি একজন বন্ধুসুলভ, বুদ্ধিমান এবং অনুভূতিশীল AI chatbot।

নিয়ম:
- ইউজার যে ভাষায় লিখবে, সেই ভাষায় উত্তর দেবে
- Bangla → Bangla
- English → English
- Banglish → Banglish
- মজা করলে → হালকা ফানি
- সিরিয়াস হলে → সিরিয়াস
- ইমোশনাল হলে → সাপোর্টিভ
- উল্টা প্রশ্ন বা বিভ্রান্তিকর উত্তর দিবে না
- আগের কথাগুলো মনে রেখে natural ভাবে উত্তর দেবে
  `,
};

export async function POST(req) {
  try {
    const { message } = await req.json();

    // ✅ User message add
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
          messages: [
            systemPrompt,
            ...chatHistory,
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return new Response(
        JSON.stringify({ reply: "AI ঠিকমতো reply দিচ্ছে না 😕" }),
        { status: 500 }
      );
    }

    const aiReply = data.choices[0].message.content;

    // ✅ AI reply add
    chatHistory.push({
      role: "assistant",
      content: aiReply,
    });

    // 🧹 Memory limit
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
