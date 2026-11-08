#!/usr/bin/env python3
"""Generate the PIWC Antwerp weekly updates workbook for church leaders."""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content" / "PIWC-Antwerp-weekly-updates.xlsx"

HEADER_FILL = PatternFill("solid", fgColor="1D1D1F")
HEADER_FONT = Font(name="Calibri", bold=True, color="FFFFFF", size=11)
NOTE_FILL = PatternFill("solid", fgColor="F5F5F7")
TITLE_FONT = Font(name="Calibri", bold=True, size=14, color="1D1D1F")
SECTION_FONT = Font(name="Calibri", bold=True, size=12, color="1D1D1F")
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
    for row in ws.iter_rows(min_row=2, max_row=max(ws.max_row, 2), max_col=len(headers)):
        for cell in row:
            cell.font = BODY_FONT
            cell.alignment = WRAP
    autosize(ws, widths)


def add_list(ws, column: str, options: str, max_row: int = 200) -> None:
    rule = DataValidation(type="list", formula1=f'"{options}"', allow_blank=True)
    ws.add_data_validation(rule)
    rule.add(f"{column}2:{column}{max_row}")


def build() -> Path:
    wb = Workbook()

    readme = wb.active
    readme.title = "Read_me"
    readme["A1"] = "PIWC Antwerp — weekly website updates"
    readme["A1"].font = TITLE_FONT
    lines = [
        "",
        "Who this file is for",
        "Church leaders. Use it when you want to post a weekly announcement or tell people where Wednesday Bible study meets.",
        "You only edit this spreadsheet. You do not touch the website code, Vercel, or any backend.",
        "",
        "What to edit each week",
        "1. Announcements — add a row for a notice (welcome, special service, fasting, visitor info, etc.).",
        "2. Wednesday — set this week’s Bible study to Zoom or At the church, and write a short note if needed.",
        "3. Word — optional. Change the scripture shown on the homepage.",
        "",
        "How to publish a notice",
        "- Keep the header row as it is. Do not rename columns.",
        "- Set Published to YES when it should appear on the website.",
        "- Set Published to NO (or delete the row later) when it should come down.",
        "- Dates use Europe/Brussels and the format YYYY-MM-DD (example: 2026-11-12).",
        "- A notice shows only when today is between Start date and End date.",
        "- After governance is applied in Google Sheets, check the Status column. Only OK rows should stay Published = YES.",
        "",
        "Wednesday examples",
        "- Usual week: Mode = Zoom, Place = Zoom, Note blank, Published = YES.",
        "- At the church this Wednesday: Mode = At the church, Place = Merksemsesteenweg 32/34, Deurne, Note = We meet at the church this week., Published = YES.",
        "",
        "One-time setup (admin only, once)",
        "A technical admin uploads this file to Google Drive, opens it with Google Sheets, shares it as Anyone with the link → Viewer, and connects the sheet id once on Vercel.",
        "After that, leaders only edit Announcements, Wednesday, and Word. The website picks up changes in about a minute.",
        "",
        "Privacy",
        "Do not put prayer request names, phone numbers, or private pastoral notes in this file. Prayer requests stay in the private Workspace sheet.",
    ]
    for index, line in enumerate(lines, start=2):
        readme[f"A{index}"] = line
        readme[f"A{index}"].alignment = WRAP
        if line in {
            "Who this file is for",
            "What to edit each week",
            "How to publish a notice",
            "Wednesday examples",
            "One-time setup (admin only, once)",
            "Privacy",
        }:
            readme[f"A{index}"].font = SECTION_FONT
            readme[f"A{index}"].fill = NOTE_FILL
        else:
            readme[f"A{index}"].font = BODY_FONT
    readme.column_dimensions["A"].width = 108

    announcements = wb.create_sheet("Announcements")
    write_table(
        announcements,
        ["id", "title", "body", "start_date", "end_date", "link", "cta", "sort", "published"],
        [
            [
                "welcome-this-week",
                "You are welcome this Sunday",
                "Join us for Sunday worship from 9:30am to 12:00 noon at Merksemsesteenweg 32/34.",
                "2026-11-02",
                "2026-11-30",
                "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen",
                "Get directions",
                10,
                "YES",
            ],
            [
                "friday-impact",
                "Friday Impact Service",
                "Impact Service this Friday at 19:30 at the church.",
                "2026-11-02",
                "2026-11-30",
                "",
                "",
                20,
                "YES",
            ],
            [
                "example-off",
                "Example notice (hidden)",
                "Change Published to YES when this should appear. Leaders can copy this row as a template.",
                "2026-01-01",
                "2026-01-07",
                "",
                "",
                90,
                "NO",
            ],
        ],
        {1: 18, 2: 28, 3: 58, 4: 12, 5: 12, 6: 36, 7: 14, 8: 8, 9: 12},
    )
    add_list(announcements, "I", "YES,NO")

    wednesday = wb.create_sheet("Wednesday")
    write_table(
        wednesday,
        ["week_start", "mode", "time", "place", "note", "link", "published"],
        [
            [
                "2026-11-05",
                "Zoom",
                "Online",
                "Zoom",
                "",
                "https://thecopbelgium-org.zoom.us/j/7381613048?pwd=WXVYOHVtSWhyMnBabWRmbWpkcmprZz09",
                "YES",
            ],
            [
                "2026-11-12",
                "At the church",
                "19:30",
                "Merksemsesteenweg 32/34, Deurne",
                "Bible study is at the church this Wednesday.",
                "https://www.google.com/maps/search/?api=1&query=Merksemsesteenweg+32%2F34%2C+2100+Antwerpen",
                "NO",
            ],
        ],
        {1: 12, 2: 16, 3: 12, 4: 34, 5: 48, 6: 40, 7: 12},
    )
    add_list(wednesday, "B", "Zoom,At the church")
    add_list(wednesday, "G", "YES,NO")
    wednesday["A5"] = (
        "Tip: keep one Published = YES row for the current week. Turn last week’s row to NO when you switch."
    )
    wednesday["A5"].font = Font(name="Calibri", italic=True, color="6E6E73")

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
        {1: 22, 2: 55, 3: 18, 4: 50, 5: 12, 6: 12},
    )
    add_list(word, "F", "YES,NO")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    # Remove the old broad CMS workbook if present so leaders have one clear file.
    legacy = ROOT / "content" / "PIWC-Antwerp-website-feed.xlsx"
    if legacy.exists():
        legacy.unlink()
    wb.save(OUT)
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path}")
