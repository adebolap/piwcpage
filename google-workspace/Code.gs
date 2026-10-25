/**
 * PIWC Antwerp: prayer requests into Google Workspace.
 *
 * This script saves each website prayer request in a private Google Sheet
 * and emails the prayer team from the Workspace account that owns the script.
 *
 * Setup (about ten minutes):
 * 1. In the church Google Workspace, open https://script.google.com and
 *    create a project named "PIWC Antwerp prayer requests".
 * 2. Replace the default Code.gs with this file.
 * 3. Run `setup` once and approve the Sheet permission.
 *    The execution log prints the new spreadsheet URL. Open it and confirm
 *    the timezone is Europe/Brussels.
 * 4. Project Settings → Script properties. Add:
 *      PRAYER_SECRET   a long random string (same value as PRAYER_SHARED_SECRET on Vercel)
 *      PRAYER_EMAIL    antwerpvlamms@gmail.com for now, or a Workspace address later
 *      SHEET_ID        filled in automatically by setup
 * 5. Deploy → New deployment → Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 *    Copy the web app URL into GOOGLE_APPS_SCRIPT_URL on Vercel.
 * 6. Submit a test request on /pray and confirm the row and the email.
 *
 * The sheet stays private to the Workspace account. Do not publish the sheet.
 * "Anyone" on the web app only means Vercel can call it. Requests without
 * PRAYER_SECRET are rejected.
 */

function setup() {
  var props = PropertiesService.getScriptProperties();
  var existing = props.getProperty("SHEET_ID");
  var ss = existing
    ? SpreadsheetApp.openById(existing)
    : SpreadsheetApp.create("PIWC Antwerp: Prayer requests");

  ss.setSpreadsheetTimeZone("Europe/Brussels");
  var sheet = ss.getSheetByName("Prayer requests");
  if (!sheet) {
    sheet = ss.getSheets()[0];
    sheet.setName("Prayer requests");
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Received", "Name", "Prayer request", "Contact", "Sharing", "Source"]);
    sheet.setFrozenRows(1);
    sheet.getRange("A:A").setNumberFormat("yyyy-mm-dd hh:mm");
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(3, 420);
  }
  props.setProperty("SHEET_ID", ss.getId());
  Logger.log("Sheet: " + ss.getUrl());
  Logger.log("Set PRAYER_SECRET and PRAYER_EMAIL in Script properties, then deploy the web app.");
}

function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var expected = props.getProperty("PRAYER_SECRET");
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ ok: false, error: "Invalid JSON" });
  }

  if (!expected || !data || data.secret !== expected) {
    return json_({ ok: false, error: "Unauthorized" });
  }

  var request = String(data.request || "").trim();
  if (request.length < 8) {
    return json_({ ok: false, error: "Request is too short" });
  }

  var sheet = sheet_(props);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    sheet.appendRow([
      new Date(),
      String(data.name || "").slice(0, 80),
      request.slice(0, 2000),
      String(data.contact || "").slice(0, 120),
      data.shareWithCongregation ? "Congregation prayer" : "Prayer team only",
      "website",
    ]);
  } finally {
    lock.releaseLock();
  }

  var email = props.getProperty("PRAYER_EMAIL");
  if (email) {
    MailApp.sendEmail({
      to: email,
      subject: "New prayer request: PIWC Antwerp",
      body: [
        "A prayer request arrived from the website.",
        "",
        "Name: " + (data.name || "Not given"),
        "Contact: " + (data.contact || "Not given"),
        "Sharing: " +
          (data.shareWithCongregation
            ? "May be prayed with the congregation"
            : "Prayer team only"),
        "",
        request,
        "",
        "It is stored in the Prayer requests sheet. Do not forward this email.",
      ].join("\n"),
    });
  }

  return json_({ ok: true });
}

function sheet_(props) {
  var id = props.getProperty("SHEET_ID");
  if (!id) {
    throw new Error("SHEET_ID is missing. Run setup() first.");
  }
  var ss = SpreadsheetApp.openById(id);
  var sheet = ss.getSheetByName("Prayer requests");
  if (!sheet) {
    throw new Error("Sheet 'Prayer requests' was not found.");
  }
  return sheet;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
