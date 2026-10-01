import React, { useState } from "react";
// Does not import or initialize the old service; simply preserves existing browser data.
export function LegacyBackup() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  function backup() {
    try {
      const records: Record<string, unknown> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        if (!key.startsWith("aei_") || /pin|session/i.test(key)) continue;
        const text = localStorage.getItem(key)!;
        try {
          records[key] = JSON.parse(text, (k, v) =>
            /^(pin|password|token)$/i.test(k) ? undefined : v,
          );
        } catch {
          records[key] = text;
        }
      }
      if (!Object.keys(records).length) {
        setError("لا توجد بيانات قديمة في هذا المتصفح.");
        return;
      }
      const blob = new Blob(
        [
          JSON.stringify(
            {
              created_at: new Date().toISOString(),
              source: "legacy-browser",
              records,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `AEI_browser_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      setSaved(true);
      setError("");
    } catch {
      setError("تعذر استخراج النسخة المحلية. لا تمسح بيانات المتصفح.");
    }
  }
  return (
    <details className="panel">
      <summary>حفظ بيانات النسخة السابقة من هذا المتصفح</summary>
      <p>
        إذا عملت على النظام القديم من هذا الجهاز، احفظ نسخة للمصالحة قبل بدء
        التشغيل الجديد. لا تُحذف البيانات ولا تُنقل عبر الشبكة، ولا تتضمن النسخة
        رموز الدخول.
      </p>
      <button type="button" onClick={backup}>
        تنزيل نسخة البيانات السابقة
      </button>
      {saved && (
        <p>تم بدء التنزيل. احتفظ بالملف في مكان خاص وسلّمه لمسؤول الترحيل.</p>
      )}
      {error && <p role="alert">{error}</p>}
    </details>
  );
}
