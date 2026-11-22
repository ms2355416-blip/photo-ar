// إعدادات Photo Ar — المفتاح هنا publishable ومسموح يظهر في الموقع (الحماية بتتم من قواعد RLS في schema.sql).
// ممنوع تحط هنا service_role أو secret key أبدًا.
window.PHOTO_AR_CONFIG = {
  SUPABASE_URL: 'https://uhuhwmiefbepfrrqxdjh.supabase.co',
  SUPABASE_KEY: 'sb_publishable_FzfKBFNZpP94n_RX2822gA_aQqZh8h-',
  ADMIN_EMAIL: 'ms2355416@gmail.com', // للواجهة بس؛ الحماية الحقيقية في قاعدة البيانات
  BUCKET: 'photos',
  PAGE_SIZE: 40,
  MAX_MB: 5
};
