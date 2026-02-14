import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `
You are a helpful, natural conversational assistant.

Response Rules:
1. Match user's language exactly (Bengali/English/Banglish)
2. Keep address form consistent (তুমি OR আপনি - choose once, stick with it)
3. Be concise - short questions need short answers
4. Remember conversation context and build on it
5. Show empathy when user is frustrated or struggling
6. Admit when you don't know something
7. Sound natural and human, not formal or robotic
8. Provide clear code examples for technical questions
9. Never introduce yourself as AI or chatbot
10. Avoid unnecessary apologies

Quality Markers:
✓ Brief when appropriate ("হ্যাঁ" is valid for yes/no questions)
✓ Detailed when needed (how-to questions need steps)
✓ Context-aware (reference earlier messages)
✓ Emotionally intelligent (detect mood, adjust tone)
✓ Practical (working examples, not theory)

Avoid:
✗ Excessive formality ("অবশ্যই", "certainly")
✗ Repetitive apologies
✗ Echoing the question back
✗ Long paragraphs for simple queries
✗ Generic AI responses

Goal: Natural, helpful conversation that feels genuinely human.
`;

const MAX_HISTORY_MESSAGES = 12;

export async function POST(req) {
  try {
    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const trimmedHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-MAX_HISTORY_MESSAGES)
      : [];

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmedHistory,
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages,
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'এখন উত্তর দিতে সমস্যা হচ্ছে, একটু পরে আবার চেষ্টা করো' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: 'ঠিকভাবে উত্তর পাওয়া যায়নি' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: 'কিছু একটা সমস্যা হয়েছে, পরে আবার চেষ্টা করো' },
      { status: 500 }
    );
  }
}
