export const PRAYER_LIMITS = {
  name: 80,
  contact: 120,
  request: 2000,
  requestMin: 8,
} as const;

export type PrayerInput = {
  name: string;
  contact: string;
  request: string;
  shareWithCongregation: boolean;
};

export type PrayerParseResult =
  | { ok: true; value: PrayerInput }
  | { ok: false; error: string; status: number };

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanRequest(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(CONTROL_CHARS, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, PRAYER_LIMITS.request);
}

export function parsePrayerRequest(body: unknown, honeypot: unknown): PrayerParseResult {
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: false, error: "Unable to send this request.", status: 400 };
  }

  if (!body || typeof body !== "object") {
    return { ok: false, error: "Please complete the prayer form.", status: 400 };
  }

  const record = body as Record<string, unknown>;
  const name = clean(record.name, PRAYER_LIMITS.name);
  const contact = clean(record.contact, PRAYER_LIMITS.contact);
  const request = cleanRequest(record.request);
  const shareWithCongregation = record.shareWithCongregation === true;
  const consent = record.consent === true;

  if (!consent) {
    return {
      ok: false,
      error: "Please confirm that the prayer team may receive this request.",
      status: 400,
    };
  }

  if (request.replace(/\s/g, "").length < PRAYER_LIMITS.requestMin) {
    return {
      ok: false,
      error: "Please write a few words so the prayer team knows how to pray.",
      status: 400,
    };
  }

  return {
    ok: true,
    value: { name, contact, request, shareWithCongregation },
  };
}
