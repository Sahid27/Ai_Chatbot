export async function POST(req) {
  try {
    const { message } = await req.json();

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
          messages: [{ role: "user", content: message }],
        }),
      }
    );

    const data = await response.json();

    // 🔴 IMPORTANT DEBUG
    console.log("GROQ FULL RESPONSE:", data);

    if (!data.choices || !data.choices[0]) {
      return new Response(
        JSON.stringify({
          reply: "Groq error — check terminal log",
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ reply: data.choices[0].message.content }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return new Response(
      JSON.stringify({ reply: "Something went wrong 😥" }),
      { status: 500 }
    );
  }
}
