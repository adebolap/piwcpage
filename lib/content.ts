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

function isYes(value: string | undefined): boolean {
  return /^(yes|y|true|1)$/i.test((value ?? "").trim());
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
  if (!rows || rows.length === 0) {
    return {
      eyebrow: defaultWord.eyebrow,
      text: defaultWord.text,
      reference: defaultWord.reference,
      note: defaultWord.note,
    };
  }
  const published = rows.filter((row) => isYes(row.published));
  const active =
    published.sort((a, b) => (b.week_start || "").localeCompare(a.week_start || ""))[0] ?? null;
  if (!active) {
    return {
      eyebrow: defaultWord.eyebrow,
      text: defaultWord.text,
      reference: defaultWord.reference,
      note: defaultWord.note,
    };
  }
  return {
    eyebrow: active.eyebrow || defaultWord.eyebrow,
    text: active.text || defaultWord.text,
    reference: active.reference || defaultWord.reference,
    note: active.note || defaultWord.note,
  };
}

function mapAnnouncements(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) return [];
  const today = todayBrussels();
  return rows
    .filter((row) => {
      if (!isYes(row.published) || !row.id || !row.title) return false;
      if (row.start_date && row.start_date > today) return false;
      if (row.end_date && row.end_date < today) return false;
      return true;
    })
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body || "",
      link: row.link || "",
      cta: row.cta || "Learn more",
    }));
}

function activeWednesday(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) return null;
  const today = todayBrussels();
  const published = rows
    .filter((row) => isYes(row.published) && row.week_start)
    .filter((row) => row.week_start <= today)
    .sort((a, b) => (b.week_start || "").localeCompare(a.week_start || ""));
  return published[0] ?? null;
}

function mapGatherings(wednesdayRows: Record<string, string>[] | null): SiteContent["gatherings"] {
  const gatherings = defaultGatherings.map((item) => ({ ...item }));
  const wednesday = activeWednesday(wednesdayRows);
  if (!wednesday) return gatherings;

  return gatherings.map((item) => {
    if (item.id !== "bible") return item;

    const atChurch = /church/i.test(wednesday.mode || "");
    const href =
      wednesday.link ||
      (atChurch ? defaultSite.mapsUrl : defaultSite.zoomUrl);
    return {
      ...item,
      when: "Wednesdays",
      time: wednesday.time || (atChurch ? "19:30" : "Online"),
      place: wednesday.place || (atChurch ? "Merksemsesteenweg 32/34, Deurne" : "Usually on Zoom"),
      note:
        wednesday.note ||
        (atChurch
          ? "Bible study is at the church this Wednesday."
          : "Bible study can occasionally take place at the church. When it does, we share the update on Instagram and TikTok."),
      href,
      cta: atChurch ? "Get directions" : "Join on Zoom",
      external: /^https?:\/\//i.test(href),
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
