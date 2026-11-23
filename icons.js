// أيقونات SVG لـ Photo Ar (بديل الإيموجي). كلها بتاخد لون النص الحالي (currentColor).
window.PA_ICONS = (() => {
  const mk = (d, sw = 2) =>
    '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="' + sw +
    '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  return {
    check: mk('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.6),
    alert: mk('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5v.01"/>'),
    close: mk('<path d="M6 6l12 12M18 6 6 18"/>', 2.2),
    link: mk('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
    share: mk('<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4"/>'),
    download: mk('<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>', 2.2),
    chevron: mk('<path d="m9 5 7 7-7 7"/>', 2.4), // يمين؛ بيتقلب تلقائيًا في RTL
    up: mk('<path d="m5 14 7-7 7 7M12 7.5V20"/>', 2.4),
    history: mk('<path d="M4 12a8 8 0 1 0 2.6-5.9L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4.2l3 1.8"/>'),
    heart: mk('<path d="M12 20.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10Z"/>'),
    bookmark: mk('<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z"/>'),
    comment: mk('<path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>'),
    send: mk('<path d="M4 12 20 4l-5 16-3.5-6.5L4 12Zm7.5 1.5L20 4"/>'),
    trash: mk('<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>'),
    lock: mk('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    globe: mk('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
    plus: mk('<path d="M12 5v14M5 12h14"/>', 2.4),
    image: mk('<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="1.6"/><path d="m4 17 5-4.5 3.5 3L16 12l4 4.5"/>'),
    smile: mk('<circle cx="12" cy="12" r="9"/><path d="M8.5 14a4 4 0 0 0 7 0M9 9.5v.01M15 9.5v.01"/>', 1.8)
  };
})();
