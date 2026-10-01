import React, { useState } from "react";
import {
  employeeFields,
  localToday,
  message,
  type Employee,
  type Point,
  type Values,
} from "./model";
import { mutate, rpc, upload } from "./api";
export function EmployeeEditor({
  employee,
  points,
  onSaved,
  self = false,
}: {
  employee?: Employee;
  points: Point[];
  onSaved: () => void;
  self?: boolean;
}) {
  const [data, setData] = useState<Values>(employee?.data || {});
  const [nid, setNid] = useState(employee?.national_id || "");
  const [point, setPoint] = useState(employee?.point_id || "");
  const [start, setStart] = useState(employee?.started_on || localToday());
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const groups = [...new Set(employeeFields.map((f) => f.group))];
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (self)
        await rpc("hr_profile_change", {
          p_employee: employee!.id,
          p_data: data,
          p_reason: reason,
        });
      else
        await mutate("employee_save", employee?.id || null, {
          national_id: nid,
          point_id: point,
          started_on: start,
          data,
          version: employee?.version,
          reason,
        });
      onSaved();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save}>
      <fieldset>
        <legend>الهوية والتكليف</legend>
        <div className="form-grid">
          <label>
            رقم الهوية
            <input
              disabled={self}
              required
              pattern="[0-9]{9}"
              inputMode="numeric"
              maxLength={9}
              value={nid}
              onChange={(e) => setNid(e.target.value)}
            />
          </label>
          <label>
            تاريخ بداية العمل
            <input
              disabled={self}
              required
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label>
            النقطة
            <select
              disabled={!!employee}
              value={point}
              onChange={(e) => setPoint(e.target.value)}
            >
              <option value="">غير مرتبط بنقطة</option>
              {points.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {employee && (
              <small>لتغيير النقطة استخدم إجراء النقل من ملف الموظف.</small>
            )}
          </label>
        </div>
      </fieldset>
      {groups.map((group) => (
        <fieldset key={group}>
          <legend>{group}</legend>
          <div className="form-grid">
            {employeeFields
              .filter(
                (f) =>
                  f.group === group &&
                  (!self ||
                    ![
                      "supervisor_name",
                      "department",
                      "category",
                      "job_title",
                    ].includes(f.key)),
              )
              .map((f) => (
                <label key={f.key}>
                  {f.label}
                  {f.required ? " *" : ""}
                  {f.options ? (
                    <select
                      value={String(data[f.key] || "")}
                      onChange={(e) =>
                        setData({ ...data, [f.key]: e.target.value })
                      }
                    >
                      <option value="">اختر</option>
                      {f.options.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  ) : f.type === "file" ? (
                    <>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        disabled={!employee || busy}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !employee) return;
                          setBusy(true);
                          try {
                            const path = await upload(file, employee.id);
                            setData((old) => ({ ...old, [f.key]: path }));
                          } catch (err) {
                            setError(message(err));
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                      <small>
                        {data[f.key]
                          ? "مرفق محفوظ"
                          : employee
                            ? "حتى 8 ميجابايت"
                            : "احفظ الموظف أولًا ثم أضف المرفقات"}
                      </small>
                    </>
                  ) : f.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={!!data[f.key]}
                      onChange={(e) =>
                        setData({ ...data, [f.key]: e.target.checked })
                      }
                    />
                  ) : (
                    <input
                      required={f.required}
                      type={f.type || "text"}
                      min={f.type === "number" ? 0 : undefined}
                      value={String(data[f.key] ?? "")}
                      onChange={(e) =>
                        setData({
                          ...data,
                          [f.key]:
                            f.type === "number"
                              ? e.target.value === ""
                                ? null
                                : Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ))}
          </div>
        </fieldset>
      ))}
      <label>
        سبب الإضافة أو التعديل
        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <div className="actions">
        <button className="primary" disabled={busy}>
          {busy ? "جارٍ الحفظ…" : "حفظ البيانات"}
        </button>
      </div>
    </form>
  );
}
