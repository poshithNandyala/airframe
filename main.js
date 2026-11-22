'use strict';

const {
  app,
  BrowserWindow,
  WebContentsView,
  session,
  ipcMain,
  globalShortcut,
  Menu,
  shell,
  screen,
} = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

// Chromium creates its top-level window with WS_EX_NOREDIRECTIONBITMAP when it
// uses DirectComposition. Windows will not route pointer/touchpad input through
// a window with that style, even when WS_EX_TRANSPARENT is set. The classic
// redirection surface lets ghost mode be genuinely click-through for WinUI 3
// and WebView2 apps.
app.commandLine.appendSwitch('disable-direct-composition');

const APP_NAME = 'Airframe';
const START_URL = 'https://www.youtube.com/';
// The partition name predates the rename. Keeping it preserves an existing
// YouTube sign-in that was created by the previous build.
const PARTITION = 'persist:youtube-overlay';
const TOP_GRIP = 8;
const MIN_OPACITY = 0;
const OPACITY_STEP = 0.1;
const MOVE_STEP = 24;
const SMOKE = process.argv.includes('--smoke');
const GHOST_SMOKE = process.argv.includes('--ghost-smoke');
const SWIPE_SMOKE = process.argv.includes('--swipe-smoke');

// Present ourselves as desktop Chrome. Google blocks sign-in from user agents
// that advertise Electron, and YouTube behaves better with a normal UA too.
const CHROME_VERSION = process.versions.chrome;
const CHROME_MAJOR = CHROME_VERSION.split('.')[0];
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  `(KHTML, like Gecko) Chrome/${CHROME_MAJOR}.0.0.0 Safari/537.36`;

app.setName(APP_NAME);
// Use a dedicated profile directory so this app's cache and YouTube session
// never mix with another Chromium app on the machine.
app.setPath('userData', path.join(app.getPath('appData'), 'Airframe'));
app.userAgentFallback = CHROME_UA;
app.setAppUserModelId('com.poshith.airframe');

let win = null;
let view = null;
let uiReady = false;
let mode = 'home'; // 'home' | 'youtube'
let youtubeLoaded = false;
let youtubeLoading = false;
let hintShown = false;
let saveTimer = null;
let blockedRequests = 0;
const shortcutIssues = [];
let hotkeyHelper = null;
let hotkeyHelperReady = false;
let helperRestarts = 0;
let fallbackRegistered = false;
let quitting = false;
let sessionFlushed = false;
let sessionFlushInProgress = false;
let mouseIgnored = false;

const settings = {
  bounds: null,
  opacity: 0.93, // every launch starts here; Alt+Shift+arrows change it live
  alwaysOnTop: true,
  protected: true,
  ghost: false,
  muted: false,
};

// ---------------------------------------------------------------------- log

const LOG_LIMIT = 512 * 1024;

function logPath() {
  return path.join(app.getPath('userData'), 'airframe.log');
}

function logLine(message) {
  const line = `${new Date().toISOString()} ${message}\n`;
  try {
    fs.mkdirSync(path.dirname(logPath()), { recursive: true });
    let size = 0;
    try {
      size = fs.statSync(logPath()).size;
    } catch (_) {}
    if (size > LOG_LIMIT) {
      try {
        fs.renameSync(logPath(), logPath() + '.old');
      } catch (_) {}
    }
    fs.appendFileSync(logPath(), line);
  } catch (_) {}
}

// ---------------------------------------------------------------- state file

function statePath() {
  return path.join(app.getPath('userData'), 'airframe-state.json');
}

function loadState() {
  try {
    const raw = fs.readFileSync(statePath(), 'utf8').replace(/^\uFEFF/, '');
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;
    settings.bounds = saved.bounds || null;
    if (typeof saved.alwaysOnTop === 'boolean') settings.alwaysOnTop = saved.alwaysOnTop;
    if (typeof saved.protected === 'boolean') settings.protected = saved.protected;
    // Click-through is intentionally session-only: starting the app in ghost
    // mode would make the launcher unclickable.
  } catch (_) {
    // First run. Defaults are fine.
  }
}

function saveNow() {
  clearTimeout(saveTimer);
  saveTimer = null;
  if (!win || win.isDestroyed()) return;

  try {
    if (!win.isMinimized() && !win.isFullScreen()) {
      const [x, y] = win.getPosition();
      // Frameless Windows windows still carry a native resize border, so store
      // the client area, not the outer bounds, to avoid creep across launches.
      const [width, height] = win.getContentSize();
      settings.bounds = { x, y, width, height };
    }
    fs.mkdirSync(path.dirname(statePath()), { recursive: true });
    fs.writeFileSync(
      statePath(),
      JSON.stringify(
        {
          bounds: settings.bounds,
          alwaysOnTop: settings.alwaysOnTop,
          protected: settings.protected,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.warn('[airframe] could not save state:', err.message);
  }
}

function saveSoon() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 350);
}

// ------------------------------------------------------------------ helpers

function clampOpacity(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 1;
  return Math.max(MIN_OPACITY, Math.min(1, Math.round(num * 100) / 100));
}

function isGoogleHost(host) {
  if (host === 'google.com' || host.endsWith('.google.com')) return true;
  // Google uses country domains for sign-in: google.co.in, google.co.uk,
  // google.com.au, google.de, google.cat, and so on. Match only the domain
  // suffix so google.com.evil.example cannot slip through.
  return /(^|\.)google\.(?:[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(host);
}

function isAllowedNavigation(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const host = u.hostname.toLowerCase();

    if (
      host === 'youtube.com' ||
      host.endsWith('.youtube.com') ||
      host === 'youtube-nocookie.com' ||
      host.endsWith('.youtube-nocookie.com') ||
      host === 'youtu.be' ||
      host.endsWith('.youtu.be')
    ) {
      return true;
    }
    if (isGoogleHost(host)) return true;

    // Google sign-in assets and account avatars.
    return (
      host === 'gstatic.com' ||
      host.endsWith('.gstatic.com') ||
      host === 'googleusercontent.com' ||
      host.endsWith('.googleusercontent.com') ||
      host === 'googleapis.com' ||
      host.endsWith('.googleapis.com') ||
      host === 'googlevideo.com' ||
      host.endsWith('.googlevideo.com') ||
      host === 'ytimg.com' ||
      host.endsWith('.ytimg.com')
    );
  } catch (_) {
    return false;
  }
}

function defaultBounds() {
  const area = screen.getPrimaryDisplay().workArea;
  const width = Math.max(420, Math.min(960, area.width - 120));
  const height = Math.max(360, Math.min(600, area.height - 120));
  return {
    width,
    height,
    x: area.x + Math.round((area.width - width) / 2),
    y: area.y + Math.round((area.height - height) / 2),
  };
}

function normalizeBounds(saved) {
  const fallback = defaultBounds();
  if (!saved || ![saved.x, saved.y, saved.width, saved.height].every(Number.isFinite)) {
    return fallback;
  }

  // Deliberately no screen clamp: the window may be moved partly or fully past
  // a display edge. Alt+Shift+D recenters it if it ends up fully off-screen.
  return {
    x: Math.max(-100000, Math.min(100000, Math.round(saved.x))),
    y: Math.max(-100000, Math.min(100000, Math.round(saved.y))),
    width: Math.max(420, Math.round(saved.width)),
    height: Math.max(360, Math.round(saved.height)),
  };
}

function snapshot() {
  let canGoBack = false;
  let canGoForward = false;
  let url = '';

  if (view && !view.webContents.isDestroyed()) {
    try {
      canGoBack = view.webContents.navigationHistory.canGoBack();
      canGoForward = view.webContents.navigationHistory.canGoForward();
      url = view.webContents.getURL();
    } catch (_) {
      // Mid-teardown.
    }
  }

  return {
    version: app.getVersion(),
    opacity: settings.opacity,
    alwaysOnTop: settings.alwaysOnTop,
    protected: settings.protected,
    ghost: settings.ghost,
    muted: settings.muted,
    visible: Boolean(win && !win.isDestroyed() && win.isVisible()),
    mode,
    loaded: youtubeLoaded,
    loading: youtubeLoading,
    canGoBack,
    canGoForward,
    url,
  };
}

function sendUi(channel, payload) {
  if (!uiReady || !win || win.isDestroyed()) return;
  try {
    win.webContents.send(channel, payload);
  } catch (_) {
    // UI is reloading or already gone.
  }
}

function broadcast() {
  sendUi('airframe:state', snapshot());
}

function notify(message) {
  if (!message) return;
  if (mode === 'youtube' && view && !view.webContents.isDestroyed() && youtubeLoaded) {
    try {
      view.webContents.send('airframe:toast', String(message));
      return;
    } catch (_) {
      // Fall back to the launcher toast.
    }
  }
  sendUi('airframe:toast', String(message));
}

function refresh() {
  saveSoon();
  broadcast();
}

let hotkeyNoticeShown = false;

function notifyHotkeyIssues() {
  if (hotkeyNoticeShown || !uiReady || !shortcutIssues.length) return;
  hotkeyNoticeShown = true;
  console.warn('[airframe] conflicting hotkeys:', shortcutIssues.join(', '));
  sendUi(
    'airframe:toast',
    'Some global shortcuts could not start. Close other overlay apps (Ziva) and restart Airframe.'
  );
}

// ------------------------------------------------------------------- actions

function setWindowOpacity(value) {
  if (!win || win.isDestroyed()) return;
  settings.opacity = clampOpacity(value);
  applyMouseMode();
  refresh();
}

function nudgeOpacity(delta) {
  setWindowOpacity(settings.opacity + delta);
}

function applyMouseMode(force = false) {
  if (!win || win.isDestroyed()) return;
  // At 0% the window is invisible, so it must not intercept input either.
  const ignore = settings.ghost || settings.opacity <= 0.001;
  const wasIgnored = mouseIgnored;
  const transition = ignore !== wasIgnored || force;
  mouseIgnored = ignore;
  try {
    // Re-apply every time: entering fullscreen / toggling topmost can make
    // Windows rebuild the window styles and silently drop click-through.
    win.setFocusable(!ignore);
    win.setIgnoreMouseEvents(ignore);
    // Do not call win.blur() here. It can activate the next window in the
    // z-order before the helper has a chance to see whether Airframe really
    // owned focus. The helper checks the native foreground window instead.
  } catch (err) {
    console.warn('[airframe] mouse-mode change failed:', err.message);
  }
  if (transition || force) sendPassThroughState(ignore);
  try {
    win.setOpacity(settings.opacity);
  } catch (_) {}
}

function sendHotkeyCommand(command) {
  if (!hotkeyHelper || hotkeyHelper.killed) return;
  try {
    hotkeyHelper.stdin.write(command + '\n');
  } catch (_) {}
}

function nativeWindowHandleString() {
  try {
    const buffer = win.getNativeWindowHandle();
    if (buffer.length >= 8) return buffer.readBigUInt64LE(0).toString();
    return String(buffer.readUInt32LE(0));
  } catch (_) {
    return '0';
  }
}

function sendPassThroughState(ignore) {
  try {
    const hwnd = nativeWindowHandleString();
    if (!hwnd || hwnd === '0') return;
    sendHotkeyCommand(`${ignore ? 'PASSTHROUGH_ON' : 'PASSTHROUGH_OFF'} ${hwnd}`);
  } catch (_) {}
}

function sendNavState() {
  if (!view || view.webContents.isDestroyed()) return;
  try {
    const history = view.webContents.navigationHistory;
    view.webContents.send('airframe:nav-state', {
      canGoBack: history.canGoBack(),
      canGoForward: history.canGoForward(),
    });
  } catch (_) {}
}

function navigateHistory(direction) {
  if (mode !== 'youtube' || !view || view.webContents.isDestroyed()) return;
  try {
    const history = view.webContents.navigationHistory;
    if (direction === 'back' && history.canGoBack()) history.goBack();
    else if (direction === 'forward' && history.canGoForward()) history.goForward();
  } catch (_) {}
}

let ghostWatchdog = null;

function startGhostWatchdog() {
  if (ghostWatchdog) return;
  // Windows can rebuild the layered/topmost styles after fullscreen changes,
  // taskbar interaction or a display change. Re-assert click-through on every
  // child while ghost mode is on.
  ghostWatchdog = setInterval(() => {
    if (!settings.ghost || !win || win.isDestroyed()) return;
    try {
      win.setIgnoreMouseEvents(true);
    } catch (_) {}
    try {
      const hwnd = nativeWindowHandleString();
      if (hwnd && hwnd !== '0') sendHotkeyCommand(`PASSTHROUGH_REFRESH ${hwnd}`);
    } catch (_) {}
    if (settings.alwaysOnTop) {
      try {
        win.setAlwaysOnTop(true, 'screen-saver', 1);
      } catch (_) {}
    }
  }, 3000);
}

function stopGhostWatchdog() {
  if (ghostWatchdog) {
    clearInterval(ghostWatchdog);
    ghostWatchdog = null;
  }
}

function focusUnderCursor(force) {
  // Only move focus when Airframe owned it at the moment Alt+L was pressed.
  // Otherwise just report the app that already has focus; never steal it.
  setTimeout(() => {
    if (!settings.ghost) return;
    sendHotkeyCommand(force ? 'FOCUS_UNDER_CURSOR_FORCE' : 'REPORT_FOREGROUND');
  }, 150);
}

function toggleMute() {
  settings.muted = !settings.muted;
  if (view && !view.webContents.isDestroyed()) {
    view.webContents.setAudioMuted(settings.muted);
  }
  console.log(`[airframe] audio muted ${settings.muted ? 'on' : 'off'}`);
  notify(settings.muted ? 'Muted — Alt+M to unmute' : 'Sound on');
  broadcast();
}

function moveWindowBy(dx, dy, fixedSession) {
  if (!win || win.isDestroyed() || !win.isVisible() || win.isFullScreen()) return;

  const bounds = win.getBounds();
  const width = fixedSession ? fixedSession.outerWidth : bounds.width;
  const height = fixedSession ? fixedSession.outerHeight : bounds.height;
  const x = Math.round(bounds.x + dx);
  const y = Math.round(bounds.y + dy);

  if (x !== bounds.x || y !== bounds.y) {
    // setBounds (rather than setPosition) keeps the outer size pinned while
    // Windows is adjusting the frame during a move.
    win.setBounds({ x, y, width, height });

    if (fixedSession) {
      const [newWidth, newHeight] = win.getContentSize();
      if (newWidth !== fixedSession.contentWidth || newHeight !== fixedSession.contentHeight) {
        win.setContentSize(fixedSession.contentWidth, fixedSession.contentHeight);
      }
    }
    // The window's move event saves the new position.
  }
}

const moveDirections = new Set();
let moveTimer = null;
let moveLastTick = 0;
let moveHeldMs = 0;
let moveSession = null;

const opacityDirections = new Set();
let opacityTimer = null;
const OPACITY_HOLD_STEP = 0.02;
const OPACITY_TAP_STEP = 0.05;

function stopOpacityTimer() {
  if (opacityTimer) {
    clearInterval(opacityTimer);
    opacityTimer = null;
  }
  opacityDirections.clear();
}

function beginOpacity(direction) {
  if (!opacityDirections.size) {
    nudgeOpacity(direction === 'up' ? OPACITY_TAP_STEP : -OPACITY_TAP_STEP);
  }
  opacityDirections.add(direction);
  if (opacityTimer) return;
  opacityTimer = setInterval(tickOpacity, 60);
}

function endOpacity(direction) {
  opacityDirections.delete(direction);
  if (!opacityDirections.size) stopOpacityTimer();
}

function tickOpacity() {
  if (!opacityDirections.size) {
    stopOpacityTimer();
    return;
  }
  let direction = 0;
  if (opacityDirections.has('up')) direction += 1;
  if (opacityDirections.has('down')) direction -= 1;
  if (!direction) return;
  setWindowOpacity(settings.opacity + direction * OPACITY_HOLD_STEP);
}

function stopMoveTimer() {
  if (moveTimer) {
    clearInterval(moveTimer);
    moveTimer = null;
  }
  moveDirections.clear();
  moveHeldMs = 0;

  const session = moveSession;
  // Windows can nudge a frameless window's client size while it is moved.
  // Restore the size captured before this movement session. The delayed passes
  // catch Windows applying its frame adjustment after the move ends.
  const restoreSize = () => {
    if (!session || !win || win.isDestroyed() || win.isFullScreen()) return;
    if (moveSession && moveSession !== session) return;
    try {
      const [width, height] = win.getContentSize();
      if (width !== session.contentWidth || height !== session.contentHeight) {
        win.setContentSize(session.contentWidth, session.contentHeight);
      }
    } catch (_) {}
  };

  if (session && win && !win.isDestroyed() && !win.isFullScreen() && win.isVisible()) {
    try {
      const bounds = win.getBounds();
      win.setBounds({
        x: bounds.x,
        y: bounds.y,
        width: session.outerWidth,
        height: session.outerHeight,
      });
    } catch (_) {}
    restoreSize();
    setTimeout(restoreSize, 90);
    setTimeout(restoreSize, 280);
  }
  moveSession = null;
}

function beginMove(direction) {
  moveDirections.add(direction);
  if (moveTimer) return;
  if (win && !win.isDestroyed()) {
    try {
      const bounds = win.getBounds();
      const [contentWidth, contentHeight] = win.getContentSize();
      moveSession = {
        outerWidth: bounds.width,
        outerHeight: bounds.height,
        contentWidth,
        contentHeight,
      };
    } catch (_) {
      moveSession = null;
    }
  }
  moveLastTick = performance.now();
  moveHeldMs = 0;
  moveTimer = setInterval(tickMove, 16);
}

function endMove(direction) {
  moveDirections.delete(direction);
  if (!moveDirections.size) stopMoveTimer();
}

function tickMove() {
  if (
    !win ||
    win.isDestroyed() ||
    !win.isVisible() ||
    win.isFullScreen() ||
    !moveDirections.size
  ) {
    stopMoveTimer();
    return;
  }

  const now = performance.now();
  const dt = Math.min(40, Math.max(1, now - moveLastTick));
  moveLastTick = now;
  moveHeldMs += dt;

  let dx = 0;
  let dy = 0;
  if (moveDirections.has('left')) dx -= 1;
  if (moveDirections.has('right')) dx += 1;
  if (moveDirections.has('up')) dy -= 1;
  if (moveDirections.has('down')) dy += 1;
  if (!dx && !dy) {
    stopMoveTimer();
    return;
  }

  const length = Math.hypot(dx, dy);
  dx /= length;
  dy /= length;

  // 0.3 px/ms initially, easing to 0.8 px/ms after ~1 second.
  const speed = 0.3 + Math.min(0.5, (moveHeldMs / 1000) * 0.5);
  moveWindowBy(dx * speed * dt, dy * speed * dt, moveSession);
}

function visibleOnAnyDisplay(bounds) {
  return screen.getAllDisplays().some((display) => {
    const area = display.workArea;
    const overlapX =
      Math.min(bounds.x + bounds.width, area.x + area.width) - Math.max(bounds.x, area.x);
    const overlapY =
      Math.min(bounds.y + bounds.height, area.y + area.height) - Math.max(bounds.y, area.y);
    return overlapX >= 40 && overlapY >= 40;
  });
}

function centerOnDisplay(display, message) {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  const area = display.workArea;
  const width = Math.min(bounds.width, Math.max(420, area.width - 16));
  const height = Math.min(bounds.height, Math.max(360, area.height - 16));
  const x = area.x + Math.round((area.width - width) / 2);
  const y = area.y + Math.round((area.height - height) / 2);

  win.setBounds({ x, y, width, height });
  try {
    applyMouseMode(true);
  } catch (_) {}
  saveNow();
  broadcast();
  notify(message);
}

function applyNextDisplay(displays) {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  const current = screen.getDisplayMatching(bounds);
  const currentIndex = Math.max(
    0,
    displays.findIndex((display) => display.id === current.id)
  );
  const next = displays[(currentIndex + 1) % displays.length];
  centerOnDisplay(next, 'Moved to the next screen');
}

function cycleDisplay() {
  if (!win || win.isDestroyed()) return;
  const displays = screen.getAllDisplays();
  const bounds = win.getBounds();
  console.log(`[airframe] next display requested (${displays.length} screen(s))`);

  // If the window was dragged completely off-screen, the same shortcut is the
  // way back. This does not restrict moving it outside in the first place.
  if (!visibleOnAnyDisplay(bounds)) {
    const target =
      displays.length > 1
        ? screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
        : displays[0];
    const recenter = () => centerOnDisplay(target, 'Recentered on the screen');
    if (win.isFullScreen()) {
      win.setFullScreen(false);
      setTimeout(recenter, 260);
    } else {
      recenter();
    }
    return;
  }

  if (displays.length < 2) {
    notify('Only one screen is connected.');
    return;
  }

  if (win.isFullScreen()) {
    win.setFullScreen(false);
    setTimeout(() => applyNextDisplay(displays), 260);
  } else {
    applyNextDisplay(displays);
  }
}

function applyTopmost(value) {
  if (!win || win.isDestroyed()) return;
  settings.alwaysOnTop = Boolean(value);
  try {
    if (settings.alwaysOnTop) {
      win.setAlwaysOnTop(true, 'screen-saver', 1);
    } else {
      win.setAlwaysOnTop(false);
    }
    // Re-applying window styles can drop layered alpha on Windows.
    applyMouseMode(true);
  } catch (_) {}
  notify(settings.alwaysOnTop ? 'Always on top — on' : 'Always on top — off');
  console.log(`[airframe] always on top ${settings.alwaysOnTop ? 'on' : 'off'}`);
  refresh();
}

function applyProtection(value) {
  if (!win || win.isDestroyed()) return;
  settings.protected = Boolean(value);
  try {
    win.setContentProtection(settings.protected);
    applyMouseMode(true);
  } catch (err) {
    console.warn('[airframe] content protection failed:', err.message);
  }
  notify(settings.protected ? 'Screen-share shield — on' : 'Screen-share shield — off');
  console.log(`[airframe] screen-share shield ${settings.protected ? 'on' : 'off'}`);
  refresh();
}

function applyGhost(value, wasFocused) {
  if (!win || win.isDestroyed()) return;
  settings.ghost = Boolean(value);
  applyMouseMode(true);
  if (settings.ghost) {
    startGhostWatchdog();
    focusUnderCursor(Boolean(wasFocused));
    notify('Click-through on — Alt+L or Ctrl+Alt+L turns it off');
  } else {
    stopGhostWatchdog();
    notify('Click-through off — the window takes clicks again');
  }
  logLine(`ghost=${settings.ghost ? 'on' : 'off'}`);
  console.log(`[airframe] click-through ${settings.ghost ? 'on' : 'off'}`);
  refresh();
}

function toggleVisibility() {
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) {
    win.restore();
    if (settings.ghost) {
      win.showInactive();
    } else {
      win.show();
      win.focus();
    }
    console.log('[airframe] window restored from minimized');
    refresh();
    return;
  }
  if (win.isVisible()) {
    win.hide();
    console.log('[airframe] window hidden');
  } else if (settings.ghost) {
    win.showInactive();
    console.log('[airframe] window shown (inactive / click-through)');
  } else {
    win.show();
    win.focus();
    console.log('[airframe] window shown');
  }
  refresh();
}

function toggleFullscreen() {
  if (!win || win.isDestroyed()) return;
  const next = !win.isFullScreen();
  try {
    win.setFullScreen(next);
  } catch (_) {}
  console.log(`[airframe] fullscreen ${next ? 'on' : 'off'}`);
  notify(next ? 'Fullscreen — Alt+F to exit' : 'Windowed');
}

function pauseYouTube() {
  if (!view || view.webContents.isDestroyed()) return;
  try {
    view.webContents
      .executeJavaScript(
        `document.querySelectorAll('video').forEach((v) => { try { v.pause(); } catch (_) {} }); true`
      )
      .catch(() => {});
  } catch (_) {}
}

function goHome() {
  if (!win || win.isDestroyed()) return;
  mode = 'home';
  console.log('[airframe] launcher');
  if (view && !view.webContents.isDestroyed()) {
    pauseYouTube();
    try {
      view.setVisible(false);
    } catch (_) {}
  }
  sendUi('airframe:loading', { loading: false });
  sendUi('airframe:mode', 'home');
  try {
    win.webContents.focus();
  } catch (_) {}
  refresh();
}

function revealYouTube() {
  if (!win || win.isDestroyed() || mode !== 'youtube') return;
  if (!view || view.webContents.isDestroyed()) return;
  try {
    view.setVisible(true);
  } catch (_) {}
  layoutViews();
  try {
    view.webContents.focus();
  } catch (_) {}
  sendUi('airframe:loading', { loading: false });
  broadcast();
}

function openYouTube() {
  if (!win || win.isDestroyed()) return;
  ensureView();
  if (!view || view.webContents.isDestroyed()) return;
  console.log('[airframe] opening YouTube');

  if (mode !== 'youtube') {
    mode = 'youtube';
    sendUi('airframe:mode', 'youtube');
  }

  if (youtubeLoaded) {
    revealYouTube();
    return;
  }

  sendUi('airframe:loading', { loading: true, title: 'Opening YouTube' });
  if (!youtubeLoading) {
    youtubeLoading = true;
    // did-finish-load / did-fail-load drive the rest.
    view.webContents.loadURL(START_URL).catch(() => {});
  }
  broadcast();
}

function reloadContent() {
  if (!view || view.webContents.isDestroyed()) {
    openYouTube();
    return;
  }
  if (mode !== 'youtube') {
    openYouTube();
    return;
  }
  view.webContents.reload();
}

function layoutViews() {
  if (!win || win.isDestroyed() || !view || view.webContents.isDestroyed()) return;
  const [width, height] = win.getContentSize();
  const top = win.isFullScreen() ? 0 : TOP_GRIP;
  view.setBounds({
    x: 0,
    y: top,
    width: Math.max(0, width),
    height: Math.max(0, height - top),
  });
}

// -------------------------------------------------------------------- window

function createWindow() {
  loadState();
  const bounds = normalizeBounds(settings.bounds);

  win = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 420,
    minHeight: 360,
    frame: false,
    show: false,
    resizable: true,
    maximizable: false,
    fullscreenable: true,
    skipTaskbar: true,
    hasShadow: true,
    title: APP_NAME,
    backgroundColor: '#08080a',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload-ui.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });

  Menu.setApplicationMenu(null);
  win.setMenuBarVisibility(false);
  try {
    win.setSkipTaskbar(true);
  } catch (_) {}
  try {
    win.setContentSize(bounds.width, bounds.height);
  } catch (_) {}

  // Apply the saved personality before the first paint.
  try {
    if (settings.alwaysOnTop) win.setAlwaysOnTop(true, 'screen-saver', 1);
    win.setContentProtection(settings.protected);
    win.setOpacity(settings.opacity);
    win.setFocusable(true);
    win.setIgnoreMouseEvents(false);
  } catch (_) {}

  win.loadFile(path.join(__dirname, 'ui', 'index.html'));

  win.webContents.on('did-finish-load', () => {
    uiReady = true;
    broadcast();
    sendUi('airframe:mode', mode);
    notifyHotkeyIssues();
    if (SMOKE || GHOST_SMOKE || SWIPE_SMOKE) runSmoke();
  });

  win.on('resize', () => {
    layoutViews();
    saveSoon();
  });
  win.on('move', saveSoon);
  win.on('moved', saveSoon);
  win.on('show', () => {
    applyMouseMode(true);
    broadcast();
  });
  win.on('hide', broadcast);
  // Mouse side buttons (X1/X2) go back/forward, like a browser.
  win.on('app-command', (_event, command) => {
    if (command === 'browser-backward') navigateHistory('back');
    else if (command === 'browser-forward') navigateHistory('forward');
  });
  win.on('close', saveNow);
  win.on('closed', () => {
    win = null;
    view = null;
    uiReady = false;
  });

  win.on('enter-full-screen', () => {
    layoutViews();
    applyMouseMode(true);
    broadcast();
  });
  win.on('leave-full-screen', () => {
    layoutViews();
    applyMouseMode(true);
    broadcast();
  });

  win.once('ready-to-show', () => {
    if (!SMOKE) {
      win.show();
      win.focus();
    }
  });

  setTimeout(() => {
    try {
      if (win && !win.isDestroyed()) win.setTitle(APP_NAME);
    } catch (_) {}
  }, 100);
}

// ------------------------------------------------------------------- content

function setupContentSession() {
  const ses = session.fromPartition(PARTITION);
  ses.setUserAgent(CHROME_UA, 'en-US,en');

  // Chrome's client hints are part of how Google decides whether a browser is
  // supported. Electron reports Chromium without the Google Chrome brand, so
  // spoof the low-entropy hints to match the user agent.
  try {
    const brandList = `"Google Chrome";v="${CHROME_MAJOR}", "Chromium";v="${CHROME_MAJOR}", "Not:A-Brand";v="8"`;
    const fullVersionList = `"Google Chrome";v="${CHROME_VERSION}", "Chromium";v="${CHROME_VERSION}", "Not:A-Brand";v="8.0.0.0"`;

    const setHeader = (headers, name, value) => {
      for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === name) delete headers[key];
      }
      headers[name] = value;
    };

    ses.webRequest.onBeforeSendHeaders(
      {
        urls: [
          'https://google.com/*',
          'https://*.google.com/*',
          'https://youtube.com/*',
          'https://*.youtube.com/*',
        ],
      },
      (details, callback) => {
        try {
          const headers = details.requestHeaders;
          setHeader(headers, 'user-agent', CHROME_UA);
          setHeader(headers, 'sec-ch-ua', brandList);
          setHeader(headers, 'sec-ch-ua-mobile', '?0');
          setHeader(headers, 'sec-ch-ua-platform', '"Windows"');
          setHeader(headers, 'sec-ch-ua-full-version-list', fullVersionList);
        } catch (_) {}
        callback({ requestHeaders: details.requestHeaders });
      }
    );
    console.log('[airframe] Chrome client hints active');
  } catch (err) {
    console.warn('[airframe] client hint spoof unavailable:', err.message);
  }

  try {
    ses.cookies
      .get({ url: 'https://www.youtube.com/' })
      .then((cookies) => {
        console.log(`[airframe] YouTube cookies loaded: ${cookies.length}`);
      })
      .catch(() => {});
  } catch (_) {}

  try {
    ses.setSpellCheckerEnabled(false);
  } catch (_) {}

  const allowed = new Set([
    'fullscreen',
    'clipboard-read',
    'clipboard-sanitized-write',
    'mediaKeySystem',
  ]);
  try {
    ses.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(allowed.has(permission));
    });
    ses.setPermissionCheckHandler((_wc, permission) => allowed.has(permission));
  } catch (_) {}

  installAdblock(ses);
}

function installAdblock(ses) {
  // Ad/tracking infrastructure only, so sign-in and playback stay reliable.
  // YouTube's own video-delivery hosts are left alone; the in-page script skips
  // the actual in-player ads.
  const adHosts = [
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'adservice.google.com',
    'googletagservices.com',
    '2mdn.net',
    'adsafeprotected.com',
    'moatads.com',
    'scorecardresearch.com',
    'adnxs.com',
    'rubiconproject.com',
    'pubmatic.com',
    'openx.net',
    'criteo.com',
    'taboola.com',
    'outbrain.com',
    'quantserve.com',
    'doubleverify.com',
    'adsrvr.org',
    'casalemedia.com',
    'smartadserver.com',
    'teads.tv',
    'amazon-adsystem.com',
  ];

  const isAdHost = (host) => adHosts.some((domain) => host === domain || host.endsWith('.' + domain));
  const isYouTubeHost = (host) =>
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'youtube-nocookie.com' ||
    host.endsWith('.youtube-nocookie.com');
  const isYouTubeAdPath = (pathname) =>
    pathname.startsWith('/pagead/') ||
    pathname.startsWith('/ptracking') ||
    pathname === '/api/stats/ads' ||
    pathname.startsWith('/api/stats/ads/') ||
    pathname.startsWith('/get_midroll_info');

  try {
    ses.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (details, callback) => {
      try {
        if (details.resourceType !== 'mainFrame') {
          const u = new URL(details.url);
          const host = u.hostname.toLowerCase();
          if (isAdHost(host) || (isYouTubeHost(host) && isYouTubeAdPath(u.pathname))) {
            blockedRequests += 1;
            if (blockedRequests % 100 === 0) {
              console.log(`[airframe] ${blockedRequests} ad/tracker requests blocked`);
            }
            callback({ cancel: true });
            return;
          }
        }
      } catch (_) {
        // Malformed URL: let Chromium handle it.
      }
      callback({});
    });
    console.log('[airframe] ad filter active');
  } catch (err) {
    console.warn('[airframe] ad filter unavailable:', err.message);
  }
}

function ensureView() {
  if (!win || win.isDestroyed()) return;
  if (view && !view.webContents.isDestroyed()) return;

  view = new WebContentsView({
    webPreferences: {
      partition: PARTITION,
      preload: path.join(__dirname, 'preload-content.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });
  win.contentView.addChildView(view);
  try {
    view.setBackgroundColor('#000000');
    view.setVisible(false);
    view.webContents.setAudioMuted(settings.muted);
  } catch (_) {}
  layoutViews();
  setupContentHandlers();
}

function setupContentHandlers() {
  if (!view || view.webContents.isDestroyed()) return;
  const wc = view.webContents;

  wc.setWindowOpenHandler(({ url }) => {
    if (isAllowedNavigation(url)) {
      wc.loadURL(url).catch(() => {});
    } else if (/^https?:/i.test(url) || /^mailto:/i.test(url)) {
      shell.openExternal(url).catch(() => {});
    }
    return { action: 'deny' };
  });

  wc.on('will-navigate', (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
      if (/^https?:/i.test(url) || /^mailto:/i.test(url)) {
        shell.openExternal(url).catch(() => {});
      }
    }
  });

  wc.on('will-redirect', (event, url, _isInPlace, isMainFrame) => {
    if (!isMainFrame || isAllowedNavigation(url)) return;
    event.preventDefault();
    if (/^https?:/i.test(url) || /^mailto:/i.test(url)) {
      shell.openExternal(url).catch(() => {});
    }
  });

  wc.on('did-start-loading', broadcast);
  wc.on('did-stop-loading', broadcast);
  wc.on('did-navigate', broadcast);
  wc.on('did-navigate-in-page', broadcast);
  wc.on('did-navigate', sendNavState);
  wc.on('did-navigate-in-page', sendNavState);

  wc.on('did-finish-load', () => {
    if (!view || view.webContents !== wc) return;
    youtubeLoaded = true;
    youtubeLoading = false;
    try {
      wc.setAudioMuted(settings.muted);
    } catch (_) {}
    console.log('[airframe] YouTube ready:', wc.getURL());
    sendNavState();
    if (mode === 'youtube') revealYouTube();
    else sendUi('airframe:loading', { loading: false });

    if (!hintShown) {
      setTimeout(() => {
        if (mode === 'youtube' && !hintShown) {
          hintShown = true;
          notify(
            'Alt H hide · Alt ←↑↓→ move · Alt Shift ←↑↓→ opacity · Alt F fullscreen · Alt B launcher · Alt Q quit'
          );
        }
      }, 800);
    }
    broadcast();
  });

  wc.on('did-fail-load', (_event, code, description, failedUrl, isMainFrame) => {
    if (!isMainFrame || code === -3) return;
    console.warn(`[airframe] failed to load ${failedUrl}: ${description} (${code})`);
    youtubeLoading = false;
    if (mode === 'youtube' && !youtubeLoaded) {
      mode = 'home';
      try {
        view.setVisible(false);
      } catch (_) {}
      sendUi('airframe:mode', 'home');
      sendUi('airframe:loading', { loading: false });
      notify("Couldn't open YouTube. Check the connection and click the card again.");
    } else if (mode === 'youtube') {
      notify("Couldn't load that page. Press Alt+R to try again.");
    }
    broadcast();
  });

  wc.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F12') {
      event.preventDefault();
      wc.toggleDevTools();
    }
  });

  wc.on('preload-error', (_event, preloadPath, error) => {
    console.warn('[airframe] preload error:', preloadPath, error && error.message ? error.message : error);
  });

  wc.on('render-process-gone', (_event, details) => {
    console.warn('[airframe] YouTube renderer went away:', details.reason);
    youtubeLoaded = false;
    youtubeLoading = false;
    if (mode === 'youtube') {
      mode = 'home';
      if (view && !view.webContents.isDestroyed()) {
        try {
          view.setVisible(false);
        } catch (_) {}
      }
      sendUi('airframe:mode', 'home');
      sendUi('airframe:loading', { loading: false });
    }
    notify('YouTube stopped unexpectedly. Click the card to reopen.');
    broadcast();
  });
}

// ----------------------------------------------------------------- shortcuts

const HOTKEY_ACTIONS = {
  HIDE: toggleVisibility,
  MOVE_START_LEFT: () => beginMove('left'),
  MOVE_START_RIGHT: () => beginMove('right'),
  MOVE_START_UP: () => beginMove('up'),
  MOVE_START_DOWN: () => beginMove('down'),
  MOVE_STOP_LEFT: () => endMove('left'),
  MOVE_STOP_RIGHT: () => endMove('right'),
  MOVE_STOP_UP: () => endMove('up'),
  MOVE_STOP_DOWN: () => endMove('down'),
  OPACITY_START_UP: () => beginOpacity('up'),
  OPACITY_START_DOWN: () => beginOpacity('down'),
  OPACITY_STOP_UP: () => endOpacity('up'),
  OPACITY_STOP_DOWN: () => endOpacity('down'),
  FULLSCREEN: toggleFullscreen,
  GHOST: () => applyGhost(!settings.ghost, Boolean(win && win.isFocused())),
  MUTE: toggleMute,
  SHIELD: () => applyProtection(!settings.protected),
  TOPMOST: () => applyTopmost(!settings.alwaysOnTop),
  RELOAD: reloadContent,
  HOME: goHome,
  NEXT_DISPLAY: cycleDisplay,
  QUIT: () => app.quit(),
};

function hotkeyHelperPath() {
  if (app.isPackaged) return path.join(process.resourcesPath, 'AltHotkeys.exe');
  return path.join(__dirname, 'helper', 'AltHotkeys.exe');
}

function handleHotkeyLine(rawLine) {
  const line = String(rawLine || '').trim();
  if (!line) return;

  if (line.startsWith('READY')) {
    hotkeyHelperReady = true;
    helperRestarts = 0;
    console.log(`[airframe] Win32 hotkeys ready (${line})`);
    if (mouseIgnored) sendPassThroughState(true);
    notifyHotkeyIssues();
    return;
  }
  if (line.startsWith('OK ')) return;
  if (line.startsWith('WARN ')) {
    logLine(`helper ${line}`);
    console.warn('[airframe] hotkey helper:', line.slice(5));
    return;
  }
  if (line.startsWith('FAILED ')) {
    shortcutIssues.push(line.slice(7));
    console.warn('[airframe] Win32 hotkey unavailable:', line.slice(7));
    notifyHotkeyIssues();
    return;
  }
  if (line.startsWith('TARGET ')) {
    logLine(`helper ${line}`);
    const titleMatch = /(?:^|\s)title=(.*)$/.exec(line);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (settings.ghost) {
      notify(`Click-through — ${title || 'ready'}`);
    }
    return;
  }
  if (line === 'GHOST' || line.startsWith('GHOST ')) {
    // The helper reports whether Airframe owned the foreground at the moment
    // the key was pressed, before Windows can shuffle focus.
    applyGhost(!settings.ghost, line.endsWith(' 1'));
    return;
  }

  const action = HOTKEY_ACTIONS[line];
  if (action) action();
}

function registerFallbackShortcuts() {
  if (fallbackRegistered || quitting) return;
  fallbackRegistered = true;
  console.warn('[airframe] hotkey helper unavailable; registering Alt+Shift fallbacks');

  const shortcuts = [
    ['Alt+Shift+H', toggleVisibility],
    ['Alt+Up', () => moveWindowBy(0, -MOVE_STEP)],
    ['Alt+Down', () => moveWindowBy(0, MOVE_STEP)],
    ['Alt+Left', () => moveWindowBy(-MOVE_STEP, 0)],
    ['Alt+Right', () => moveWindowBy(MOVE_STEP, 0)],
    ['Alt+Shift+Up', () => nudgeOpacity(OPACITY_STEP)],
    ['Alt+Shift+Right', () => nudgeOpacity(OPACITY_STEP)],
    ['Alt+Shift+Down', () => nudgeOpacity(-OPACITY_STEP)],
    ['Alt+Shift+Left', () => nudgeOpacity(-OPACITY_STEP)],
    ['Alt+Enter', toggleFullscreen],
    ['Alt+Shift+L', () => applyGhost(!settings.ghost, Boolean(win && win.isFocused()))],
    ['Ctrl+Alt+L', () => applyGhost(!settings.ghost, Boolean(win && win.isFocused()))],
    ['Alt+Shift+M', toggleMute],
    ['Alt+Shift+D', cycleDisplay],
    ['Alt+Shift+S', () => applyProtection(!settings.protected)],
    ['Alt+Shift+T', () => applyTopmost(!settings.alwaysOnTop)],
    ['Alt+Shift+R', reloadContent],
    ['Alt+Home', goHome],
    ['Alt+Shift+Q', () => app.quit()],
  ];

  for (const [accelerator, handler] of shortcuts) {
    try {
      if (!globalShortcut.register(accelerator, handler)) {
        shortcutIssues.push(accelerator);
        console.warn(`[airframe] fallback shortcut unavailable: ${accelerator}`);
      }
    } catch (err) {
      shortcutIssues.push(accelerator);
      console.warn(`[airframe] fallback shortcut failed (${accelerator}):`, err.message);
    }
  }
}

function unregisterFallbackShortcuts() {
  if (!fallbackRegistered) return;
  try {
    globalShortcut.unregisterAll();
  } catch (_) {}
  fallbackRegistered = false;
  shortcutIssues.length = 0;
}

function startHotkeyHelper() {
  if (quitting || hotkeyHelper) return;

  const exe = hotkeyHelperPath();
  if (!fs.existsSync(exe)) {
    console.warn('[airframe] hotkey helper missing:', exe);
    registerFallbackShortcuts();
    return;
  }

  let child;
  try {
    child = spawn(exe, [String(process.pid)], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err) {
    console.warn('[airframe] hotkey helper failed to start:', err.message);
    registerFallbackShortcuts();
    return;
  }

  hotkeyHelper = child;
  hotkeyHelperReady = false;
  console.log('[airframe] hotkey helper started');

  readline.createInterface({ input: child.stdout }).on('line', handleHotkeyLine);

  child.stderr.on('data', (data) => {
    const text = String(data || '').trim();
    if (text) console.warn('[airframe] hotkey helper stderr:', text);
  });

  child.on('error', (err) => {
    console.warn('[airframe] hotkey helper error:', err.message);
    if (hotkeyHelper === child) hotkeyHelper = null;
    hotkeyHelperReady = false;
    stopMoveTimer();
    stopOpacityTimer();
    registerFallbackShortcuts();
  });

  child.on('exit', (code, signal) => {
    if (hotkeyHelper === child) hotkeyHelper = null;
    hotkeyHelperReady = false;
    stopMoveTimer();
    stopOpacityTimer();
    if (quitting) return;
    const codeLabel = code === null || code === undefined ? '' : ` with code ${code}`;
    console.warn(
      `[airframe] hotkey helper exited${codeLabel}${signal ? ` (${signal})` : ''}`
    );
    logLine(`helper exited${codeLabel}${signal ? ` (${signal})` : ''}`);
    registerFallbackShortcuts();
    if (helperRestarts < 3) {
      helperRestarts += 1;
      console.warn(`[airframe] restarting hotkey helper (${helperRestarts}/3)`);
      setTimeout(() => {
        if (quitting || hotkeyHelper) return;
        // Release the Electron fallbacks first; otherwise they own Alt+Enter,
        // Alt+Home, Alt+Shift+D... and the restarted helper cannot register them.
        unregisterFallbackShortcuts();
        startHotkeyHelper();
      }, 1500);
    }
  });
}

function stopHotkeyHelper() {
  quitting = true;
  hotkeyHelperReady = false;
  stopMoveTimer();
  stopOpacityTimer();
  if (hotkeyHelper) {
    try {
      hotkeyHelper.kill();
    } catch (_) {}
    hotkeyHelper = null;
  }
}

// ----------------------------------------------------------------------- ipc

function isUiSender(event) {
  return Boolean(win && !win.isDestroyed() && event.sender === win.webContents);
}

function registerIpc() {
  ipcMain.on('airframe:nav', (event, direction) => {
    if (!view || view.webContents.isDestroyed() || event.sender !== view.webContents) return;
    navigateHistory(direction);
  });

  ipcMain.handle('airframe:get-state', (event) => {
    if (!isUiSender(event)) return null;
    return snapshot();
  });

  ipcMain.handle('airframe:action', (event, message) => {
    if (!isUiSender(event)) return null;
    const type = message && message.type;

    switch (type) {
      case 'open-youtube':
        openYouTube();
        break;
      case 'home':
        goHome();
        break;
      case 'hide':
        if (win.isVisible()) win.hide();
        refresh();
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
      case 'protect':
        applyProtection(!settings.protected);
        break;
      case 'topmost':
        applyTopmost(!settings.alwaysOnTop);
        break;
      case 'ghost':
        applyGhost(!settings.ghost, Boolean(win && win.isFocused()));
        break;
      case 'mute':
        toggleMute();
        break;
      case 'next-display':
        cycleDisplay();
        break;
      case 'reload':
        reloadContent();
        break;
      case 'opacity-up':
        nudgeOpacity(OPACITY_STEP);
        break;
      case 'opacity-down':
        nudgeOpacity(-OPACITY_STEP);
        break;
      case 'opacity-reset':
        setWindowOpacity(1);
        break;
      case 'quit':
        app.quit();
        return null;
      default:
        break;
    }
    return snapshot();
  });
}

// --------------------------------------------------------------------- smoke

let smokeStarted = false;

function runGhostPlaybackTest(wc, finish) {
  const testUrl = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
  let done = false;
  const complete = (code, label) => {
    if (done) return;
    done = true;
    finish(code, label);
  };

  setTimeout(() => complete(3, 'TIMEOUT waiting for the ghost playback test'), 25000);

  const probeStart = `(() => {
    const v = document.querySelector('video');
    if (!v) return { has: false };
    v.muted = true;
    v.play().catch(() => {});
    return { has: true, t: v.currentTime, paused: v.paused, ready: v.readyState };
  })()`;

  const probeEnd = `(() => {
    const v = document.querySelector('video');
    return v ? { has: true, t: v.currentTime, paused: v.paused, ready: v.readyState } : { has: false };
  })()`;

  const onVideoLoaded = () => {
    wc.executeJavaScript(probeStart)
      .then((first) => {
        console.log('[smoke] ghost playback start:', JSON.stringify(first));
        applyGhost(true, false);
        setTimeout(() => {
          wc.executeJavaScript(probeEnd)
            .then((second) => {
              console.log('[smoke] ghost playback end:', JSON.stringify(second));
              const advanced = Boolean(first && second && second.t > first.t + 0.5);
              applyGhost(false, false);
              complete(
                advanced ? 0 : 3,
                advanced
                  ? 'OK (ghost playback advanced)'
                  : 'ghost playback did not advance'
              );
            })
            .catch((err) => complete(3, `ghost playback probe failed: ${err.message}`));
        }, 2500);
      })
      .catch((err) => complete(3, `ghost playback start failed: ${err.message}`));
  };

  console.log('[smoke] ghost playback test: loading', testUrl);
  wc.once('did-finish-load', onVideoLoaded);
  wc.loadURL(testUrl).catch(() => {});
}

// Touchpad swipe: open a video, swipe right (back), expect the previous page.
function runSwipeTest(wc, finish) {
  const homeUrl = wc.getURL();
  setTimeout(() => finish(4, 'TIMEOUT in swipe test'), 30000);
  const swipeBurst = (sign) => {
    for (let i = 0; i < 10; i += 1) {
      setTimeout(() => {
        try {
          wc.sendInputEvent({ type: 'mouseWheel', x: 400, y: 300, deltaX: sign * 40, deltaY: 0 });
        } catch (_) {}
      }, i * 16);
    }
  };
  wc.once('did-finish-load', () => {
    console.log('[smoke] swipe test on', wc.getURL());
    setTimeout(() => {
      swipeBurst(1);
      setTimeout(() => {
        if (wc.getURL() === homeUrl) return finish(0, 'OK (swipe went back)');
        swipeBurst(-1); // other sign, in case the input mapping is reversed
        setTimeout(() => {
          const url = wc.getURL();
          if (url === homeUrl) finish(0, 'OK (swipe went back, reversed sign)');
          else finish(4, `swipe did not go back: ${url}`);
        }, 2500);
      }, 2500);
    }, 1500);
  });
  wc.loadURL('https://www.youtube.com/watch?v=aqz-KE-bpKQ').catch(() => {});
}

function runSmoke() {
  if ((!SMOKE && !GHOST_SMOKE && !SWIPE_SMOKE) || smokeStarted) return;
  smokeStarted = true;

  let finished = false;
  const finish = (code, label) => {
    if (finished) return;
    finished = true;
    console.log(`[smoke] ${label}`);
    const b = win && !win.isDestroyed() ? win.getBounds() : null;
    const c = win && !win.isDestroyed() ? win.getContentSize() : null;
    console.log(
      `[smoke] electron=${process.versions.electron} chrome=${process.versions.chrome} ` +
        `protected=${settings.protected} top=${settings.alwaysOnTop} ghost=${settings.ghost} ` +
        `opacity=${settings.opacity} blocked=${blockedRequests}`
    );
    console.log(
      `[smoke] window bounds=${JSON.stringify(b)} content=${JSON.stringify(c)} ` +
        `config: skipTaskbar=true tray=none frame=false`
    );
    const hotkeyMode = hotkeyHelperReady
      ? 'win32-helper'
      : fallbackRegistered
        ? 'electron-fallback'
        : 'not-ready';
    console.log(
      `[smoke] hotkeys=${hotkeyMode}` +
        (shortcutIssues.length ? ' issues:' + shortcutIssues.join(',') : ' all-registered')
    );
    stopHotkeyHelper();
    setTimeout(() => app.exit(code), 350);
  };

  setTimeout(() => finish(2, 'TIMEOUT waiting for the launcher / YouTube'), 45000);

  win.webContents
    .executeJavaScript(
      `({
        brand: document.querySelector('.brand-name')?.textContent || '',
        version: document.getElementById('app-version')?.textContent || '',
        card: !!document.getElementById('open-youtube'),
        soon: document.querySelectorAll('[data-coming]').length,
        grip: getComputedStyle(document.querySelector('.grip')).height,
        bodyBg: getComputedStyle(document.body).backgroundColor
      })`
    )
    .then((probe) => console.log('[smoke] launcher probe:', JSON.stringify(probe)))
    .catch((err) => console.warn('[smoke] launcher probe failed:', err.message));

  openYouTube();
  if (!view || view.webContents.isDestroyed()) {
    finish(2, 'view was not created');
    return;
  }

  const wc = view.webContents;
  const onLoaded = () => {
    console.log('[smoke] YouTube finished loading:', wc.getURL());
    wc.executeJavaScript(
      `({
        ytClean: !!document.getElementById('airframe-clean'),
        ua: navigator.userAgent,
        brands: navigator.userAgentData ? navigator.userAgentData.brands : null,
        ytd: !!document.querySelector('ytd-app'),
        toastCss: !!document.getElementById('airframe-toast-css')
      })`
    )
      .then((probe) => console.log('[smoke] content probe:', JSON.stringify(probe)))
      .catch((err) => console.warn('[smoke] content probe failed:', err.message));

    if (GHOST_SMOKE) {
      runGhostPlaybackTest(wc, finish);
      return;
    }
    if (SWIPE_SMOKE) {
      runSwipeTest(wc, finish);
      return;
    }

    finish(0, 'OK (launcher + YouTube loaded)');
  };

  if (wc.isLoadingMainFrame() || !youtubeLoaded) {
    wc.once('did-finish-load', onLoaded);
    wc.once('did-fail-load', (_e, code, description, _url, isMainFrame) => {
      if (isMainFrame && code !== -3) finish(2, `YouTube failed: ${description} (${code})`);
    });
  } else {
    onLoaded();
  }
}

// ---------------------------------------------------------------------- boot

function start() {
  console.log(`[airframe] starting ${APP_NAME} (Electron ${process.versions.electron})`);
  logLine(`start ${APP_NAME} electron=${process.versions.electron}`);
  console.log('[airframe] profile:', app.getPath('userData'));
  console.log('[airframe] user agent:', CHROME_UA);

  setupContentSession();
  createWindow();
  registerIpc();
  startHotkeyHelper();
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win || win.isDestroyed()) return;
    if (win.isMinimized()) win.restore();
    // Click-through must never steal focus from the app being used.
    if (settings.ghost) {
      win.showInactive();
    } else {
      win.show();
      win.focus();
    }
  });

  app.on('window-all-closed', () => {
    if (!SMOKE) app.quit();
  });

  app.on('before-quit', (event) => {
    quitting = true;
    if (sessionFlushed) return;
    event.preventDefault();
    if (sessionFlushInProgress) return;

    sessionFlushInProgress = true;
    const ses = session.fromPartition(PARTITION);
    try {
      ses.flushStorageData();
    } catch (_) {}

    let flush = null;
    try {
      flush = ses.cookies.flushStore();
    } catch (_) {}

    Promise.race([
      Promise.resolve(flush).catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ]).finally(() => {
      sessionFlushInProgress = false;
      sessionFlushed = true;
      console.log('[airframe] session flushed; quitting');
      app.quit();
    });
  });

  app.on('will-quit', () => {
    stopHotkeyHelper();
    stopGhostWatchdog();
    stopMoveTimer();
    stopOpacityTimer();
    globalShortcut.unregisterAll();
    clearTimeout(saveTimer);
  });

  app.on('activate', () => {
    if (win && !win.isDestroyed()) {
      win.show();
      win.focus();
    }
  });

  app.whenReady().then(start).catch((err) => {
    console.error('[airframe] startup failed:', err);
    app.exit(1);
  });
}
