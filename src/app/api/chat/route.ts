function getCoachResponse(prompt: string): string {
  const p = (prompt || '').trim().toLowerCase();

  // 1. Insults / Playful banter (e.g. donkey, stupid, fool)
  if (p.includes('donkey') || p.includes('gadha') || p.includes('fool') || p.includes('stupid') || p.includes('idiot')) {
    return "Hey now! Even a donkey knows how to remember where the sweet grass is hidden. Let's see if you can remember where the matching cards are on the grid! Back to focus, champ.";
  }

  // 2. Greetings
  if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('salam')) {
    return "Hey there! ?? I'm your AI Memory Coach. Whether you want to master 4x4 card grids, slash your flip time, or build a photographic memory, I've got your back. What level are you playing right now?";
  }

  // 3. Card Memory / Speed Tactics
  if (p.includes('faster') || p.includes('speed') || p.includes('time') || p.includes('fast') || p.includes('quick')) {
    return "To cut your solve time in half:\n\n1. **The Corner Anchor**: Fix the 4 corners of the grid in your head first to establish reference points.\n2. **Visual Chunking**: Memorize tiles in 2x2 blocks rather than scanning individually.\n3. **Verbal Echoing**: Whisper the card name as soon as it flips (e.g., 'Blue Star, Top Right')—auditory cues double your retention.\n4. **Rhythm over Rush**: Wait 0.3 seconds before clicking the second card to lock in the first card's position.";
  }

  // 4. Mistakes / Mismatches
  if (p.includes('mismatch') || p.includes('wrong') || p.includes('mistake') || p.includes('fail')) {
    return "A mismatch is not a failure—it's free intel! Every time two cards flip back down, you now have the exact coordinates of two cards. Mentally tag their spots before touching a single new tile.";
  }

  // 5. Forgetting specific areas (e.g. top right, corners)
  if (p.includes('forget') || p.includes('top right') || p.includes('corner') || p.includes('bottom')) {
    return "When a specific sector keeps slipping your mind, use the **Quadrant Method**: Don't treat the board as one huge grid. Mentally divide it into 4 quadrants (Top-Left, Top-Right, Bottom-Left, Bottom-Right) and completely clear one quadrant before moving to the next.";
  }

  // 6. Hard level / Difficulties
  if (p.includes('hard') || p.includes('expert') || p.includes('level') || p.includes('difficult')) {
    return "On harder grids, working memory gets saturated. The secret is **Sequential Sweeping**: Open cards row by row systematically. Never guess randomly in the center until you've mapped out the perimeter!";
  }

  // 7. Nonsense / Random typing (e.g. df, asdf, etc.)
  if (p.length <= 3 || /^[a-z]+$/i.test(p) && !p.includes(' ')) {
    return "Looks like your fingers slipped on the keyboard! Let's get down to business: what part of the Memory Match board is giving you a hard time?";
  }

  // 8. General Strategy Default
  return `That's a smart tactical question. In Memory Match, 80% of mistakes come from impulsive clicking. Take a breath, build a mental map of cards you've already revealed, and scan adjacent tiles first. Ready to beat your high score?`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastUserPrompt = [...(messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';

    const replyText = getCoachResponse(lastUserPrompt);
    const encoder = new TextEncoder();

    // Smooth real-time token streaming to frontend
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
    return new Response('Coach is ready. Send your message!', { status: 200 });
  }
}
