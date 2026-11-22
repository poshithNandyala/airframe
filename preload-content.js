'use strict';

// Runs inside YouTube's page. No Node APIs are exposed to the page; this is a
// tiny userscript that hides ad surfaces, skips in-player ads, draws the small
// shortcut toasts, and applies the Chrome compatibility shim used by Google
// sign-in.
const { ipcRenderer, webFrame } = require('electron');

(() => {
  installChromeShim();

  const isYouTube =
    /(^|\.)youtube\.com$/i.test(location.hostname) ||
    /(^|\.)youtube-nocookie\.com$/i.test(location.hostname);

  // ------------------------------------------------ Google / Chrome shim

  // Google's sign-in flow refuses Chromium builds it identifies as embedded
  // (the "This browser or app may not be secure" page). Present the client
  // hints Google expects from desktop Chrome. This is a compatibility shim in
  // the page's main world; it changes no account data.
  function installChromeShim() {
    try {
      let fullVersion = '156.0.0.0';
      try {
        if (process.versions && process.versions.chrome) fullVersion = process.versions.chrome;
      } catch (_) {}
      const major = String(fullVersion).split('.')[0];
      const code =
        "(function(){\n" +
        "  if (window.__airframeChromeShim) return;\n" +
        "  window.__airframeChromeShim = true;\n" +
        "  var brands = [\n" +
        `    { brand: 'Google Chrome', version: '${major}' },\n` +
        `    { brand: 'Chromium', version: '${major}' },\n` +
        "    { brand: 'Not:A-Brand', version: '8' }\n" +
        "  ];\n" +
        "  var fullVersionList = [\n" +
        `    { brand: 'Google Chrome', version: '${fullVersion}' },\n` +
        `    { brand: 'Chromium', version: '${fullVersion}' },\n` +
        "    { brand: 'Not:A-Brand', version: '8.0.0.0' }\n" +
        "  ];\n" +
        "  var uaData = {\n" +
        "    brands: brands,\n" +
        "    mobile: false,\n" +
        "    platform: 'Windows',\n" +
        "    getHighEntropyValues: function () {\n" +
        "      return Promise.resolve({\n" +
        "        brands: brands,\n" +
        "        fullVersionList: fullVersionList,\n" +
        "        mobile: false,\n" +
        "        platform: 'Windows',\n" +
        "        platformVersion: '15.0.0',\n" +
        "        architecture: 'x86',\n" +
        "        bitness: '64',\n" +
        "        model: '',\n" +
        "        wow64: false,\n" +
        `        uaFullVersion: '${fullVersion}'\n` +
        "      });\n" +
        "    },\n" +
        "    toJSON: function () { return { brands: brands, mobile: false, platform: 'Windows' }; }\n" +
        "  };\n" +
        "  try {\n" +
        "    Object.defineProperty(Navigator.prototype, 'userAgentData', {\n" +
        "      configurable: true,\n" +
        "      get: function () { return uaData; }\n" +
        "    });\n" +
        "  } catch (_) {}\n" +
        "  try {\n" +
        "    Object.defineProperty(navigator, 'webdriver', { configurable: true, get: function () { return false; } });\n" +
        "  } catch (_) {}\n" +
        "  try {\n" +
        "    Object.defineProperty(Navigator.prototype, 'pdfViewerEnabled', { configurable: true, get: function () { return true; } });\n" +
        "  } catch (_) {}\n" +
        "  try {\n" +
        "    var chrome = window.chrome || {};\n" +
        "    if (!chrome.app) chrome.app = { isInstalled: false, InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' }, RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' } };\n" +
        "    if (!chrome.csi) chrome.csi = function () { return { onloadT: Date.now(), startE: Date.now(), pageT: 0, tran: 15 }; };\n" +
        "    if (!chrome.loadTimes) chrome.loadTimes = function () { var t = performance.timeOrigin / 1000; return { requestTime: t, startLoadTime: t, commitLoadTime: t, finishDocumentLoadTime: t, finishLoadTime: t, firstPaintTime: t, firstPaintAfterLoadTime: 0, navigationType: 'Other', wasFetchedViaSpdy: true, wasNpnNegotiated: true, npnNegotiatedProtocol: 'h2', wasAlternateProtocolAvailable: false, connectionInfo: 'h2' }; };\n" +
        "    if (!window.chrome) Object.defineProperty(window, 'chrome', { configurable: true, value: chrome });\n" +
        "  } catch (_) {}\n" +
        "})();";

      try {
        webFrame.executeJavaScriptInIsolatedWorld(0, [{ code }]);
      } catch (_) {
        try {
          webFrame.executeJavaScript(code);
        } catch (_) {}
      }
    } catch (_) {
      // The session-level UA/client-hint spoof still applies if this fails.
    }
  }

  // ------------------------------------------------------------ window toast

  function ensureToastStyle() {
    if (document.getElementById('airframe-toast-css')) return;
    const style = document.createElement('style');
    style.id = 'airframe-toast-css';
    style.textContent = `
      .airframe-toast {
        position: fixed;
        left: 50%;
        bottom: 26px;
        transform: translate(-50%, 10px);
        max-width: min(680px, 88vw);
        padding: 10px 17px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 14px;
        background: rgba(15, 15, 19, 0.94);
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        color: #ececf1;
        font: 500 12px/1.5 "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
        text-align: center;
        letter-spacing: 0.1px;
        -webkit-backdrop-filter: blur(16px) saturate(1.2);
        backdrop-filter: blur(16px) saturate(1.2);
        opacity: 0;
        pointer-events: none;
        z-index: 2147483647;
        transition: opacity 0.22s ease, transform 0.22s ease;
      }
      .airframe-toast.show {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  let toastEl = null;
  let toastTimer = 0;

  function showToast(message) {
    if (!message) return;
    ensureToastStyle();
    if (!toastEl || !toastEl.isConnected) {
      toastEl = document.createElement('div');
      toastEl.className = 'airframe-toast';
      toastEl.setAttribute('role', 'status');
      document.body ? document.body.appendChild(toastEl) : document.documentElement.appendChild(toastEl);
    }
    toastEl.textContent = message;
    clearTimeout(toastTimer);
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => {
      if (toastEl) toastEl.classList.remove('show');
    }, 6200);
  }

  ipcRenderer.on('airframe:toast', (_event, message) => showToast(String(message || '')));

  // ------------------------------------------------- touchpad swipe back/forward

  // Chrome-style: two fingers right = back, two fingers left = forward. A small
  // arrow slides in from the edge while swiping and turns white once released
  // will navigate; swiping back before letting go cancels.
  const nav = { canGoBack: false, canGoForward: false };
  ipcRenderer.on('airframe:nav-state', (_event, state) => {
    nav.canGoBack = Boolean(state && state.canGoBack);
    nav.canGoForward = Boolean(state && state.canGoForward);
  });

  const SWIPE_TRIGGER = 150; // px of horizontal travel to commit
  const SWIPE_IDLE_MS = 140; // no wheel events for this long = gesture over
  const swipe = { active: false, locked: false, acc: 0, peak: 0, timer: 0 };
  let swipeEl = null;

  function ensureSwipeStyle() {
    if (document.getElementById('airframe-swipe-css')) return;
    const style = document.createElement('style');
    style.id = 'airframe-swipe-css';
    style.textContent = `
      .airframe-swipe {
        position: fixed;
        top: 50%;
        left: 0;
        width: 46px;
        height: 46px;
        margin-top: -23px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 50%;
        background: rgba(20, 20, 25, 0.86);
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.07);
        color: #ececf1;
        -webkit-backdrop-filter: blur(16px) saturate(1.2);
        backdrop-filter: blur(16px) saturate(1.2);
        opacity: 0;
        pointer-events: none;
        z-index: 2147483647;
        transition: background 0.16s ease, color 0.16s ease, border-color 0.16s ease;
        will-change: transform, opacity;
      }
      .airframe-swipe.forward { left: auto; right: 0; }
      .airframe-swipe.forward svg { transform: rotate(180deg); }
      .airframe-swipe.ready {
        border-color: rgba(255, 255, 255, 0.9);
        background: #f4f4f6;
        color: #0c0c0f;
      }
      .airframe-swipe.settle {
        transition: transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.26s ease,
          background 0.16s ease, color 0.16s ease;
      }
      .airframe-swipe svg { width: 20px; height: 20px; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function swipeIndicator() {
    if (swipeEl && swipeEl.isConnected) return swipeEl;
    ensureSwipeStyle();
    const NS = 'http://www.w3.org/2000/svg';
    swipeEl = document.createElement('div');
    swipeEl.className = 'airframe-swipe';
    swipeEl.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M19 12H5M11 6l-6 6 6 6');
    svg.appendChild(path);
    swipeEl.appendChild(svg);
    document.documentElement.appendChild(swipeEl);
    return swipeEl;
  }

  function swipeDirection() {
    return swipe.acc < 0 ? 'back' : 'forward';
  }

  function swipeAllowed(direction) {
    return direction === 'back' ? nav.canGoBack : nav.canGoForward;
  }

  function drawSwipe() {
    const el = swipeIndicator();
    const direction = swipeDirection();
    const allowed = swipeAllowed(direction);
    const p = Math.min(1, Math.abs(swipe.acc) / SWIPE_TRIGGER);
    const eased = 1 - Math.pow(1 - p, 2);
    const travel = -56 + eased * 74; // from off-screen to 18px in
    el.classList.remove('settle');
    el.classList.toggle('forward', direction === 'forward');
    el.classList.toggle('ready', allowed && p >= 1);
    el.style.transform =
      `translateX(${direction === 'back' ? travel : -travel}px) scale(${0.78 + 0.22 * eased})`;
    el.style.opacity = String(Math.min(1, eased * 1.6) * (allowed ? 1 : 0.4));
  }

  function hideSwipe(fired) {
    if (!swipeEl || !swipeEl.isConnected) return;
    const back = !swipeEl.classList.contains('forward');
    swipeEl.classList.add('settle');
    swipeEl.style.opacity = '0';
    swipeEl.style.transform = fired
      ? `translateX(${back ? 18 : -18}px) scale(1.14)`
      : `translateX(${back ? -56 : 56}px) scale(0.78)`;
  }

  function fireSwipe() {
    const direction = swipeDirection();
    const go = swipeAllowed(direction);
    if (go) ipcRenderer.send('airframe:nav', direction);
    hideSwipe(go);
  }

  function endSwipe() {
    if (swipe.active && !swipe.locked) {
      if (Math.abs(swipe.acc) >= SWIPE_TRIGGER) fireSwipe();
      else hideSwipe(false);
    }
    swipe.active = false;
    swipe.locked = false;
    swipe.acc = 0;
    swipe.peak = 0;
  }

  // True when an element under the pointer can still scroll sideways in this
  // direction (shelves, chip bars): the swipe belongs to it, not to history.
  function scrollsSideways(node, dx) {
    for (let el = node; el && el.nodeType === 1 && el !== document.documentElement; el = el.parentElement) {
      if (el.scrollWidth <= el.clientWidth + 1) continue;
      const overflow = getComputedStyle(el).overflowX;
      if (overflow !== 'auto' && overflow !== 'scroll') continue;
      if (dx < 0 ? el.scrollLeft > 0 : el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
    }
    return false;
  }

  window.addEventListener(
    'wheel',
    (event) => {
      // Ctrl = pinch zoom, Shift = mouse sideways scroll: never navigate.
      if (event.ctrlKey || event.shiftKey || event.altKey) return;
      clearTimeout(swipe.timer);
      swipe.timer = setTimeout(endSwipe, SWIPE_IDLE_MS);

      const dx = event.deltaMode === 1 ? event.deltaX * 16 : event.deltaX;
      const dy = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (!swipe.active) {
        if (!dx && !dy) return;
        swipe.active = true;
        // Decide once per gesture: mostly-vertical scrolling never turns into
        // a swipe halfway through.
        swipe.locked = Math.abs(dx) <= Math.abs(dy) * 1.2 || scrollsSideways(event.target, dx);
      }
      if (swipe.locked) return;

      swipe.acc += dx;
      swipe.peak = Math.max(swipe.peak, Math.abs(dx));
      drawSwipe();

      // Fingers lifted (deltas fading) past the threshold: go now rather than
      // waiting for the touchpad's momentum to finish.
      if (Math.abs(swipe.acc) >= SWIPE_TRIGGER && Math.abs(dx) < swipe.peak * 0.3) {
        fireSwipe();
        swipe.locked = true;
      }
    },
    { passive: true, capture: true }
  );

  if (!isYouTube) return;

  // ------------------------------------------------------------- ad cleanup

  const CSS = `
    ytd-ad-slot-renderer,
    ytd-in-feed-ad-layout-renderer,
    ytd-promoted-sparkles-web-renderer,
    ytd-promoted-video-renderer,
    ytd-display-ad-renderer,
    ytd-banner-promo-renderer,
    ytd-statement-banner-renderer,
    ytd-companion-slot-renderer,
    ytd-action-companion-ad-renderer,
    #player-ads,
    #masthead-ad,
    .ytp-ad-overlay-container,
    .ytp-ad-overlay-slot,
    .ytp-ad-image-overlay,
    .ytp-ad-progress-list,
    .ytp-ad-survey,
    .ytp-ad-survey-answers,
    .ytp-ad-badge,
    ytd-enforcement-message-view-model,
    tp-yt-paper-dialog:has(ytd-enforcement-message-view-model),
    ytd-popup-container:has(ytd-enforcement-message-view-model) {
      display: none !important;
    }

    ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
    ytd-rich-item-renderer:has(ytd-in-feed-ad-layout-renderer),
    ytd-rich-item-renderer:has(ytd-display-ad-renderer) {
      display: none !important;
    }
  `;

  let lastSeek = 0;

  function ensureCleanStyle() {
    if (document.getElementById('airframe-clean')) return;
    const style = document.createElement('style');
    style.id = 'airframe-clean';
    style.textContent = CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function clickAll(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      try {
        element.click();
      } catch (_) {}
    });
  }

  function dismissEnforcement() {
    const modal = document.querySelector('ytd-enforcement-message-view-model');
    if (!modal) return;

    try {
      const dialog = modal.closest('tp-yt-paper-dialog') || modal;
      dialog.remove();
    } catch (_) {
      try {
        modal.remove();
      } catch (_) {}
    }

    const video = document.querySelector('.html5-video-player video');
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  }

  function tick() {
    try {
      ensureCleanStyle();
      dismissEnforcement();

      // Banner ad close buttons.
      clickAll(
        '.ytp-ad-overlay-close-button, .ytp-ad-overlay-close-container, .ytp-ad-feedback-dialog-close-button'
      );

      const adPlayer = document.querySelector(
        '.html5-video-player.ad-showing, .html5-video-player.ad-interrupting'
      );
      if (!adPlayer) return;

      // Click a real "Skip Ad" button whenever YouTube offers one.
      clickAll(
        '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-skip-button'
      );

      // Fast-forward unskippable ads. The ad-UI check prevents touching the
      // main video during the brief moment the ad classes linger after an ad.
      const hasAdUi = document.querySelector(
        '.ytp-ad-player-overlay, .ytp-ad-player-overlay-layout, .ytp-ad-text, ' +
          '.ytp-ad-preview-container, .ytp-ad-skip-button, .ytp-ad-skip-button-modern'
      );
      if (!hasAdUi) return;
      if (Date.now() - lastSeek < 1500) return;

      let seeked = false;
      adPlayer.querySelectorAll('video').forEach((video) => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        if (video.duration - video.currentTime > 0.4) {
          try {
            video.currentTime = Math.max(0, video.duration - 0.05);
            seeked = true;
          } catch (_) {}
        }
      });
      if (seeked) lastSeek = Date.now();
    } catch (_) {
      // Never let cosmetic/ad logic break the page.
    }
  }

  function start() {
    ensureCleanStyle();
    ensureToastStyle();
    setInterval(tick, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
