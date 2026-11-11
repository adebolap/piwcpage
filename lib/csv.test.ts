import assert from "node:assert/strict";
import { test } from "node:test";
import { csvObjects, parseCsv } from "./csv.ts";

test("parseCsv handles quoted commas and newlines", () => {
  const rows = parseCsv('id,name\n"a,b","line\nTwo"\n');
  assert.deepEqual(rows, [
    ["id", "name"],
    ["a,b", "line\nTwo"],
  ]);
});

test("csvObjects maps headers", () => {
  const records = csvObjects("key,value\nname,PIWC Antwerp\n");
  assert.deepEqual(records, [{ key: "name", value: "PIWC Antwerp" }]);
});
