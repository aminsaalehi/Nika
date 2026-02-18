import { NextResponse } from "next/server";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const LOG_PATH = path.join(process.cwd(), ".cursor", "debug.log");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const line = JSON.stringify(body) + "\n";
    const dir = path.dirname(LOG_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(LOG_PATH, line, "utf8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
