import React, { useEffect, useId, useRef } from "react";
import { monthLabel, type Period } from "./model";
export function MonthPicker({
  periods,
  value,
  onChange,
}: {
  periods: Period[];
  value: string;
  onChange: (value: string) => void;
}) {
  const sorted = [...periods].sort((a, b) => a.month.localeCompare(b.month));
  const index = sorted.findIndex((x) => x.month === value);
  return (
    <section className="month-picker" aria-label="اختيار شهر العمل">
      <div>
        <strong>شهر العمل</strong>
        <small>جميع البيانات والتقارير مرتبطة بالشهر المختار</small>
      </div>
      <div className="actions">
        <button
          disabled={index <= 0}
          onClick={() => onChange(sorted[index - 1].month)}
        >
          الشهر السابق
        </button>
        <label>
          <span className="sr-only">الشهر والسنة</span>
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            {sorted.map((p) => (
              <option value={p.month} key={p.month}>
                {monthLabel(p.month)}
              </option>
            ))}
          </select>
        </label>
        <button
          disabled={index < 0 || index >= sorted.length - 1}
          onClick={() => onChange(sorted[index + 1].month)}
        >
          الشهر التالي
        </button>
        <button onClick={() => onChange(sorted[sorted.length - 1].month)}>
          الشهر الحالي
        </button>
      </div>
    </section>
  );
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const el = ref.current;
    const previous = document.activeElement as HTMLElement;
    el?.showModal();
    return () => {
      el?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby={id} onCancel={onClose}>
      <div className="dialog-head">
        <h2 id={id}>{title}</h2>
        <button type="button" aria-label="إغلاق" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}
export function Empty({
  text = "لا توجد سجلات لهذا الشهر أو لهذه التصفية.",
}: {
  text?: string;
}) {
  return <p className="empty">{text}</p>;
}
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge">{children}</span>;
}
