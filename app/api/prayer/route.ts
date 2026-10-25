import { NextResponse } from "next/server";
import { getContactEmail } from "@/lib/integrations";
import { parsePrayerRequest } from "@/lib/prayer";

export const runtime = "nodejs";
export const maxDuration = 30;

const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 20_000) {
    return NextResponse.json({ ok: false, error: "That request is too long." }, { status: 413 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (limited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Please wait a few minutes before sending another request." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Please complete the prayer form." }, { status: 400 });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const parsed = parsePrayerRequest(record, record.company);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: parsed.status });
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  const secret = process.env.PRAYER_SHARED_SECRET?.trim();

  if (!scriptUrl || !secret) {
    if (process.env.PRAYER_DEV_ACCEPT === "true") {
      console.info("Prayer request accepted without Google Workspace delivery.");
      return NextResponse.json({ ok: true, delivered: false });
    }
    return NextResponse.json(
      {
        ok: false,
        error: `The prayer inbox is not connected yet. Please email ${getContactEmail()} or message @piwc_antwerp on Instagram.`,
      },
      { status: 503 },
    );
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret,
        name: parsed.value.name,
        contact: parsed.value.contact,
        request: parsed.value.request,
        shareWithCongregation: parsed.value.shareWithCongregation,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const text = await upstream.text();
    let payload: { ok?: boolean } = {};
    try {
      payload = JSON.parse(text) as { ok?: boolean };
    } catch {
      payload = {};
    }
    if (!upstream.ok || payload.ok !== true) {
      console.error("Prayer forward failed", upstream.status);
      return NextResponse.json(
        {
          ok: false,
          error: `We could not deliver this request. Please try again, or email ${getContactEmail()}.`,
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Prayer forward error", error instanceof Error ? error.name : "unknown");
    return NextResponse.json(
      {
        ok: false,
        error:
          `We could not deliver this request. Please try again, or email ${getContactEmail()}.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
