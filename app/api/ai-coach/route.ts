import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { level = 1, moves, time } = await req.json();

    const efficiency =
      moves <= 12 ? "Tier-S (Genius)" : moves <= 18 ? "Tier-A (Optimal)" : "Tier-B (Adaptive)";

    const feedback = `Neural Audit [Level ${level}]: Rated as ${efficiency}. Solved 8 procedural pairs in ${moves} moves (${time}s). Spatial index precision is scaling well. Ready for higher pattern velocity in Level ${level + 1}!`;

    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json(
      { feedback: "Neural calibration complete! Visual matching accuracy is holding steady. Proceeding to next level." },
      { status: 200 }
    );
  }
}