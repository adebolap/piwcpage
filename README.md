# PIWC Antwerp

Landing page for Pentecost International Worship Centre Antwerp, ready for [Vercel](https://vercel.com).

Prayer requests are sent into the church **Google Workspace**: a private Google Sheet, plus an email from the Workspace account to the prayer team. A QR code on the site opens the prayer form, for printing in the foyer.

Details on the page come from the church’s public links:

- Instagram: [@piwc_antwerp](https://www.instagram.com/piwc_antwerp/)
- Location pin: Merksemsesteenweg 32/34, 2100 Antwerpen
- Bethel Grounds morning devotion and Wednesday Bible study on the church Zoom
- Spotify playlist “PIWC Antwerp”

Sunday worship is 9:30am–12:00 noon. Friday Impact Service is every Friday at 19:30. Both are at Merksemsesteenweg 32/34. Wednesday Bible study is usually on Zoom and can occasionally meet at the church — those changes are announced on Instagram and TikTok.

Edit the gatherings list and the “word for the week” in `lib/site.ts`.

## Pages

- `/` — welcome, gatherings, map, prayer QR, Spotify
- `/pray` — prayer request form (this is what the QR code opens)
- `/qr` — foyer poster, print, and PNG download
- `/privacy` — what happens to a prayer request

## Connect Google Workspace

1. Sign in to the church Workspace account.
2. Open [script.google.com](https://script.google.com) → New project.
3. Paste `google-workspace/Code.gs` over the default script.
4. Run `setup` and accept the spreadsheet permission. The log shows the new Sheet URL. Leave that Sheet private.
5. Project Settings → Script properties:

   | Property | Value |
   | --- | --- |
   | `PRAYER_SECRET` | a long random string |
   | `PRAYER_EMAIL` | the Workspace address that should receive requests |
   | `SHEET_ID` | filled in by `setup` |

6. Deploy → New deployment → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the web app URL.

“Anyone” lets the Vercel server call the script. Requests without `PRAYER_SECRET` are rejected. Do not publish the Sheet.

Optional Workspace extras, set as environment variables:

- `CONTACT_EMAIL` — shown on the site. Until you set this, the site uses antwerpvlamms@gmail.com.
- `GOOGLE_CALENDAR_ID` — a calendar shared as public, so the agenda can be embedded. Times display in Europe/Brussels.

## Deploy on Vercel

1. Import this repository in Vercel. `vercel.json` sets the framework to Next.js, so the deploy uses the Next.js build instead of a static `public` folder. If an older project still fails with “No Output Directory named public”, open Project Settings → Build and Deployment, set Framework Preset to Next.js, and turn off the Output Directory override. Leave that field empty.
2. Environment variables:

   | Name | Value |
   | --- | --- |
   | `GOOGLE_APPS_SCRIPT_URL` | the web app URL from the deploy step |
   | `PRAYER_SHARED_SECRET` | the same string as `PRAYER_SECRET` |
   | `CONTACT_EMAIL` | optional. Defaults to antwerpvlamms@gmail.com |
   | `GOOGLE_CALENDAR_ID` | optional |
   | `NEXT_PUBLIC_SITE_URL` | optional. Leave empty and the QR code uses the domain of the visit, including `*.vercel.app` and a custom domain. |

3. Deploy, then open `/pray` and send a test request. Confirm the Sheet row and the email.
4. Open `/qr`, download the PNG or print it, and scan it with a phone. It should open `/pray` on that same domain.

Changing `NEXT_PUBLIC_SITE_URL` needs a new deployment. The other variables are read on the server at request time.

## Local

```bash
npm install
npm test
npm run dev
```

To try the form locally without Workspace, set `PRAYER_DEV_ACCEPT=true`. The success message will say the request was not stored. Do not set that variable on Vercel.
