import assert from "node:assert/strict";
import test from "node:test";
import { parsePrayerRequest } from "./prayer.ts";

const valid = {
  name: "Ama",
  contact: "ama@example.com",
  request: "Please pray for my family this week.",
  shareWithCongregation: false,
  consent: true,
};

test("accepts a private prayer request", () => {
  const result = parsePrayerRequest(valid, "");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.name, "Ama");
    assert.equal(result.value.shareWithCongregation, false);
  }
});

test("requires consent", () => {
  const result = parsePrayerRequest({ ...valid, consent: false }, "");
  assert.equal(result.ok, false);
});

test("rejects a request that is too short", () => {
  const result = parsePrayerRequest({ ...valid, request: "Amen" }, "");
  assert.equal(result.ok, false);
});

test("rejects a filled honeypot", () => {
  const result = parsePrayerRequest(valid, "acme");
  assert.equal(result.ok, false);
});

test("trims and keeps an optional name empty", () => {
  const result = parsePrayerRequest({ ...valid, name: "   ", contact: "" }, "");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.name, "");
    assert.equal(result.value.contact, "");
  }
});
