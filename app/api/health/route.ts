import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ ok: true, service: "memereach", mode: process.env.HELIUS_API_KEY ? "provider-connected" : "demo" }); }
