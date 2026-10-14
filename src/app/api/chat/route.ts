import { coachSystemPrompt } from '@/lib/ai-config';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return new Response('API key GOOGLE_GENERATIVE_AI_API_KEY is missing on server.', {
        status: 500,
      });
    }

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : '' }],
    }));

    // Standard fast generateContent endpoint (non-blocking & immediate)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: coachSystemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return new Response(`Coach API Error: ${err}`, { status: geminiRes.status });
    }

    const data = await geminiRes.json();
    const aiReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help you strategize your memory game! What specific part of the board are you working on?";

    // Stream the actual AI text smoothly word-by-word into the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = aiReply.split(' ');
        for (let i = 0; i < words.length; i++) {
          const suffix = i === words.length - 1 ? '' : ' ';
          controller.enqueue(encoder.encode(words[i] + suffix));
          await new Promise((r) => setTimeout(r, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(error?.message || 'Server Internal Error', { status: 500 });
  }
}
