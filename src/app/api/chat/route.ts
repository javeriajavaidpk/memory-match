import { coachSystemPrompt } from '@/lib/ai-config';

const FALLBACK_TIPS = [
  "Here are proven tactics to speed up your memory match recall:\n\n1. **Grid Anchoring**: Fixate on the 4 board corners first. Mentally split the arena into 2x2 quadrants.\n2. **Visual Association**: Rather than names, associate symbols with bold colors and positions (e.g. 'purple gem top-right').\n3. **Chunking Pairs**: Remember reveals in pairs rather than standalone cards to cut working memory load by half.\n4. **Deliberate Pacing**: Never spam clicks. Flip card 1, take 0.3s to register position, then flip card 2 to form solid memory anchors.",
  "Quick strategies to dominate the Memory Match board:\n\n- **Sequential Sweep**: Open cards row-by-row on early turns to build an orderly mental map.\n- **Subvocal Chanting**: Quietly repeat card identities ('Star-Top, Coin-Center') upon reveal.\n- **Learn from Whiffs**: Every failed match reveals 2 concrete spots. Lock their coordinates before touching new tiles."
];

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

    const callGemini = async (model: string) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;
      return fetch(url, {
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
    };

    const models = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let geminiRes: Response | null = null;

    for (const model of models) {
      try {
        const res = await callGemini(model);
        if (res.ok) {
          geminiRes = res;
          break;
        }
      } catch {
        // try fallback
      }
    }

    const encoder = new TextEncoder();

    // If Google is busy/503/exhausted, stream reliable pro tips directly
    if (!geminiRes || !geminiRes.ok) {
      const randomTip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      const stream = new ReadableStream({
        async start(controller) {
          const words = randomTip.split(' ');
          for (const word of words) {
            controller.enqueue(encoder.encode(word + ' '));
            await new Promise((r) => setTimeout(r, 40));
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
    }

    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!geminiRes?.body) {
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
                // partial character split
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
