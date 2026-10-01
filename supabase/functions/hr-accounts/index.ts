import { createClient } from "https://esm.sh/@supabase/supabase-js@2.117.2";
const cors = {
  "Access-Control-Allow-Origin":
    Deno.env.get("APP_ORIGIN") || "https://aei-wfp-hr.vercel.app",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const url = Deno.env.get("SUPABASE_URL")!;
const service = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = () =>
  createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
function password() {
  const b = crypto.getRandomValues(new Uint8Array(24));
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  return Array.from(b, (v) => chars[v % chars.length]).join("");
}
function pin() {
  return Array.from(crypto.getRandomValues(new Uint8Array(10)), (v) =>
    String(v % 10),
  ).join("");
}
function check(error: unknown) {
  if (error) throw new Error("تعذر حفظ العملية. راجع إعدادات الخادم.");
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  if (req.method !== "POST") return respond({ error: "طريقة غير مسموحة" }, 405);
  try {
    const b = await req.json();
    if (b.action === "employee_login") {
      if (
        !/^\d{9}$/.test(b.national_id || "") ||
        typeof b.password !== "string"
      )
        return respond({ error: "بيانات الدخول غير صحيحة" }, 400);
      // DB-backed counters are atomic across edge instances. Keys are hashed; no PIN is stored.
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      const digest = async (s: string) =>
        Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
          ),
          (v) => v.toString(16).padStart(2, "0"),
        ).join("");
      for (const [key, limit] of [
        [await digest("nid:" + b.national_id), 10],
        [await digest("ip:" + ip), 50],
      ] as [string, number][]) {
        const rate = await service.rpc("hr_login_limit", {
          p_key: key,
          p_limit: limit,
        });
        check(rate.error);
        if (!rate.data)
          return respond({ error: "محاولات كثيرة؛ حاول بعد 15 دقيقة." }, 429);
      }
      const { data: e } = await service
        .from("hr_employees")
        .select("id,status,ended_on")
        .eq("national_id", b.national_id)
        .maybeSingle();
      const { data: p } = e
        ? await service
            .from("hr_profiles")
            .select("*")
            .eq("employee_id", e.id)
            .eq("active", true)
            .maybeSingle()
        : { data: null };
      if (!p || e?.status !== "نشط")
        return respond(
          { error: "بيانات الدخول غير صحيحة أو الحساب غير مفعّل" },
          401,
        );
      const { data: auth } = await service.auth.admin.getUserById(p.id);
      const { data, error } = await anon().auth.signInWithPassword({
        email: auth.user?.email || "invalid@staff.aei.invalid",
        password: b.password,
      });
      if (error || !data.session)
        return respond(
          { error: "بيانات الدخول غير صحيحة أو الحساب غير مفعّل" },
          401,
        );
      return respond({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }
    const token = (req.headers.get("authorization") || "").replace(
      /^Bearer /,
      "",
    );
    const {
      data: { user },
      error: authError,
    } = await service.auth.getUser(token);
    if (authError || !user) return respond({ error: "الجلسة غير صالحة" }, 401);
    const { data: actor } = await service
      .from("hr_profiles")
      .select("*")
      .eq("id", user.id)
      .eq("active", true)
      .single();
    if (!actor) return respond({ error: "الحساب غير مصرح" }, 403);
    const claims = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (
      (claims.app_metadata?.hr_session_version || 0) !== actor.session_version
    )
      return respond({ error: "انتهت الجلسة؛ سجل الدخول مجددًا" }, 401);
    if (claims.session_id) {
      const { data: revoked } = await service
        .from("hr_revoked_sessions")
        .select("session_id")
        .eq("session_id", claims.session_id)
        .maybeSingle();
      if (revoked)
        return respond({ error: "انتهت الجلسة؛ سجل الدخول مجددًا" }, 401);
    }
    if (b.action === "change_password") {
      if (
        typeof b.new_password !== "string" ||
        (actor.role === "employee"
          ? !/^\d{8,12}$/.test(b.new_password)
          : b.new_password.length < 12)
      )
        return respond(
          { error: "كلمة المرور لا تستوفي الطول أو الصيغة المطلوبة" },
          400,
        );
      const verifier = anon();
      const { error } = await verifier.auth.signInWithPassword({
        email: user.email!,
        password: b.old_password,
      });
      if (error)
        return respond({ error: "كلمة المرور الحالية غير صحيحة" }, 403);
      check(
        (await service.rpc("hr_invalidate_sessions", { p_user: user.id }))
          .error,
      );
      check(
        (
          await service.auth.admin.updateUserById(user.id, {
            password: b.new_password,
            app_metadata: {
              ...user.app_metadata,
              hr_session_version: actor.session_version + 1,
            },
          })
        ).error,
      );
      check(
        (
          await service
            .from("hr_profiles")
            .update({
              must_change_password: false,
              session_version: actor.session_version + 1,
            })
            .eq("id", user.id)
        ).error,
      );
      await verifier.auth.signOut();
      check(
        (
          await service
            .from("hr_audit")
            .insert({
              actor: user.id,
              action: "password_changed",
              record_id: user.id,
            })
        ).error,
      );
      const signed = await anon().auth.signInWithPassword({
        email: user.email!,
        password: b.new_password,
      });
      check(signed.error);
      return respond({
        success: true,
        session: {
          access_token: signed.data.session!.access_token,
          refresh_token: signed.data.session!.refresh_token,
        },
      });
    }
    if (actor.must_change_password)
      return respond({ error: "غيّر كلمة المرور المؤقتة أولًا" }, 403);
    if (
      actor.role !== "super_admin" &&
      !(b.action === "employee_pin" && actor.role === "coordinator")
    )
      return respond({ error: "غير مصرح بإدارة الحسابات" }, 403);
    let result: Record<string, unknown> = { success: true };
    if (b.action === "create") {
      if (
        !/^[a-z0-9._-]{3,40}$/.test(b.username || "") ||
        !["super_admin", "coordinator", "supervisor", "hr_observer"].includes(
          b.role,
        ) ||
        !b.name?.trim()
      )
        return respond({ error: "راجع اسم الدخول والدور واسم الحساب" }, 400);
      const pw = password();
      const { data, error } = await service.auth.admin.createUser({
        email: `${b.username}@accounts.aei.invalid`,
        password: pw,
        email_confirm: true,
      });
      check(error);
      const profile = await service
        .from("hr_profiles")
        .insert({
          id: data.user!.id,
          name: b.name,
          role: b.role,
          must_change_password: true,
        });
      if (profile.error) {
        await service.auth.admin.deleteUser(data.user!.id);
        check(profile.error);
      }
      result = { username: b.username, password: pw };
    } else if (b.action === "employee_pin") {
      const { data: e, error } = await service
        .from("hr_employees")
        .select("id,national_id,data")
        .eq("id", b.id)
        .single();
      check(error);
      const { data: p } = await service
        .from("hr_profiles")
        .select("*")
        .eq("employee_id", b.id)
        .maybeSingle();
      const pw = pin();
      if (p) {
        check(
          (await service.rpc("hr_invalidate_sessions", { p_user: p.id })).error,
        );
        check(
          (
            await service.auth.admin.updateUserById(p.id, {
              password: pw,
              app_metadata: { hr_session_version: p.session_version + 1 },
            })
          ).error,
        );
        check(
          (
            await service
              .from("hr_profiles")
              .update({
                must_change_password: true,
                session_version: p.session_version + 1,
              })
              .eq("id", p.id)
          ).error,
        );
      } else {
        const { data, error } = await service.auth.admin.createUser({
          email: `${e!.id}@staff.aei.invalid`,
          password: pw,
          email_confirm: true,
        });
        check(error);
        const added = await service
          .from("hr_profiles")
          .insert({
            id: data.user!.id,
            name: e!.data.full_name_ar,
            role: "employee",
            employee_id: b.id,
            must_change_password: true,
          });
        if (added.error) {
          await service.auth.admin.deleteUser(data.user!.id);
          check(added.error);
        }
      }
      result = { username: e!.national_id, password: pw };
    } else if (b.action === "reset") {
      if (b.id === user.id)
        return respond({ error: "استخدم تغيير كلمة المرور لحسابك" }, 400);
      const { data: p, error } = await service
        .from("hr_profiles")
        .select("*")
        .eq("id", b.id)
        .single();
      check(error);
      const pw = p!.role === "employee" ? pin() : password();
      check(
        (await service.rpc("hr_invalidate_sessions", { p_user: b.id })).error,
      );
      check(
        (
          await service.auth.admin.updateUserById(b.id, {
            password: pw,
            app_metadata: { hr_session_version: p!.session_version + 1 },
          })
        ).error,
      );
      check(
        (
          await service
            .from("hr_profiles")
            .update({
              must_change_password: true,
              session_version: p!.session_version + 1,
            })
            .eq("id", b.id)
        ).error,
      );
      const { data: a } = await service.auth.admin.getUserById(b.id);
      result = {
        username: a.user?.email?.replace("@accounts.aei.invalid", ""),
        password: pw,
      };
    } else if (b.action === "toggle") {
      if (b.id === user.id || typeof b.active !== "boolean")
        return respond({ error: "إجراء غير صالح" }, 400);
      check(
        (await service.rpc("hr_invalidate_sessions", { p_user: b.id })).error,
      );
      check(
        (
          await service
            .from("hr_profiles")
            .update({ active: b.active })
            .eq("id", b.id)
        ).error,
      );
      check(
        (
          await service.auth.admin.updateUserById(b.id, {
            ban_duration: b.active ? "none" : "876000h",
          })
        ).error,
      );
    } else if (b.action === "assign_points") {
      if (!Array.isArray(b.points))
        return respond({ error: "قائمة النقاط مطلوبة" }, 400);
      check(
        (
          await service.rpc("hr_assign_points", {
            p_actor: user.id,
            p_profile: b.id,
            p_points: b.points,
          })
        ).error,
      );
    } else return respond({ error: "إجراء غير معروف" }, 400);
    check(
      (
        await service
          .from("hr_audit")
          .insert({
            actor: user.id,
            action: b.action,
            record_id: b.id || b.username,
            after_data: { role: b.role, active: b.active },
          })
      ).error,
    );
    return respond(result);
  } catch (_error) {
    return respond(
      { error: "تعذر تنفيذ العملية على الخادم. راجع إعدادات الحساب والاتصال." },
      400,
    );
  }
});
