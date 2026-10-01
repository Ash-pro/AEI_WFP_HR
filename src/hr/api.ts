import { createClient } from "@supabase/supabase-js";
import type { Profile, Report, Period, Values } from "./model";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured = Boolean(url && key);
export const db = createClient(
  url || "https://not-configured.supabase.co",
  key || "not-configured",
);
export async function rpc<T>(
  name: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}
export async function profile(): Promise<Profile | null> {
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) return null;
  const result = await db
    .from("hr_profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (result.error)
    throw new Error(
      "تعذر تحميل صلاحيات الحساب. تحقق من تفعيل قاعدة البيانات وحسابك.",
    );
  if (!result.data.active) throw new Error("هذا الحساب موقوف. راجع الإدارة.");
  return result.data;
}
export const periods = () => rpc<Period[]>("hr_list_periods");
export const report = (month: string) =>
  rpc<Report>("hr_report", { p_month: month });
export const mutate = <T = unknown>(
  action: string,
  id: string | null,
  payload: Record<string, unknown>,
) => rpc<T>("hr_mutate", { p_action: action, p_id: id, p_payload: payload });
export async function account(
  action: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await db.functions.invoke("hr-accounts", {
    body: { action, ...payload },
  });
  if (error) {
    let reason = "تعذر تنفيذ عملية الحساب. تحقق من الاتصال وصلاحياتك.";
    try {
      reason = (await error.context.json()).error || reason;
    } catch {}
    throw new Error(reason);
  }
  if (data?.error) throw new Error(data.error);
  if (action === "change_password" && data?.session) {
    const result = await db.auth.setSession(data.session);
    if (result.error) throw result.error;
  }
  return data;
}
export async function upload(file: File, employeeId: string) {
  if (
    file.size > 8 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "application/pdf"].includes(file.type)
  )
    throw new Error("المسموح: JPG أو PNG أو PDF بحجم حتى 8 ميجابايت.");
  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : "jpg";
  const path = `${employeeId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage
    .from("hr-private-documents")
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error("فشل رفع الملف؛ لم يُحفظ المرفق. أعد المحاولة.");
  return path;
}
export async function openDocument(path: string) {
  const popup = window.open("about:blank", "_blank");
  if (!popup)
    throw new Error("اسمح بفتح نافذة المرفق في المتصفح ثم أعد المحاولة.");
  popup.opener = null;
  try {
    const { data, error } = await db.storage
      .from("hr-private-documents")
      .createSignedUrl(path, 60);
    if (error) throw new Error(error.message);
    popup.location.replace(data.signedUrl);
  } catch (error) {
    popup.close();
    throw error;
  }
}
export async function downloadReport(
  data: Report,
  kind: "employees" | "leaves" | "resignations" | "all",
  rows?: Values[],
) {
  const { exportReport } = await import("./excel");
  await rpc("hr_log_export", {
    p_month: data.period.month,
    p_kind: kind,
    p_scope: rows ? "filtered" : "all",
  });
  await exportReport(data, kind, rows);
}
