// ─── NAV SCROLL ───
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── MOBILE MENU ───
const menuToggle = document.getElementById('menu-toggle');
const mobileNav  = document.getElementById('mobile-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');
  mobileNav.style.display = 'flex';
  requestAnimationFrame(() => {
    mobileNav.classList.toggle('open', !isOpen);
    menuToggle.classList.toggle('active', !isOpen);
  });
  document.body.style.overflow = isOpen ? '' : 'hidden';
});
function closeMenu() {
  mobileNav.classList.remove('open');
  menuToggle.classList.remove('active');
  document.body.style.overflow = '';
}

// ─── REVEAL ───
const reveals = document.querySelectorAll('.reveal');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
reveals.forEach(el => revObs.observe(el));

// ─── STATS COUNTER ───
function countUp(el, target, decimals, duration) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = (ease * target).toFixed(decimals);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const statsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimal || '0');
      countUp(el, target, decimals, 1400);
    });
    statsObs.disconnect();
  });
}, { threshold: 0.5 });
statsObs.observe(document.querySelector('.stats-strip'));

// ─── SMOOTH ANCHORS ───
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ─── FORM ───
const form = document.getElementById('enquiry-form');
const success = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');
form.addEventListener('submit', async e => {
  e.preventDefault();
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;
  try {
    const res = await fetch(form.action, {
      method: 'POST', body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) { form.style.display = 'none'; success.style.display = 'block'; }
    else { submitBtn.textContent = 'Error — try email instead'; submitBtn.disabled = false; }
  } catch { submitBtn.textContent = 'Error — try email instead'; submitBtn.disabled = false; }
});

// ─── COOKIE ───
function dismissCookie() {
  document.getElementById('cookie-bar').classList.add('hidden');
  sessionStorage.setItem('cookie_consent', '1');
}
if (sessionStorage.getItem('cookie_consent')) {
  document.getElementById('cookie-bar').classList.add('hidden');
}

// ─── BEFORE/AFTER SLIDER ───
(function() {
  const slider = document.getElementById('ba-slider');
  const handle = document.getElementById('ba-handle');
  const before = slider.querySelector('.ba-before');
  let dragging = false;
  function setPosition(x) {
    const rect = slider.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
  }
  slider.addEventListener('mousedown', e => { dragging = true; setPosition(e.clientX); });
  window.addEventListener('mousemove', e => { if (dragging) { e.preventDefault(); setPosition(e.clientX); } });
  window.addEventListener('mouseup', () => { dragging = false; });
  slider.addEventListener('touchstart', e => { dragging = true; setPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove', e => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });
})();

// ─── TIMEZONE CLOCKS ───
function updateTimezones() {
  const zones = {
    'tz-bangkok': 'Asia/Bangkok',
    'tz-beijing': 'Asia/Shanghai',
    'tz-tokyo':   'Asia/Tokyo',
    'tz-seoul':   'Asia/Seoul'
  };
  const now = new Date();
  for (const [id, tz] of Object.entries(zones)) {
    const el = document.getElementById(id);
    if (el) el.textContent = now.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
updateTimezones();
setInterval(updateTimezones, 30000);

// ─── TRANSLATION SYSTEM ───

// ─── APPLY LANGUAGE ───
function setLang(lang) {
  const t = T[lang];
  if (!t) return;

  // Body class for hiding asian text blocks on non-EN
  document.body.classList.toggle('lang-alt', lang !== 'en');
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja' : lang === 'ko' ? 'ko' : lang === 'th' ? 'th' : 'en';

  // Helper
  const q = s => document.querySelector(s);
  const qa = s => document.querySelectorAll(s);

  // Nav
  qa('.nav-links a').forEach((a, i) => { if (t.nav[i]) a.textContent = t.nav[i]; });
  qa('.mobile-nav > a').forEach((a, i) => { if (t.nav[i]) a.textContent = t.nav[i]; });
  const navCta = q('.nav-cta'); if (navCta) navCta.textContent = t.nav_cta;
  const mobCta = q('.mobile-cta'); if (mobCta) mobCta.textContent = t.nav_cta;

  // Lang buttons active state
  const langMap = {en:0, zh:1, ja:2, ko:3, th:4};
  qa('.lang-switcher .lang-btn').forEach((b, i) => b.classList.toggle('active', i === langMap[lang]));
  qa('.mobile-lang-switcher .lang-btn').forEach((b, i) => b.classList.toggle('active', i === langMap[lang]));

  // Hero
  const heroEye = q('.hero-eyebrow'); if (heroEye) heroEye.textContent = t.hero_eyebrow;
  const heroTitle = q('.hero-title'); if (heroTitle) heroTitle.innerHTML = t.hero_title;
  const heroSub = q('.hero-sub'); if (heroSub) heroSub.textContent = t.hero_sub;
  const heroBtn1 = q('.hero-actions .btn-primary'); if (heroBtn1) heroBtn1.textContent = t.hero_btn1;
  const heroBtn2 = q('.hero-actions .btn-outline'); if (heroBtn2) heroBtn2.textContent = t.hero_btn2;
  const scrollHint = q('.scroll-hint span'); if (scrollHint) scrollHint.textContent = t.scroll;

  // Stats
  qa('.stat-label').forEach((el, i) => { if (t.stats[i]) el.textContent = t.stats[i]; });

  // About
  const aboutTag = q('#about .section-tag'); if (aboutTag) aboutTag.textContent = t.about_tag;
  const aboutTitle = q('#about .section-title'); if (aboutTitle) aboutTitle.innerHTML = t.about_title;
  const aboutPs = qa('#about .section-body');
  if (aboutPs[0]) aboutPs[0].textContent = t.about_p1;
  if (aboutPs[1]) aboutPs[1].textContent = t.about_p2;
  const aboutCap = q('.about-img-caption'); if (aboutCap) aboutCap.textContent = t.about_caption;
  const aboutBadge = q('.badge-text'); if (aboutBadge) aboutBadge.textContent = t.about_badge;
  const visaTitle = q('.gv-title'); if (visaTitle) visaTitle.textContent = t.visa_title;
  const visaBody = q('.gv-body'); if (visaBody) visaBody.innerHTML = t.visa_body;
  const aboutBtn = q('#about .btn-primary'); if (aboutBtn) aboutBtn.textContent = t.about_btn;

  // Services
  const svcTag = q('#services .section-tag'); if (svcTag) svcTag.textContent = t.svc_tag;
  const svcTitle = q('#services .section-title'); if (svcTitle) svcTitle.innerHTML = t.svc_title;
  const svcIntro = q('.services-header .section-body'); if (svcIntro) svcIntro.textContent = t.svc_intro;
  qa('.service-card').forEach((card, i) => {
    const title = card.querySelector('.service-title');
    const desc = card.querySelector('.service-desc');
    const link = card.querySelector('.service-link');
    if (title && t.svc_titles[i]) title.textContent = t.svc_titles[i];
    if (desc && t.svc_descs[i]) desc.textContent = t.svc_descs[i];
    if (link) link.textContent = t.svc_link;
  });

  // Staging
  const stgTag = q('#staging .section-tag'); if (stgTag) stgTag.textContent = t.stg_tag;
  const stgTitle = q('#staging .section-title'); if (stgTitle) stgTitle.innerHTML = t.stg_title;
  const stgPs = qa('#staging .section-body');
  if (stgPs[0]) stgPs[0].textContent = t.stg_p1;
  if (stgPs[1]) stgPs[1].textContent = t.stg_p2;
  const stgStat = q('.staging-stat-label'); if (stgStat) stgStat.innerHTML = t.stg_stat;
  const baLabels = qa('.ba-label');
  if (baLabels[0]) baLabels[0].textContent = t.ba_before;
  if (baLabels[1]) baLabels[1].textContent = t.ba_after;

  // Reviews
  const revTag = q('#reviews .section-tag'); if (revTag) revTag.textContent = t.rev_tag;
  const revTitle = q('#reviews .section-title'); if (revTitle) revTitle.innerHTML = t.rev_title;
  const revCount = q('.rating-count'); if (revCount) revCount.textContent = t.rev_count;
  qa('.review-card').forEach((card, i) => {
    if (!t.rev[i]) return;
    const text = card.querySelector('.review-text'); if (text) text.textContent = t.rev[i].text;
    const name = card.querySelector('.reviewer-name'); if (name) name.textContent = t.rev[i].name;
    const origin = card.querySelector('.reviewer-origin'); if (origin) origin.textContent = t.rev[i].origin;
    const platform = card.querySelector('.review-platform'); if (platform) platform.textContent = t.rev[i].platform;
  });

  // Blog
  const blogTag = q('#blog .section-tag'); if (blogTag) blogTag.textContent = t.blog_tag;
  const blogTitle = q('#blog .section-title'); if (blogTitle) blogTitle.innerHTML = t.blog_title;
  qa('.blog-card').forEach((card, i) => {
    if (!t.blog[i]) return;
    const tag = card.querySelector('.blog-tag'); if (tag) tag.textContent = t.blog[i].tag;
    const title = card.querySelector('.blog-title'); if (title) title.textContent = t.blog[i].title;
    const excerpt = card.querySelector('.blog-excerpt'); if (excerpt) excerpt.textContent = t.blog[i].excerpt;
    const read = card.querySelector('.blog-read'); if (read) read.textContent = t.blog_read;
  });

  // CTA / How It Works
  const ctaTag = q('#cta-section .section-tag'); if (ctaTag) ctaTag.textContent = t.cta_tag;
  const ctaTitle = q('#cta-section .section-title'); if (ctaTitle) ctaTitle.innerHTML = t.cta_title;
  const ctaSteps = q('#cta-section .section-body'); if (ctaSteps) ctaSteps.innerHTML = t.cta_steps;
  const ctaBtn = q('#cta-section .btn-primary'); if (ctaBtn) ctaBtn.textContent = t.cta_btn;

  // Contact
  const cntTag = q('#contact .section-tag'); if (cntTag) cntTag.textContent = t.cnt_tag;
  const cntTitle = q('#contact .section-title'); if (cntTitle) cntTitle.innerHTML = t.cnt_title;
  const cntBody = q('#contact .section-body'); if (cntBody) cntBody.textContent = t.cnt_body;
  const cntInfoPs = qa('.contact-info > p');
  if (cntInfoPs[0]) cntInfoPs[0].innerHTML = t.cnt_office;
  if (cntInfoPs[1]) cntInfoPs[1].innerHTML = t.cnt_phone;
  if (cntInfoPs[2]) cntInfoPs[2].innerHTML = t.cnt_langs;
  const cntTz = q('.contact-info > p:last-of-type'); // tz label
  qa('.contact-info p').forEach(p => { if (p.style.fontSize === '0.72rem' || p.style.cssText.includes('.72rem')) p.textContent = t.cnt_tz; });

  // Form labels
  qa('.form-label').forEach((label, i) => { if (t.form[i]) label.textContent = t.form[i]; });

  // Form placeholders
  const formInputs = [
    q('input[name="name"]'), q('input[name="company"]'),
    q('input[name="email"]'), q('input[name="phone"]'),
    null, null,
    q('textarea[name="message"]')
  ];
  formInputs.forEach((el, i) => { if (el && t.form_ph[i]) el.placeholder = t.form_ph[i]; });

  // Form selects
  const svcSelect = q('select[name="service"]');
  if (svcSelect) svcSelect.querySelectorAll('option').forEach((opt, i) => { if (t.form_svc_opts[i]) opt.textContent = t.form_svc_opts[i]; });
  const locSelect = q('select[name="location"]');
  if (locSelect) locSelect.querySelectorAll('option').forEach((opt, i) => { if (t.form_loc_opts[i]) opt.textContent = t.form_loc_opts[i]; });

  // Form button
  const formBtn = q('.form-submit'); if (formBtn) formBtn.textContent = t.form_btn;

  // Form success
  const formSuccess = q('.form-success > p:first-child'); if (formSuccess) formSuccess.textContent = t.form_success;

  // Footer
  const ftAbout = q('.footer-about'); if (ftAbout) ftAbout.textContent = t.ft_about;
  qa('.footer-col-title').forEach((el, i) => { if (t.ft_cols[i]) el.textContent = t.ft_cols[i]; });
  const ftSvcLinks = qa('.footer-grid > div:nth-child(2) .footer-links a');
  ftSvcLinks.forEach((a, i) => { if (t.ft_svc[i]) a.textContent = t.ft_svc[i]; });
  const ftCopy = q('.footer-bottom > span:first-child'); if (ftCopy) ftCopy.innerHTML = t.ft_copy;

  // Cookie bar
  const cookieP = q('#cookie-bar p');
  if (cookieP) cookieP.innerHTML = t.cookie_text + '<a href="/privacy.html">' + (T[lang].cookie_link || 'Privacy Policy') + '</a>.';
  const cookieDecline = q('.cookie-decline'); if (cookieDecline) cookieDecline.textContent = t.cookie_decline;
  const cookieAccept = q('.cookie-accept'); if (cookieAccept) cookieAccept.textContent = t.cookie_accept;

  // Persist
  localStorage.setItem('site_lang', lang);
}

// ─── LANG BUTTON HANDLERS ───
const langCodes = ['en','zh','ja','ko','th'];
document.querySelectorAll('.lang-switcher .lang-btn').forEach((btn, i) => {
  btn.addEventListener('click', () => setLang(langCodes[i]));
});
document.querySelectorAll('.mobile-lang-switcher .lang-btn').forEach((btn, i) => {
  btn.addEventListener('click', () => { setLang(langCodes[i]); closeMenu(); });
});

// ─── RESTORE SAVED LANGUAGE ───
const savedLang = localStorage.getItem('site_lang');
if (savedLang && savedLang !== 'en') setLang(savedLang);

// ─── CHAT WIDGET ───
const chatFab = document.getElementById('chat-fab');
const chatPanel = document.getElementById('chat-panel');

chatFab.addEventListener('click', () => {
  const isOpen = chatPanel.classList.contains('open');
  chatPanel.classList.toggle('open', !isOpen);
  chatFab.classList.toggle('open', !isOpen);
});

function closeChatPanel() {
  chatPanel.classList.remove('open');
  chatFab.classList.remove('open');
}

// Tab switching
document.querySelectorAll('.chat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.chat-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.chat-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

// Chat input → WhatsApp redirect
document.getElementById('chat-msg').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const msg = e.target.value.trim();
    if (msg) window.open('https://wa.me/36301865215?text=' + encodeURIComponent(msg), '_blank');
  }
});

// ─── CONFIGURATOR ───
const cfgData = { location: '', services: [] };

function cfgSelect(step, btn) {
  cfgData.location = btn.dataset.val;
  btn.parentElement.querySelectorAll('.cfg-opt').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  setTimeout(() => cfgNext(step), 300);
}

function cfgToggle(btn) {
  btn.classList.toggle('selected');
  const val = btn.dataset.val;
  if (cfgData.services.includes(val)) {
    cfgData.services = cfgData.services.filter(s => s !== val);
  } else {
    cfgData.services.push(val);
  }
}

function cfgNext(fromStep) {
  document.getElementById('cfg-step-' + fromStep).classList.remove('active');
  const next = fromStep + 1;
  document.getElementById('cfg-step-' + next).classList.add('active');
  for (let i = 1; i <= 3; i++) {
    document.getElementById('cfg-dot-' + i).classList.toggle('done', i <= next);
  }
}

function cfgSubmit() {
  const name = document.getElementById('cfg-name').value.trim();
  const email = document.getElementById('cfg-email').value.trim();
  const phone = document.getElementById('cfg-phone').value.trim();
  if (!name || !email) { alert('Please enter your name and email.'); return; }

  // Send to formspree
  const body = new FormData();
  body.append('name', name);
  body.append('email', email);
  body.append('phone', phone);
  body.append('location', cfgData.location);
  body.append('services', cfgData.services.join(', '));
  body.append('source', 'Chat Configurator');

  fetch(document.getElementById('enquiry-form').action, {
    method: 'POST', body: body,
    headers: { 'Accept': 'application/json' }
  }).catch(() => {});

  document.getElementById('cfg-step-3').classList.remove('active');
  document.getElementById('cfg-result').classList.add('active');
}
