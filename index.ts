// Edge Function: photo-ai
// action "index"  : يحلل صورة (وصف عربي لو مفيش وصف + بصمة معنى) ويخزنهم.
// action "search" : يحوّل نص أو صورة لبصمة ويرجّع ids أقرب الصور المقبولة.
// المفتاح GEMINI_API_KEY بيتحط كـ secret في Supabase، ومش موجود في أي ملف للموقع.
import { createClient } from "npm:@supabase/supabase-js@2";

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const EMBED_MODEL = Deno.env.get("GEMINI_EMBED_MODEL") ?? "gemini-embedding-2";
const TEXT_MODEL = Deno.env.get("GEMINI_TEXT_MODEL") ?? "gemini-2.5-flash-lite";
const ADMIN_EMAIL = (Deno.env.get("ADMIN_EMAIL") ?? "ms2355416@gmail.com").toLowerCase();
const ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://ms2355416-blip.github.io";
const DIM = 768;
const API = "https://generativelanguage.googleapis.com/v1beta/models/";
const OK_MIME = ["image/jpeg", "image/png", "image/webp"];

const CORS = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
  auth: { persistSession: false },
});

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
const vecStr = (v: number[]) => {
  const n = Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
  return "[" + v.map((x) => x / n).join(",") + "]";
};

async function gem(model: string, method: string, body: unknown) {
  const r = await fetch(`${API}${model}:${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`gemini ${r.status}: ${String(j?.error?.message ?? "").slice(0, 160)}`);
  return j;
}

async function embed(part: Record<string, unknown>): Promise<string> {
  const j = await gem(EMBED_MODEL, "embedContent", { content: { parts: [part] }, outputDimensionality: DIM });
  const v = j?.embedding?.values;
  if (!Array.isArray(v) || v.length !== DIM) throw new Error("bad embedding shape");
  return vecStr(v);
}

async function describe(mime: string, b64: string): Promise<string> {
  const j = await gem(TEXT_MODEL, "generateContent", {
    contents: [{
      parts: [
        { text: "اكتب وصفًا قصيرًا بالعربي لهذه الصورة في جملة أو جملتين (لا يزيد عن 150 حرفًا): الموضوع الرئيسي والألوان والجو العام. اكتب الوصف فقط بدون مقدمات أو علامات تنسيق." },
        { inlineData: { mimeType: mime, data: b64 } },
      ],
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
  });
  const parts = j?.candidates?.[0]?.content?.parts ?? [];
  const txt = parts.map((p: { text?: string }) => p.text ?? "").join("").trim();
  return txt.replace(/[*#`]/g, "").slice(0, 300);
}

const lastCall = new Map<string, number>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!GEMINI_KEY) return json({ error: "GEMINI_API_KEY secret مش متضاف في Supabase" }, 500);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: u, error: ue } = await admin.auth.getUser(token);
  if (ue || !u?.user) return json({ error: "سجّل دخولك الأول" }, 401);
  const user = u.user;
  const isAdmin = (user.email ?? "").toLowerCase() === ADMIN_EMAIL;

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  try {
    if (body.action === "index") {
      const id = String(body.photo_id ?? "");
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "bad id" }, 400);
      const { data: p } = await admin.from("photos")
        .select("id,user_id,thumb_path,view_path,description,ai_status").eq("id", id).maybeSingle();
      if (!p) return json({ error: "الصورة مش موجودة" }, 404);
      if (p.user_id !== user.id && !isAdmin) return json({ error: "مش مسموح" }, 403);
      if (p.ai_status === "done") return json({ ok: true, skipped: true });

      const path = p.thumb_path || p.view_path;
      if (!path) return json({ error: "مفيش نسخة مصغرة للصورة" }, 422);
      const { data: blob, error: de } = await admin.storage.from("photos").download(path);
      if (de || !blob) return json({ error: "تعذّر قراءة الصورة من التخزين" }, 500);
      const mime = OK_MIME.includes(blob.type) ? blob.type : "image/webp";
      const b64 = toB64(new Uint8Array(await blob.arrayBuffer()));

      const embedding = await embed({ inlineData: { mimeType: mime, data: b64 } });
      let description = "";
      if (!String(p.description ?? "").trim()) {
        try { description = await describe(mime, b64); } catch (e) { console.warn("describe failed", String(e)); }
      }
      const upd: Record<string, unknown> = { embedding, ai_status: "done" };
      if (description) upd.description = description;
      const { error: upe } = await admin.from("photos").update(upd).eq("id", id);
      if (upe) throw new Error(upe.message);
      return json({ ok: true, described: !!description });
    }

    if (body.action === "search") {
      const now = Date.now();
      if (now - (lastCall.get(user.id) ?? 0) < 1500) return json({ error: "استنى ثانيتين وجرب تاني" }, 429);
      lastCall.set(user.id, now);

      let part: Record<string, unknown> | null = null;
      if (typeof body.text === "string" && body.text.trim()) {
        part = { text: body.text.trim().slice(0, 300) };
      } else if (typeof body.image_b64 === "string") {
        const mime = String(body.mime ?? "image/webp");
        if (!OK_MIME.includes(mime)) return json({ error: "صيغة غير مدعومة" }, 400);
        if (body.image_b64.length > 600_000) return json({ error: "الصورة كبيرة" }, 413);
        part = { inlineData: { mimeType: mime, data: body.image_b64 } };
      }
      if (!part) return json({ error: "مفيش نص أو صورة" }, 400);

      const q = await embed(part);
      const { data, error } = await admin.rpc("match_photos", { query_embedding: q, match_count: 24 });
      if (error) throw new Error(error.message);
      return json({ ids: (data ?? []).map((r: { id: string }) => r.id) });
    }

    return json({ error: "action غير معروف" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message ?? e).slice(0, 200) }, 500);
  }
});
