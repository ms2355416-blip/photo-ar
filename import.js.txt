/* Photo Ar: selected Wikimedia Commons CC0 imports. No provider secret needed. */
(() => {
  "use strict";
  const C = window.PHOTO_AR_CONFIG,
    $ = (s) => document.querySelector(s);
  if (!C || !window.supabase) {
    $("#st-loading").textContent = "تعذر تحميل الإعدادات. أعد تحميل الصفحة.";
    return;
  }
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const EMAIL = String(C.ADMIN_EMAIL).toLowerCase(),
    BUCKET = "pending-photos",
    MAX = 5 * 1024 * 1024;
  let user = null,
    allowed = false,
    busy = false,
    searching = false,
    results = [],
    selected = new Set(),
    cursor = null,
    term = "",
    nextSearchAt = 0;
  const text = (x) =>
    new DOMParser()
      .parseFromString(String(x || ""), "text/html")
      .body.textContent.trim();
  const el = (tag, value) => {
    const n = document.createElement(tag);
    if (value != null) n.textContent = value;
    return n;
  };
  const safe = (value, hosts) => {
    const u = new URL(value);
    if (
      u.protocol !== "https:" ||
      !hosts.includes(u.hostname) ||
      u.username ||
      u.password
    )
      throw Error("رابط مصدر غير مسموح");
    return u.href;
  };
  const sourceUrl = (x) => safe(x, ["commons.wikimedia.org"]);
  const imageUrl = (x) =>
    safe(x, ["upload.wikimedia.org", "thumb.wikimedia.org"]);
  function controls() {
    $("#search-btn").disabled = busy || searching || !allowed;
    $("#next").disabled = busy || searching;
    $("#import-btn").disabled =
      busy || searching || !allowed || !selected.size || !$("#rights").checked;
  }
  function auth(session) {
    user = session?.user || null;
    allowed = !!user && user.email?.toLowerCase() === EMAIL;
    $("#st-loading").hidden = true;
    $("#st-login").hidden = !!user;
    $("#st-denied").hidden = !user || allowed;
    $("#st-bulk").hidden = !allowed;
    selected.clear();
    controls();
  }
  $("#login-title").textContent = "سجّل دخول بحساب الأدمن";
  $("#login-sub").textContent = EMAIL;
  $("#google-label").textContent = "المتابعة بحساب Google";
  $("#or-label").textContent = "أو";
  $("#email-label").textContent = "الإيميل";
  $("#pass-label").textContent = "كلمة السر";
  $("#login-submit").textContent = "تسجيل الدخول";
  $("#denied-title").textContent = "الحساب ده مش حساب الأدمن";
  $("#denied-sub").textContent = EMAIL;
  $("#btn-logout").textContent = "تسجيل الخروج";
  $("#st-loading").textContent = "جاري فحص تسجيل الدخول…";
  sb.auth.onAuthStateChange((event, session) =>
    setTimeout(() => auth(session), 0),
  );
  $("#btn-google").onclick = async () => {
    const r = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: location.origin + location.pathname },
    });
    if (r.error) loginError(r.error.message);
  };
  function loginError(m) {
    $("#login-msg").textContent = m;
    $("#login-msg").hidden = false;
  }
  $("#login-form").onsubmit = async (e) => {
    e.preventDefault();
    $("#login-submit").disabled = true;
    try {
      const r = await sb.auth.signInWithPassword({
        email: $("#a-email").value.trim(),
        password: $("#a-pass").value,
      });
      if (r.error) loginError(r.error.message);
    } finally {
      $("#login-submit").disabled = false;
    }
  };
  $("#btn-logout").onclick = () => sb.auth.signOut();
  function paint() {
    const box = $("#results");
    box.replaceChildren();
    for (const p of results) {
      const card = el("div");
      card.className = "bi";
      const img = el("img");
      img.src = p.preview;
      img.alt = p.title;
      img.loading = "lazy";
      img.style.cssText = "width:100%;aspect-ratio:1;object-fit:cover";
      card.append(img);
      const label = el("label");
      label.style.padding = "10px";
      const check = el("input");
      check.type = "checkbox";
      check.checked = selected.has(p.id);
      check.disabled = busy;
      check.onchange = () => {
        if (check.checked && selected.size >= 5) {
          check.checked = false;
          return alert("اختار لحد ٥ صور في المرة");
        }
        check.checked ? selected.add(p.id) : selected.delete(p.id);
        controls();
      };
      label.append(check, document.createTextNode(" " + p.title));
      card.append(label);
      const credit = el("small", p.creator + " · CC0");
      credit.style.padding = "10px";
      card.append(credit);
      const link = el("a", "افتح المصدر وراجع الحقوق");
      link.href = p.source;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.style.padding = "10px";
      card.append(link);
      const status = el("p", p.status || "");
      status.style.padding = "10px";
      card.append(status);
      box.append(card);
    }
    controls();
  }
  async function search(next = false) {
    if (busy || searching || !allowed) return;
    if (Date.now() < nextSearchAt) {
      $("#search-msg").textContent = "استنى شوية بين طلبات البحث.";
      return;
    }
    nextSearchAt = Date.now() + 3000;
    searching = true;
    controls();
    $("#search-msg").textContent = "جاري البحث…";
    try {
      if (!next) {
        term = $("#query").value.trim();
        cursor = null;
      }
      if (!term) throw Error("اكتب كلمة للبحث");
      const q = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrsearch: term + ' filetype:bitmap incategory:"CC-Zero"',
        gsrnamespace: "6",
        gsrlimit: "12",
        prop: "imageinfo",
        iiprop: "url|size|mime|extmetadata",
        iiurlwidth: "1600",
        origin: "*",
        maxlag: "5",
      });
      if (next && cursor)
        for (const [k, v] of Object.entries(cursor)) q.set(k, String(v));
      const response = await fetch(
        "https://commons.wikimedia.org/w/api.php?" + q,
        {
          headers: {
            "Api-User-Agent":
              "PhotoAr/1.0 (https://ms2355416-blip.github.io/photo-ar/)",
          },
        },
      );
      if (response.status === 429)
        throw Error("المصدر طلب تهدئة الطلبات. استنى قبل إعادة المحاولة.");
      if (!response.ok) throw Error("تعذر الاتصال بالمصدر: " + response.status);
      const d = await response.json();
      if (d.error) throw Error("المصدر مشغول. حاول بعد شوية.");
      results = [];
      selected.clear();
      $("#rights").checked = false;
      for (const p of Object.values(d.query?.pages || {})) {
        const ii = p.imageinfo?.[0],
          m = ii?.extmetadata || {};
        if (
          !ii ||
          text(m.LicenseShortName?.value) !== "CC0" ||
          !["image/jpeg", "image/png", "image/webp"].includes(ii.mime)
        )
          continue;
        try {
          results.push({
            id: p.pageid,
            title: text(p.title.replace(/^File:/, "")),
            source: sourceUrl(ii.descriptionurl),
            preview: imageUrl(ii.thumburl || ii.url),
            creator: text(m.Artist?.value).slice(0, 240) || "المؤلف غير مذكور",
            license: "https://creativecommons.org/publicdomain/zero/1.0/",
            status: "",
          });
        } catch {}
      }
      cursor = d.continue || null;
      $("#next").hidden = !cursor;
      $("#search-msg").textContent = results.length
        ? "نتائج بترخيص CC0 حسب المصدر. راجع كل صورة."
        : "مفيش صور مناسبة في الدفعة دي. جرّب كلمة تانية أو النتائج التالية.";
      paint();
    } catch (e) {
      $("#search-msg").textContent = e.message;
    } finally {
      searching = false;
      controls();
    }
  }
  $("#search-form").onsubmit = (e) => {
    e.preventDefault();
    search(false);
  };
  $("#next").onclick = () => search(true);
  $("#rights").onchange = controls;
  async function getBlob(url) {
    const r = await fetch(imageUrl(url), {
      signal: AbortSignal.timeout(30000),
    });
    if (!r.ok) throw Error("تعذر تنزيل الصورة: " + r.status);
    if (Number(r.headers.get("content-length")) > MAX)
      throw Error("الصورة أكبر من ٥ ميجا");
    const reader = r.body.getReader(),
      chunks = [];
    let n = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      n += value.byteLength;
      if (n > MAX) {
        await reader.cancel();
        throw Error("الصورة أكبر من ٥ ميجا");
      }
      chunks.push(value);
    }
    const blob = new Blob(chunks, {
      type: (r.headers.get("content-type") || "").split(";")[0],
    });
    if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type))
      throw Error("نوع ملف غير مدعوم");
    return blob;
  }
  async function variant(img, max) {
    const ratio = Math.min(1, max / img.naturalWidth);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    c.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return new Promise((resolve, reject) =>
      c.toBlob(
        (b) => (b ? resolve(b) : reject(Error("تعذر تجهيز الصورة"))),
        "image/webp",
        0.85,
      ),
    );
  }
  async function stableId(uid, id) {
    const a = new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("commons:" + uid + ":" + id),
      ),
    );
    a[6] = (a[6] & 15) | 80;
    a[8] = (a[8] & 63) | 128;
    const h = [...a.slice(0, 16)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
    return [
      h.slice(0, 8),
      h.slice(8, 12),
      h.slice(12, 16),
      h.slice(16, 20),
      h.slice(20),
    ].join("-");
  }
  async function importOne(p, owner) {
    const verify = new URLSearchParams({
      action: "query",
      format: "json",
      pageids: String(p.id),
      prop: "imageinfo",
      iiprop: "extmetadata",
      origin: "*",
      maxlag: "5",
    });
    const response = await fetch(
      "https://commons.wikimedia.org/w/api.php?" + verify,
      {
        headers: {
          "Api-User-Agent":
            "PhotoAr/1.0 (https://ms2355416-blip.github.io/photo-ar/)",
        },
      },
    );
    if (!response.ok) throw Error("تعذر مراجعة ترخيص الصورة");
    const fresh = await response.json();
    const license =
      fresh.query?.pages?.[p.id]?.imageinfo?.[0]?.extmetadata?.LicenseShortName
        ?.value;
    if (text(license) !== "CC0")
      throw Error("تعذر تأكيد ترخيص CC0، تم إيقاف الاستيراد");
    const id = await stableId(owner, p.id);
    const existing = await sb
      .from("photos")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) {
      p.status = "موجودة قبل كده، مفيش تكرار";
      return;
    }
    const blob = await getBlob(p.preview),
      object = URL.createObjectURL(blob),
      img = new Image();
    let paths = [];
    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(Error("صورة غير سليمة"));
        img.src = object;
      });
      if (img.naturalWidth * img.naturalHeight > 20000000)
        throw Error("أبعاد الصورة كبيرة جدًا");
      const view = await variant(img, 1600),
        thumb = await variant(img, 600),
        base = owner + "/" + id;
      const ext = blob.type === "image/jpeg" ? "jpg" : blob.type.split("/")[1];
      const files = [
        { path: base + "." + ext, blob },
        { path: base + "_v.webp", blob: view },
        { path: base + "_t.webp", blob: thumb },
      ];
      for (const f of files) {
        const r = await sb.storage
          .from(BUCKET)
          .upload(f.path, f.blob, {
            contentType: f.blob.type,
            cacheControl: "300",
            upsert: false,
          });
        if (r.error) throw r.error;
        paths.push(f.path);
      }
      const r = await sb
        .from("photos")
        .insert({
          id,
          user_id: owner,
          title: p.title.slice(0, 120),
          description: [
            "Wikimedia Commons",
            p.source,
            "Creator: " + p.creator,
            "License: CC0 1.0",
            p.license,
            "Imported preview resized to max 1600px; not guaranteed original resolution.",
          ].join("\n"),
          tags: ["commons", "cc0"],
          path: files[0].path,
          view_path: files[1].path,
          thumb_path: files[2].path,
          width: img.naturalWidth,
          height: img.naturalHeight,
          status: "pending",
          storage_bucket: BUCKET,
        });
      if (r.error) {
        const landed = await sb
          .from("photos")
          .select("id")
          .eq("id", id)
          .maybeSingle();
        if (landed.error) {
          paths = [];
          throw Error(
            "نتيجة الحفظ غير مؤكدة. راجع المراجعة قبل إعادة المحاولة.",
          );
        }
        if (!landed.data) throw r.error;
      }
      paths = [];
      p.status = "اتضافت للمراجعة";
    } catch (e) {
      if (paths.length) {
        const cleanup = await sb.storage.from(BUCKET).remove(paths);
        if (cleanup.error)
          throw Error(
            "الاستيراد وقف وفي ملفات خاصة محتاجة تنظيف. ابعتلي صورة الخطأ قبل المحاولة تاني.",
          );
      }
      throw e;
    } finally {
      URL.revokeObjectURL(object);
    }
  }
  $("#import-btn").onclick = async () => {
    if (busy || !allowed || !$("#rights").checked || !selected.size) return;
    const queue = results.filter((p) => selected.has(p.id));
    if (queue.length > 5) return;
    busy = true;
    paint();
    const owner = user.id;
    let done = 0;
    try {
      for (const p of queue) {
        if (user?.id !== owner || !allowed) throw Error("جلسة الدخول اتغيرت");
        p.status = "جاري الاستيراد…";
        paint();
        try {
          await importOne(p, owner);
          done++;
          selected.delete(p.id);
        } catch (e) {
          p.status = "فشلت: " + e.message;
        }
        paint();
      }
      $("#import-msg").textContent =
        "اكتمل " +
        done +
        " من " +
        queue.length +
        ". افتح الموقع الرئيسي > المراجعة. اللي فشل ممكن تحاول تاني بعد مراجعة الخطأ.";
    } finally {
      busy = false;
      paint();
    }
  };
})();
