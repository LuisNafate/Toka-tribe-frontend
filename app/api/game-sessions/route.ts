import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: forward to Toka backend when endpoint is available
    // e.g. await fetch(process.env.TOKA_API_URL + '/v1/game-sessions', { ... })

    console.log("[game-sessions] score received:", {
      gameType: body.gameType,
      sessionId: body.sessionId,
      score: body.score,
    });

    return NextResponse.json({
      success: true,
      sessionId: body.sessionId ?? crypto.randomUUID(),
    });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
