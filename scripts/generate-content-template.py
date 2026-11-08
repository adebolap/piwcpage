#!/usr/bin/env python3
"""Generate the PIWC Antwerp Excel workbook that feeds website content."""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content" / "PIWC-Antwerp-website-feed.xlsx"

HEADER_FILL = PatternFill("solid", fgColor="1D1D1F")
HEADER_FONT = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
NOTE_FILL = PatternFill("solid", fgColor="F5F5F7")
TITLE_FONT = Font(name="Calibri", bold=True, size=14, color="1D1D1F")
BODY_FONT = Font(name="Calibri", size=11, color="1D1D1F")
WRAP = Alignment(wrap_text=True, vertical="top")


def style_header(ws, columns: int) -> None:
    for col in range(1, columns + 1):
        cell = ws.cell(1, col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = WRAP
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions


def autosize(ws, widths: dict[int, int]) -> None:
    for index, width in widths.items():
        ws.column_dimensions[get_column_letter(index)].width = width


def write_table(ws, headers: list[str], rows: list[list[object]], widths: dict[int, int]) -> None:
    ws.append(headers)
    for row in rows:
        ws.append(row)
    style_header(ws, len(headers))
    for row in ws.iter_rows(min_row=2, max_row=ws.max_row, max_col=len(headers)):
        for cell in row:
            cell.font = BODY_FONT
            cell.alignment = WRAP
    autosize(ws, widths)


def add_yes_no(ws, column: str, max_row: int = 200) -> None:
    rule = DataValidation(type="list", formula1='"YES,NO"', allow_blank=True)
    rule.error = "Use YES or NO"
    rule.errorTitle = "Published"
    ws.add_data_validation(rule)
    rule.add(f"{column}2:{column}{max_row}")


def build() -> Path:
    wb = Workbook()

    # --- Instructions -------------------------------------------------------
    instructions = wb.active
    instructions.title = "Instructions"
    instructions["A1"] = "PIWC Antwerp — website content feed"
    instructions["A1"].font = TITLE_FONT
    lines = [
        "",
        "What this file is",
        "Edit this workbook in Excel or Google Sheets. The website can read the public content tabs and show the latest gatherings, word for the week, announcements, mission text, giving details, and site links.",
        "",
        "How to set it up (Google Sheets, recommended)",
        "1. Upload this file to the church Google Drive.",
        "2. Open with Google Sheets (File → Save as Google Sheets).",
        "3. Share the spreadsheet as Anyone with the link → Viewer. Do not make Prayer requests public.",
        "4. Copy the spreadsheet ID from the URL (the long id between /d/ and /edit).",
        "5. On each content tab, copy the gid from the URL (#gid=…).",
        "6. In Vercel → Project → Settings → Environment Variables, set:",
        "   CONTENT_SHEET_ID = <spreadsheet id>",
        "   CONTENT_GID_SITE = <gid of Site tab>",
        "   CONTENT_GID_GATHERINGS = <gid of Gatherings tab>",
        "   CONTENT_GID_MISSION = <gid of Mission tab>",
        "   CONTENT_GID_WORD = <gid of Word tab>",
        "   CONTENT_GID_GIVING = <gid of Giving tab>",
        "   CONTENT_GID_ANNOUNCEMENTS = <gid of Announcements tab>",
        "7. Redeploy. Edits in the sheet appear on the site within about one minute.",
        "",
        "Rules",
        "- Keep header row 1 exactly as provided. Do not rename columns.",
        "- Use YES / NO in Published columns. Unpublished rows stay off the website.",
        "- Leave a cell blank to keep the built-in website default for that field.",
        "- Prayer_Log_Headers is only a private log layout for Workspace. Never publish that sheet.",
        "- Never put prayer request names or private contact details in the public feed tabs.",
        "",
        "Tabs that feed the website",
        "Site — church name, address, Zoom, social links, contact email",
        "Gatherings — Sunday, Friday, devotion, Bible study, and any extra meetings",
        "Mission — about copy and ministry pillars",
        "Word — scripture for the week",
        "Giving — bank transfer details and Stripe payment link",
        "Announcements — short notices shown when Published is YES and dates are current",
        "",
        "Timezone",
        "Use Europe/Brussels dates (YYYY-MM-DD) on Announcements.",
    ]
    for index, line in enumerate(lines, start=2):
        instructions[f"A{index}"] = line
        instructions[f"A{index}"].font = BODY_FONT
        instructions[f"A{index}"].alignment = WRAP
        if line.startswith("What ") or line.startswith("How ") or line.startswith("Rules") or line.startswith("Tabs ") or line.startswith("Timezone"):
            instructions[f"A{index}"].font = Font(name="Calibri", bold=True, size=12)
            instructions[f"A{index}"].fill = NOTE_FILL
    instructions.column_dimensions["A"].width = 110

    # --- Site ---------------------------------------------------------------
    site = wb.create_sheet("Site")
    write_table(
        site,
        ["key", "value", "notes"],
        [
            ["name", "PIWC Antwerp", "Hero brand name"],
            ["full_name", "Pentecost International Worship Centre Antwerp", "Long name / SEO"],
            ["denomination", "The Church of Pentecost", "Shown near Visit"],
            ["tagline", "The Centre where God lives", "Hero line under the brand"],
            ["lede", "A welcoming, multicultural church in Antwerp. We spread the Gospel of Jesus Christ, grow in the Word, and serve our city with Christian love.", "Short hero paragraph"],
            ["description", "Pentecost International Worship Centre (PIWC) Antwerp is a Christian faith-based, nonprofit organization dedicated to spreading the Gospel of Jesus Christ, fostering spiritual growth, and building a welcoming, multicultural community.", "Meta description"],
            ["address_line", "Merksemsesteenweg 32/34", "Street"],
            ["postal_code", "2100", ""],
            ["city", "Antwerpen", ""],
            ["district", "Deurne", ""],
            ["country", "Belgium", ""],
            ["country_code", "BE", "ISO country code"],
            ["email", "antwerpvlamms@gmail.com", "Public contact. Can also be set as CONTACT_EMAIL on Vercel."],
            ["zoom_url", "https://thecopbelgium-org.zoom.us/j/7381613048?pwd=WXVYOHVtSWhyMnBabWRmbWpkcmprZz09", "Morning devotion / Bible study"],
            ["instagram_url", "https://www.instagram.com/piwc_antwerp/", ""],
            ["instagram_handle", "@piwc_antwerp", ""],
            ["tiktok_url", "https://www.tiktok.com/@piwc_antwerp", ""],
            ["tiktok_handle", "@piwc_antwerp", ""],
            ["spotify_url", "https://open.spotify.com/playlist/3ZRRgKRSswTr3pqQR0sHfN", ""],
            ["spotify_embed", "https://open.spotify.com/embed/playlist/3ZRRgKRSswTr3pqQR0sHfN", ""],
            ["playlist_title", "PIWC Antwerp", ""],
            ["maps_url", "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen", "Directions button"],
            ["maps_embed", "https://maps.google.com/maps?q=Merksemsesteenweg+32/34,+2100+Antwerpen&z=16&output=embed", "Visit map iframe"],
        ],
        {1: 22, 2: 90, 3: 42},
    )

    # --- Gatherings ---------------------------------------------------------
    gatherings = wb.create_sheet("Gatherings")
    write_table(
        gatherings,
        [
            "id",
            "name",
            "when",
            "time",
            "place",
            "detail",
            "note",
            "link",
            "cta",
            "sort",
            "published",
        ],
        [
            [
                "sunday",
                "Sunday worship",
                "Sundays, 9:30am to 12:00 noon",
                "9:30 to 12:00",
                "Merksemsesteenweg 32/34, Deurne",
                "Worship with the church in Antwerp, from 9:30 in the morning until 12:00.",
                "",
                "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen",
                "Get directions",
                10,
                "YES",
            ],
            [
                "friday",
                "Friday Impact Service",
                "Fridays, 7:30pm",
                "19:30",
                "Merksemsesteenweg 32/34, Deurne",
                "An evening Impact Service at the church, every Friday at 19:30.",
                "",
                "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen",
                "Get directions",
                20,
                "YES",
            ],
            [
                "devotion",
                "Bethel Grounds morning devotion",
                "Morning devotion",
                "Online",
                "Zoom",
                "A morning devotion to pray and listen to the Word before the day begins.",
                "",
                "https://thecopbelgium-org.zoom.us/j/7381613048?pwd=WXVYOHVtSWhyMnBabWRmbWpkcmprZz09",
                "Join on Zoom",
                30,
                "YES",
            ],
            [
                "bible",
                "Wednesday Bible study",
                "Wednesdays",
                "Online",
                "Usually on Zoom",
                "Midweek Bible study with the church.",
                "Bible study can occasionally take place at the church. When it does, we share the update on Instagram and TikTok.",
                "https://thecopbelgium-org.zoom.us/j/7381613048?pwd=WXVYOHVtSWhyMnBabWRmbWpkcmprZz09",
                "Join on Zoom",
                40,
                "YES",
            ],
        ],
        {1: 12, 2: 28, 3: 30, 4: 14, 5: 28, 6: 48, 7: 40, 8: 40, 9: 14, 10: 8, 11: 12},
    )
    add_yes_no(gatherings, "K")

    # --- Mission ------------------------------------------------------------
    mission = wb.create_sheet("Mission")
    write_table(
        mission,
        ["section", "sort", "title", "body", "published"],
        [
            ["eyebrow", 10, "", "Who we are", "YES"],
            ["title", 20, "", "Gospel, growth, and community.", "YES"],
            [
                "paragraph",
                30,
                "",
                "Pentecost International Worship Centre (PIWC) Antwerp is a Christian faith-based, nonprofit organization dedicated to spreading the Gospel of Jesus Christ, fostering spiritual growth, and building a welcoming, multicultural community.",
                "YES",
            ],
            [
                "paragraph",
                40,
                "",
                "Through worship, biblical teaching, discipleship, community outreach, and charitable initiatives, we seek to empower individuals, strengthen families, support those in need, and positively impact society through Christian love and service.",
                "YES",
            ],
            ["pillar", 50, "Worship", "Gathering to exalt Jesus Christ together.", "YES"],
            [
                "pillar",
                60,
                "Biblical teaching",
                "Opening Scripture for spiritual growth and discipleship.",
                "YES",
            ],
            [
                "pillar",
                70,
                "Community",
                "A multicultural family that welcomes every nation in the city.",
                "YES",
            ],
            [
                "pillar",
                80,
                "Outreach and charity",
                "Serving those in need with Christian love.",
                "YES",
            ],
        ],
        {1: 14, 2: 8, 3: 22, 4: 80, 5: 12},
    )
    add_yes_no(mission, "E")

    # --- Word ---------------------------------------------------------------
    word = wb.create_sheet("Word")
    write_table(
        word,
        ["eyebrow", "text", "reference", "note", "week_start", "published"],
        [
            [
                "A word for the week",
                "My house shall be called a house of prayer.",
                "Matthew 21:13",
                "Come expecting God to meet you in worship, in the Word, and in prayer.",
                "2026-11-02",
                "YES",
            ],
        ],
        {1: 22, 2: 55, 3: 18, 4: 50, 5: 14, 6: 12},
    )
    add_yes_no(word, "F")

    # --- Giving -------------------------------------------------------------
    giving = wb.create_sheet("Giving")
    write_table(
        giving,
        ["key", "value", "notes"],
        [
            ["beneficiary", "CHURCH OF PENTECOST VZW ANTWERP P.I.W.C", "Bank transfer name"],
            ["iban", "BE61734048103117", "No spaces"],
            ["iban_display", "BE61 7340 4810 3117", "Spaced for print"],
            ["bic", "KREDBEBB", ""],
            ["bic_full", "KREDBEBBXXX", "Used in EPC QR"],
            ["currency", "EUR", ""],
            [
                "epc_payload",
                "BCD\n002\n1\nSCT\nKREDBEBBXXX\nCHURCH OF PENTECOST VZW ANTWERP P.I.W.C\nBE61734048103117\nEUR0.00\n\n",
                "Belgian EPC / SEPA QR payload. Keep line breaks.",
            ],
            [
                "stripe_payment_url",
                "https://buy.stripe.com/5kA8xG4hU1L29u8000",
                "Payment link from the church Stripe QR",
            ],
            ["cta_label", "Give online", "Button label for the Stripe link"],
        ],
        {1: 22, 2: 70, 3: 42},
    )

    # --- Announcements ------------------------------------------------------
    announcements = wb.create_sheet("Announcements")
    write_table(
        announcements,
        ["id", "title", "body", "start_date", "end_date", "link", "cta", "sort", "published"],
        [
            [
                "welcome-nov",
                "You are welcome this Sunday",
                "Join us for Sunday worship from 9:30am to 12:00 noon at Merksemsesteenweg 32/34.",
                "2026-11-01",
                "2026-12-31",
                "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen",
                "Get directions",
                10,
                "YES",
            ],
            [
                "example-hidden",
                "Example unpublished notice",
                "Set Published to YES when this should appear on the website.",
                "2026-01-01",
                "2026-01-31",
                "",
                "",
                99,
                "NO",
            ],
        ],
        {1: 16, 2: 28, 3: 55, 4: 12, 5: 12, 6: 40, 7: 14, 8: 8, 9: 12},
    )
    add_yes_no(announcements, "I")

    # --- Prayer log headers (private reference) -----------------------------
    prayer = wb.create_sheet("Prayer_Log_Headers")
    write_table(
        prayer,
        ["Received", "Name", "Prayer request", "Contact", "Sharing", "Source"],
        [
            [
                "2026-11-08 14:00",
                "Example only",
                "Private prayer requests arrive here from the website. Keep this sheet private in Workspace.",
                "",
                "Prayer team only",
                "website",
            ],
        ],
        {1: 18, 2: 18, 3: 70, 4: 22, 5: 22, 6: 12},
    )
    prayer["A4"] = "Do not publish this tab. The live prayer log is created by google-workspace/Code.gs."
    prayer["A4"].font = Font(name="Calibri", italic=True, color="B42318")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT)
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path}")
