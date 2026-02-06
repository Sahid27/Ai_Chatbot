// 🧠 Simple in-memory chat history
let chatHistory = [];

export async function POST(req) {
  try {
    const { message } = await req.json();

    // User message memory তে রাখি
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
            {
              role: "system",
              content: `
তুমি একজন বন্ধুসুলভ, বুদ্ধিমান এবং অনুভূতিশীল AI chatbot।
তুমি আগের কথাগুলো মনে রাখবে এবং সেই অনুযায়ী উত্তর দেবে।

নিয়ম:
- ইউজার যে ভাষায় লিখবে, সেই ভাষায় উত্তর দেবে
- Bangla → Bangla
- English → English
- Banglish → Banglish
- মজা করলে → হালকা ফানি
- সিরিয়াস হলে → সিরিয়াস
- ইমোশনাল হলে → সাপোর্টিভ
- robotic ভাষা ব্যবহার করবে না
              `,
            },
            ...chatHistory, // 🧠 MEMORY MAGIC
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return new Response(
        JSON.stringify({ reply: "কিছু একটা সমস্যা হয়েছে 😕" }),
        { status: 500 }
      );
    }

    const aiReply = data.choices[0].message.content;

    // AI reply memory তে রাখি
    chatHistory.push({
      role: "assistant",
      content: aiReply,
    });

    // 🧹 Memory limit (last 10 messages রাখবো)
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    return new Response(
      JSON.stringify({ reply: aiReply }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return new Response(
      JSON.stringify({ reply: "Server সমস্যা করেছে 😥" }),
      { status: 500 }
    );
  }
}
