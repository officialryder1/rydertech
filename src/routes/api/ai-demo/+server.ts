import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

// Live AI demo backend — proxies chat to Google Gemini.
// The API key stays server-side (never shipped to the client).
// Model: gemini-1.5-flash (free tier, fast). Override via GEMINI_MODEL.

const SYSTEM_PROMPT = `You are Ryder, the AI assistant for RyderTech — a Nigeria-based software studio specializing in web, mobile, cloud, and AI/ML solutions (LLM chatbots, computer vision, ML automation, WhatsApp AI assistants).

Your job:
- Answer visitor questions about RyderTech's services clearly and concisely.
- Gently qualify the visitor: what kind of business are they (e.g. retail, health, fintech, logistics), what they want to build, and their rough budget range (starter ₦250k–₦1M, growth ₦1M–₦5M, enterprise ₦5M+).
- Keep replies short (2–4 sentences). Be warm, professional, and Nigerian-market aware.
- If asked something off-topic, briefly redirect to how RyderTech can help.
- Always end high-intent replies with a soft nudge: "Want a custom quote? Tap 'Talk to a human' below."
- Never invent prices beyond the ranges above. Never claim to be a human.`;

const MODEL = env.GEMINI_MODEL || 'gemini-flash-latest';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=`;

export const POST: RequestHandler = async ({ request }) => {
  const key = env.GOOGLE_API_KEY;
  if (!key) {
    return json(
      { error: 'AI demo is not configured yet. Please contact RyderTech directly.' },
      { status: 503 }
    );
  }

  let body: { messages?: { role: 'user' | 'assistant'; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'No messages provided.' }, { status: 400 });
  }

  // Cap history to last 12 messages to bound token use.
  const recent = messages.slice(-12);

  const contents = recent.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const res = await fetch(ENDPOINT + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7,
          topP: 0.9
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Gemini error', res.status, errText);
      return json(
        { error: 'The assistant is temporarily unavailable. Please try again or contact us.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join('') ||
      "Sorry, I couldn't generate a response. Please contact RyderTech directly.";

    return json({ reply: text });
  } catch (err) {
    console.error('Gemini request failed', err);
    return json(
      { error: 'The assistant is temporarily unavailable. Please try again or contact us.' },
      { status: 502 }
    );
  }
};
