(() => {
  'use strict';

  const C = window.PHOTO_AR_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  if (!window.supabase) {
    document.body.innerHTML = '<p style="padding:40px;color:#fff;font-family:sans-serif">تعذر تحميل مكتبة Supabase. تأكد من الاتصال بالإنترنت وأعد تحميل الصفحة.</p>';
    return;
  }
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const BUCKET = C.BUCKET;
  const MAX_BYTES = C.MAX_MB * 1024 * 1024;
  const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /* ------------------------------------------------------------------ */
  /* النصوص (عربي / إنجليزي)                                              */
  /* ------------------------------------------------------------------ */
  const I18N = {
    ar: {
      lang: 'EN',
      searchPh: 'ابحث بالاسم أو الوسوم…',
      upload: 'رفع صورة',
      home: 'الرئيسية', mine: 'صوري', review: 'المراجعة',
      login: 'تسجيل الدخول', signup: 'إنشاء حساب', logout: 'تسجيل الخروج',
      loginSub: 'أهلًا بيك تاني في Photo Ar',
      signupSub: 'انضم وشارك لقطاتك مع أصحابك',
      google: 'المتابعة بحساب جوجل', or: 'أو',
      username: 'الاسم الظاهر', email: 'الإيميل', password: 'كلمة السر (6 حروف على الأقل)',
      noAccount: 'معندكش حساب؟', haveAccount: 'عندك حساب؟',
      uploadTitle: 'رفع صورة جديدة',
      dropHere: 'اضغط أو اسحب الصورة هنا',
      fileRules: 'JPG أو PNG أو WebP — حتى 5 ميجا',
      titleLabel: 'العنوان (اختياري)', titlePh: 'مثال: غروب على النيل',
      tagsLabel: 'الوسوم', tagsPh: 'اكتب وسم واضغط Enter', tagsHint: 'الوسوم بتساعد الناس تلاقي صورتك (لحد 15 وسم).',
      publish: 'نشر الصورة', publishing: 'جاري الرفع…',
      noteReview: 'صورتك هتظهر للكل بعد موافقة الأدمن.',
      noteAdmin: 'بما إنك الأدمن، صورتك هتنزل مباشرة.',
      sentReview: 'تم الرفع ✓ وهتظهر بعد المراجعة',
      published: 'تم نشر الصورة ✓',
      download: 'تنزيل', del: 'حذف', approve: 'قبول', reject: 'رفض وحذف',
      pending: 'قيد المراجعة', by: 'بواسطة', untitled: 'بدون عنوان',
      emptyHome: 'لسه مفيش صور', emptyHomeSub: 'كن أول واحد ينشر صورة هنا.',
      emptyMine: 'لسه ما رفعتش صور', emptyMineSub: 'ارفع أول لقطة ليك.',
      emptyReview: 'مفيش صور مستنية مراجعة', emptyReviewSub: 'كله تمام 👌',
      emptySearch: 'مفيش نتائج', emptySearchSub: 'جرّب كلمة تانية أو وسم مختلف.',
      resultsFor: 'نتائج البحث عن', clear: 'مسح البحث',
      needLogin: 'سجّل دخولك الأول',
      pickFile: 'اختار صورة الأول',
      tooBig: 'حجم الصورة أكبر من 5 ميجا',
      badType: 'الصيغة غير مدعومة. استخدم JPG أو PNG أو WebP',
      badImage: 'مش قادر أقرأ الصورة دي',
      confirmDel: 'متأكد إنك عايز تحذف الصورة نهائيًا؟',
      deleted: 'تم الحذف', approved: 'تم قبول الصورة ✓', rejected: 'تم رفض الصورة وحذفها',
      checkEmail: 'بعتنالك رسالة تأكيد على إيميلك. افتحها واضغط على الرابط، وبعدين اكتب كلمة السر هنا وسجّل دخول.',
      confirmed: 'تم تأكيد حسابك وتسجيل دخولك ✓',
      linkErr: 'رابط التأكيد منتهي أو اتفتح قبل كده. سجّل دخول بإيميلك وكلمة السر، ولو مش شغال جرّب إنشاء الحساب تاني.',
      fillAll: 'املأ الإيميل وكلمة السر',
      loadErr: 'حصلت مشكلة في تحميل الصور. اتأكد إنك شغّلت ملف schema.sql في Supabase.',
      err: 'حصل خطأ، حاول تاني',
      badCreds: 'الإيميل أو كلمة السر غلط',
      userExists: 'الإيميل ده مسجل قبل كده',
      weakPass: 'كلمة السر ضعيفة (6 حروف على الأقل)',
      emailNotConfirmed: 'لازم تأكد الإيميل الأول من الرسالة اللي وصلتلك',
      rateLimit: 'محاولات كتير، استنى شوية وجرب تاني',
      moderated: 'الصورة دي لسه قيد المراجعة'
    },
    en: {
      lang: 'عربي',
      searchPh: 'Search by title or tags…',
      upload: 'Upload',
      home: 'Home', mine: 'My photos', review: 'Review',
      login: 'Log in', signup: 'Sign up', logout: 'Log out',
      loginSub: 'Welcome back to Photo Ar',
      signupSub: 'Join and share your shots with friends',
      google: 'Continue with Google', or: 'or',
      username: 'Display name', email: 'Email', password: 'Password (min 6 characters)',
      noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
      uploadTitle: 'Upload a new photo',
      dropHere: 'Click or drag a photo here',
      fileRules: 'JPG, PNG or WebP — up to 5 MB',
      titleLabel: 'Title (optional)', titlePh: 'e.g. Sunset over the Nile',
      tagsLabel: 'Tags', tagsPh: 'Type a tag and press Enter', tagsHint: 'Tags help people find your photo (up to 15).',
      publish: 'Publish', publishing: 'Uploading…',
      noteReview: 'Your photo goes live after admin approval.',
      noteAdmin: "You're the admin, so your photo goes live right away.",
      sentReview: 'Uploaded ✓ It will appear after review',
      published: 'Photo published ✓',
      download: 'Download', del: 'Delete', approve: 'Approve', reject: 'Reject & delete',
      pending: 'Pending review', by: 'by', untitled: 'Untitled',
      emptyHome: 'No photos yet', emptyHomeSub: 'Be the first to post one.',
      emptyMine: "You haven't uploaded anything yet", emptyMineSub: 'Upload your first shot.',
      emptyReview: 'Nothing waiting for review', emptyReviewSub: 'All clear 👌',
      emptySearch: 'No results', emptySearchSub: 'Try a different word or tag.',
      resultsFor: 'Results for', clear: 'Clear search',
      needLogin: 'Please log in first',
      pickFile: 'Choose a photo first',
      tooBig: 'Image is larger than 5 MB',
      badType: 'Unsupported format. Use JPG, PNG or WebP',
      badImage: "Couldn't read this image",
      confirmDel: 'Delete this photo permanently?',
      deleted: 'Deleted', approved: 'Photo approved ✓', rejected: 'Photo rejected and deleted',
      checkEmail: 'We sent a confirmation email. Open it and click the link, then enter your password here and log in.',
      confirmed: 'Your account is confirmed and you are logged in ✓',
      linkErr: 'The confirmation link has expired or was already used. Log in with your email and password.',
      fillAll: 'Enter your email and password',
      loadErr: 'Could not load photos. Make sure you ran schema.sql in Supabase.',
      err: 'Something went wrong, try again',
      badCreds: 'Wrong email or password',
      userExists: 'This email is already registered',
      weakPass: 'Password is too weak (min 6 characters)',
      emailNotConfirmed: 'Please confirm your email first',
      rateLimit: 'Too many attempts, wait a bit and retry',
      moderated: 'This photo is still pending review'
    }
  };

  const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };

  let lang = lsGet('pa_lang') === 'en' ? 'en' : 'ar';
  const t = (k) => (I18N[lang] && I18N[lang][k]) || k;

  // الرابط اللي بيجي من إيميل التأكيد بيحمل بيانات في الـ hash أو الـ query
  const LINK_PARAMS = new URLSearchParams(location.hash.replace(/^#/, '') + '&' + location.search.replace(/^\?/, ''));
  let FROM_EMAIL_LINK = LINK_PARAMS.has('access_token') || LINK_PARAMS.has('code') || /^(signup|magiclink|invite|recovery|email)$/.test(LINK_PARAMS.get('type') || '');
  const LINK_ERROR = LINK_PARAMS.has('error') || LINK_PARAMS.has('error_code');

  /* ------------------------------------------------------------------ */
  /* الحالة                                                              */
  /* ------------------------------------------------------------------ */
  const S = {
    user: null,
    isAdmin: false,
    view: 'home',
    query: '',
    page: 0,
    loading: false,
    done: false,
    items: [],
    ready: false, // بيبقى true بعد أول فحص للجلسة
    uid: null,
    gen: 0 // يلغي الطلبات القديمة لما المستخدم يغير البحث بسرعة
  };

  /* ------------------------------------------------------------------ */
  /* أدوات                                                               */
  /* ------------------------------------------------------------------ */
  function toast(msg, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    el.textContent = msg;
    $('#toasts').append(el);
    setTimeout(() => el.remove(), 3600);
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  const pubUrl = (path, download) =>
    sb.storage.from(BUCKET).getPublicUrl(path, download ? { download } : undefined).data.publicUrl;

  const extOf = (path) => (path.split('.').pop() || 'jpg').toLowerCase();

  function friendlyAuthError(e) {
    const m = (e && e.message ? e.message : '').toLowerCase();
    if (m.includes('invalid login')) return t('badCreds');
    if (m.includes('already registered') || m.includes('already been registered')) return t('userExists');
    if (m.includes('password')) return t('weakPass');
    if (m.includes('not confirmed')) return t('emailNotConfirmed');
    if (m.includes('rate limit') || m.includes('too many')) return t('rateLimit');
    return e && e.message ? e.message : t('err');
  }

  /* ------------------------------------------------------------------ */
  /* النوافذ                                                             */
  /* ------------------------------------------------------------------ */
  function openModal(id) {
    $(id).hidden = false;
    document.body.classList.add('lock');
  }
  function closeModal(node) {
    node.hidden = true;
    if (!$$('.modal').some((m) => !m.hidden)) document.body.classList.remove('lock');
  }
  $$('.modal').forEach((m) => {
    m.addEventListener('mousedown', (e) => { if (e.target === m) closeModal(m); });
    $$('[data-close]', m).forEach((b) => b.addEventListener('click', () => closeModal(m)));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $$('.modal').filter((m) => !m.hidden).pop();
    if (open) closeModal(open);
  });

  /* ------------------------------------------------------------------ */
  /* الترجمة                                                             */
  /* ------------------------------------------------------------------ */
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((n) => { n.placeholder = t(n.dataset.i18nPh); });
    $('#btn-lang').textContent = t('lang');
    renderAuthArea();
    renderAuthModalText();
    renderUploadNote();
    renderGrid();
    renderResultBar();
  }

  $('#btn-lang').addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    lsSet('pa_lang', lang);
    applyLang();
  });

  /* ------------------------------------------------------------------ */
  /* الحساب                                                              */
  /* ------------------------------------------------------------------ */
  let authMode = 'login';

  function renderAuthArea() {
    const box = $('#auth-area');
    box.replaceChildren();
    if (!S.user) {
      const b = el('button', 'btn ghost', t('login'));
      b.type = 'button';
      b.addEventListener('click', () => openAuth('login'));
      box.append(b);
      return;
    }
    const name = (S.user.user_metadata && (S.user.user_metadata.username || S.user.user_metadata.full_name)) || S.user.email || '?';
    const av = el('button', 'avatar', name.trim().charAt(0).toUpperCase());
    av.type = 'button';
    av.setAttribute('aria-label', name);
    const menu = el('div', 'menu');
    menu.hidden = true;
    const who = el('div', 'who');
    who.append(el('b', '', name), el('small', '', S.user.email || ''));
    const out = el('button', '', t('logout'));
    out.type = 'button';
    out.addEventListener('click', async () => { menu.hidden = true; await sb.auth.signOut(); });
    menu.append(who, out);
    av.addEventListener('click', (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
    box.append(av, menu);
  }
  document.addEventListener('click', () => { const m = $('.menu'); if (m) m.hidden = true; });

  function renderAuthModalText() {
    const login = authMode === 'login';
    $('#auth-title').textContent = t(login ? 'login' : 'signup');
    $('#auth-sub').textContent = t(login ? 'loginSub' : 'signupSub');
    $('#auth-submit').textContent = t(login ? 'login' : 'signup');
    $('#auth-switch-text').textContent = t(login ? 'noAccount' : 'haveAccount');
    $('#auth-switch').textContent = t(login ? 'signup' : 'login');
    $('#f-username').hidden = login;
    $('#a-pass').autocomplete = login ? 'current-password' : 'new-password';
  }

  function openAuth(mode = 'login') {
    authMode = mode;
    renderAuthModalText();
    setMsg($('#auth-msg'), '');
    openModal('#auth-modal');
    setTimeout(() => $('#a-email').focus(), 50);
  }

  function setMsg(node, text, ok = false) {
    node.textContent = text;
    node.hidden = !text;
    node.classList.toggle('ok', !!ok);
  }

  $('#auth-switch').addEventListener('click', () => {
    authMode = authMode === 'login' ? 'signup' : 'login';
    renderAuthModalText();
    setMsg($('#auth-msg'), '');
  });

  $('#btn-google').addEventListener('click', async () => {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + location.pathname }
    });
    if (error) setMsg($('#auth-msg'), friendlyAuthError(error));
  });

  $('#auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#a-email').value.trim();
    const password = $('#a-pass').value;
    const username = $('#a-username').value.trim();
    if (!email || !password) return setMsg($('#auth-msg'), t('fillAll'));
    const btn = $('#auth-submit');
    btn.disabled = true;
    setMsg($('#auth-msg'), '');
    try {
      if (authMode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        closeModal($('#auth-modal'));
      } else {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: { username: username || email.split('@')[0] },
            emailRedirectTo: location.origin + location.pathname
          }
        });
        if (error) throw error;
        if (data.session) closeModal($('#auth-modal'));
        else {
          // بعد التأكيد من الإيميل يرجع يسجل دخول بنفس البيانات
          authMode = 'login';
          renderAuthModalText();
          $('#a-pass').value = '';
          setMsg($('#auth-msg'), t('checkEmail'), true);
        }
      }
    } catch (err) {
      setMsg($('#auth-msg'), friendlyAuthError(err));
    } finally {
      btn.disabled = false;
    }
  });

  function applySession(session) {
    S.user = session ? session.user : null;
    S.isAdmin = !!(S.user && S.user.email && S.user.email.toLowerCase() === C.ADMIN_EMAIL.toLowerCase());
    $('[data-view="mine"]').hidden = !S.user;
    $('[data-view="review"]').hidden = !S.isAdmin;
    if (!S.user && S.view !== 'home') S.view = 'home';
    if (!S.isAdmin && S.view === 'review') S.view = 'home';
    $$('.tab').forEach((b) => b.classList.toggle('active', b.dataset.view === S.view));
    renderAuthArea();
    renderUploadNote();
  }

  sb.auth.onAuthStateChange((event, session) => {
    // مهم: متنادّيش على Supabase جوه الـ callback مباشرة
    setTimeout(() => {
      const uid = session && session.user ? session.user.id : null;
      const changed = !S.ready || uid !== S.uid;
      S.ready = true;
      S.uid = uid;
      applySession(session);
      if (session) {
        // لو التأكيد تم في تبويب تاني في نفس المتصفح، الجلسة بتوصل هنا تلقائيًا
        const am = $('#auth-modal');
        if (!am.hidden) closeModal(am);
        if (FROM_EMAIL_LINK) { FROM_EMAIL_LINK = false; toast(t('confirmed'), 'ok'); }
      }
      if (changed) {
        loadPhotos(true);
        refreshPendingCount();
      }
    }, 0);
  });

  /* ------------------------------------------------------------------ */
  /* التبويبات والبحث                                                    */
  /* ------------------------------------------------------------------ */
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b) return;
    S.view = b.dataset.view;
    $$('.tab').forEach((x) => x.classList.toggle('active', x === b));
    loadPhotos(true);
  });

  let searchTimer;
  function setQuery(q, fromInput) {
    S.query = q.trim().toLowerCase().slice(0, 80);
    if (!fromInput) $('#q').value = q.trim();
    loadPhotos(true);
  }
  $('#q').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => setQuery(e.target.value, true), 350);
  });
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(searchTimer);
    setQuery($('#q').value, true);
    $('#q').blur();
  });

  function renderResultBar() {
    const bar = $('#result-bar');
    if (!S.query) { bar.hidden = true; return; }
    bar.replaceChildren();
    const txt = el('span', '', t('resultsFor') + ' ');
    txt.append(el('b', '', '«' + S.query + '»'));
    const clr = el('button', '', t('clear'));
    clr.type = 'button';
    clr.addEventListener('click', () => setQuery('', false));
    bar.append(txt, clr);
    bar.hidden = false;
  }

  /* ------------------------------------------------------------------ */
  /* تحميل الصور                                                         */
  /* ------------------------------------------------------------------ */
  const COLS = 'id,title,description,tags,path,view_path,thumb_path,width,height,status,user_id,created_at,profiles(username)';

  async function loadPhotos(reset) {
    if (reset) {
      S.gen++;
      S.page = 0;
      S.done = false;
      S.items = [];
      S.loading = false;
      $('#grid').replaceChildren();
      $('#empty').hidden = true;
      renderResultBar();
    }
    if (!S.ready || S.loading || S.done) return;
    if (S.view === 'mine' && !S.user) return;
    const gen = S.gen;
    S.loading = true;
    $('#loader').hidden = false;

    const size = C.PAGE_SIZE;
    let q = sb.from('photos').select(COLS)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(S.page * size, S.page * size + size - 1);

    if (S.view === 'home') q = q.eq('status', 'approved');
    else if (S.view === 'mine') q = q.eq('user_id', S.user.id);
    else if (S.view === 'review') q = q.eq('status', 'pending');

    if (S.query) {
      S.query.split(/\s+/).filter(Boolean).forEach((w) => {
        const safe = w.replace(/[%_\\]/g, '');
        if (safe) q = q.ilike('search_text', '%' + safe + '%');
      });
    }

    const { data, error } = await q;
    if (gen !== S.gen) return; // وصلنا طلب أحدث
    S.loading = false;
    $('#loader').hidden = true;

    if (error) {
      console.error(error);
      toast(t('loadErr'), 'err');
      S.done = true;
      return;
    }
    if (data.length < size) S.done = true;
    S.page++;
    S.items.push(...data);
    data.forEach((p) => $('#grid').append(cardEl(p)));
    renderEmpty();
    // لو الصفحة لسه فاضية بعد الرسم نكمل تحميل
    requestAnimationFrame(checkSentinel);
  }

  function renderEmpty() {
    const box = $('#empty');
    if (!S.ready || S.items.length) { box.hidden = true; return; }
    box.replaceChildren();
    let h, s;
    if (S.query) { h = 'emptySearch'; s = 'emptySearchSub'; }
    else if (S.view === 'mine') { h = 'emptyMine'; s = 'emptyMineSub'; }
    else if (S.view === 'review') { h = 'emptyReview'; s = 'emptyReviewSub'; }
    else { h = 'emptyHome'; s = 'emptyHomeSub'; }
    box.append(el('h3', '', t(h)), el('p', '', t(s)));
    if (!S.query && S.view !== 'review') {
      const b = el('button', 'btn primary', t('upload'));
      b.type = 'button';
      b.addEventListener('click', openUpload);
      box.append(b);
    }
    box.hidden = false;
  }

  function renderGrid() {
    const grid = $('#grid');
    grid.replaceChildren();
    S.items.forEach((p) => grid.append(cardEl(p)));
    if (!S.loading) renderEmpty();
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) loadPhotos(false);
  }, { rootMargin: '700px 0px' });
  io.observe($('#sentinel'));
  function checkSentinel() {
    const r = $('#sentinel').getBoundingClientRect();
    if (r.top < innerHeight + 700) loadPhotos(false);
  }

  async function refreshPendingCount() {
    const badge = $('#pending-count');
    if (!S.isAdmin) { badge.hidden = true; return; }
    const { count } = await sb.from('photos').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    badge.textContent = count || 0;
    badge.hidden = !count;
  }

  /* ------------------------------------------------------------------ */
  /* كارت الصورة                                                         */
  /* ------------------------------------------------------------------ */
  function downloadName(p) {
    return 'photo-ar-' + p.id.slice(0, 8) + '.' + extOf(p.path);
  }

  function downloadLink(p, cls) {
    const a = el('a', cls);
    a.href = pubUrl(p.path, downloadName(p));
    a.rel = 'noopener';
    a.setAttribute('aria-label', t('download'));
    a.title = t('download');
    return a;
  }

  const DL_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/></svg>';

  function cardEl(p) {
    const fig = el('figure', 'card');
    fig.dataset.id = p.id;
    fig.tabIndex = 0;
    fig.style.aspectRatio = (p.width || 1) + ' / ' + (p.height || 1);

    const img = new Image();
    img.alt = p.title || '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.src = pubUrl(p.thumb_path || p.path);
    img.addEventListener('load', () => fig.classList.add('loaded'));
    img.addEventListener('error', () => fig.classList.add('loaded'));
    fig.append(img);

    if (p.status === 'pending' && S.view !== 'review') fig.append(el('span', 'badge', t('pending')));

    const ov = el('div', 'card-ov');
    if (p.title) ov.append(el('div', 't', p.title));
    const row = el('div', 'row');
    row.append(el('span', 'by', (p.profiles && p.profiles.username) || ''));
    if (p.status === 'approved') {
      const dl = downloadLink(p, 'icon-btn');
      dl.innerHTML = DL_ICON;
      dl.addEventListener('click', (e) => e.stopPropagation());
      row.append(dl);
    }
    ov.append(row);

    if (S.view === 'review' && S.isAdmin) {
      ov.append(reviewButtons(p));
      fig.classList.add('show-ov');
    }
    fig.append(ov);

    fig.addEventListener('click', () => openViewer(p));
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter') openViewer(p); });
    return fig;
  }

  function reviewButtons(p) {
    const wrap = el('div', 'review-actions');
    const ok = el('button', 'btn ok', t('approve'));
    ok.type = 'button';
    ok.addEventListener('click', (e) => { e.stopPropagation(); approvePhoto(p); });
    const no = el('button', 'btn danger', t('reject'));
    no.type = 'button';
    no.addEventListener('click', (e) => { e.stopPropagation(); removePhoto(p, 'rejected'); });
    wrap.append(ok, no);
    return wrap;
  }

  /* ------------------------------------------------------------------ */
  /* العارض                                                              */
  /* ------------------------------------------------------------------ */
  function openViewer(p) {
    const img = $('#v-img');
    img.alt = p.title || '';
    img.src = pubUrl(p.view_path || p.thumb_path || p.path);
    $('#v-title').textContent = p.title || t('untitled');
    $('#v-by').textContent = t('by') + ' ' + ((p.profiles && p.profiles.username) || '—');

    const tags = $('#v-tags');
    tags.replaceChildren();
    (p.tags || []).forEach((tag) => {
      const c = el('button', 'chip', '#' + tag);
      c.type = 'button';
      c.addEventListener('click', () => {
        closeModal($('#viewer'));
        if (S.view !== 'home') {
          S.view = 'home';
          $$('.tab').forEach((x) => x.classList.toggle('active', x.dataset.view === 'home'));
        }
        setQuery(tag, false);
        scrollTo({ top: 0, behavior: 'smooth' });
      });
      tags.append(c);
    });

    const act = $('#v-actions');
    act.replaceChildren();
    if (p.status === 'approved') {
      const dl = downloadLink(p, 'btn primary');
      dl.innerHTML = DL_ICON + '<span></span>';
      dl.lastChild.textContent = t('download');
      act.append(dl);
    } else if (S.view !== 'review') {
      act.append(el('p', 'hint', t('moderated')));
    }
    if (S.isAdmin && p.status === 'pending') {
      const ok = el('button', 'btn ok', t('approve'));
      ok.type = 'button';
      ok.addEventListener('click', async () => { await approvePhoto(p); closeModal($('#viewer')); });
      const no = el('button', 'btn danger', t('reject'));
      no.type = 'button';
      no.addEventListener('click', async () => { if (await removePhoto(p, 'rejected')) closeModal($('#viewer')); });
      act.append(ok, no);
    } else if (S.user && (S.user.id === p.user_id || S.isAdmin)) {
      const d = el('button', 'btn danger', t('del'));
      d.type = 'button';
      d.addEventListener('click', async () => {
        if (!confirm(t('confirmDel'))) return;
        if (await removePhoto(p, 'deleted')) closeModal($('#viewer'));
      });
      act.append(d);
    }
    openModal('#viewer');
  }

  /* ------------------------------------------------------------------ */
  /* مراجعة وحذف                                                         */
  /* ------------------------------------------------------------------ */
  function dropFromView(id) {
    S.items = S.items.filter((x) => x.id !== id);
    const node = $('.card[data-id="' + id + '"]');
    if (node) node.remove();
    renderEmpty();
  }

  async function approvePhoto(p) {
    const { error } = await sb.from('photos').update({ status: 'approved' }).eq('id', p.id);
    if (error) { console.error(error); return toast(t('err'), 'err'); }
    toast(t('approved'), 'ok');
    dropFromView(p.id);
    refreshPendingCount();
  }

  async function removePhoto(p, msgKey) {
    const files = [p.path, p.view_path, p.thumb_path].filter(Boolean);
    const { error } = await sb.from('photos').delete().eq('id', p.id);
    if (error) { console.error(error); toast(t('err'), 'err'); return false; }
    await sb.storage.from(BUCKET).remove(files); // لو فشل مش مشكلة، الصف اتمسح
    toast(t(msgKey), 'ok');
    dropFromView(p.id);
    refreshPendingCount();
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* الرفع                                                               */
  /* ------------------------------------------------------------------ */
  const U = { file: null, img: null, url: null, tags: [] };

  function renderUploadNote() {
    $('#up-note').textContent = t(S.isAdmin ? 'noteAdmin' : 'noteReview');
  }

  function openUpload() {
    if (!S.user) { toast(t('needLogin'), 'err'); return openAuth('login'); }
    resetUpload();
    openModal('#upload-modal');
  }
  $('#btn-upload').addEventListener('click', openUpload);

  function resetUpload() {
    if (U.url) URL.revokeObjectURL(U.url);
    U.file = null; U.img = null; U.url = null; U.tags = [];
    $('#file').value = '';
    $('#preview').hidden = true;
    $('#preview').removeAttribute('src');
    $('#drop-hint').hidden = false;
    $('#up-title-in').value = '';
    $('#tag-in').value = '';
    renderChips();
    setMsg($('#up-msg'), '');
    $('#up-submit').disabled = false;
    $('#up-submit').textContent = t('publish');
  }

  function renderChips() {
    const box = $('#chips');
    box.replaceChildren();
    U.tags.forEach((tag, i) => {
      const c = el('span', 'chip', '#' + tag);
      const x = el('button', '', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'remove');
      x.addEventListener('click', () => { U.tags.splice(i, 1); renderChips(); });
      c.append(x);
      box.append(c);
    });
  }

  function addTag(raw) {
    const tag = raw.trim().replace(/^#+/, '').replace(/\s+/g, ' ').toLowerCase().slice(0, 30);
    if (!tag || U.tags.includes(tag) || U.tags.length >= 15) return;
    U.tags.push(tag);
    renderChips();
  }

  const tagIn = $('#tag-in');
  tagIn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === '،') {
      e.preventDefault();
      addTag(tagIn.value);
      tagIn.value = '';
    } else if (e.key === 'Backspace' && !tagIn.value && U.tags.length) {
      U.tags.pop();
      renderChips();
    }
  });
  tagIn.addEventListener('blur', () => { if (tagIn.value.trim()) { addTag(tagIn.value); tagIn.value = ''; } });
  $('#tagbox').addEventListener('click', () => tagIn.focus());

  const drop = $('#drop');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => { if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]); });
  drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#file').click(); } });
  $('#file').addEventListener('change', (e) => { if (e.target.files[0]) pickFile(e.target.files[0]); });

  function pickFile(file) {
    setMsg($('#up-msg'), '');
    if (!OK_TYPES.includes(file.type)) return setMsg($('#up-msg'), t('badType'));
    if (file.size > MAX_BYTES) return setMsg($('#up-msg'), t('tooBig'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (U.url) URL.revokeObjectURL(U.url);
      U.file = file; U.img = img; U.url = url;
      const pv = $('#preview');
      pv.src = url;
      pv.hidden = false;
      $('#drop-hint').hidden = true;
    };
    img.onerror = () => { URL.revokeObjectURL(url); setMsg($('#up-msg'), t('badImage')); };
    img.src = url;
  }

  // يعمل نسخة مصغرة (الصفحة الرئيسية بتحمّل المصغّرة مش الأصلية عشان تفضل سريعة ومتستهلكش باندويدث)
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
  const EXT_BY_TYPE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

  $('#up-submit').addEventListener('click', async () => {
    if (!S.user) return openAuth('login');
    if (!U.file || !U.img) return setMsg($('#up-msg'), t('pickFile'));
    if (tagIn.value.trim()) { addTag(tagIn.value); tagIn.value = ''; }

    const btn = $('#up-submit');
    btn.disabled = true;
    btn.textContent = t('publishing');
    setMsg($('#up-msg'), '');

    const id = crypto.randomUUID();
    const base = S.user.id + '/' + id;
    const uploaded = [];
    try {
      const [viewBlob, thumbBlob] = await Promise.all([
        makeVariant(U.img, 1600, 0.86),
        makeVariant(U.img, 600, 0.8)
      ]);
      const files = [
        { key: 'path', path: base + '.' + EXT_BY_TYPE[U.file.type], blob: U.file, type: U.file.type },
        { key: 'view_path', path: base + '_v.' + extFromBlob(viewBlob), blob: viewBlob, type: viewBlob.type },
        { key: 'thumb_path', path: base + '_t.' + extFromBlob(thumbBlob), blob: thumbBlob, type: thumbBlob.type }
      ];
      for (const f of files) {
        const { error } = await sb.storage.from(BUCKET).upload(f.path, f.blob, {
          contentType: f.type, cacheControl: '31536000', upsert: false
        });
        if (error) throw error;
        uploaded.push(f.path);
      }
      const row = {
        id,
        user_id: S.user.id,
        title: $('#up-title-in').value.trim().slice(0, 120),
        tags: U.tags.slice(0, 15),
        path: files[0].path,
        view_path: files[1].path,
        thumb_path: files[2].path,
        width: U.img.naturalWidth,
        height: U.img.naturalHeight,
        status: S.isAdmin ? 'approved' : 'pending'
      };
      const { error } = await sb.from('photos').insert(row);
      if (error) throw error;

      closeModal($('#upload-modal'));
      toast(t(S.isAdmin ? 'published' : 'sentReview'), 'ok');
      resetUpload();
      if (S.isAdmin && S.view === 'home' && !S.query) loadPhotos(true);
      else if (S.view === 'mine') loadPhotos(true);
      refreshPendingCount();
    } catch (err) {
      console.error(err);
      if (uploaded.length) await sb.storage.from(BUCKET).remove(uploaded);
      const m = (err && err.message) || '';
      setMsg($('#up-msg'), /exceeded|too large|size/i.test(m) ? t('tooBig') : t('err') + (m ? ' — ' + m : ''));
      btn.disabled = false;
      btn.textContent = t('publish');
    }
  });

  /* ------------------------------------------------------------------ */
  /* البداية                                                             */
  /* ------------------------------------------------------------------ */
  applyLang();
  if (LINK_ERROR) setTimeout(() => toast(t('linkErr'), 'err'), 400);
  // أول تحميل بيحصل من onAuthStateChange (INITIAL_SESSION)
})();
