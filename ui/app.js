'use strict';

const api = window.airframe;
const $ = (id) => document.getElementById(id);

const home = $('home');
const loading = $('loading');
const loadingTitle = $('loading-title');
const loadingSub = $('loading-sub');
const toast = $('toast');
const protectChip = $('chip-protect');
const topChip = $('chip-top');
const muteChip = $('chip-mute');
const protectLabel = $('protect-label');
const topLabel = $('top-label');
const muteLabel = $('mute-label');
const opacityLabel = $('opacity-label');
const appVersion = $('app-version');

let toastTimer = 0;
let opening = false;

function showToast(message, duration = 2800) {
  if (!toast || !message) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function setLoading(visible, title, subtitle) {
  if (!loading) return;
  if (visible) {
    if (title) loadingTitle.textContent = title;
    if (subtitle) loadingSub.textContent = subtitle;
    loading.hidden = false;
  } else {
    loading.hidden = true;
  }
}

function replayEntrance() {
  if (!home) return;
  home.classList.remove('enter');
  void home.offsetWidth;
  home.classList.add('enter');
}

function render(state) {
  if (!state) return;

  document.body.classList.toggle('ghost', Boolean(state.ghost));

  if (protectChip && protectLabel) {
    protectChip.classList.toggle('on', Boolean(state.protected));
    protectChip.setAttribute('aria-pressed', String(Boolean(state.protected)));
    protectLabel.textContent = state.protected ? 'Shield on' : 'Shield off';
  }

  if (topChip && topLabel) {
    topChip.classList.toggle('on', Boolean(state.alwaysOnTop));
    topChip.setAttribute('aria-pressed', String(Boolean(state.alwaysOnTop)));
    topLabel.textContent = state.alwaysOnTop ? 'Pinned' : 'Unpinned';
  }

  if (muteChip && muteLabel) {
    muteChip.classList.toggle('on', !state.muted);
    muteChip.setAttribute('aria-pressed', String(Boolean(state.muted)));
    muteLabel.textContent = state.muted ? 'Muted' : 'Sound';
  }

  if (opacityLabel && typeof state.opacity === 'number') {
    opacityLabel.textContent = `${Math.round(state.opacity * 100)}%`;
  }

  if (appVersion && state.version) {
    appVersion.textContent = `Airframe v${state.version}`;
  }
}

function act(type) {
  if (!api) return;
  Promise.resolve(api.act(type))
    .then(render)
    .catch(() => {});
}

function openYouTube() {
  if (!api || opening) return;
  opening = true;
  setLoading(true, 'Opening YouTube', 'Getting your screen ready…');
  Promise.resolve(api.act('open-youtube')).catch(() => {
    opening = false;
    setLoading(false);
  });
}

const youtubeCard = $('open-youtube');
if (youtubeCard) youtubeCard.addEventListener('click', openYouTube);

const quitButton = $('quit');
if (quitButton) {
  quitButton.addEventListener('click', () => {
    if (api) Promise.resolve(api.act('quit')).catch(() => {});
  });
}

document.querySelectorAll('[data-coming]').forEach((card) => {
  card.addEventListener('click', () => {
    const name = card.dataset.coming || 'This screen';
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 380);
    showToast(`${name} is coming soon.`);
  });
});

document.querySelectorAll('[data-act]').forEach((button) => {
  button.addEventListener('click', () => act(button.dataset.act));
});

if (api) {
  api.onState(render);
  api.onToast((message) => showToast(message, 3600));
  api.onLoading((payload) => {
    const isLoading = typeof payload === 'boolean' ? payload : Boolean(payload && payload.loading);
    if (isLoading) {
      setLoading(true, payload && payload.title, payload && payload.subtitle);
    } else {
      setLoading(false);
      opening = false;
    }
  });
  api.onMode((nextMode) => {
    if (nextMode === 'home') {
      setLoading(false);
      opening = false;
      replayEntrance();
    } else if (nextMode === 'youtube') {
      setLoading(false);
    }
  });
  api.getState().then(render).catch(() => {});
}

requestAnimationFrame(() => {
  requestAnimationFrame(replayEntrance);
});
