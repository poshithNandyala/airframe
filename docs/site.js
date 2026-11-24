'use strict';

/*
 * Single source for the site version and release assets.
 * Update these three values together when a new release ships.
 */
const AIRFRAME = {
  version: '1.5.0',
  installer: 'https://github.com/poshithNandyala/airframe/releases/download/v1.5.0/Airframe-Setup-1.5.0.exe',
  portable: 'https://github.com/poshithNandyala/airframe/releases/download/v1.5.0/Airframe-1.5.0-win-x64.zip',
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* --------------------------------------------------------------- downloads */

for (const link of $$('[data-download="installer"]')) {
  link.href = AIRFRAME.installer;
  link.setAttribute('download', `Airframe-Setup-${AIRFRAME.version}.exe`);
}

for (const link of $$('[data-download="portable"]')) {
  link.href = AIRFRAME.portable;
  link.setAttribute('download', `Airframe-${AIRFRAME.version}-win-x64.zip`);
}

for (const version of $$('[data-version]')) {
  version.textContent = AIRFRAME.version;
}

for (const link of $$('[data-download]')) {
  link.addEventListener('click', () => {
    const label = link.dataset.download === 'portable' ? 'Portable ZIP' : 'Installer';
    showToast(`${label} download is starting...`);
  });
}

/* -------------------------------------------------------------------- menu */

const nav = $('.nav');
const menuToggle = $('#menu-toggle');
const navLinks = $('#nav-links');

function closeMenu() {
  if (!nav) return;
  nav.classList.remove('nav-open');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

for (const link of $$('.nav-links a')) {
  link.addEventListener('click', closeMenu);
}

document.addEventListener('click', (event) => {
  if (nav && !nav.contains(event.target)) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener(
  'resize',
  () => {
    if (window.innerWidth > 980) closeMenu();
  },
  { passive: true }
);

/* ---------------------------------------------------------------- nav state */

function syncNavState() {
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 8);
}

syncNavState();
window.addEventListener('scroll', syncNavState, { passive: true });

/* ------------------------------------------------------------------ reveal */

const revealItems = $$('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const staticMode = new URLSearchParams(window.location.search).get('static') === '1';

if (staticMode || reduceMotion || !('IntersectionObserver' in window)) {
  for (const item of revealItems) item.classList.add('is-visible');
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
  );

  for (const item of revealItems) observer.observe(item);
}

/* ------------------------------------------------------------------- toast */

let toastTimer = 0;

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ----------------------------------------------------------------- checksums */

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();

  const ok = document.execCommand('copy');
  field.remove();

  if (!ok) throw new Error('copy failed');
}

for (const button of $$('[data-copy]')) {
  button.addEventListener('click', async () => {
    try {
      await copyText(button.dataset.copy);
      showToast('Checksum copied.');
    } catch (_) {
      showToast('Copy failed - select the hash manually.');
    }
  });
}

/* --------------------------------------------------------------- star count */

const starCount = $('#star-count');

if (starCount) {
  fetch('https://api.github.com/repos/poshithNandyala/airframe', {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data && Number.isFinite(data.stargazers_count)) {
        starCount.textContent = data.stargazers_count.toLocaleString('en-US');
      }
    })
    .catch(() => {
      // Offline / rate-limited: leave the placeholder.
    });
}
