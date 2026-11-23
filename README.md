# photo-ar

Privacy/bulk-upload replacement package v2, 23 November 2026.
Supersedes the earlier four preparation files. Not deployed by the preparer.

1. Back up the current files and database configuration.
2. Run fix-storage-privacy.sql in Supabase SQL Editor. It adds a storage_bucket
   column, a private pending-photos bucket and scoped storage policies. Existing
   approved URLs stay unchanged. Old upload clients fail safely until refreshed.
3. Upload app.js, upload.js, upload.html and README.md together to GitHub.
   Find the deployed address in repository Settings > Pages; wait for success.
4. Sign in as admin in ONE tab, then account menu > Photo maintenance. Keep the
   page open. Repeat after an error. This copies all three legacy pending variants
   to private storage, updates their marker, then deletes their public originals.
   Pending originals stay exposed until this finishes. Previously cached or
   downloaded copies cannot be recalled.
5. Upload a harmless test image. Check review, anonymous gallery, direct private
   access, approve, reject and retry before calling the live privacy fix verified.

New pending images never use public-URL fallback. Five-minute signed URLs allow
owner/admin previews. Approved photos use their public URL, or a signed private
URL while an interrupted transfer awaits maintenance. Approval commits first;
copying all variants, switching the marker and private cleanup follow in order.
Retry via Photo maintenance. Storage and database actions are not atomic.
Use one admin tab for maintenance/approval/deletion; do not run them concurrently.
Do not roll back only app.js after SQL: older upload clients are incompatible.
Do not make pending-photos public to fix an error. Send the error for review.
