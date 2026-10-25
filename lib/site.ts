export const site = {
  name: "PIWC Antwerp",
  fullName: "Pentecost International Worship Centre Antwerp",
  denomination: "The Church of Pentecost",
  tagline: "The Centre where God lives",
  description:
    "PIWC Antwerp is an international congregation of The Church of Pentecost in Antwerp. Come and worship, pray, and open the Bible with us.",
  address: {
    line: "Merksemsesteenweg 32/34",
    postalCode: "2100",
    city: "Antwerpen",
    district: "Deurne",
    country: "Belgium",
    countryCode: "BE",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen",
  mapsEmbed:
    "https://maps.google.com/maps?q=Merksemsesteenweg+32/34,+2100+Antwerpen&z=16&output=embed",
  zoomUrl:
    "https://thecopbelgium-org.zoom.us/j/7381613048?pwd=WXVYOHVtSWhyMnBabWRmbWpkcmprZz09",
  instagram: "https://www.instagram.com/piwc_antwerp/",
  instagramHandle: "@piwc_antwerp",
  tiktok: "https://www.tiktok.com/@piwc_antwerp",
  tiktokHandle: "@piwc_antwerp",
  spotify: "https://open.spotify.com/playlist/3ZRRgKRSswTr3pqQR0sHfN",
  spotifyEmbed:
    "https://open.spotify.com/embed/playlist/3ZRRgKRSswTr3pqQR0sHfN",
  playlistTitle: "PIWC Antwerp",
  email: "antwerpvlamms@gmail.com",
} as const;

export const gatherings = [
  {
    id: "sunday",
    name: "Sunday worship",
    when: "Sundays, 9:30am–12:00 noon",
    time: "9:30–12:00",
    place: "Merksemsesteenweg 32/34, Deurne",
    detail: "Worship with the church in Antwerp, from 9:30 in the morning until 12:00.",
    href: site.mapsUrl,
    cta: "Get directions",
    external: true,
  },
  {
    id: "devotion",
    name: "Bethel Grounds morning devotion",
    when: "Morning devotion",
    time: "Online",
    place: "Zoom",
    detail: "A morning devotion to pray and listen to the Word before the day begins.",
    href: site.zoomUrl,
    cta: "Join on Zoom",
    external: true,
  },
  {
    id: "bible",
    name: "Wednesday Bible study",
    when: "Wednesday",
    time: "Online",
    place: "Zoom",
    detail: "Midweek Bible study with the church, on Zoom.",
    href: site.zoomUrl,
    cta: "Join on Zoom",
    external: true,
  },
] as const;

export function addressLines() {
  return [
    site.address.line,
    `${site.address.postalCode} ${site.address.city}`,
    site.address.country,
  ];
}
