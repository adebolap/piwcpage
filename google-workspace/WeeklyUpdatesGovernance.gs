/**
 * PIWC Antwerp — governance for the weekly updates Google Sheet.
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1utkULtIqiPOv8PW9fR14QGiv9DubAwB1vC4gRizaS6o
 *
 * Run once as the spreadsheet owner:
 * 1. Open the Google Sheet.
 * 2. Extensions → Apps Script.
 * 3. Paste this file (replace any blank Code.gs / Untitled.gs).
 * 4. Save. In the toolbar function list, choose `applyGovernance`
 *    (or `myFunction` — both work). Click Run.
 * 5. Approve the permission prompt.
 * 6. Reload the Sheet. A “PIWC updates” menu appears.
 *
 * If you see “Attempted to execute myFunction, but it was deleted”,
 * the dropdown was still on the old blank template. This file defines
 * myFunction again, so Save and Run once more.
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
  // Live church sheet uses "Word of the Week"; older copies may still say "Word".
  word: "Word of the Week",
  wordLegacy: "Word",
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

/**
 * Default Apps Script entry point.
 * The editor often still has "myFunction" selected after you paste this file.
 */
function myFunction() {
  applyGovernance();
}

/** One-click setup: structure, validation, protection, status formulas. */
function applyGovernance() {
  var ss = SpreadsheetApp.getActive();
  if (!ss) {
    throw new Error(
      "Open this script from the Google Sheet: Extensions → Apps Script. " +
        "Then choose applyGovernance (or myFunction) and click Run."
    );
  }
  ss.setSpreadsheetTimeZone("Europe/Brussels");

  var steps = [
    ["tabs", ensureTabs_],
    ["headers", normalizeHeaders_],
    ["layout", styleTabs_],
    ["dropdowns", applyValidations_],
    ["status", function () { refreshStatusFormulas(); }],
    ["colours", applyConditionalFormatting_],
    ["protection", protectGovernance_],
  ];
  var failed = [];
  for (var i = 0; i < steps.length; i++) {
    try {
      steps[i][1](ss);
    } catch (err) {
      failed.push(steps[i][0] + ": " + (err && err.message ? err.message : err));
      Logger.log(failed[failed.length - 1]);
    }
  }

  var message =
    "Governance applied.\n\n" +
    "• Header rows are locked.\n" +
    "• Read_me is locked for editors.\n" +
    "• Published / Mode use dropdowns.\n" +
    "• Status turns red when a published row is incomplete.\n\n" +
    "Leaders should only edit data rows. Do not rename tabs or columns.";
  if (failed.length) {
    message +=
      "\n\nSome steps need a second look:\n- " + failed.join("\n- ");
  }

  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    Logger.log(message);
  }
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
  ensureWordSheet_(ss);
}

function ensureSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function ensureWordSheet_(ss) {
  var sheet = ss.getSheetByName(SHEET_NAMES.word);
  if (sheet) return sheet;
  var legacy = ss.getSheetByName(SHEET_NAMES.wordLegacy);
  if (legacy) {
    legacy.setName(SHEET_NAMES.word);
    return legacy;
  }
  return ensureSheet_(ss, SHEET_NAMES.word);
}

function wordSheet_(ss) {
  return (
    ss.getSheetByName(SHEET_NAMES.word) ||
    ss.getSheetByName(SHEET_NAMES.wordLegacy) ||
    ensureWordSheet_(ss)
  );
}

function normalizeHeaders_(ss) {
  setHeaders_(ss.getSheetByName(SHEET_NAMES.announcements), ANNOUNCEMENT_HEADERS);
  setHeaders_(ss.getSheetByName(SHEET_NAMES.wednesday), WEDNESDAY_HEADERS);
  setHeaders_(wordSheet_(ss), WORD_HEADERS);
  ensureReadme_(ss.getSheetByName(SHEET_NAMES.readme));
}

function setHeaders_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet
    .getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setBackground("#1D1D1F")
    .setFontColor("#FFFFFF");
  try {
    if (sheet.getFilter()) sheet.getFilter().remove();
    sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 2), headers.length).createFilter();
  } catch (err) {
    Logger.log("Filter skipped on " + sheet.getName() + ": " + err);
  }
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
  var word = wordSheet_(ss);
  announcements.setColumnWidth(1, 140);
  announcements.setColumnWidth(2, 220);
  announcements.setColumnWidth(3, 420);
  wednesday.setColumnWidth(5, 360);
  word.setColumnWidth(2, 420);
}

function yesNoValidation_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(["YES", "NO"], true)
    .setAllowInvalid(false)
    .setHelpText("Use YES or NO only.")
    .build();
}

function modeValidation_() {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(["Zoom", "At the church"], true)
    .setAllowInvalid(false)
    .setHelpText("Choose Zoom or At the church.")
    .build();
}

/**
 * YYYY-MM-DD check without requireTextMatchesPattern (not available in all runtimes).
 * Formula is written for the top-left cell of the target range; Sheets adjusts it.
 */
function dateValidationFor_(a1TopLeft) {
  var formula =
    "=REGEXMATCH(TO_TEXT(" + a1TopLeft + '),"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")';
  return SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied(formula)
    .setAllowInvalid(false)
    .setHelpText("Use YYYY-MM-DD, for example 2026-11-12.")
    .build();
}

function applyValidations_(ss) {
  var yesNo = yesNoValidation_();
  var mode = modeValidation_();

  var announcements = ss.getSheetByName(SHEET_NAMES.announcements);
  announcements.getRange("D2:D1000").setDataValidation(dateValidationFor_("D2"));
  announcements.getRange("E2:E1000").setDataValidation(dateValidationFor_("E2"));
  announcements.getRange("I2:I1000").setDataValidation(yesNo);

  var wednesday = ss.getSheetByName(SHEET_NAMES.wednesday);
  wednesday.getRange("A2:A1000").setDataValidation(dateValidationFor_("A2"));
  wednesday.getRange("B2:B1000").setDataValidation(mode);
  wednesday.getRange("G2:G1000").setDataValidation(yesNo);

  var word = wordSheet_(ss);
  word.getRange("E2:E1000").setDataValidation(dateValidationFor_("E2"));
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
    wordSheet_(ss),
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
  formatStatus_(wordSheet_(ss), "G2:G1000");
}

function formatStatus_(sheet, rangeA1) {
  var range = sheet.getRange(rangeA1);
  var rules = [];
  var existing = sheet.getConditionalFormatRules();
  for (var i = 0; i < existing.length; i++) {
    var keep = true;
    var ranges = existing[i].getRanges();
    for (var j = 0; j < ranges.length; j++) {
      if (ranges[j].getA1Notation() === rangeA1) keep = false;
    }
    if (keep) rules.push(existing[i]);
  }
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
  protectRange_(wordSheet_(ss).getRange("A1:G1"), "Word headers");

  var readme = ss.getSheetByName(SHEET_NAMES.readme);
  var readmeProtection = readme.protect().setDescription("Read_me locked for leaders");
  readmeProtection.setWarningOnly(false);
  lockToOwner_(readmeProtection);

  // Status formulas stay editable by owner only so leaders do not overwrite checks.
  protectRange_(ss.getSheetByName(SHEET_NAMES.announcements).getRange("J2:J1000"), "Announcements status");
  protectRange_(ss.getSheetByName(SHEET_NAMES.wednesday).getRange("H2:H1000"), "Wednesday status");
  protectRange_(wordSheet_(ss).getRange("G2:G1000"), "Word status");
}

function protectRange_(range, description) {
  var protection = range.protect().setDescription(description);
  protection.setWarningOnly(false);
  lockToOwner_(protection);
}

function lockToOwner_(protection) {
  try {
    var me = Session.getEffectiveUser();
    protection.addEditor(me);
    var editors = protection.getEditors();
    for (var i = 0; i < editors.length; i++) {
      if (editors[i].getEmail() !== me.getEmail()) {
        protection.removeEditor(editors[i]);
      }
    }
    if (protection.canDomainEdit()) protection.setDomainEdit(false);
  } catch (err) {
    // Consumer accounts sometimes cannot remove other editors; warning-only still helps.
    protection.setWarningOnly(true);
    Logger.log("Protection softened: " + err);
  }
}

function clearOldProtections_(ss) {
  var sheetProtections = ss.getProtections(SpreadsheetApp.ProtectionType.SHEET);
  for (var i = 0; i < sheetProtections.length; i++) {
    var sheetDesc = sheetProtections[i].getDescription() || "";
    if (/Read_me|PIWC|status|header/i.test(sheetDesc)) sheetProtections[i].remove();
  }
  var rangeProtections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var j = 0; j < rangeProtections.length; j++) {
    var rangeDesc = rangeProtections[j].getDescription() || "";
    if (/header|status|Announcements|Wednesday|Word|PIWC/i.test(rangeDesc)) {
      rangeProtections[j].remove();
    }
  }
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

  var publishedCol =
    name === SHEET_NAMES.announcements
      ? 9
      : name === SHEET_NAMES.wednesday
        ? 7
        : name === SHEET_NAMES.word || name === SHEET_NAMES.wordLegacy
          ? 6
          : 0;
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
