import { NextResponse } from "next/server";
import { heliusSolanaAdapter } from "@/lib/solana/adapter";
import { screeningSchema } from "@/lib/security/guards";

export async function POST(request: Request) {
  try {
    const parsed = screeningSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid screening request", code: "INVALID_INPUT" }, { status: 400 });
    const screening = await heliusSolanaAdapter.screenMint(parsed.data.mint, { force: parsed.data.force });
    return NextResponse.json({ screening }, { headers: { "cache-control": "private, max-age=60" } });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Invalid Solana") ? error.message : "Unable to screen this mint right now";
    return NextResponse.json({ error: message, code: "SCREENING_UNAVAILABLE" }, { status: message.startsWith("Invalid") ? 400 : 503 });
  }
}
