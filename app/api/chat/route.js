import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `তুমি একজন সহায়ক AI chatbot। ইউজার যে ভাষা ও স্টাইলে লিখবে, ঠিক সেই ভাষা ও স্টাইলেই উত্তর দেবে। যদি ইউজার বাংলা অক্ষরে লিখে তাহলে বাংলায় উত্তর দাও। যদি ইংরেজিতে লিখে তাহলে ইংরেজিতে উত্তর দাও। যদি ইংরেজি অক্ষরে বাংলা (Banglish) লিখে, তাহলে Banglish-এই উত্তর দাও। উত্তর সহজ, বন্ধুসুলভ ও পরিষ্কার রাখো।`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Build messages array with conversation history
    const messages: Message[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...(Array.isArray(conversationHistory) ? conversationHistory : []),
      {
        role: 'user',
        content: message.trim(),
      },
    ];

    // Call Groq API
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
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
