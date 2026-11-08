import { csvObjects } from "@/lib/csv";
import {
  gatherings as defaultGatherings,
  giving as defaultGiving,
  mission as defaultMission,
  site as defaultSite,
  word as defaultWord,
} from "@/lib/site";

export type SiteContent = {
  site: {
    name: string;
    fullName: string;
    denomination: string;
    tagline: string;
    description: string;
    lede: string;
    address: {
      line: string;
      postalCode: string;
      city: string;
      district: string;
      country: string;
      countryCode: string;
    };
    mapsUrl: string;
    mapsEmbed: string;
    zoomUrl: string;
    instagram: string;
    instagramHandle: string;
    tiktok: string;
    tiktokHandle: string;
    spotify: string;
    spotifyEmbed: string;
    playlistTitle: string;
    email: string;
  };
  giving: {
    beneficiary: string;
    iban: string;
    ibanDisplay: string;
    bic: string;
    bicFull: string;
    currency: string;
    epcPayload: string;
    stripePaymentUrl: string;
    ctaLabel: string;
  };
  mission: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    pillars: { name: string; detail: string }[];
  };
  word: {
    eyebrow: string;
    text: string;
    reference: string;
    note: string;
  };
  gatherings: {
    id: string;
    name: string;
    when: string;
    time: string;
    place: string;
    detail: string;
    note: string;
    href: string;
    cta: string;
    external: boolean;
  }[];
  announcements: {
    id: string;
    title: string;
    body: string;
    link: string;
    cta: string;
  }[];
  sourcedFromSheet: boolean;
};

const REVALIDATE_SECONDS = 60;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{1,48}$/i;
const MAX = {
  title: 120,
  body: 500,
  note: 280,
  place: 120,
  text: 280,
  reference: 80,
  link: 500,
} as const;

function isYes(value: string | undefined): boolean {
  return /^(yes|y|true|1)$/i.test((value ?? "").trim());
}

function isDate(value: string | undefined): boolean {
  if (!value || !DATE_RE.test(value)) return false;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(stamp);
}

function cleanText(value: string | undefined, max: number): string {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanLink(value: string | undefined): string {
  const link = cleanText(value, MAX.link);
  if (!link) return "";
  if (!/^https:\/\//i.test(link)) return "";
  return link;
}

function normalizeWednesdayMode(value: string | undefined): "Zoom" | "At the church" | null {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "zoom" || raw === "online") return "Zoom";
  if (raw.includes("church") || raw === "in person" || raw === "in-person") return "At the church";
  return null;
}

function todayBrussels(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function sheetConfigured(): boolean {
  return Boolean(process.env.CONTENT_SHEET_ID?.trim());
}

async function fetchSheet(gidEnv: string): Promise<Record<string, string>[] | null> {
  const sheetId = process.env.CONTENT_SHEET_ID?.trim();
  const sheetGid = process.env[gidEnv]?.trim();
  if (!sheetId || !sheetGid) return null;

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${encodeURIComponent(sheetGid)}`;
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "text/csv" },
    });
    if (!response.ok) return null;
    const text = await response.text();
    if (!text.trim() || text.trimStart().startsWith("<!DOCTYPE")) return null;
    return csvObjects(text);
  } catch {
    return null;
  }
}

function baseSite(): SiteContent["site"] {
  return {
    name: defaultSite.name,
    fullName: defaultSite.fullName,
    denomination: defaultSite.denomination,
    tagline: defaultSite.tagline,
    description: defaultSite.description,
    lede: defaultSite.lede,
    address: {
      line: defaultSite.address.line,
      postalCode: defaultSite.address.postalCode,
      city: defaultSite.address.city,
      district: defaultSite.address.district,
      country: defaultSite.address.country,
      countryCode: defaultSite.address.countryCode,
    },
    mapsUrl: defaultSite.mapsUrl,
    mapsEmbed: defaultSite.mapsEmbed,
    zoomUrl: defaultSite.zoomUrl,
    instagram: defaultSite.instagram,
    instagramHandle: defaultSite.instagramHandle,
    tiktok: defaultSite.tiktok,
    tiktokHandle: defaultSite.tiktokHandle,
    spotify: defaultSite.spotify,
    spotifyEmbed: defaultSite.spotifyEmbed,
    playlistTitle: defaultSite.playlistTitle,
    email: defaultSite.email,
  };
}

function baseGiving(): SiteContent["giving"] {
  return {
    beneficiary: defaultGiving.beneficiary,
    iban: defaultGiving.iban,
    ibanDisplay: defaultGiving.ibanDisplay,
    bic: defaultGiving.bic,
    bicFull: defaultGiving.bicFull,
    currency: defaultGiving.currency,
    epcPayload: defaultGiving.epcPayload,
    stripePaymentUrl: defaultGiving.stripePaymentUrl,
    ctaLabel: defaultGiving.ctaLabel,
  };
}

function mapWord(rows: Record<string, string>[] | null) {
  const fallback = {
    eyebrow: defaultWord.eyebrow,
    text: defaultWord.text,
    reference: defaultWord.reference,
    note: defaultWord.note,
  };
  if (!rows || rows.length === 0) return fallback;

  const published = rows
    .filter((row) => isYes(row.published))
    .filter((row) => cleanText(row.text, MAX.text) && cleanText(row.reference, MAX.reference))
    .filter((row) => !row.week_start || isDate(row.week_start))
    .sort((a, b) => (b.week_start || "").localeCompare(a.week_start || ""));
  const active = published[0];
  if (!active) return fallback;

  return {
    eyebrow: cleanText(active.eyebrow, 80) || defaultWord.eyebrow,
    text: cleanText(active.text, MAX.text),
    reference: cleanText(active.reference, MAX.reference),
    note: cleanText(active.note, MAX.note) || defaultWord.note,
  };
}

function mapAnnouncements(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) return [];
  const today = todayBrussels();
  return rows
    .filter((row) => {
      if (!isYes(row.published)) return false;
      if (!ID_RE.test(row.id || "")) return false;
      if (!cleanText(row.title, MAX.title)) return false;
      if (row.start_date && !isDate(row.start_date)) return false;
      if (row.end_date && !isDate(row.end_date)) return false;
      if (row.start_date && row.end_date && row.start_date > row.end_date) return false;
      if (row.start_date && row.start_date > today) return false;
      if (row.end_date && row.end_date < today) return false;
      if (row.link && !cleanLink(row.link)) return false;
      return true;
    })
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((row) => ({
      id: row.id,
      title: cleanText(row.title, MAX.title),
      body: cleanText(row.body, MAX.body),
      link: cleanLink(row.link),
      cta: cleanText(row.cta, 40) || "Learn more",
    }));
}

function activeWednesday(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) return null;
  const today = todayBrussels();
  const published = rows
    .filter((row) => isYes(row.published))
    .filter((row) => isDate(row.week_start))
    .filter((row) => normalizeWednesdayMode(row.mode))
    .filter((row) => cleanText(row.place, MAX.place))
    .filter((row) => row.week_start <= today)
    .filter((row) => {
      const mode = normalizeWednesdayMode(row.mode);
      const link = cleanLink(row.link);
      // Incomplete published rows are ignored so a mistake cannot blank the site.
      if (mode === "Zoom") return Boolean(link || defaultSite.zoomUrl);
      if (mode === "At the church") return Boolean(link || defaultSite.mapsUrl);
      return false;
    })
    .sort((a, b) => (b.week_start || "").localeCompare(a.week_start || ""));
  return published[0] ?? null;
}

function mapGatherings(wednesdayRows: Record<string, string>[] | null): SiteContent["gatherings"] {
  const gatherings = defaultGatherings.map((item) => ({ ...item }));
  const wednesday = activeWednesday(wednesdayRows);
  if (!wednesday) return gatherings;

  return gatherings.map((item) => {
    if (item.id !== "bible") return item;

    const mode = normalizeWednesdayMode(wednesday.mode) || "Zoom";
    const atChurch = mode === "At the church";
    const href =
      cleanLink(wednesday.link) ||
      (atChurch ? defaultSite.mapsUrl : defaultSite.zoomUrl);
    return {
      ...item,
      when: "Wednesdays",
      time: cleanText(wednesday.time, 40) || (atChurch ? "19:30" : "Online"),
      place:
        cleanText(wednesday.place, MAX.place) ||
        (atChurch ? "Merksemsesteenweg 32/34, Deurne" : "Usually on Zoom"),
      note:
        cleanText(wednesday.note, MAX.note) ||
        (atChurch
          ? "Bible study is at the church this Wednesday."
          : "Bible study can occasionally take place at the church. When it does, we share the update on Instagram and TikTok."),
      href,
      cta: atChurch ? "Get directions" : "Join on Zoom",
      external: /^https:\/\//i.test(href),
    };
  });
}

function defaults(): SiteContent {
  return {
    site: baseSite(),
    giving: baseGiving(),
    mission: {
      eyebrow: defaultMission.eyebrow,
      title: defaultMission.title,
      paragraphs: [...defaultMission.paragraphs],
      pillars: defaultMission.pillars.map((pillar) => ({ ...pillar })),
    },
    word: {
      eyebrow: defaultWord.eyebrow,
      text: defaultWord.text,
      reference: defaultWord.reference,
      note: defaultWord.note,
    },
    gatherings: defaultGatherings.map((item) => ({ ...item })),
    announcements: [],
    sourcedFromSheet: false,
  };
}

/**
 * Load weekly leader updates (announcements, Wednesday venue, word).
 * Stable church details stay in code. Leaders only edit the spreadsheet.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!sheetConfigured()) return defaults();

  const [announcementRows, wednesdayRows, wordRows] = await Promise.all([
    fetchSheet("CONTENT_GID_ANNOUNCEMENTS"),
    fetchSheet("CONTENT_GID_WEDNESDAY"),
    fetchSheet("CONTENT_GID_WORD"),
  ]);

  const anySheet = Boolean(announcementRows) || Boolean(wednesdayRows) || Boolean(wordRows);

  return {
    site: baseSite(),
    giving: baseGiving(),
    mission: {
      eyebrow: defaultMission.eyebrow,
      title: defaultMission.title,
      paragraphs: [...defaultMission.paragraphs],
      pillars: defaultMission.pillars.map((pillar) => ({ ...pillar })),
    },
    word: mapWord(wordRows),
    gatherings: mapGatherings(wednesdayRows),
    announcements: mapAnnouncements(announcementRows),
    sourcedFromSheet: anySheet,
  };
}

export function contentAddressLines(content: SiteContent["site"]): string[] {
  return [
    content.address.line,
    `${content.address.postalCode} ${content.address.city}`,
    content.address.country,
  ];
}
