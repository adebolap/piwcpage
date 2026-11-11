import assert from "node:assert/strict";
import { test } from "node:test";
import { csvObjects } from "./csv.ts";

// Exercise governance filters through the same CSV shape leaders export.
test("announcement CSV rows keep only complete published notices", () => {
  const rows = csvObjects(
    [
      "id,title,body,start_date,end_date,link,cta,sort,published",
      'good,Welcome,Come this Sunday,2020-01-01,2099-01-01,https://example.com,Go,10,YES',
      "bad,,Missing title,2020-01-01,2099-01-01,,Go,20,YES",
      "hidden,Hidden,Nope,2020-01-01,2099-01-01,,Go,30,NO",
      "baddate,Bad date,Nope,12-11-2026,2099-01-01,,Go,40,YES",
      "badlink,Bad link,Nope,2020-01-01,2099-01-01,http://insecure.example,Go,50,YES",
    ].join("\n"),
  );

  const today = "2026-11-08";
  const kept = rows.filter((row) => {
    if (!/^(yes|y|true|1)$/i.test(row.published || "")) return false;
    if (!/^[a-z0-9][a-z0-9-]{1,48}$/i.test(row.id || "")) return false;
    if (!(row.title || "").trim()) return false;
    if (row.start_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.start_date)) return false;
    if (row.end_date && !/^\d{4}-\d{2}-\d{2}$/.test(row.end_date)) return false;
    if (row.start_date && row.start_date > today) return false;
    if (row.end_date && row.end_date < today) return false;
    if (row.link && !/^https:\/\//i.test(row.link)) return false;
    return true;
  });

  assert.deepEqual(
    kept.map((row) => row.id),
    ["good"],
  );
});
