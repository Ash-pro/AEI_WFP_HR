import ExcelJS from "exceljs";
import {
  daysInMonth,
  employeeFields,
  monthLabel,
  type Report,
  type Values,
} from "./model";
export function employeeRows(data: Report): Values[] {
  return data.employees.map((e) => ({
    national_id: e.national_id,
    ...e.data,
    point_name:
      data.points.find((p) => p.id === e.point_id)?.name || "غير مرتبط بنقطة",
    status: e.status,
    started_on: e.started_on,
    ended_on: e.ended_on || "",
    updated_at: e.updated_at,
  }));
}
export function requestRows(
  data: Report,
  kind: "leaves" | "resignations",
): Values[] {
  return data[kind].map((r) => ({
    id: r.id,
    national_id: r.national_id,
    employee_name: r.employee_name,
    point_name:
      data.points.find((p) => p.id === r.point_id)?.name || "غير محدد",
    ...r.data,
    status: r.status,
    start_date: r.start_date || "",
    end_date: r.end_date || "",
    last_working_date: r.last_working_date || "",
    month_days:
      r.start_date && r.end_date
        ? daysInMonth(r.start_date, r.end_date, data.period.month)
        : "",
    created_at: r.created_at,
    reviewed_at: r.reviewed_at || "",
  }));
}
const staffColumns = [
  ["national_id", "رقم الهوية"],
  ...employeeFields.map((f) => [f.key, f.label]),
  ["point_name", "نقطة العمل"],
  ["status", "حالة الملف"],
  ["started_on", "بدء العمل"],
  ["ended_on", "آخر يوم عمل"],
  ["updated_at", "آخر تحديث"],
];
const leaveColumns = [
  ["id", "رقم الطلب"],
  ["national_id", "الهوية"],
  ["employee_name", "الموظف"],
  ["point_name", "النقطة"],
  ["leave_type", "نوع الإجازة"],
  ["start_date", "من"],
  ["end_date", "إلى"],
  ["month_days", "الأيام داخل الشهر"],
  ["status", "الاعتماد"],
  ["notes", "الملاحظات"],
  ["created_at", "تقديم الطلب"],
  ["reviewed_at", "آخر اعتماد"],
];
const resignationColumns = [
  ["id", "رقم الطلب"],
  ["national_id", "الهوية"],
  ["employee_name", "الموظف"],
  ["point_name", "النقطة"],
  ["last_working_date", "آخر يوم عمل"],
  ["reason", "السبب"],
  ["replacement_name", "البديل"],
  ["clearance_completed", "إخلاء العهد"],
  ["status", "الاعتماد"],
  ["created_at", "تقديم الطلب"],
  ["reviewed_at", "تاريخ القرار"],
];
export function createWorkbook(
  data: Report,
  kind: "employees" | "leaves" | "resignations" | "all",
  filtered?: Values[],
) {
  const book = new ExcelJS.Workbook();
  book.creator = "AEI HR";
  book.created = new Date();
  function sheet(name: string, columns: string[][], rows: Values[]) {
    const s = book.addWorksheet(name, {
      views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }],
      pageSetup: {
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    });
    s.columns = columns.map(([key, header]) => ({ key, header, width: 25 }));
    for (const row of rows) {
      const clean: Values = {};
      for (const [key] of columns) {
        const v = row[key];
        clean[key] = typeof v === "boolean" ? (v ? "نعم" : "لا") : (v ?? "");
      }
      s.addRow(clean);
    }
    s.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, s.rowCount), column: columns.length },
    };
    s.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    s.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF532B68" },
    };
    s.eachRow((row) => {
      row.alignment = {
        vertical: "middle",
        horizontal: "right",
        wrapText: true,
      };
    });
    s.getRow(1).height = 32;
  }
  sheet(
    "معلومات التقرير",
    [
      ["name", "البيان"],
      ["value", "القيمة"],
    ],
    [
      { name: "الشهر", value: monthLabel(data.period.month) },
      {
        name: "حالة الشهر",
        value:
          data.period.status === "closed"
            ? "مغلق ومعتمد"
            : data.period.status === "review"
              ? "قيد المراجعة"
              : "مفتوح — بيانات حتى وقت الاستخراج",
      },
      { name: "الإصدار", value: data.period.revision },
      { name: "وقت البيانات", value: data.generated_at },
      {
        name: "النطاق",
        value: filtered
          ? "نتائج البحث والتصفية"
          : "جميع السجلات ضمن صلاحية الحساب",
      },
    ],
  );
  if (kind === "employees" || kind === "all")
    sheet("موظفو الشهر", staffColumns, filtered || employeeRows(data));
  if (kind === "leaves" || kind === "all")
    sheet("الإجازات", leaveColumns, filtered || requestRows(data, "leaves"));
  if (kind === "resignations" || kind === "all")
    sheet(
      "الاستقالات",
      resignationColumns,
      filtered || requestRows(data, "resignations"),
    );
  if (kind === "all")
    sheet(
      "التنقلات",
      [
        ["employee", "الموظف"],
        ["from", "من نقطة"],
        ["to", "إلى نقطة"],
        ["date", "تاريخ النقل"],
        ["reason", "السبب"],
      ],
      data.transfers.map((t) => ({
        employee:
          data.employees.find((e) => e.id === t.employee_id)?.data
            .full_name_ar || t.employee_id,
        from:
          data.points.find((p) => p.id === t.data.from_point)?.name ||
          String(t.data.from_point || ""),
        to:
          data.points.find((p) => p.id === t.data.to_point)?.name ||
          String(t.data.to_point || ""),
        date: t.created_at,
        reason: t.data.reason || "",
      })),
    );
  return book;
}
export async function exportReport(
  data: Report,
  kind: "employees" | "leaves" | "resignations" | "all",
  filtered?: Values[],
) {
  const bytes = await createWorkbook(data, kind, filtered).xlsx.writeBuffer();
  const href = URL.createObjectURL(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = href;
  link.download = `AEI_HR_${data.period.month.slice(0, 7)}_${kind}_v${data.period.revision}.xlsx`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 30000);
}
