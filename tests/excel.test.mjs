import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import fs from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import ExcelJS from "exceljs";
const require = createRequire(import.meta.url);
const compile = (p) =>
  ts.transpileModule(fs.readFileSync(p, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
const url = (source) =>
  "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const model = url(compile("src/hr/model.ts"));
const code = compile("src/hr/excel.ts")
  .replace('"./model"', JSON.stringify(model))
  .replace(
    '"exceljs"',
    JSON.stringify(pathToFileURL(require.resolve("exceljs")).href),
  );
const { createWorkbook } = await import(url(code));
const data = {
  period: { month: "2026-09-01", status: "closed", revision: 2 },
  generated_at: "2026-10-01T00:00:00Z",
  points: [],
  leaves: [],
  resignations: [],
  transfers: [],
  employees: [
    {
      id: "1",
      national_id: "001234567",
      point_id: null,
      status: "نشط",
      started_on: "2026-09-01",
      data: {
        full_name_ar: "موظف اختباري",
        phone: "0590000000",
        notes: '=HYPERLINK("https://invalid.example")',
        pin: "never-export",
        family_count: 0,
      },
    },
  ],
};
test("monthly workbook contains all approved fields, preserves zeros and excludes PIN", async () => {
  const workbook = createWorkbook(data, "employees");
  const bytes = await workbook.xlsx.writeBuffer();
  const loaded = new ExcelJS.Workbook();
  await loaded.xlsx.load(bytes);
  const sheet = loaded.getWorksheet("موظفو الشهر");
  assert.equal(sheet.rowCount, 2);
  assert.equal(sheet.getCell("A2").value, "001234567");
  assert.equal(sheet.columnCount, 38);
  const headers = sheet.getRow(1).values;
  const phoneCol = headers.indexOf("رقم الجوال");
  assert.equal(sheet.getRow(2).getCell(phoneCol).value, "0590000000");
  const notesCol = headers.indexOf("ملاحظات");
  assert.equal(typeof sheet.getRow(2).getCell(notesCol).value, "string");
  assert.equal(sheet.getRow(2).getCell(notesCol).formula, undefined);
  assert.ok(!JSON.stringify(sheet.getRow(2).values).includes("never-export"));
  assert.equal(sheet.views[0].rightToLeft, true);
  assert.equal(loaded.getWorksheet("معلومات التقرير").getCell("B4").value, 2);
});
test("filtered empty results remain empty, not replaced by all employees", () => {
  assert.equal(
    createWorkbook(data, "employees", []).getWorksheet("موظفو الشهر").rowCount,
    1,
  );
});
