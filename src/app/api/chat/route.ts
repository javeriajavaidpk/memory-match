import { coachSystemPrompt } from '@/lib/ai-config';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return new Response('GROQ_API_KEY is missing in environment variables.', { status: 500 });
    }

    const formattedMessages = [
      {
        role: 'system',
        content: `${coachSystemPrompt}

Additional Instructions:
- You are strictly an interactive Memory Coach for the card flip puzzle game "Memory Match".
- If the user asks completely off-topic questions (e.g. driving, cooking, recipes, general news), react playfully with wit in 1-2 lines, politely refuse, and pull them right back to card flip memory training.
- If the user sends insults, playful teasers, or random words (e.g. "donkey", "you fool"), respond humorously without getting offended, and challenge them to prove their memory skills on the board.
- If the user types gibberish (e.g. "asdfghjkl", "df"), playfully ask if their keyboard slipped and invite a real game question.
- Always keep responses punchy, concise, and engaging (2 to 4 sentences maximum).`
      },
      ...(messages || []).map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: typeof m.content === 'string' ? m.content : '',
      }))
    ];

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 300,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(`AI Engine Error: ${err}`, { status: res.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!res.body) {
          controller.close();
          return;
        }

        const reader = res.body.getReader();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                try {
                  const json = JSON.parse(trimmed.slice(6));
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) {
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {}
              }
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
    return new Response(error?.message || 'Server error', { status: 500 });
  }
}
