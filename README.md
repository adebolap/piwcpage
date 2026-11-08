# PIWC Antwerp

Landing page for Pentecost International Worship Centre Antwerp, ready for [Vercel](https://vercel.com).

Prayer requests are sent into the church **Google Workspace**: a private Google Sheet, plus an email from the Workspace account to the prayer team. A QR code on the site opens the prayer form, for printing in the foyer.

Details on the page come from the church’s public links:

- Instagram: [@piwc_antwerp](https://www.instagram.com/piwc_antwerp/)
- Location pin: Merksemsesteenweg 32/34, 2100 Antwerpen
- Bethel Grounds morning devotion and Wednesday Bible study on the church Zoom
- Spotify playlist “PIWC Antwerp”

Sunday worship is 9:30am to 12:00 noon. Friday Impact Service is every Friday at 19:30. Both are at Merksemsesteenweg 32/34. Wednesday Bible study is usually on Zoom and can occasionally meet at the church. Those changes are announced on Instagram and TikTok.

Stable church details (address, mission, giving, regular Sunday/Friday times) live in `lib/site.ts`. Weekly notices do not require code changes.

## Weekly updates for leaders (Excel / Google Sheets)

Leaders use one spreadsheet to post announcements and to say whether Wednesday Bible study is on Zoom or at the church. After a one-time admin link, leaders never touch Vercel, GitHub, or the backend.

**Leader file:** [`content/PIWC-Antwerp-weekly-updates.xlsx`](content/PIWC-Antwerp-weekly-updates.xlsx)

| Tab | What leaders edit |
| --- | --- |
| `Announcements` | Weekly notices on the homepage (`Published` = YES, with start/end dates) |
| `Wednesday` | This week’s Bible study: `Zoom` or `At the church`, place, note, link |
| `Word` | Optional scripture for the week |
| `Read_me` | Short how-to inside the file |

### Live church sheet

Working copy:

https://docs.google.com/spreadsheets/d/1utkULtIqiPOv8PW9fR14QGiv9DubAwB1vC4gRizaS6o/edit

Spreadsheet id: `1utkULtIqiPOv8PW9fR14QGiv9DubAwB1vC4gRizaS6o`

### One-time admin setup

1. Keep **Anyone with the link → Viewer** so the website can read the sheet. Add church leaders as **Editors** (the share link alone does not give edit rights).
2. Set these Vercel values once, then redeploy:

   | Name | Value |
   | --- | --- |
   | `CONTENT_SHEET_ID` | `1utkULtIqiPOv8PW9fR14QGiv9DubAwB1vC4gRizaS6o` |
   | `CONTENT_GID_ANNOUNCEMENTS` | `1289496058` |
   | `CONTENT_GID_WEDNESDAY` | `683473896` |
   | `CONTENT_GID_WORD` | `2041075164` |

3. Apply sheet governance (owner only, once), signed in as the sheet owner:
   - Open the Sheet while signed into the **same Google account that owns the Sheet**
   - Extensions → Apps Script
   - Paste [`google-workspace/WeeklyUpdatesGovernance.gs`](google-workspace/WeeklyUpdatesGovernance.gs)
   - Run `applyGovernance`
   - Reload the Sheet

If Apps Script shows **Unable to open the file at this time**, you are usually on the wrong Google account (the URL often contains `authuser=3`). Fix:
   - Sign out of extra Google accounts, or use a clean browser window / Incognito
   - Sign in only with the church owner account (`antwerpvlamms@gmail.com` or whichever account owns the Sheet)
   - Open the Sheet again from Drive, then Extensions → Apps Script
   - Or go to [script.google.com](https://script.google.com) while on that account → New project → paste the governance file → save → run `applyGovernance` after binding it via the Sheet’s Extensions menu once the account matches

That locks header rows, locks `Read_me`, forces YES/NO and Zoom / At the church dropdowns, requires `YYYY-MM-DD` dates, and adds a protected **Status** column (`OK` / `FIX…`) so incomplete published rows are obvious. The website also ignores invalid rows instead of breaking the page.

### Every week after that

Leaders only edit the Google Sheet. Watch **Status**. Changes show on the website in about a minute. No deploy, no code review, no backend work.

To regenerate the Excel template: `npm run content:template` (needs Python `openpyxl`).

## Pages

- `/` : welcome, gatherings, map, giving QR, prayer QR, Spotify
- `/pray` : prayer request form (this is what the prayer QR code opens)
- `/give` : bank details and printable giving QR (Belgian EPC / SEPA)
- `/qr` : foyer poster for prayer requests
- `/privacy` : what happens to a prayer request

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

- `CONTACT_EMAIL` : shown on the site. Until you set this, the site uses antwerpvlamms@gmail.com.
- `GOOGLE_CALENDAR_ID` : a calendar shared as public, so the agenda can be embedded. Times display in Europe/Brussels.
- `CONTENT_SHEET_ID` / `CONTENT_GID_ANNOUNCEMENTS` / `CONTENT_GID_WEDNESDAY` / `CONTENT_GID_WORD` : one-time link to the leaders’ weekly updates sheet.

## Deploy on Vercel

1. Import this repository in Vercel. `vercel.json` sets the framework to Next.js, so the deploy uses the Next.js build instead of a static `public` folder. If an older project still fails with “No Output Directory named public”, open Project Settings → Build and Deployment, set Framework Preset to Next.js, and turn off the Output Directory override. Leave that field empty.
2. Environment variables:

   | Name | Value |
   | --- | --- |
   | `GOOGLE_APPS_SCRIPT_URL` | the web app URL from the deploy step |
   | `PRAYER_SHARED_SECRET` | the same string as `PRAYER_SECRET` |
   | `CONTACT_EMAIL` | optional. Defaults to antwerpvlamms@gmail.com |
   | `GOOGLE_CALENDAR_ID` | optional |
   | `CONTENT_SHEET_ID` / `CONTENT_GID_ANNOUNCEMENTS` / `CONTENT_GID_WEDNESDAY` / `CONTENT_GID_WORD` | optional one-time link so leaders can update weekly notices without touching code |
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
