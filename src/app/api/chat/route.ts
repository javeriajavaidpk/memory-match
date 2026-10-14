export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastPrompt = [...(messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';
    const p = lastPrompt.trim().toLowerCase();

    let reply = "";

    if (p.includes('drive') || p.includes('car')) {
      reply = "I can teach you how to drift through a 4x4 card grid, but driving a real car? Leave that to a driving instructor! Let's get your eyes back on the matching tiles.";
    } else if (p.includes('hungry') || p.includes('eat') || p.includes('food') || p.includes('cook')) {
      reply = "Grab some almonds or walnuts for brain power! Once you're fueled up, let's crush your memory high score.";
    } else if (p.includes('donkey') || p.includes('gadha') || p.includes('fool') || p.includes('stupid') || p.includes('idiot')) {
      reply = "Hey now! Even a donkey knows where the carrots are stashed. Let's see if your memory can match two cards in under 2 seconds! Ready to prove it?";
    } else if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('salam')) {
      reply = "Hey there! I am your AI Memory Coach. Whether you want to master grids, slash flip times, or build visual recall, I am ready. What difficulty are you on?";
    } else if (p.includes('fast') || p.includes('speed') || p.includes('time') || p.includes('quick')) {
      reply = "To cut your solve time in half: 1. Corner Anchors: Memorize the 4 corners first. 2. Visual Chunking: Group tiles in pairs rather than scanning one by one. 3. Whisper Echo: Whisper the card name when flipped to lock in retention.";
    } else if (p.includes('mismatch') || p.includes('wrong') || p.includes('fail')) {
      reply = "A mismatch is free intel! You now know the exact coordinates of two cards. Mentally register their spots before touching a fresh tile.";
    } else if (p.length <= 4 || (/^[a-z]+$/i.test(p) && !p.includes(' '))) {
      reply = "Did your keyboard slip or did a cat walk across it? Drop a real game question and let's train your recall!";
    } else {
      reply = "In Memory Match, impulsive clicking is your biggest enemy. Take a 0.3s pause between flips, build a mental grid map, and scan perimeter tiles first. What's your current move?";
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = reply.split(' ');
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
    return new Response("Coach is active! Ask any game tactic.", { status: 200 });
  }
}