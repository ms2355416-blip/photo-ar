/* صفحة الرفع الجماعي — Photo Ar
   صفحة مخصصة لحساب واحد (BULK_EMAIL في config.js، ولو مش موجود ADMIN_EMAIL).
   كل صورة بتتنشر كمنشور منفصل بحالة "قيد المراجعة" (pending) حتى لو الحساب هو الأدمن —
   قرار محمد يوم ٢٣ نوفمبر ٢٠٢٦: صور الصفحة دي تستنى موافقته من تبويب «المراجعة». */
(() => {
  'use strict';

  const C = window.PHOTO_AR_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);

  if (!window.supabase) {
    document.body.innerHTML = '<p style="padding:40px;color:#fff;font-family:sans-serif">تعذر تحميل مكتبة Supabase. تأكد من الاتصال بالإنترنت وأعد تحميل الصفحة.</p>';
    return;
  }
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const BUCKET = C.BUCKET;
  // صور الصفحة دي دايمًا «قيد المراجعة»، فبتترفع للمخزن الخاص — بينشأ من fix-storage-privacy.sql
  const UPLOAD_BUCKET = 'pending-photos';
  const MAX_BYTES = C.MAX_MB * 1024 * 1024;
  const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

  const PAGE_EMAIL = String(C.BULK_EMAIL || C.ADMIN_EMAIL).toLowerCase();
  const MAX_BATCH = 20;
  // صور الصفحة دي دايمًا بتستنى المراجعة، حتى لو الرافع هو الأدمن (متغيرهاش غير لو محمد طلب كده صراحة)
  const BULK_STATUS = 'pending';

  const I18N = {
    ar: {
      pageTitle: 'رفع جماعي', back: 'رجوع للموقع', loading: 'جاري فحص تسجيل الدخول…',
      loginTitle: 'سجّل دخولك الأول', loginSub: 'الصفحة دي مخصصة لحساب معين. سجّل دخولك بيه.',
      google: 'المتابعة بحساب Google', or: 'أو', email: 'الإيميل', password: 'كلمة السر', login: 'تسجيل الدخول',
      deniedTitle: 'الحساب ده مش مصرح له بالصفحة دي',
      deniedSub: 'الصفحة دي مخصصة لحساب ' + PAGE_EMAIL + ' بس. سجّل خروج وادخل بالحساب الصح.',
      logout: 'تسجيل الخروج',
      note: 'كل صورة هتنزل كمنشور منفصل وتظهر للناس بعد موافقة الأدمن من تبويب «المراجعة».',
      dropStrong: 'حدد أو اسحب حتى ٢٠ صورة', dropRules: 'JPG أو PNG أو WebP — بحد أقصى ٥ ميجا للصورة',
      tagsLabel: 'وسوم لكل الصور (اختياري، افصل بينها بفاصلة)',
      publish: 'نشر الكل', publishing: 'جاري النشر…',
      count: (n, max) => n + ' / ' + max + ' صورة',
      stReady: 'جاهزة', stUp: 'بيترفع…', stDone: 'اتنشرت', stErr: 'فشلت',
      badType: 'نوع الملف مش مدعوم', tooBig: 'الصورة أكبر من ٥ ميجا', badImage: 'الملف مش صورة سليمة',
      overCap: 'الحد الأقصى ٢٠ صورة في الدفعة — الزيادة اتجاهلت',
      needPhotos: 'ضيف صور الأول',
      doneAll: (ok, total) => ok === total
        ? 'اتنشرت كل الصور (' + ok + ') وهتظهر بعد المراجعة'
        : 'اتنشرت ' + ok + ' من ' + total + ' — اللي فشل ظاهر بالأحمر وتحتاج تعيد رفعه',
      err: 'حصل خطأ أثناء الرفع', wrongCreds: 'الإيميل أو كلمة السر غلط'
    },
    en: {
      pageTitle: 'Bulk upload', back: 'Back to site', loading: 'Checking sign-in…',
      loginTitle: 'Log in first', loginSub: 'This page is for one specific account. Log in with it.',
      google: 'Continue with Google', or: 'or', email: 'Email', password: 'Password', login: 'Log in',
      deniedTitle: 'This account is not allowed here',
      deniedSub: 'This page is only for ' + PAGE_EMAIL + '. Log out and use the right account.',
      logout: 'Log out',
      note: 'Each photo becomes its own post and appears after admin approval from the Review tab.',
      dropStrong: 'Pick or drop up to 20 photos', dropRules: 'JPG, PNG or WebP — 5 MB max each',
      tagsLabel: 'Tags for all photos (optional, comma separated)',
      publish: 'Publish all', publishing: 'Publishing…',
      count: (n, max) => n + ' / ' + max + ' photos',
      stReady: 'Ready', stUp: 'Uploading…', stDone: 'Published', stErr: 'Failed',
      badType: 'Unsupported file type', tooBig: 'Photo is over 5 MB', badImage: 'Not a valid image',
      overCap: 'Max 20 photos per batch — extras were ignored',
      needPhotos: 'Add photos first',
      doneAll: (ok, total) => ok === total
        ? 'All photos published (' + ok + ') and will appear after review'
        : ok + ' of ' + total + ' published — failed ones are marked red, re-upload them',
      err: 'Upload error', wrongCreds: 'Wrong email or password'
    }
  };
  let lang = 'ar';
  try { lang = localStorage.getItem('pa_lang') === 'en' ? 'en' : 'ar'; } catch (e) {}
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;

  function toast(msg, kind = '') {
    const n = document.createElement('div');
    n.className = 'toast ' + kind;
    const ic = window.PA_ICONS && PA_ICONS[kind === 'ok' ? 'check' : kind === 'err' ? 'alert' : ''];
    if (ic) n.insertAdjacentHTML('beforeend', ic);
    n.append(document.createTextNode(msg));
    $('#toasts').append(n);
    setTimeout(() => n.remove(), 4200);
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = t('pageTitle') + ' — Photo Ar';
    $('#page-title').textContent = t('pageTitle');
    $('#back-link').textContent = t('back');
    $('#st-loading').textContent = t('loading');
    $('#login-title').textContent = t('loginTitle');
    $('#login-sub').textContent = t('loginSub');
    $('#google-label').textContent = t('google');
    $('#or-label').textContent = t('or');
    $('#email-label').textContent = t('email');
    $('#pass-label').textContent = t('password');
    $('#login-submit').textContent = t('login');
    $('#denied-title').textContent = t('deniedTitle');
    $('#denied-sub').textContent = t('deniedSub');
    $('#btn-logout').textContent = t('logout');
    $('#bulk-note').textContent = t('note');
    $('#drop-strong').textContent = t('dropStrong');
    $('#drop-rules').textContent = t('dropRules');
    $('#tags-label').textContent = t('tagsLabel');
    $('#tags-in').placeholder = lang === 'ar' ? 'مثال: رحلة، أصحاب، ٢٠٢٦' : 'e.g. trip, friends, 2026';
    $('#publish').textContent = t('publish');
  }

  function setMsg(node, text, ok = false) {
    node.textContent = text;
    node.hidden = !text;
    node.classList.toggle('ok', !!ok);
  }

  /* ---------- الحالة ---------- */
  const S = { user: null, allowed: false, busy: false };
  const items = []; // {id, file, img, url, title, state, err, prog}
  let seq = 0;

  function showState() {
    $('#st-loading').hidden = true;
    $('#st-login').hidden = !!S.user;
    $('#st-denied').hidden = !(S.user && !S.allowed);
    $('#st-bulk').hidden = !(S.user && S.allowed);
  }

  sb.auth.onAuthStateChange((event, session) => {
    setTimeout(() => {
      S.user = session ? session.user : null;
      S.allowed = !!(S.user && S.user.email && S.user.email.toLowerCase() === PAGE_EMAIL);
      showState();
    }, 0);
  });

  /* ---------- تسجيل الدخول ---------- */
  $('#btn-google').addEventListener('click', async () => {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + location.pathname }
    });
    if (error) setMsg($('#login-msg'), error.message || t('err'));
  });

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#a-email').value.trim();
    const password = $('#a-pass').value;
    if (!email || !password) return;
    const btn = $('#login-submit');
    btn.disabled = true;
    setMsg($('#login-msg'), '');
    const { error } = await sb.auth.signInWithPassword({ email, password });
    btn.disabled = false;
    if (error) {
      const m = /invalid login credentials/i.test(error.message || '') ? t('wrongCreds') : (error.message || t('err'));
      setMsg($('#login-msg'), m);
    }
  });

  $('#btn-logout').addEventListener('click', async () => { await sb.auth.signOut(); });

  /* ---------- اختيار الصور ---------- */
  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer.files && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#files').click(); } });
  $('#files').addEventListener('change', (e) => { if (e.target.files.length) addFiles(e.target.files); e.target.value = ''; });

  function addFiles(fileList) {
    if (S.busy) return;
    setMsg($('#bulk-msg'), '');
    let list = [...fileList];
    const room = MAX_BATCH - items.length;
    if (list.length > room) {
      list = list.slice(0, Math.max(0, room));
      toast(t('overCap'), 'err');
    }
    for (const file of list) {
      if (!OK_TYPES.includes(file.type)) { toast(file.name + ': ' + t('badType'), 'err'); continue; }
      if (file.size > MAX_BYTES) { toast(file.name + ': ' + t('tooBig'), 'err'); continue; }
      const url = URL.createObjectURL(file);
      const img = new Image();
      const it = { id: ++seq, file, img: null, url, title: '', state: 'ready', err: '', prog: 0 };
      img.onload = () => { it.img = img; renderItems(); };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const i = items.indexOf(it);
        if (i > -1) items.splice(i, 1);
        toast(file.name + ': ' + t('badImage'), 'err');
        renderItems();
      };
      img.src = url;
      items.push(it);
    }
    renderItems();
  }

  function removeItem(it) {
    if (S.busy) return;
    const i = items.indexOf(it);
    if (i > -1) items.splice(i, 1);
    URL.revokeObjectURL(it.url);
    renderItems();
  }

  function renderItems() {
    const box = $('#items');
    box.replaceChildren();
    for (const it of items) {
      const card = document.createElement('div');
      card.className = 'bi' + (it.state === 'done' ? ' done' : it.state === 'error' ? ' err' : '');

      const th = document.createElement('div');
      th.className = 'bi-thumb';
      const im = document.createElement('img');
      im.src = it.url;
      im.alt = '';
      th.append(im);

      const st = document.createElement('span');
      st.className = 'bi-state' + (it.state === 'done' ? ' ok' : it.state === 'error' ? ' err' : '');
      st.textContent = it.state === 'done' ? t('stDone')
        : it.state === 'error' ? t('stErr')
        : it.state === 'uploading' ? t('stUp') : t('stReady');
      th.append(st);

      if (!S.busy && it.state !== 'done') {
        const x = document.createElement('button');
        x.className = 'bi-x';
        x.type = 'button';
        x.setAttribute('aria-label', 'x');
        x.innerHTML = (window.PA_ICONS && PA_ICONS.close) || '×';
        x.addEventListener('click', () => removeItem(it));
        th.append(x);
      }
      card.append(th);

      const body = document.createElement('div');
      body.className = 'bi-body';
      const nm = document.createElement('div');
      nm.className = 'bi-name';
      nm.textContent = it.file.name;
      nm.title = it.file.name;
      body.append(nm);

      const ti = document.createElement('input');
      ti.className = 'bi-title';
      ti.type = 'text';
      ti.maxLength = 120;
      ti.placeholder = it.file.name.replace(/\.[^.]+$/, '');
      ti.value = it.title;
      ti.disabled = S.busy || it.state === 'done';
      ti.addEventListener('input', () => { it.title = ti.value; });
      body.append(ti);

      const pr = document.createElement('div');
      pr.className = 'bi-prog';
      const bar = document.createElement('i');
      bar.style.width = (it.state === 'done' ? 100 : it.prog) + '%';
      pr.append(bar);
      body.append(pr);

      if (it.err) {
        const em = document.createElement('div');
        em.className = 'bi-name';
        em.style.color = 'var(--danger)';
        em.textContent = it.err;
        body.append(em);
      }
      card.append(body);
      box.append(card);
    }
    $('#count').textContent = t('count')(items.length, MAX_BATCH);
    $('#publish').disabled = S.busy || !items.some((i) => i.state === 'ready' || i.state === 'error');
    $('#publish').textContent = S.busy ? t('publishing') : t('publish');
    $('#tags-in').disabled = S.busy;
  }

  /* ---------- النشر ---------- */
  function makeVariant(img, maxW, quality) {
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return new Promise((res, rej) => {
      c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), 'image/webp', quality);
    });
  }
  const extFromBlob = (b) => (b.type === 'image/webp' ? 'webp' : b.type === 'image/png' ? 'png' : 'jpg');

  function sharedTags() {
    return $('#tags-in').value.split(/[,،]/).map((x) => x.trim().replace(/^#+/, '').toLowerCase().slice(0, 30)).filter(Boolean).slice(0, 15);
  }

  async function uploadOne(it, tags) {
    it.state = 'uploading';
    it.err = '';
    it.prog = 5;
    renderItems();
    const id = crypto.randomUUID();
    const base = S.user.id + '/' + id;
    const uploaded = [];
    try {
      const [viewBlob, thumbBlob] = await Promise.all([
        makeVariant(it.img, 1600, 0.86),
        makeVariant(it.img, 600, 0.8)
      ]);
      const files = [
        { path: base + '.' + EXT_BY_TYPE[it.file.type], blob: it.file, type: it.file.type },
        { path: base + '_v.' + extFromBlob(viewBlob), blob: viewBlob, type: viewBlob.type },
        { path: base + '_t.' + extFromBlob(thumbBlob), blob: thumbBlob, type: thumbBlob.type }
      ];
      it.prog = 15;
      renderItems();
      let n = 0;
      for (const f of files) {
        const { error } = await sb.storage.from(UPLOAD_BUCKET).upload(f.path, f.blob, {
          contentType: f.type, cacheControl: '300', upsert: false
        });
        if (error) throw error;
        uploaded.push(f.path);
        it.prog = 15 + Math.round((++n / files.length) * 70);
        renderItems();
      }
      const row = {
        id,
        user_id: S.user.id,
        title: it.title.trim().slice(0, 120),
        tags,
        path: files[0].path,
        view_path: files[1].path,
        thumb_path: files[2].path,
        width: it.img.naturalWidth,
        height: it.img.naturalHeight,
        storage_bucket: UPLOAD_BUCKET,
        status: BULK_STATUS
      };
      const { error } = await sb.from('photos').insert(row);
      if (error) throw error;
      it.state = 'done';
      it.prog = 100;
    } catch (err) {
      console.error(err);
      if (uploaded.length) await sb.storage.from(UPLOAD_BUCKET).remove(uploaded);
      it.state = 'error';
      const m = (err && err.message) || '';
      it.err = /exceeded|too large|size/i.test(m) ? t('tooBig') : (m || t('err'));
    }
    renderItems();
  }

  $('#publish').addEventListener('click', async () => {
    if (S.busy) return;
    const queue = items.filter((i) => i.state === 'ready' || i.state === 'error');
    if (!queue.length) return setMsg($('#bulk-msg'), t('needPhotos'));
    const notReady = queue.filter((i) => !i.img);
    if (notReady.length) return setMsg($('#bulk-msg'), t('badImage'));

    S.busy = true;
    setMsg($('#bulk-msg'), '');
    const prog = $('#bulk-prog');
    prog.hidden = false;
    prog.firstElementChild.style.width = '0%';
    renderItems();

    const tags = sharedTags();
    const total = queue.length;
    let doneCount = 0, okCount = 0;
    for (const it of queue) {
      await uploadOne(it, tags);
      doneCount++;
      if (it.state === 'done') okCount++;
      prog.firstElementChild.style.width = Math.round((doneCount / total) * 100) + '%';
    }

    S.busy = false;
    prog.hidden = true;
    setMsg($('#bulk-msg'), t('doneAll')(okCount, total), okCount === total);
    toast(t('doneAll')(okCount, total), okCount === total ? 'ok' : 'err');
    // شيل اللي اتنشر من القايمة بعد ثانيتين عشان الشاشة ترجع نضيفة للدفعة الجاية
    setTimeout(() => {
      for (let i = items.length - 1; i >= 0; i--) {
        if (items[i].state === 'done') {
          URL.revokeObjectURL(items[i].url);
          items.splice(i, 1);
        }
      }
      renderItems();
    }, 2000);
    renderItems();
  });

  /* ---------- بداية ---------- */
  applyLang();
  renderItems();
})();
