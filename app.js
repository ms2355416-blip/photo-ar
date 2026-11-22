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
      sentReview: 'تم الرفع وهتظهر بعد المراجعة',
      published: 'تم نشر الصورة',
      download: 'تنزيل', del: 'حذف', approve: 'قبول', reject: 'رفض وحذف',
      pending: 'قيد المراجعة', by: 'بواسطة', untitled: 'بدون عنوان',
      emptyHome: 'لسه مفيش صور', emptyHomeSub: 'كن أول واحد ينشر صورة هنا.',
      emptyMine: 'لسه ما رفعتش صور', emptyMineSub: 'ارفع أول لقطة ليك.',
      emptyReview: 'مفيش صور مستنية مراجعة', emptyReviewSub: 'كله تمام',
      emptySearch: 'مفيش نتائج', emptySearchSub: 'جرّب كلمة تانية أو وسم مختلف.',
      resultsFor: 'نتائج البحث عن', clear: 'مسح البحث',
      needLogin: 'سجّل دخولك الأول',
      pickFile: 'اختار صورة الأول',
      tooBig: 'حجم الصورة أكبر من 5 ميجا',
      badType: 'الصيغة غير مدعومة. استخدم JPG أو PNG أو WebP',
      badImage: 'مش قادر أقرأ الصورة دي',
      confirmDel: 'متأكد إنك عايز تحذف الصورة نهائيًا؟',
      deleted: 'تم الحذف', approved: 'تم قبول الصورة', rejected: 'تم رفض الصورة وحذفها',
      checkEmail: 'بعتنالك رسالة تأكيد على إيميلك. افتحها واضغط على الرابط، وبعدين اكتب كلمة السر هنا وسجّل دخول.',
      confirmed: 'تم تأكيد حسابك وتسجيل دخولك',
      linkErr: 'رابط التأكيد منتهي أو اتفتح قبل كده. سجّل دخول بإيميلك وكلمة السر، ولو مش شغال جرّب إنشاء الحساب تاني.',
      fillAll: 'املأ الإيميل وكلمة السر',
      loadErr: 'حصلت مشكلة في تحميل الصور. اتأكد إنك شغّلت ملف schema.sql في Supabase.',
      err: 'حصل خطأ، حاول تاني',
      badCreds: 'الإيميل أو كلمة السر غلط',
      userExists: 'الإيميل ده مسجل قبل كده',
      weakPass: 'كلمة السر ضعيفة (6 حروف على الأقل)',
      emailNotConfirmed: 'لازم تأكد الإيميل الأول من الرسالة اللي وصلتلك',
      rateLimit: 'محاولات كتير، استنى شوية وجرب تاني',
      moderated: 'الصورة دي لسه قيد المراجعة',
      recent: 'شاهدتها مؤخرًا', emptyRecent: 'لسه ما شاهدتش صور', emptyRecentSub: 'الصور اللي تفتحها هتظهر هنا.',
      clearHistory: 'مسح السجل', historyCleared: 'تم مسح السجل',
      copyLink: 'نسخ الرابط', linkCopied: 'تم نسخ الرابط', share: 'مشاركة',
      prev: 'السابقة', next: 'التالية', toTop: 'لفوق', notFound: 'الصورة دي مش موجودة أو لسه ما اتوافقش عليها',
      like: 'إعجاب', save: 'حفظ', saveTitle: 'حفظ في مجموعة', collections: 'مجموعاتي', newColl: 'مجموعة جديدة',
      collName: 'اسم المجموعة', collPh: 'مثال: خلفيات الموبايل', collPublic: 'عامة (أي حد معاه الرابط يشوفها)', create: 'إنشاء',
      emptyColl: 'لسه معندكش مجموعات', emptyCollSub: 'اعمل مجموعة، وبعدين احفظ فيها من زرار الحفظ جوه الصورة.',
      emptyCollItems: 'المجموعة فاضية', emptyCollItemsSub: 'احفظ فيها صور من زرار الحفظ.',
      collPublicTag: 'عامة', collPrivateTag: 'خاصة', photosN: 'صور', collSaved: 'تم الحفظ في المجموعة', collRemoved: 'اتشالت من المجموعة',
      collDeleted: 'تم حذف المجموعة', confirmDelColl: 'تحذف المجموعة؟ الصور نفسها مش هتتحذف.', collNotFound: 'المجموعة دي مش موجودة أو خاصة',
      back: 'رجوع', comments: 'التعليقات', commentPh: 'اكتب تعليق…', send: 'إرسال', noComments: 'لسه مفيش تعليقات',
      loginToComment: 'سجّل دخولك عشان تعلّق', delComment: 'حذف التعليق'
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
      sentReview: 'Uploaded. It will appear after review',
      published: 'Photo published',
      download: 'Download', del: 'Delete', approve: 'Approve', reject: 'Reject & delete',
      pending: 'Pending review', by: 'by', untitled: 'Untitled',
      emptyHome: 'No photos yet', emptyHomeSub: 'Be the first to post one.',
      emptyMine: "You haven't uploaded anything yet", emptyMineSub: 'Upload your first shot.',
      emptyReview: 'Nothing waiting for review', emptyReviewSub: 'All clear',
      emptySearch: 'No results', emptySearchSub: 'Try a different word or tag.',
      resultsFor: 'Results for', clear: 'Clear search',
      needLogin: 'Please log in first',
      pickFile: 'Choose a photo first',
      tooBig: 'Image is larger than 5 MB',
      badType: 'Unsupported format. Use JPG, PNG or WebP',
      badImage: "Couldn't read this image",
      confirmDel: 'Delete this photo permanently?',
      deleted: 'Deleted', approved: 'Photo approved', rejected: 'Photo rejected and deleted',
      checkEmail: 'We sent a confirmation email. Open it and click the link, then enter your password here and log in.',
      confirmed: 'Your account is confirmed and you are logged in',
      linkErr: 'The confirmation link has expired or was already used. Log in with your email and password.',
      fillAll: 'Enter your email and password',
      loadErr: 'Could not load photos. Make sure you ran schema.sql in Supabase.',
      err: 'Something went wrong, try again',
      badCreds: 'Wrong email or password',
      userExists: 'This email is already registered',
      weakPass: 'Password is too weak (min 6 characters)',
      emailNotConfirmed: 'Please confirm your email first',
      rateLimit: 'Too many attempts, wait a bit and retry',
      moderated: 'This photo is still pending review',
      recent: 'Recently viewed', emptyRecent: "You haven't viewed any photos yet", emptyRecentSub: 'Photos you open will show up here.',
      clearHistory: 'Clear history', historyCleared: 'History cleared',
      copyLink: 'Copy link', linkCopied: 'Link copied', share: 'Share',
      prev: 'Previous', next: 'Next', toTop: 'Back to top', notFound: 'This photo does not exist or is not approved yet',
      like: 'Like', save: 'Save', saveTitle: 'Save to collection', collections: 'Collections', newColl: 'New collection',
      collName: 'Collection name', collPh: 'e.g. Phone wallpapers', collPublic: 'Public (anyone with the link can view)', create: 'Create',
      emptyColl: 'No collections yet', emptyCollSub: 'Create one, then save photos from the Save button in the viewer.',
      emptyCollItems: 'This collection is empty', emptyCollItemsSub: 'Save photos here with the Save button.',
      collPublicTag: 'Public', collPrivateTag: 'Private', photosN: 'photos', collSaved: 'Saved to collection', collRemoved: 'Removed from collection',
      collDeleted: 'Collection deleted', confirmDelColl: 'Delete this collection? The photos themselves stay.', collNotFound: 'Collection not found or private',
      back: 'Back', comments: 'Comments', commentPh: 'Write a comment…', send: 'Send', noComments: 'No comments yet',
      loginToComment: 'Log in to comment', delComment: 'Delete comment'
    }
  };

  const lsGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } };
  const PA_ICONS = window.PA_ICONS || {};

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
    liked: new Set(),
    coll: null,
    gen: 0 // يلغي الطلبات القديمة لما المستخدم يغير البحث بسرعة
  };

  /* ------------------------------------------------------------------ */
  /* أدوات                                                               */
  /* ------------------------------------------------------------------ */
  function toast(msg, kind = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + kind;
    const ic = PA_ICONS[kind === 'ok' ? 'check' : kind === 'err' ? 'alert' : ''];
    if (ic) el.insertAdjacentHTML('beforeend', ic);
    el.append(document.createTextNode(msg));
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

  // نفس تطبيع قاعدة البيانات (norm_ar في schema.sql): أحمد = احمد، سياسة = سياسه، التشكيل يتجاهل
  const normAr = (s) => s.toLowerCase()
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');

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

  const DEEP = { id: new URLSearchParams(location.search).get('p'), c: new URLSearchParams(location.search).get('c'), shown: false };

  /* ------------------------------------------------------------------ */
  /* النوافذ                                                             */
  /* ------------------------------------------------------------------ */
  function openModal(id) {
    $(id).hidden = false;
    document.body.classList.add('lock');
  }
  function closeModal(node) {
    node.hidden = true;
    if (node.id === 'viewer' && DEEP.shown) { DEEP.shown = false; history.replaceState(null, '', location.pathname); }
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
    $('#to-top').innerHTML = PA_ICONS.up || '';
    $('#to-top').setAttribute('aria-label', t('toTop'));
    $('#v-prev').innerHTML = PA_ICONS.chevron || '';
    $('#v-next').innerHTML = PA_ICONS.chevron || '';
    $('#v-prev').setAttribute('aria-label', t('prev'));
    $('#v-next').setAttribute('aria-label', t('next'));
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
    $('[data-view="collections"]').hidden = !(S.user && SOCIAL);
    $('[data-view="review"]').hidden = !S.isAdmin;
    if (!S.user && (S.view === 'mine' || S.view === 'collections')) S.view = 'home';
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
        S.liked = new Set();
        loadPhotos(true);
        refreshPendingCount();
      }
      if (DEEP.id) openDeepLink();
      if (DEEP.c) {
        const cid = DEEP.c;
        DEEP.c = null;
        history.replaceState(null, '', location.pathname);
        if (/^[0-9a-f-]{36}$/i.test(cid)) openCollection(cid);
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
    S.coll = null;
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
    if (S.view === 'collections' || S.view === 'collection') {
      bar.replaceChildren();
      if (S.view === 'collections') bar.append(barBtn(PA_ICONS.plus, t('newColl'), () => openCollForm()));
      else if (S.coll) {
        const own = !!(S.user && S.coll.user_id === S.user.id);
        bar.append(el('b', '', S.coll.name));
        if (own) bar.append(barBtn(null, t('back'), () => { S.view = 'collections'; S.coll = null; loadPhotos(true); }));
        if (S.coll.is_public) bar.append(barBtn(PA_ICONS.link, t('copyLink'), () => copyText(location.origin + location.pathname + '?c=' + S.coll.id)));
        if (own) bar.append(barBtn(PA_ICONS.trash, t('del'), async () => {
          if (!confirm(t('confirmDelColl'))) return;
          const { error } = await sb.from('collections').delete().eq('id', S.coll.id);
          if (error) return toast(t('err'), 'err');
          toast(t('collDeleted'), 'ok');
          S.view = 'collections'; S.coll = null; loadPhotos(true);
        }, 'danger'));
      }
      bar.hidden = false;
      return;
    }
    if (S.view === 'recent' && !S.query) {
      bar.replaceChildren();
      if (!getRecent().length) { bar.hidden = true; return; }
      const c = el('button', '', t('clearHistory'));
      c.type = 'button';
      c.addEventListener('click', () => { lsSet(RECENT_KEY, '[]'); toast(t('historyCleared'), 'ok'); loadPhotos(true); });
      bar.append(c);
      bar.hidden = false;
      return;
    }
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
  // لو SQL الاجتماعي (schema_social.sql) لسه ما اتشغلش، الموقع يكمل عادي من غير لايك وتعليقات ومجموعات
  let SOCIAL = true;
  const colsNow = () => (SOCIAL ? COLS + ',like_count,comment_count' : COLS);
  function socialFail(err) {
    if (!SOCIAL || !/like_count|comment_count/i.test((err && err.message) || '')) return false;
    SOCIAL = false;
    $('[data-view="collections"]').hidden = true;
    if (S.view === 'collections' || S.view === 'collection') {
      S.view = 'home'; S.coll = null;
      $$('.tab').forEach((x) => x.classList.toggle('active', x.dataset.view === 'home'));
    }
    loadPhotos(true);
    return true;
  }

  const RECENT_KEY = 'pa_recent';
  const getRecent = () => { try { const a = JSON.parse(lsGet(RECENT_KEY) || '[]'); return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []; } catch { return []; } };
  function addRecent(id) {
    lsSet(RECENT_KEY, JSON.stringify([id, ...getRecent().filter((x) => x !== id)].slice(0, 40)));
  }

  const COLS = 'id,title,description,tags,path,view_path,thumb_path,width,height,status,user_id,created_at,profiles!user_id(username)';

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
    if ((S.view === 'mine' || S.view === 'collections') && !S.user) return;
    const gen = S.gen;
    S.loading = true;
    $('#loader').hidden = false;

    const size = C.PAGE_SIZE;
    if (S.view === 'collections' || S.view === 'collection') {
      let list = [];
      let cerr = null;
      if (S.view === 'collections') {
        const r = await sb.from('collections').select('id,name,is_public,user_id,collection_photos(count)')
          .eq('user_id', S.user.id).order('created_at', { ascending: false });
        list = r.data || []; cerr = r.error;
      } else {
        const r = await sb.from('collection_photos').select('created_at,photos(' + colsNow() + ')')
          .eq('collection_id', S.coll.id).order('created_at', { ascending: false }).limit(200);
        list = (r.data || []).map((x) => x.photos).filter(Boolean); cerr = r.error;
      }
      if (gen !== S.gen) return;
      S.loading = false; S.done = true;
      $('#loader').hidden = true;
      if (cerr) { console.error(cerr); toast(t('loadErr'), 'err'); return; }
      S.items.push(...list);
      list.forEach((x) => $('#grid').append(S.view === 'collections' ? collTile(x) : cardEl(x)));
      if (S.view === 'collection') loadLikes(list);
      renderEmpty();
      renderResultBar();
      return;
    }
    if (S.view === 'recent') {
      const ids = getRecent();
      let rows = [];
      let err = null;
      if (ids.length) {
        const r = await sb.from('photos').select(colsNow()).in('id', ids);
        rows = r.data || []; err = r.error;
      }
      if (gen !== S.gen) return;
      S.loading = false; S.done = true;
      $('#loader').hidden = true;
      if (err && socialFail(err)) return;
      if (err) { console.error(err); toast(t('loadErr'), 'err'); return; }
      rows.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      S.items.push(...rows);
      rows.forEach((p) => $('#grid').append(cardEl(p)));
      loadLikes(rows);
      renderEmpty();
      renderResultBar();
      return;
    }
    let q = sb.from('photos').select(colsNow())
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(S.page * size, S.page * size + size - 1);

    if (S.view === 'home') q = q.eq('status', 'approved');
    else if (S.view === 'mine') q = q.eq('user_id', S.user.id);
    else if (S.view === 'review') q = q.eq('status', 'pending');

    if (S.query) {
      normAr(S.query).split(/\s+/).filter(Boolean).forEach((w) => {
        const safe = w.replace(/[%_\\]/g, '');
        if (safe) q = q.ilike('search_text', '%' + safe + '%');
      });
    }

    const { data, error } = await q;
    if (gen !== S.gen) return; // وصلنا طلب أحدث
    S.loading = false;
    $('#loader').hidden = true;

    if (error && socialFail(error)) return;
    if (error) {
      console.error(error);
      toast(t('loadErr') + ' (' + String(error.message || '').slice(0, 90) + ')', 'err');
      S.done = true;
      return;
    }
    if (data.length < size) S.done = true;
    S.page++;
    S.items.push(...data);
    data.forEach((p) => $('#grid').append(cardEl(p)));
    loadLikes(data);
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
    else if (S.view === 'recent') { h = 'emptyRecent'; s = 'emptyRecentSub'; }
    else if (S.view === 'collections') { h = 'emptyColl'; s = 'emptyCollSub'; }
    else if (S.view === 'collection') { h = 'emptyCollItems'; s = 'emptyCollItemsSub'; }
    else if (S.view === 'mine') { h = 'emptyMine'; s = 'emptyMineSub'; }
    else if (S.view === 'review') { h = 'emptyReview'; s = 'emptyReviewSub'; }
    else { h = 'emptyHome'; s = 'emptyHomeSub'; }
    box.append(el('h3', '', t(h)), el('p', '', t(s)));
    if (!S.query && S.view !== 'review' && S.view !== 'recent' && S.view !== 'collections' && S.view !== 'collection') {
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
    S.items.forEach((p) => grid.append(S.view === 'collections' ? collTile(p) : cardEl(p)));
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
      const cp = el('button', 'icon-btn copy-btn');
      cp.type = 'button';
      cp.innerHTML = PA_ICONS.link || '';
      cp.title = t('copyLink');
      cp.setAttribute('aria-label', t('copyLink'));
      cp.addEventListener('click', (e) => { e.stopPropagation(); copyText(photoUrl(p)); });
      const dl = downloadLink(p, 'icon-btn');
      dl.innerHTML = DL_ICON;
      dl.addEventListener('click', (e) => e.stopPropagation());
      if (SOCIAL) row.append(likeBtn(p, 'icon-btn like-btn'));
      row.append(cp, dl);
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
  const photoUrl = (p) => location.origin + location.pathname + '?p=' + p.id;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      ta.remove();
    }
    toast(t('linkCopied'), 'ok');
  }

  let curIdx = -1;
  function stepViewer(d) {
    const n = S.items[curIdx + d];
    if (n && !$('#viewer').hidden) openViewer(n);
  }
  $('#v-prev').addEventListener('click', () => stepViewer(-1));
  $('#v-next').addEventListener('click', () => stepViewer(1));
  document.addEventListener('keydown', (e) => {
    if ($('#viewer').hidden || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowLeft') stepViewer(rtl ? 1 : -1);
    else if (e.key === 'ArrowRight') stepViewer(rtl ? -1 : 1);
  });
  let tx = null;
  $('.v-media').addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; }, { passive: true });
  $('.v-media').addEventListener('touchend', (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) < 70) return;
    const rtl = document.documentElement.dir === 'rtl';
    stepViewer((dx < 0) === rtl ? -1 : 1);
  }, { passive: true });
  function openViewer(p) {
    curIdx = S.items.findIndex((x) => x.id === p.id);
    $('#v-prev').hidden = curIdx < 0 || curIdx === 0;
    $('#v-next').hidden = curIdx < 0 || curIdx >= S.items.length - 1;
    if (p.status === 'approved') addRecent(p.id);
    const img = $('#v-img');
    img.classList.remove('ready');
    img.onload = img.onerror = () => img.classList.add('ready');
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
      const cp = el('button', 'btn ghost');
      cp.type = 'button';
      cp.innerHTML = (PA_ICONS.link || '') + '<span></span>';
      cp.lastChild.textContent = t('copyLink');
      cp.addEventListener('click', () => copyText(photoUrl(p)));
      act.append(dl, cp);
      if (navigator.share) {
        const sh = el('button', 'btn ghost');
        sh.type = 'button';
        sh.innerHTML = (PA_ICONS.share || '') + '<span></span>';
        sh.lastChild.textContent = t('share');
        sh.addEventListener('click', () => navigator.share({ title: p.title || 'Photo Ar', url: photoUrl(p) }).catch(() => {}));
        act.append(sh);
      }
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
    renderSocial(p);
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
    $('#up-prog').hidden = true;
  }

  function renderChips() {
    const box = $('#chips');
    box.replaceChildren();
    U.tags.forEach((tag, i) => {
      const c = el('span', 'chip', '#' + tag);
      const x = el('button', '');
      x.innerHTML = PA_ICONS.close || '';
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
    const prog = $('#up-prog');
    const setProg = (n) => { prog.firstElementChild.style.width = n + '%'; };
    prog.hidden = false; setProg(6);

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
      setProg(15);
      let doneN = 0;
      for (const f of files) {
        const { error } = await sb.storage.from(BUCKET).upload(f.path, f.blob, {
          contentType: f.type, cacheControl: '31536000', upsert: false
        });
        if (error) throw error;
        uploaded.push(f.path);
        setProg(15 + Math.round((++doneN / files.length) * 75));
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
      setProg(100);

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
      prog.hidden = true;
    }
  });

  /* ------------------------------------------------------------------ */
  /* الإعجابات                                                           */
  /* ------------------------------------------------------------------ */
  function likeBtn(p, cls) {
    const b = el('button', cls);
    b.type = 'button';
    b.dataset.like = p.id;
    b.innerHTML = (PA_ICONS.heart || '') + '<span class="n"></span>';
    b.title = t('like');
    b.setAttribute('aria-label', t('like'));
    b.addEventListener('click', (e) => { e.stopPropagation(); toggleLike(p); });
    paintLike(b, p);
    return b;
  }
  function paintLike(b, p) {
    const on = S.liked.has(p.id);
    b.classList.toggle('liked', on);
    b.setAttribute('aria-pressed', String(on));
    b.querySelector('.n').textContent = p.like_count > 0 ? p.like_count : '';
  }
  const syncLike = (p) => $$('[data-like="' + p.id + '"]').forEach((b) => paintLike(b, p));

  async function toggleLike(p) {
    if (!S.user) { toast(t('needLogin'), 'err'); return openAuth('login'); }
    const had = S.liked.has(p.id);
    if (had) S.liked.delete(p.id); else S.liked.add(p.id);
    p.like_count = Math.max(0, (p.like_count || 0) + (had ? -1 : 1));
    syncLike(p);
    const { error } = had
      ? await sb.from('likes').delete().eq('photo_id', p.id).eq('user_id', S.user.id)
      : await sb.from('likes').insert({ photo_id: p.id, user_id: S.user.id });
    if (error) {
      console.error(error);
      if (had) S.liked.add(p.id); else S.liked.delete(p.id);
      p.like_count = Math.max(0, p.like_count + (had ? 1 : -1));
      syncLike(p);
      toast(t('err'), 'err');
    }
  }

  async function loadLikes(rows) {
    if (!SOCIAL || !S.user || !rows.length) return;
    const { data } = await sb.from('likes').select('photo_id').eq('user_id', S.user.id).in('photo_id', rows.map((p) => p.id));
    (data || []).forEach((r) => S.liked.add(r.photo_id));
    rows.forEach(syncLike);
  }

  /* ------------------------------------------------------------------ */
  /* التعليقات                                                           */
  /* ------------------------------------------------------------------ */
  let cTok = 0;
  const cTitle = (p) => t('comments') + (p.comment_count > 0 ? ' (' + p.comment_count + ')' : '');
  const C_COLS = 'id,body,created_at,user_id,profiles!user_id(username)';

  function renderSocial(p) {
    const soc = $('#v-social');
    const box = $('#v-comments');
    soc.replaceChildren();
    box.replaceChildren();
    soc.hidden = box.hidden = !(SOCIAL && p.status === 'approved');
    if (soc.hidden) return;
    soc.append(likeBtn(p, 'btn ghost like-btn'));
    const sv = el('button', 'btn ghost');
    sv.type = 'button';
    sv.innerHTML = (PA_ICONS.bookmark || '') + '<span></span>';
    sv.lastChild.textContent = t('save');
    sv.addEventListener('click', () => openSave(p));
    soc.append(sv);
    loadComments(p, box);
  }

  async function loadComments(p, box) {
    const tok = ++cTok;
    const h = el('h3', '', cTitle(p));
    const list = el('div', 'c-list');
    box.append(h, list);
    if (S.user) box.append(commentForm(p, list, h));
    else {
      const l = el('button', 'link', t('loginToComment'));
      l.type = 'button';
      l.addEventListener('click', () => openAuth('login'));
      box.append(l);
    }
    const { data, error } = await sb.from('comments').select(C_COLS).eq('photo_id', p.id)
      .order('created_at', { ascending: true }).limit(100);
    if (tok !== cTok) return;
    if (error) { console.error(error); return; }
    if (!data.length) list.append(el('p', 'hint', t('noComments')));
    data.forEach((c) => list.append(commentEl(c, p, list, h)));
  }

  function commentEl(c, p, list, h) {
    const row = el('div', 'c-item');
    const head = el('div', 'c-head');
    head.append(el('b', '', (c.profiles && c.profiles.username) || '—'));
    if (S.user && (S.user.id === c.user_id || S.isAdmin)) {
      const d = el('button', 'c-del');
      d.type = 'button';
      d.innerHTML = PA_ICONS.trash || '';
      d.title = t('delComment');
      d.setAttribute('aria-label', t('delComment'));
      d.addEventListener('click', async () => {
        const { error } = await sb.from('comments').delete().eq('id', c.id);
        if (error) return toast(t('err'), 'err');
        row.remove();
        p.comment_count = Math.max(0, (p.comment_count || 0) - 1);
        h.textContent = cTitle(p);
        if (!list.children.length) list.append(el('p', 'hint', t('noComments')));
      });
      head.append(d);
    }
    row.append(head, el('p', 'c-body', c.body));
    return row;
  }

  function commentForm(p, list, h) {
    const f = el('form', 'c-form');
    f.noValidate = true;
    const inp = el('input');
    inp.type = 'text'; inp.maxLength = 500; inp.autocomplete = 'off'; inp.dir = 'auto';
    inp.placeholder = t('commentPh');
    const b = el('button', 'btn primary');
    b.type = 'submit';
    b.innerHTML = PA_ICONS.send || '';
    b.setAttribute('aria-label', t('send'));
    f.append(inp, b);
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = inp.value.trim();
      if (!body || b.disabled) return;
      b.disabled = true;
      const { data, error } = await sb.from('comments')
        .insert({ photo_id: p.id, user_id: S.user.id, body }).select(C_COLS).single();
      setTimeout(() => { b.disabled = false; }, 3000);
      if (error) { console.error(error); return toast(t('err'), 'err'); }
      inp.value = '';
      const empty = list.querySelector('.hint');
      if (empty) empty.remove();
      list.append(commentEl(data, p, list, h));
      p.comment_count = (p.comment_count || 0) + 1;
      h.textContent = cTitle(p);
    });
    return f;
  }

  /* ------------------------------------------------------------------ */
  /* المجموعات                                                           */
  /* ------------------------------------------------------------------ */
  const SV = { p: null };
  let collDone = null;

  const barBtn = (icon, text, fn, cls) => {
    const b = el('button', 'bar-btn' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    b.innerHTML = (icon || '') + '<span></span>';
    b.lastChild.textContent = text;
    b.addEventListener('click', fn);
    return b;
  };

  function collTile(c) {
    const n = (c.collection_photos && c.collection_photos[0] && c.collection_photos[0].count) || 0;
    const d = el('button', 'coll');
    d.type = 'button';
    d.innerHTML = (c.is_public ? PA_ICONS.globe : PA_ICONS.lock) + '<b></b><small></small>';
    d.querySelector('b').textContent = c.name;
    d.querySelector('small').textContent = n + ' ' + t('photosN') + ' · ' + t(c.is_public ? 'collPublicTag' : 'collPrivateTag');
    d.addEventListener('click', () => openCollection(c.id, c));
    return d;
  }

  async function openCollection(id, known) {
    let c = known;
    if (!c) {
      const r = await sb.from('collections').select('id,name,is_public,user_id').eq('id', id).maybeSingle();
      if (r.error || !r.data) return toast(t('collNotFound'), 'err');
      c = r.data;
    }
    S.coll = c;
    S.view = 'collection';
    $$('.tab').forEach((x) => x.classList.toggle('active', x.dataset.view === 'collections'));
    loadPhotos(true);
  }

  function openCollForm(done) {
    collDone = done || null;
    $('#coll-name').value = '';
    $('#coll-public').checked = true;
    setMsg($('#coll-msg'), '');
    openModal('#coll-modal');
    setTimeout(() => $('#coll-name').focus(), 50);
  }

  $('#coll-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#coll-name').value.trim().slice(0, 60);
    if (!name || !S.user) return;
    const btn = $('#coll-submit');
    btn.disabled = true;
    const { data, error } = await sb.from('collections')
      .insert({ user_id: S.user.id, name, is_public: $('#coll-public').checked })
      .select('id,name,is_public,user_id').single();
    btn.disabled = false;
    if (error) { console.error(error); return setMsg($('#coll-msg'), t('err')); }
    closeModal($('#coll-modal'));
    if (collDone) collDone(data);
    else if (S.view === 'collections') loadPhotos(true);
  });

  async function openSave(p) {
    if (!S.user) { toast(t('needLogin'), 'err'); return openAuth('login'); }
    SV.p = p;
    openModal('#save-modal');
    renderSaveList();
  }

  $('#save-new').addEventListener('click', () => openCollForm(async (col) => {
    if (SV.p) await sb.from('collection_photos').insert({ collection_id: col.id, photo_id: SV.p.id });
    renderSaveList();
  }));

  async function renderSaveList() {
    const box = $('#save-list');
    const [c, m] = await Promise.all([
      sb.from('collections').select('id,name,is_public').eq('user_id', S.user.id).order('created_at', { ascending: false }),
      sb.from('collection_photos').select('collection_id').eq('photo_id', SV.p.id)
    ]);
    box.replaceChildren();
    if (c.error) { console.error(c.error); return toast(t('err'), 'err'); }
    const has = new Set((m.data || []).map((r) => r.collection_id));
    c.data.forEach((col) => {
      const b = el('button', 'save-row');
      b.type = 'button';
      b.innerHTML = (col.is_public ? PA_ICONS.globe : PA_ICONS.lock) + '<span></span><i class="tick"></i>';
      b.querySelector('span').textContent = col.name;
      b.querySelector('.tick').innerHTML = PA_ICONS.check || '';
      const paint = () => b.classList.toggle('on', has.has(col.id));
      paint();
      b.addEventListener('click', () => toggleInColl(col, has, paint));
      box.append(b);
    });
    if (!c.data.length) box.append(el('p', 'hint center', t('emptyColl')));
  }

  async function toggleInColl(col, has, paint) {
    const pid = SV.p.id;
    const on = has.has(col.id);
    const { error } = on
      ? await sb.from('collection_photos').delete().eq('collection_id', col.id).eq('photo_id', pid)
      : await sb.from('collection_photos').insert({ collection_id: col.id, photo_id: pid });
    if (error) { console.error(error); return toast(t('err'), 'err'); }
    if (on) has.delete(col.id); else has.add(col.id);
    paint();
    toast(t(on ? 'collRemoved' : 'collSaved'), 'ok');
    if (on && S.view === 'collection' && S.coll && S.coll.id === col.id) dropFromView(pid);
  }

  const topBtn = $('#to-top');
  addEventListener('scroll', () => { topBtn.hidden = scrollY < 900; }, { passive: true });
  topBtn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  async function openDeepLink() {
    const id = DEEP.id;
    DEEP.id = null;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return;
    const { data } = await sb.from('photos').select(colsNow()).eq('id', id).maybeSingle();
    if (!data) return toast(t('notFound'), 'err');
    DEEP.shown = true;
    openViewer(data);
  }

  /* ------------------------------------------------------------------ */
  /* البداية                                                             */
  /* ------------------------------------------------------------------ */
  applyLang();
  if (LINK_ERROR) setTimeout(() => toast(t('linkErr'), 'err'), 400);
  // أول تحميل بيحصل من onAuthStateChange (INITIAL_SESSION)
})();
