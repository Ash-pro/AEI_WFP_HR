import React, { useState } from "react";
import {
  employeeFields,
  message,
  type Employee,
  type Point,
  type Values,
} from "./model";
import { rpc } from "./api";
interface ImportRow {
  id: string | null;
  version?: number;
  national_id: string;
  point_id: string | null;
  started_on: string;
  data: Values;
}
export function ImportEmployees({
  employees,
  points,
  month,
  onSaved,
}: {
  employees: Employee[];
  points: Point[];
  month: string;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [batch] = useState(crypto.randomUUID());
  async function read(file: File) {
    setBusy(true);
    setErrors([]);
    setRows([]);
    try {
      if (file.size > 8 * 1024 * 1024)
        throw new Error("حجم الملف الأقصى 8 ميجابايت.");
      const { default: ExcelJS } = await import("exceljs");
      const book = new ExcelJS.Workbook();
      await book.xlsx.load(await file.arrayBuffer());
      const sheet = book.getWorksheet("موظفو الشهر") || book.worksheets[0];
      if (!sheet) throw new Error("الملف لا يحتوي ورقة بيانات.");
      const headers = new Map<string, number>();
      sheet
        .getRow(1)
        .eachCell((cell, col) => headers.set(cell.text.trim(), col));
      if (!headers.has("رقم الهوية"))
        throw new Error(
          "يجب وجود عمود رقم الهوية. استخدم ملف تصدير الموظفين كقالب.",
        );
      const parsed: ImportRow[] = [];
      const problems: string[] = [];
      const ids = new Set<string>();
      sheet.eachRow((row, n) => {
        if (n === 1) return;
        const value = (name: string) =>
          headers.has(name)
            ? row.getCell(headers.get(name)!).text.trim()
            : undefined;
        const national_id = value("رقم الهوية") || "";
        if (!national_id) return;
        if (!/^\d{9}$/.test(national_id) || ids.has(national_id)) {
          problems.push(`السطر ${n}: هوية غير صحيحة أو مكررة.`);
          return;
        }
        ids.add(national_id);
        const old = employees.find((e) => e.national_id === national_id);
        const data = { ...old?.data };
        for (const field of employeeFields) {
          const v = value(field.label);
          if (v === undefined || v === "") continue;
          if (field.type === "file") continue;
          if (field.type === "checkbox")
            data[field.key] = v === "نعم" || v === "true";
          else if (field.type === "number") {
            const number = Number(v);
            if (!Number.isInteger(number) || number < 0)
              problems.push(`السطر ${n}: ${field.label} غير صالح.`);
            else data[field.key] = number;
          } else data[field.key] = v;
        }
        const pointName = value("نقطة العمل");
        let point_id = old?.point_id || null;
        if (pointName && pointName !== "غير مرتبط بنقطة") {
          const matching = points.filter(
            (p) =>
              p.name === pointName &&
              (!data.supervisor_name ||
                p.data.supervisor_name === data.supervisor_name),
          );
          if (matching.length !== 1) {
            problems.push(
              `السطر ${n}: النقطة غير معروفة أو لها أكثر من إشراف؛ حدد المشرف الصحيح.`,
            );
            return;
          }
          if (old && old.point_id !== matching[0].id) {
            problems.push(
              `السطر ${n}: تغيير النقطة يحتاج إجراء النقل المستقل.`,
            );
            return;
          }
          point_id = matching[0].id;
        }
        if (!data.full_name_ar || !data.phone || !data.job_title)
          problems.push(`السطر ${n}: الاسم والهاتف والمسمى الوظيفي مطلوبة.`);
        parsed.push({
          id: old?.id || null,
          version: old?.version,
          national_id,
          point_id,
          started_on: old?.started_on || month,
          data,
        });
      });
      if (parsed.length > 500)
        throw new Error("قسّم الاستيراد إلى دفعات لا تتجاوز 500 موظف.");
      setRows(parsed);
      setErrors(problems);
    } catch (e) {
      setErrors([message(e)]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await rpc("hr_import_employees", {
            p_rows: rows,
            p_reason: reason,
            p_batch: batch,
          });
          onSaved();
        } catch (err) {
          setErrors([message(err)]);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="notice">
        تُستورد الحقول الموجودة وغير الفارغة فقط. لا يغير الاستيراد الحالة
        الوظيفية أو PIN أو المرفقات أو نقطة الموظف الحالي. راجع الفروق قبل
        الحفظ.
      </p>
      <label>
        ملف Excel
        <input
          type="file"
          accept=".xlsx"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void read(f);
          }}
        />
      </label>
      {errors.map((err, i) => (
        <p className="notice error" key={i}>
          {err}
        </p>
      ))}
      {rows.length > 0 && (
        <>
          <p>
            {rows.filter((r) => !r.id).length} موظف جديد ·{" "}
            {rows.filter((r) => r.id).length} تحديث
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الهوية</th>
                  <th>الاسم</th>
                  <th>الإجراء والفروق</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const old = employees.find((e) => e.id === r.id);
                  return (
                    <tr key={r.national_id}>
                      <td>{r.national_id}</td>
                      <td>{String(r.data.full_name_ar || "")}</td>
                      <td>
                        {old ? (
                          <details>
                            <summary>مراجعة الحقول المتغيرة</summary>
                            {employeeFields
                              .filter((f) => r.data[f.key] !== old.data[f.key])
                              .map((f) => (
                                <p key={f.key}>
                                  {f.label}: {String(old.data[f.key] ?? "—")} ←{" "}
                                  {String(r.data[f.key] ?? "—")}
                                </p>
                              ))}
                          </details>
                        ) : (
                          "إضافة ملف معلق للاعتماد"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <label>
            سبب الاستيراد
            <textarea
              required
              minLength={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button className="primary" disabled={busy || errors.length > 0}>
            اعتماد وحفظ الدفعة
          </button>
        </>
      )}
    </form>
  );
}
