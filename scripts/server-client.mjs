import fs from "node:fs";
import https from "node:https";
export function readEnv(path) {
  if (!fs.existsSync(path)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [
          l.slice(0, i).trim(),
          l
            .slice(i + 1)
            .trim()
            .replace(/^['"]|['"]$/g, ""),
        ];
      }),
  );
}
export const config = {
  ...readEnv(".env"),
  ...readEnv(".env.server"),
  ...process.env,
};
export const projectUrl = config.SUPABASE_URL || config.VITE_SUPABASE_URL;
export const serviceKey = config.SUPABASE_SECRET_KEY;
const resolved = new Map();
export async function request(
  path,
  { method = "GET", body, rawBody, headers = {}, management = false } = {},
) {
  const base = new URL(management ? "https://api.supabase.com" : projectUrl);
  if (!resolved.has(base.hostname)) {
    const result = await fetch(
      "https://dns.google/resolve?name=" +
        encodeURIComponent(base.hostname) +
        "&type=A",
    );
    const dns = await result.json();
    const ip = dns.Answer?.find((x) => x.type === 1)?.data;
    if (!ip) throw new Error("Cannot resolve service hostname");
    resolved.set(base.hostname, ip);
  }
  const key = management ? config.SUPABASE_ACCESS_TOKEN : serviceKey;
  if (!key)
    throw new Error(
      management
        ? "SUPABASE_ACCESS_TOKEN is missing in .env.server"
        : "SUPABASE_SECRET_KEY is missing",
    );
  const payload =
    rawBody ?? (body === undefined ? undefined : JSON.stringify(body));
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: base.hostname,
        path,
        method,
        lookup: (_host, opts, cb) =>
          opts.all
            ? cb(null, [{ address: resolved.get(base.hostname), family: 4 }])
            : cb(null, resolved.get(base.hostname), 4),
        headers: {
          ...(management
            ? { Authorization: `Bearer ${key}` }
            : { apikey: key, Authorization: `Bearer ${key}` }),
          ...(payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {}),
          ...headers,
        },
      },
      (response) => {
        let text = "";
        response.on("data", (chunk) => (text += chunk));
        response.on("end", () => {
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
          resolve({
            status: response.statusCode,
            data,
            headers: response.headers,
          });
        });
      },
    );
    req.setTimeout(30000, () => req.destroy(new Error("Request timed out")));
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}
export function ensure(result) {
  if (result.status < 200 || result.status >= 300)
    throw new Error(
      `Service returned HTTP ${result.status}; no credentials or response data printed.`,
    );
  return result.data;
}
