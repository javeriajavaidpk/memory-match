import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { level = 1, moves = 12, timeRemaining = 20, totalScore = 500 } = body;

    // Cognitive Tier Logic
    let tier = "Tier-A";
    let analysis = "";

    if (moves <= 14 && timeRemaining >= 20) {
      tier = "Tier-S (Exceptional)";
      analysis = `Stellar cognitive performance! You cleared Level ${level} with ${moves} moves and ${timeRemaining}s remaining. Your spatial recall and working memory retrieval show peak efficiency.`;
    } else if (moves <= 20) {
      tier = "Tier-A (Proficient)";
      analysis = `Solid neural synchronization on Level ${level}. Move count was disciplined (${moves} moves). Next tip: lock corner anchors early to reduce latency.`;
    } else {
      tier = "Tier-B (Developing)";
      analysis = `Level ${level} completed! Your persistence is great, but cognitive fatigue caused extra flips (${moves} moves). Try mentally chunking cards into 2x2 quadrants.`;
    }

    return NextResponse.json({
      tier,
      analysis,
      totalScore,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      tier: "Tier-A",
      analysis: "Excellent cognitive endurance! High spatial orientation detected across the neural arena.",
    });
  }
}