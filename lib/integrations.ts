export function getContactEmail(): string {
  return process.env.CONTACT_EMAIL?.trim() ?? "";
}

export function getCalendarEmbedUrl(): string | null {
  const id = process.env.GOOGLE_CALENDAR_ID?.trim();
  if (!id) return null;
  const params = new URLSearchParams({
    src: id,
    ctz: "Europe/Brussels",
    mode: "AGENDA",
    showTitle: "0",
    showNav: "1",
    showDate: "1",
    showPrint: "0",
    showTabs: "0",
    showCalendars: "0",
    showTz: "0",
  });
  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}
