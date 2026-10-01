export type Role =
  "super_admin" | "coordinator" | "supervisor" | "hr_observer" | "employee";
export const roleLabels: Record<Role, string> = {
  super_admin: "مدير النظام",
  coordinator: "منسقة المشروع",
  supervisor: "مشرف ميداني",
  hr_observer: "متابعة الموارد البشرية",
  employee: "موظف",
};
export interface Profile {
  id: string;
  name: string;
  role: Role;
  active: boolean;
  employee_id: string | null;
  must_change_password: boolean;
}
export type Values = Record<string, string | number | boolean | null>;
export interface Employee {
  id: string;
  national_id: string;
  point_id: string | null;
  data: Values;
  status: string;
  started_on: string;
  ended_on: string | null;
  version: number;
  updated_at: string;
}
export interface Point {
  id: string;
  name: string;
  data: Values;
  status: string;
}
export interface Request {
  id: string;
  employee_id: string;
  point_id: string | null;
  employee_name: string;
  national_id: string;
  status: string;
  start_date?: string;
  end_date?: string;
  last_working_date?: string;
  data: Values;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  version: number;
}
export interface Asset {
  id: string;
  employee_id: string | null;
  point_id: string;
  name: string;
  quantity: number;
  returned: boolean;
  created_at: string;
}
export interface Period {
  month: string;
  status: "open" | "review" | "closed";
  closed_at: string | null;
  revision: number;
}
export interface Report {
  period: Period;
  employees: Employee[];
  points: Point[];
  leaves: Request[];
  resignations: Request[];
  transfers: {
    id: string;
    employee_id: string;
    data: Values;
    created_at: string;
  }[];
  generated_at: string;
}
export const employeeFields: {
  key: string;
  label: string;
  group: string;
  type?: string;
  required?: boolean;
  options?: string[];
}[] = [
  {
    key: "full_name_ar",
    label: "الاسم الرباعي بالعربية",
    group: "البيانات الشخصية",
    required: true,
  },
  {
    key: "full_name_en",
    label: "الاسم بالإنجليزية",
    group: "البيانات الشخصية",
  },
  {
    key: "birth_date",
    label: "تاريخ الميلاد",
    group: "البيانات الشخصية",
    type: "date",
  },
  {
    key: "marital_status",
    label: "الحالة الاجتماعية",
    group: "البيانات الشخصية",
    options: ["أعزب", "متزوج", "مطلق", "أرمل"],
  },
  {
    key: "family_count",
    label: "عدد أفراد الأسرة",
    group: "البيانات الشخصية",
    type: "number",
  },
  {
    key: "children_under_5",
    label: "الأطفال دون الخامسة",
    group: "البيانات الشخصية",
    type: "number",
  },
  { key: "phone", label: "رقم الجوال", group: "التواصل", required: true },
  { key: "email", label: "البريد الإلكتروني", group: "التواصل", type: "email" },
  {
    key: "category",
    label: "الفئة",
    group: "العمل",
    options: ["موظف", "متطوع", "أمن", "منسق", "مشرف"],
  },
  { key: "job_title", label: "المسمى الوظيفي", group: "العمل", required: true },
  { key: "department", label: "القسم والبرنامج", group: "العمل" },
  { key: "supervisor_name", label: "المشرف المباشر", group: "العمل" },
  {
    key: "degree",
    label: "الدرجة العلمية",
    group: "المؤهلات",
    options: ["إعدادي", "ثانوي", "دبلوم", "بكالوريوس", "ماجستير", "دكتوراه"],
  },
  { key: "major", label: "التخصص", group: "المؤهلات" },
  { key: "graduation_year", label: "سنة التخرج", group: "المؤهلات" },
  { key: "university", label: "الجامعة", group: "المؤهلات" },
  {
    key: "university_other",
    label: "جامعة أخرى أو آخر مؤهل",
    group: "المؤهلات",
  },
  { key: "license_number", label: "رقم المزاولة", group: "المؤهلات" },
  {
    key: "license_date",
    label: "تاريخ المزاولة",
    group: "المؤهلات",
    type: "date",
  },
  { key: "current_gov", label: "المحافظة الحالية", group: "السكن" },
  { key: "current_address", label: "العنوان الحالي", group: "السكن" },
  {
    key: "housing_type",
    label: "طبيعة السكن",
    group: "السكن",
    options: [
      "ملك",
      "إيجار",
      "نزوح - مدرسة إيواء",
      "نزوح - خيمة",
      "استضافة لدى أقارب",
      "أخرى",
    ],
  },
  { key: "prewar_gov", label: "المحافظة قبل الحرب", group: "السكن" },
  { key: "prewar_address", label: "العنوان قبل الحرب", group: "السكن" },
  {
    key: "payment_method",
    label: "طريقة استلام المستحقات",
    group: "البيانات المالية",
    options: ["حساب بنك فلسطين", "كود جوال باي / محفظة", "حوالة نقدية أخرى"],
  },
  {
    key: "iban_or_phone",
    label: "آيبان الدولار أو رقم المحفظة",
    group: "البيانات المالية",
  },
  { key: "bank_account", label: "رقم الحساب", group: "البيانات المالية" },
  { key: "bank_branch", label: "فرع البنك", group: "البيانات المالية" },
  {
    key: "photo_path",
    label: "الصورة الشخصية",
    group: "المرفقات",
    type: "file",
  },
  {
    key: "id_card_path",
    label: "صورة الهوية وملحقها",
    group: "المرفقات",
    type: "file",
  },
  { key: "notes", label: "ملاحظات", group: "الإقرار" },
  {
    key: "declaration_agreed",
    label: "إقرار صحة البيانات",
    group: "الإقرار",
    type: "checkbox",
  },
];
export function currentMonth(date = new Date()): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hebron",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  return `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}-01`;
}
export function localToday(date = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hebron",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return `${p.find((x) => x.type === "year")!.value}-${p.find((x) => x.type === "month")!.value}-${p.find((x) => x.type === "day")!.value}`;
}
export function employmentLabel(e: Employee, report: Report) {
  const end = monthEnd(report.period.month);
  const today = localToday();
  const asOf = today < end ? today : end;
  if (e.started_on > asOf) return "لم يبدأ بعد";
  if (e.ended_on && e.ended_on < asOf) return "منتهية الخدمة";
  if (
    report.leaves.some(
      (l) =>
        l.employee_id === e.id &&
        l.status === "معتمد_نهائي" &&
        l.start_date! <= asOf &&
        l.end_date! >= asOf,
    )
  )
    return "مجاز";
  return e.status;
}
export function monthLabel(month: string) {
  return new Intl.DateTimeFormat("ar-PS", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(month + "T12:00:00Z"));
}
export function monthEnd(month: string) {
  const d = new Date(month + "T12:00:00Z");
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12))
    .toISOString()
    .slice(0, 10);
}
export function daysInMonth(start: string, end: string, month: string) {
  const from = start > month ? start : month;
  const to = end < monthEnd(month) ? end : monthEnd(month);
  return Math.max(
    0,
    Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1,
  );
}
export function canManage(role: Role) {
  return role === "super_admin" || role === "coordinator";
}
export const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String(error.message)
      : "تعذر تنفيذ العملية. حاول مجددًا.";
