import { coachSystemPrompt } from '@/lib/ai-config';

function getSmartFallback(prompt: string): string {
  const p = (prompt || '').trim().toLowerCase();

  if (p.includes('drive') || p.includes('car')) {
    return "I can teach you how to drift through a 4x4 card grid, but driving a real car? Leave that to a driving instructor! Let's get your eyes back on the matching tiles.";
  }
  if (p.includes('hungry') || p.includes('eat') || p.includes('food') || p.includes('cook')) {
    return "Grab a quick brain-boosting snack like almonds or walnuts! Once you're fueled up, let's crush your memory high score.";
  }
  if (p.includes('donkey') || p.includes('gadha') || p.includes('fool') || p.includes('stupid') || p.includes('idiot')) {
    return "Hey now! Even a donkey knows where the carrots are stashed. Let's see if your human recall can match two cards in under 2 seconds! Ready?";
  }
  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
    return "Hey there! ?? I'm your AI Memory Coach. Whether you want to master grids, slash flip times, or build visual recall, I'm ready. What difficulty are you on?";
  }
  if (p.includes('fast') || p.includes('speed') || p.includes('time')) {
    return "To cut your solve time in half:\n1. **Corner Anchors**: Memorize the 4 corners first as mental compass points.\n2. **Visual Chunking**: Group tiles in pairs rather than scanning one by one.\n3. **Whisper Echo**: Whisper the card name when flipped—auditory cues double retention.";
  }
  if (p.includes('mismatch') || p.includes('wrong')) {
    return "A mismatch is free intel! You now know the exact coordinates of two cards. Mentally register their spots before touching a fresh tile.";
  }
  if (p.length <= 4 || /^[a-z]+$/i.test(p) && !p.includes(' ')) {
    return "Did your keyboard slip or did a cat walk across it? Drop a real game question and let's train your recall!";
  }
  return "In Memory Match, impulsive clicking is your biggest enemy. Take a 0.3s pause between flips, build a mental grid map, and scan perimeter tiles first. What's your current move?";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;
    const lastUserPrompt = [...(messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';

    let aiReply = '';

    if (groqKey) {
      const modelsToTry = ['llama3-8b-8192', 'llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'gemma2-9b-it'];
      const formattedMessages = [
        {
          role: 'system',
          content: `${coachSystemPrompt}\nRespond in 2-3 punchy, witty sentences. If off-topic (cooking, driving), jokingly decline and redirect to memory cards.`
        },
        ...(messages || []).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: typeof m.content === 'string' ? m.content : '',
        }))
      ];

      for (const model of modelsToTry) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: formattedMessages,
              temperature: 0.7,
              max_tokens: 250,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            aiReply = data?.choices?.[0]?.message?.content || '';
            if (aiReply) break;
          }
        } catch {}
      }
    }

    if (!aiReply) {
      aiReply = getSmartFallback(lastUserPrompt);
    }

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
    return new Response('Coach is active! Ask any game tactic.', { status: 200 });
  }
}
