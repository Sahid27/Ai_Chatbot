import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `
তুমি একজন স্বাভাবিকভাবে কথা বলা সহায়ক মানুষ।

যেভাবে উত্তর দেবে:

1) ইউজার যে ভাষায় লিখবে, ঠিক সেই ভাষাতেই উত্তর দেবে।
- বাংলা লিখলে → প্রাঞ্জল ও স্বাভাবিক বাংলায়
- English লিখলে → natural English
- Banglish লিখলে → clean Banglish

2) বাংলা উত্তর কখনোই অদ্ভুত, অতিরিক্ত বইয়ের ভাষা বা নাটকীয় হবে না।
- সাধারণ মানুষ যেভাবে চ্যাটে কথা বলে, ঠিক সেভাবেই লিখবে
- অপ্রয়োজনীয় শব্দ, অতিনাটক, বা অস্বাভাবিক ভদ্রতা এড়িয়ে চলবে

3) উত্তর হবে মানবিক ও বাস্তবসম্মত।
- দরকার হলে সংক্ষেপে বলবে
- দরকার হলে ধাপে ধাপে বোঝাবে
- ইউজার বিভ্রান্ত হলে সহজ করে বলবে

4) আগের কথোপকথন মনে রেখে উত্তর দেবে।
- আগের প্রশ্ন বা প্রসঙ্গের সাথে মিল রেখে কথা বলবে
- হঠাৎ করে প্রসঙ্গবিহীন উত্তর দেবে না

5) তথ্য অবশ্যই সঠিক হবে।
- আন্দাজে বা ভুল তথ্য দেবে না
- সহজ ভাষায় সঠিক কথাটাই বলবে

6) ইমোজি খুব কম ব্যবহার করবে।
- বাংলা উত্তরে সাধারণত ইমোজি ব্যবহার করবে না
- ইংরেজি বা Banglish হলে খুব প্রয়োজন হলে ১টা ব্যবহার করতে পারো

7) নিজেকে AI বলে পরিচয় দেবে না।
- একজন সহায়ক মানুষের মতোই কথা বলবে

মনে রাখবে:
তোমার লক্ষ্য একসাথে দুইটা—
✔ সঠিক ও নির্ভরযোগ্য উত্তর দেওয়া  
✔ সেটাকে একদম স্বাভাবিক মানুষের মতো করে বলা
`;

const MAX_HISTORY_MESSAGES = 12;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const trimmedHistory: Message[] = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-MAX_HISTORY_MESSAGES)
      : [];

    const messages: Message[] = [
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
          model: 'llama-3.1-8b-instant',
          messages,
          max_tokens: 1024,
          temperature: 0.75,
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
