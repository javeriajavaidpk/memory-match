function getCoachResponse(prompt: string): string {
  const p = (prompt || '').trim().toLowerCase();

  if (p.includes('donkey') || p.includes('gadha') || p.includes('fool') || p.includes('stupid') || p.includes('idiot')) {
    return "Hey now! Even a donkey knows how to remember where the carrots are hidden! Let's see if you can remember where the matching cards are on the grid. Back to focus, champ!";
  }

  if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('salam')) {
    return "Hey there! ?? I'm your AI Memory Coach. Whether you want to master card grids, slash your flip time, or build solid recall, I've got your back. Ready to play?";
  }

  if (p.includes('faster') || p.includes('speed') || p.includes('fast') || p.includes('quick')) {
    return "To cut your solve time in half:\n\n1. **The Corner Anchor**: Memorize the 4 corners of the board first to create reference points.\n2. **Visual Chunking**: Group tiles in pairs or 2x2 blocks rather than scanning individually.\n3. **Verbal Echoing**: Whisper the card identity immediately upon reveal (e.g. 'Blue Star Top-Right').\n4. **Rhythm**: Don't spam clicks; pause 0.3s between flips.";
  }

  if (p.includes('mismatch') || p.includes('wrong') || p.includes('mistake')) {
    return "A mismatch is free intel! Every time two cards flip back down, you now have the exact coordinates of two cards. Mentally register their spots before touching a single new tile.";
  }

  if (p.includes('top right') || p.includes('corner') || p.includes('forget')) {
    return "When a specific sector slips your mind, use the **Quadrant Method**: Mentally divide the board into 4 quarters and completely clear one quadrant before moving to the next.";
  }

  if (p.length <= 3) {
    return "Looks like your fingers slipped on the keys! What part of the Memory Match board do you want help with?";
  }

  return "That's a smart tactical question. In Memory Match, 80% of errors come from impulsive clicking. Take a breath, build a mental map of revealed cards, and scan adjacent tiles first. How is your current game going?";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserPrompt = [...(messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';

    const replyText = getCoachResponse(lastUserPrompt);
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const words = replyText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const suffix = i === words.length - 1 ? '' : ' ';
          controller.enqueue(encoder.encode(words[i] + suffix));
          await new Promise((r) => setTimeout(r, 22));
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
    return new Response('Coach is online!', { status: 200 });
  }
}
