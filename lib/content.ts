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

function gid(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}

async function fetchSheet(gidEnv: string): Promise<Record<string, string>[] | null> {
  const sheetId = process.env.CONTENT_SHEET_ID?.trim();
  const sheetGid = gid(gidEnv);
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

function mapFromSiteRows(rows: Record<string, string>[] | null): SiteContent["site"] {
  const site: SiteContent["site"] = {
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
  if (!rows) return site;

  const values = new Map(rows.map((row) => [row.key, row.value]));
  const pick = (key: string, fallback: string) => values.get(key)?.trim() || fallback;

  site.name = pick("name", site.name);
  site.fullName = pick("full_name", site.fullName);
  site.denomination = pick("denomination", site.denomination);
  site.tagline = pick("tagline", site.tagline);
  site.lede = pick("lede", site.lede);
  site.description = pick("description", site.description);
  site.address.line = pick("address_line", site.address.line);
  site.address.postalCode = pick("postal_code", site.address.postalCode);
  site.address.city = pick("city", site.address.city);
  site.address.district = pick("district", site.address.district);
  site.address.country = pick("country", site.address.country);
  site.address.countryCode = pick("country_code", site.address.countryCode);
  site.email = pick("email", site.email);
  site.zoomUrl = pick("zoom_url", site.zoomUrl);
  site.instagram = pick("instagram_url", site.instagram);
  site.instagramHandle = pick("instagram_handle", site.instagramHandle);
  site.tiktok = pick("tiktok_url", site.tiktok);
  site.tiktokHandle = pick("tiktok_handle", site.tiktokHandle);
  site.spotify = pick("spotify_url", site.spotify);
  site.spotifyEmbed = pick("spotify_embed", site.spotifyEmbed);
  site.playlistTitle = pick("playlist_title", site.playlistTitle);
  site.mapsUrl = pick("maps_url", site.mapsUrl);
  site.mapsEmbed = pick("maps_embed", site.mapsEmbed);
  return site;
}

function mapGiving(rows: Record<string, string>[] | null): SiteContent["giving"] {
  const giving: SiteContent["giving"] = {
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
  if (!rows) return giving;
  const values = new Map(rows.map((row) => [row.key, row.value]));
  const pick = (key: string, fallback: string) => values.get(key)?.trim() || fallback;
  giving.beneficiary = pick("beneficiary", giving.beneficiary);
  giving.iban = pick("iban", giving.iban);
  giving.ibanDisplay = pick("iban_display", giving.ibanDisplay);
  giving.bic = pick("bic", giving.bic);
  giving.bicFull = pick("bic_full", giving.bicFull);
  giving.currency = pick("currency", giving.currency);
  giving.epcPayload = pick("epc_payload", giving.epcPayload);
  giving.stripePaymentUrl = pick("stripe_payment_url", giving.stripePaymentUrl);
  giving.ctaLabel = pick("cta_label", giving.ctaLabel);
  return giving;
}

function mapMission(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) {
    return {
      eyebrow: defaultMission.eyebrow,
      title: defaultMission.title,
      paragraphs: [...defaultMission.paragraphs],
      pillars: defaultMission.pillars.map((pillar) => ({ ...pillar })),
    };
  }

  const published = rows
    .filter((row) => isYes(row.published))
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

  const eyebrow =
    published.find((row) => row.section === "eyebrow")?.body || defaultMission.eyebrow;
  const title = published.find((row) => row.section === "title")?.body || defaultMission.title;
  const paragraphs = published
    .filter((row) => row.section === "paragraph" && row.body)
    .map((row) => row.body);
  const pillars = published
    .filter((row) => row.section === "pillar" && row.title && row.body)
    .map((row) => ({ name: row.title, detail: row.body }));

  return {
    eyebrow,
    title,
    paragraphs: paragraphs.length ? paragraphs : [...defaultMission.paragraphs],
    pillars: pillars.length
      ? pillars
      : defaultMission.pillars.map((pillar) => ({ ...pillar })),
  };
}

function mapWord(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) return { ...defaultWord };
  const published = rows.filter((row) => isYes(row.published));
  const active =
    published.sort((a, b) => (b.week_start || "").localeCompare(a.week_start || ""))[0] ??
    null;
  if (!active) return { ...defaultWord };
  return {
    eyebrow: active.eyebrow || defaultWord.eyebrow,
    text: active.text || defaultWord.text,
    reference: active.reference || defaultWord.reference,
    note: active.note || defaultWord.note,
  };
}

function mapGatherings(rows: Record<string, string>[] | null) {
  if (!rows || rows.length === 0) {
    return defaultGatherings.map((item) => ({ ...item }));
  }
  const mapped = rows
    .filter((row) => isYes(row.published) && row.id && row.name)
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
    .map((row) => {
      const href = row.link || defaultSite.mapsUrl;
      return {
        id: row.id,
        name: row.name,
        when: row.when || "",
        time: row.time || "",
        place: row.place || "",
        detail: row.detail || "",
        note: row.note || "",
        href,
        cta: row.cta || "Learn more",
        external: /^https?:\/\//i.test(href),
      };
    });
  return mapped.length ? mapped : defaultGatherings.map((item) => ({ ...item }));
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

function defaults(): SiteContent {
  return {
    site: mapFromSiteRows(null),
    giving: mapGiving(null),
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

/** Load public website content from the Excel/Sheets feed when configured. */
export async function getSiteContent(): Promise<SiteContent> {
  if (!sheetConfigured()) return defaults();

  const [siteRows, gatheringRows, missionRows, wordRows, givingRows, announcementRows] =
    await Promise.all([
      fetchSheet("CONTENT_GID_SITE"),
      fetchSheet("CONTENT_GID_GATHERINGS"),
      fetchSheet("CONTENT_GID_MISSION"),
      fetchSheet("CONTENT_GID_WORD"),
      fetchSheet("CONTENT_GID_GIVING"),
      fetchSheet("CONTENT_GID_ANNOUNCEMENTS"),
    ]);

  const anySheet =
    Boolean(siteRows) ||
    Boolean(gatheringRows) ||
    Boolean(missionRows) ||
    Boolean(wordRows) ||
    Boolean(givingRows) ||
    Boolean(announcementRows);

  return {
    site: mapFromSiteRows(siteRows),
    giving: mapGiving(givingRows),
    mission: mapMission(missionRows),
    word: mapWord(wordRows),
    gatherings: mapGatherings(gatheringRows),
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
