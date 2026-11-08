/**
 * PIWC Antwerp — governance for the weekly updates Google Sheet.
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1utkULtIqiPOv8PW9fR14QGiv9DubAwB1vC4gRizaS6o
 *
 * Run once as the spreadsheet owner:
 * 1. Open the Google Sheet.
 * 2. Extensions → Apps Script.
 * 3. Paste this file (replace any blank Code.gs).
 * 4. Save, then run `applyGovernance` from the dropdown.
 * 5. Approve the permission prompt.
 * 6. Reload the Sheet. A “PIWC updates” menu appears.
 *
 * What this locks down:
 * - Header row 1 is protected (leaders cannot rename or delete columns).
 * - Read_me is view-only for editors.
 * - Published is YES/NO only.
 * - Wednesday Mode is Zoom / At the church only.
 * - Dates must look like YYYY-MM-DD.
 * - A Status column flags incomplete published rows in red.
 * - Soft onEdit warnings if someone clears a required cell on a published row.
 */

var SHEET_NAMES = {
  readme: "Read_me",
  announcements: "Announcements",
  wednesday: "Wednesday",
  word: "Word",
};

var ANNOUNCEMENT_HEADERS = [
  "id",
  "title",
  "body",
  "start_date",
  "end_date",
  "link",
  "cta",
  "sort",
  "published",
  "status",
];

var WEDNESDAY_HEADERS = [
  "week_start",
  "mode",
  "time",
  "place",
  "note",
  "link",
  "published",
  "status",
];

var WORD_HEADERS = [
  "eyebrow",
  "text",
  "reference",
  "note",
  "week_start",
  "published",
  "status",
];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("PIWC updates")
    .addItem("Apply governance (protect + validate)", "applyGovernance")
    .addItem("Re-check Status column", "refreshStatusFormulas")
    .addItem("Show leader checklist", "showChecklist")
    .addToUi();
}

/** One-click setup: structure, validation, protection, status formulas. */
function applyGovernance() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone("Europe/Brussels");

  ensureTabs_(ss);
  normalizeHeaders_(ss);
  styleTabs_(ss);
  applyValidations_(ss);
  refreshStatusFormulas();
  applyConditionalFormatting_(ss);
  protectGovernance_(ss);

  SpreadsheetApp.getUi().alert(
    "Governance applied.\n\n" +
      "• Header rows are locked.\n" +
      "• Read_me is locked for editors.\n" +
      "• Published / Mode use dropdowns.\n" +
      "• Status turns red when a published row is incomplete.\n\n" +
      "Leaders should only edit data rows. Do not rename tabs or columns."
  );
}

function showChecklist() {
  SpreadsheetApp.getUi().alert(
    "Leader checklist\n\n" +
      "1. Announcements: add a row, set dates, set Published = YES.\n" +
      "2. Wednesday: one Published = YES row for this week (Zoom or At the church).\n" +
      "3. Word: optional. One Published = YES scripture.\n" +
      "4. Watch the Status column. Fix anything that is not OK before Sunday.\n" +
      "5. Never put prayer names or private contacts in this sheet.\n" +
      "6. Never rename columns or delete the header row."
  );
}

function ensureTabs_(ss) {
  ensureSheet_(ss, SHEET_NAMES.readme);
  ensureSheet_(ss, SHEET_NAMES.announcements);
  ensureSheet_(ss, SHEET_NAMES.wednesday);
  ensureSheet_(ss, SHEET_NAMES.word);
}

function ensureSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function normalizeHeaders_(ss) {
  setHeaders_(ss.getSheetByName(SHEET_NAMES.announcements), ANNOUNCEMENT_HEADERS);
  setHeaders_(ss.getSheetByName(SHEET_NAMES.wednesday), WEDNESDAY_HEADERS);
  setHeaders_(ss.getSheetByName(SHEET_NAMES.word), WORD_HEADERS);
  ensureReadme_(ss.getSheetByName(SHEET_NAMES.readme));
}

function setHeaders_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#1D1D1F")
    .setFontColor("#FFFFFF");
  if (sheet.getFilter()) sheet.getFilter().remove();
  sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), headers.length).createFilter();
}

function ensureReadme_(sheet) {
  if (sheet.getLastRow() > 0) return;
  var lines = [
    ["PIWC Antwerp — weekly website updates"],
    [""],
    ["Leaders only edit Announcements, Wednesday, and Word."],
    ["Do not rename tabs or the header row. Use the Status column before publishing."],
    ["Published = YES means the website may show that row within about a minute."],
    ["Never store prayer requests or private pastoral notes here."],
  ];
  sheet.getRange(1, 1, lines.length, 1).setValues(lines);
  sheet.setColumnWidth(1, 900);
}

function styleTabs_(ss) {
  var announcements = ss.getSheetByName(SHEET_NAMES.announcements);
  var wednesday = ss.getSheetByName(SHEET_NAMES.wednesday);
  var word = ss.getSheetByName(SHEET_NAMES.word);
  announcements.setColumnWidths(1, 1, 140);
  announcements.setColumnWidths(2, 1, 220);
  announcements.setColumnWidths(3, 1, 420);
  wednesday.setColumnWidths(5, 1, 360);
  word.setColumnWidths(2, 1, 420);
}

function applyValidations_(ss) {
  var yesNo = SpreadsheetApp.newDataValidation()
    .requireValueInList(["YES", "NO"], true)
    .setAllowInvalid(false)
    .setHelpText("Use YES or NO only.")
    .build();

  var mode = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Zoom", "At the church"], true)
    .setAllowInvalid(false)
    .setHelpText("Choose Zoom or At the church.")
    .build();

  var dateHelp = SpreadsheetApp.newDataValidation()
    .requireTextMatchesPattern("^\\d{4}-\\d{2}-\\d{2}$")
    .setAllowInvalid(false)
    .setHelpText("Use YYYY-MM-DD, for example 2026-11-12.")
    .build();

  var announcements = ss.getSheetByName(SHEET_NAMES.announcements);
  announcements.getRange("D2:E1000").setDataValidation(dateHelp);
  announcements.getRange("I2:I1000").setDataValidation(yesNo);

  var wednesday = ss.getSheetByName(SHEET_NAMES.wednesday);
  wednesday.getRange("A2:A1000").setDataValidation(dateHelp);
  wednesday.getRange("B2:B1000").setDataValidation(mode);
  wednesday.getRange("G2:G1000").setDataValidation(yesNo);

  var word = ss.getSheetByName(SHEET_NAMES.word);
  word.getRange("E2:E1000").setDataValidation(dateHelp);
  word.getRange("F2:F1000").setDataValidation(yesNo);
}

function refreshStatusFormulas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  fillStatus_(
    ss.getSheetByName(SHEET_NAMES.announcements),
    10,
    '=IF(I{row}<>"YES","",IF(OR(A{row}="",B{row}="",D{row}="",E{row}=""),"FIX: need id, title, start_date, end_date",IF(D{row}>E{row},"FIX: start_date after end_date","OK")))'
  );

  fillStatus_(
    ss.getSheetByName(SHEET_NAMES.wednesday),
    8,
    '=IF(G{row}<>"YES","",IF(OR(A{row}="",B{row}="",D{row}=""),"FIX: need week_start, mode, place",IF(AND(LOWER(B{row})="zoom",F{row}=""),"FIX: Zoom rows need the Zoom link",IF(AND(REGEXMATCH(LOWER(B{row}),"church"),F{row}=""),"FIX: church rows need a maps link","OK"))))'
  );

  fillStatus_(
    ss.getSheetByName(SHEET_NAMES.word),
    7,
    '=IF(F{row}<>"YES","",IF(OR(B{row}="",C{row}=""),"FIX: need text and reference","OK"))'
  );
}

function fillStatus_(sheet, statusCol, template) {
  var last = Math.max(sheet.getLastRow(), 50);
  var formulas = [];
  for (var row = 2; row <= last; row++) {
    formulas.push([template.replace(/\{row\}/g, String(row))]);
  }
  sheet.getRange(2, statusCol, last - 1, 1).setFormulas(formulas);
  sheet.getRange(1, statusCol).setNote(
    "Auto status. OK means safe to show on the website. FIX means repair before Sunday."
  );
}

function applyConditionalFormatting_(ss) {
  formatStatus_(ss.getSheetByName(SHEET_NAMES.announcements), "J2:J1000");
  formatStatus_(ss.getSheetByName(SHEET_NAMES.wednesday), "H2:H1000");
  formatStatus_(ss.getSheetByName(SHEET_NAMES.word), "G2:G1000");
}

function formatStatus_(sheet, rangeA1) {
  var range = sheet.getRange(rangeA1);
  var rules = sheet.getConditionalFormatRules().filter(function (rule) {
    return rule.getRanges().every(function (r) {
      return r.getA1Notation() !== rangeA1;
    });
  });
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextContains("FIX")
      .setBackground("#FCE8E6")
      .setFontColor("#C5221F")
      .setRanges([range])
      .build()
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("OK")
      .setBackground("#E6F4EA")
      .setFontColor("#137333")
      .setRanges([range])
      .build()
  );
  sheet.setConditionalFormatRules(rules);
}

function protectGovernance_(ss) {
  clearOldProtections_(ss);

  protectRange_(ss.getSheetByName(SHEET_NAMES.announcements).getRange("A1:J1"), "Announcements headers");
  protectRange_(ss.getSheetByName(SHEET_NAMES.wednesday).getRange("A1:H1"), "Wednesday headers");
  protectRange_(ss.getSheetByName(SHEET_NAMES.word).getRange("A1:G1"), "Word headers");

  var readme = ss.getSheetByName(SHEET_NAMES.readme);
  var readmeProtection = readme.protect().setDescription("Read_me locked for leaders");
  readmeProtection.setWarningOnly(false);
  lockToOwner_(readmeProtection);

  // Status formulas stay editable by owner only so leaders do not overwrite checks.
  protectRange_(ss.getSheetByName(SHEET_NAMES.announcements).getRange("J2:J1000"), "Announcements status");
  protectRange_(ss.getSheetByName(SHEET_NAMES.wednesday).getRange("H2:H1000"), "Wednesday status");
  protectRange_(ss.getSheetByName(SHEET_NAMES.word).getRange("G2:G1000"), "Word status");
}

function protectRange_(range, description) {
  var protection = range.protect().setDescription(description);
  protection.setWarningOnly(false);
  lockToOwner_(protection);
}

function lockToOwner_(protection) {
  var me = Session.getEffectiveUser();
  protection.addEditor(me);
  protection.removeEditors(
    protection.getEditors().filter(function (user) {
      return user.getEmail() !== me.getEmail();
    })
  );
  if (protection.canDomainEdit()) protection.setDomainEdit(false);
}

function clearOldProtections_(ss) {
  ss.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(function (p) {
    if (/Read_me|PIWC|status|header/i.test(p.getDescription() || "")) p.remove();
  });
  ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(function (p) {
    if (/header|status|Announcements|Wednesday|Word|PIWC/i.test(p.getDescription() || "")) {
      p.remove();
    }
  });
}

/** Soft warning when a published row loses required fields. */
function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var name = sheet.getName();
  var row = e.range.getRow();
  if (row === 1) {
    SpreadsheetApp.getActive().toast(
      "Header row is protected. Do not rename columns.",
      "PIWC updates",
      6
    );
    return;
  }

  var publishedCol = name === SHEET_NAMES.announcements ? 9 : name === SHEET_NAMES.wednesday ? 7 : name === SHEET_NAMES.word ? 6 : 0;
  if (!publishedCol) return;
  var published = String(sheet.getRange(row, publishedCol).getDisplayValue() || "").toUpperCase();
  if (published !== "YES") return;

  var value = e.value;
  if (value === "" || value === null) {
    SpreadsheetApp.getActive().toast(
      "This row is Published = YES. Leaving required cells blank will hide or break the website update. Check Status.",
      "PIWC updates",
      8
    );
  }
}
