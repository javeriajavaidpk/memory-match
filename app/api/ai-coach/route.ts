import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { moves = 12, timeRemaining = 20 } = body;

    let analysis = "";

    if (moves <= 14 && timeRemaining >= 20) {
      analysis = "🌟 Super Genius! You cleared the board with lightning speed and earned all 3 Stars! ⭐⭐⭐";
    } else if (moves <= 20) {
      analysis = "🎉 Awesome memory! You played so well and earned 2 Stars! Replay to grab all 3! ⭐⭐";
    } else {
      analysis = "👏 Great job finishing! Play this level again to master it and win 3 Stars! ⭐";
    }

    return NextResponse.json({
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      analysis: "Fantastic effort! Your memory power is growing stronger! 🚀",
    });
  }
}