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

    // Exact active model required by Google API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent?key=${apiKey}`;

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
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return new Response(`Gemini API Error: ${errText}`, { status: geminiRes.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!geminiRes.body) {
          controller.close();
          return;
        }

        const reader = geminiRes.body.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const regex = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
            let match;
            while ((match = regex.exec(buffer)) !== null) {
              try {
                const unescaped = JSON.parse(`"${match[1]}"`);
                if (unescaped) {
                  controller.enqueue(encoder.encode(unescaped));
                }
              } catch {
                // partial chunk
              }
            }
            if (buffer.length > 2000) {
              buffer = buffer.slice(-500);
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
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
    return new Response(error?.message || 'Internal Server Error', { status: 500 });
  }
}
