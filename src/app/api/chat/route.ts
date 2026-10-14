import { coachSystemPrompt } from '@/lib/ai-config';

function generateSmartFallback(userPrompt: string): string {
  const p = (userPrompt || '').toLowerCase();

  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
    return "Hey there! ?? I am your Memory Coach. Whether you are aiming for a high score or trying to improve your focus, I am here to help you conquer the grid. Ready to train your recall?";
  }

  if (p.includes('fast') || p.includes('quick') || p.includes('speed') || p.includes('how')) {
    return "To memorize cards faster and beat the clock:\n\n1. **The Corner Anchor**: Memorize the 4 board corners first to establish visual reference points.\n2. **Visual Chunking**: Group cards into pairs or 2x2 blocks rather than scanning individually.\n3. **Verbal Echo**: Whisper the card name as soon as you reveal it (e.g. 'Blue Gem, Top Left'). Auditory memory reinforces visual recall.\n4. **Don't Spam**: Take a 0.3-second pause after every card flip to register its exact position.";
  }

  if (p.includes('grid') || p.includes('board') || p.includes('pattern')) {
    return "Grid strategy breakdown:\n\n- Sweep row by row systematically instead of guessing randomly.\n- Treat each mismatch as a double clue: memorize BOTH locations before flipping card 3.\n- Keep your focus centered and use your peripheral vision to track tile coordinates.";
  }

  return `Great question! When playing Memory Match, maintaining focus and minimizing impulsive clicks is 80% of the game. Always create a mental map of cards you have already seen, scan adjacent tiles first, and maintain a steady 1-second rhythm between pairs. How is your current game going?`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const userMessage = [...(messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';

    if (!apiKey) {
      return streamFallback(userMessage);
    }

    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : '' }],
    }));

    // Try Google's active model with a 4-second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    let geminiRes: Response | null = null;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:streamGenerateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: coachSystemPrompt }] },
            contents,
            generationConfig: { temperature: 0.7 },
          }),
        }
      );
    } catch {
      // Network/timeout error -> graceful fallback
    } finally {
      clearTimeout(timeout);
    }

    // If Google succeeds (status 200), stream its live output
    if (geminiRes && geminiRes.ok && geminiRes.body) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = geminiRes.body.getReader();

      const stream = new ReadableStream({
        async start(ctrl) {
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
                  if (unescaped) ctrl.enqueue(encoder.encode(unescaped));
                } catch {}
              }
              if (buffer.length > 2000) buffer = buffer.slice(-500);
            }
          } catch (err) {
            ctrl.error(err);
          } finally {
            ctrl.close();
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
    }

    // If Google returned 503, 404, or timed out, stream smart relevant response
    return streamFallback(userMessage);

  } catch (error: any) {
    return streamFallback('');
  }
}

function streamFallback(userPrompt: string) {
  const encoder = new TextEncoder();
  const text = generateSmartFallback(userPrompt);

  const stream = new ReadableStream({
    async start(controller) {
      const words = text.split(' ');
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '));
        await new Promise((r) => setTimeout(r, 25));
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
