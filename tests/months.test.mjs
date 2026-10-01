import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import fs from "node:fs";
const source = ts.transpileModule(fs.readFileSync("src/hr/model.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ES2020 },
}).outputText;
const { daysInMonth, currentMonth, monthEnd } = await import(
  "data:text/javascript;base64," + Buffer.from(source).toString("base64")
);
test("leave across months is split inclusively", () => {
  assert.equal(daysInMonth("2026-09-29", "2026-10-03", "2026-09-01"), 2);
  assert.equal(daysInMonth("2026-09-29", "2026-10-03", "2026-10-01"), 3);
});
test("year rollover and leap year", () => {
  assert.equal(daysInMonth("2026-12-31", "2027-01-02", "2027-01-01"), 2);
  assert.equal(monthEnd("2028-02-01"), "2028-02-29");
  assert.equal(daysInMonth("2026-01-01", "2026-01-02", "2026-02-01"), 0);
});
test("Hebron timezone decides month independent of browser timezone", () => {
  assert.equal(currentMonth(new Date("2026-09-30T22:30:00Z")), "2026-10-01");
});
