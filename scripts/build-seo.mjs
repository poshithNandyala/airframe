import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pagesA } from './seo-pages-a.mjs';
import { pagesB } from './seo-pages-b.mjs';

const pages = [...pagesA, ...pagesB];
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const docs = path.join(root, 'docs');

const SITE = 'https://poshithnandyala.github.io/airframe';
const INSTALLER =
  'https://github.com/poshithNandyala/airframe/releases/download/v1.5.0/Airframe-Setup-1.5.0.exe';
const PORTABLE =
  'https://github.com/poshithNandyala/airframe/releases/download/v1.5.0/Airframe-1.5.0-win-x64.zip';
const DATE = '2026-11-25';
const OG_ALT =
  'Airframe, a floating always-on-top YouTube player for Windows 10 and 11.';

const pageBySlug = new Map(pages.map((page) => [page.slug, page]));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTime(body) {
  const words = stripTags(body).split(' ').filter(Boolean).length;
  return Math.max(4, Math.round(words / 220));
}

function jsonLd(data) {
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

function nav() {
  return `
  <header class="nav" id="nav">
    <div class="container nav-inner">
      <a class="brand" href="../" aria-label="Airframe home">
        <span class="brand-mark"><svg class="icon"><use href="#i-play"/></svg></span>
        <span class="brand-name">Airframe</span>
        <span class="brand-version">v<span data-version>1.5.0</span></span>
      </a>

      <nav class="nav-links" id="nav-links" aria-label="Main">
        <a href="../#features">Features</a>
        <a href="../#screens">Screens</a>
        <a href="../#shortcuts">Shortcuts</a>
        <a href="../#guides">Guides</a>
        <a href="../#download">Download</a>
        <a href="../#faq">FAQ</a>
      </nav>

      <div class="nav-actions">
        <a class="icon-link" href="https://github.com/poshithNandyala/airframe" target="_blank" rel="noopener" aria-label="Airframe on GitHub">
          <svg class="icon"><use href="#i-github"/></svg>
        </a>
        <a class="btn btn-primary btn-small" href="${INSTALLER}" download data-download="installer">
          <svg class="icon"><use href="#i-download"/></svg>
          <span>Download</span>
        </a>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">
          <span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;
}

function sprite() {
  return `
  <svg class="sprite" aria-hidden="true" focusable="false">
    <symbol id="i-play" viewBox="0 0 24 24"><path d="M8.4 6.1 18.4 12 8.4 17.9V6.1Z" fill="currentColor"/></symbol>
    <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></symbol>
    <symbol id="i-github" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></symbol>
  </svg>`;
}

function footer() {
  return `
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand" href="../" aria-label="Airframe home">
          <span class="brand-mark"><svg class="icon"><use href="#i-play"/></svg></span>
          <span class="brand-name">Airframe</span>
        </a>
        <p>A quiet floating screen for YouTube on Windows 10/11.</p>
        <span class="footer-version">v<span data-version>1.5.0</span> &middot; MIT</span>
      </div>

      <div>
        <h4>Product</h4>
        <a href="../#features">Features</a>
        <a href="../#screens">Screens</a>
        <a href="../#shortcuts">Shortcuts</a>
        <a href="../#download">Download</a>
        <a href="../#faq">FAQ</a>
      </div>

      <div>
        <h4>Guides</h4>
        <a href="../always-on-top-youtube-player/">Always on top</a>
        <a href="../watch-youtube-while-working/">Watch while working</a>
        <a href="../picture-in-picture-alternative/">PiP alternative</a>
        <a href="../hide-window-from-screen-share/">Screen-share privacy</a>
        <a href="../make-window-click-through-windows/">Click-through</a>
      </div>

      <div>
        <h4>GitHub</h4>
        <a href="https://github.com/poshithNandyala" target="_blank" rel="noopener">Poshith Nandyala</a>
        <a href="https://github.com/poshithNandyala/airframe" target="_blank" rel="noopener">Source</a>
        <a href="https://github.com/poshithNandyala/airframe/releases" target="_blank" rel="noopener">Releases</a>
        <a href="https://github.com/poshithNandyala/airframe/issues" target="_blank" rel="noopener">Issues</a>
      </div>

      <div>
        <h4>Legal</h4>
        <a href="https://github.com/poshithNandyala/airframe/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a>
        <a href="https://github.com/poshithNandyala/airframe/releases/tag/v1.5.0" target="_blank" rel="noopener">Release notes</a>
        <p class="footer-fine">Airframe is an independent project. Not affiliated with YouTube, Google, Amazon, Netflix, Twitch or Microsoft. All product names are trademarks of their respective owners.</p>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>&copy; 2026 Poshith Nandyala. Made for Windows 10 &amp; 11.</p>
      <a href="#top">Back to top <svg class="icon"><use href="#i-arrow"/></svg></a>
    </div>
  </footer>`;
}

function renderPage(page) {
  const canonical = `${SITE}/${page.slug}/`;
  const relatedSlugs = [...page.related];
  for (const fallback of [
    'best-floating-youtube-player-windows',
    'watch-youtube-while-working',
    'always-on-top-youtube-player',
  ]) {
    if (relatedSlugs.length >= 4) break;
    if (fallback !== page.slug && !relatedSlugs.includes(fallback)) {
      relatedSlugs.push(fallback);
    }
  }

  const related = relatedSlugs
    .map((slug) => pageBySlug.get(slug))
    .filter(Boolean);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: page.h1,
        description: page.description,
        image: `${SITE}/og.png`,
        url: canonical,
        datePublished: `${DATE}T00:00:00+00:00`,
        dateModified: `${DATE}T00:00:00+00:00`,
        inLanguage: 'en',
        articleSection: 'Guides',
        keywords: page.keywords.join(', '),
        wordCount: stripTags(page.body).split(' ').filter(Boolean).length,
        author: {
          '@type': 'Person',
          name: 'Poshith Nandyala',
          url: 'https://github.com/poshithNandyala',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Airframe',
          url: `${SITE}/`,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE}/icon.png`,
          },
        },
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE}/#website`,
          name: 'Airframe',
          url: `${SITE}/`,
        },
        about: {
          '@type': 'SoftwareApplication',
          name: 'Airframe',
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Windows 10, Windows 11',
          url: `${SITE}/`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonical,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Airframe',
            item: `${SITE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Guides',
            item: `${SITE}/#guides`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.shortTitle,
            item: canonical,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonical}#faq`,
        mainEntity: page.faqs.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
  };

  const sourceList = (page.sources || [])
    .map(
      (source) =>
        `<li><a href="${source.url}" target="_blank" rel="noopener">${source.label}</a></li>`
    )
    .join('\n          ');

  const relatedCards = related
    .map(
      (item) => `
          <a class="related-card" href="../${item.slug}/">
            <span class="related-kicker">Guide</span>
            <strong>${item.h1}</strong>
            <span>${item.card}</span>
          </a>`
    )
    .join('');

  const faqItems = page.faqs
    .map(
      (item) => `
            <details>
              <summary>${item.q}</summary>
              <p>${item.a}</p>
            </details>`
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}" />
  <meta name="author" content="Poshith Nandyala" />
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
  <meta name="theme-color" content="#08080a" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" href="../icon.png" type="image/png" />
  <link rel="apple-touch-icon" href="../icon.png" />
  <link rel="manifest" href="../site.webmanifest" />
  <link rel="stylesheet" href="../styles.css" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Airframe" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${escapeHtml(page.title)}" />
  <meta property="og:description" content="${escapeHtml(page.description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${SITE}/og.png" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${OG_ALT}" />
  <meta property="article:published_time" content="${DATE}T00:00:00+00:00" />
  <meta property="article:modified_time" content="${DATE}T00:00:00+00:00" />
  <meta property="article:author" content="Poshith Nandyala" />
  <meta property="article:section" content="Guides" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(page.title)}" />
  <meta name="twitter:description" content="${escapeHtml(page.description)}" />
  <meta name="twitter:image" content="${SITE}/og.png" />
  <meta name="twitter:image:alt" content="${OG_ALT}" />

  <script type="application/ld+json">
${jsonLd(articleSchema)}
  </script>
</head>
<body class="article-page">
  <a class="skip-link" href="#main">Skip to content</a>
${sprite()}

  <div class="bg" aria-hidden="true">
    <div class="bg-grid"></div>
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
  </div>
${nav()}

  <main id="main">
    <article class="article">
      <div class="container article-container">
        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a href="../">Airframe</a>
          <span aria-hidden="true">/</span>
          <a href="../#guides">Guides</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">${page.shortTitle}</span>
        </nav>

        <header class="article-head">
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.h1}</h1>
          <p class="article-lede">${page.lede}</p>
          <div class="article-meta">
            <span>By <a href="https://github.com/poshithNandyala" rel="author">Poshith Nandyala</a></span>
            <span>Updated <time datetime="${DATE}">November 25, 2026</time></span>
            <span>${readTime(page.body)} min read</span>
          </div>
        </header>

        <div class="quick-answer">
          <span class="quick-label">Short answer</span>
          <p>${page.quick}</p>
        </div>

        <div class="article-body">
${page.body}
        </div>

        <section class="article-section" id="faq">
          <h2>Frequently asked questions</h2>
          <div class="article-faq">${faqItems}
          </div>
        </section>

        ${
          sourceList
            ? `<section class="article-sources">
          <h2>Sources</h2>
          <ul>
          ${sourceList}
          </ul>
        </section>`
            : ''
        }

        <aside class="article-cta">
          <p class="eyebrow">Try it</p>
          <h2>Float YouTube over your work.</h2>
          <p>Free and open source for Windows 10 and 11. Installer or portable ZIP, no account and no telemetry.</p>
          <div class="article-cta-actions">
            <a class="btn btn-primary" href="${INSTALLER}" download data-download="installer">
              <svg class="icon"><use href="#i-download"/></svg>
              <span>Download for Windows</span>
            </a>
            <a class="btn btn-ghost" href="../#download">Installer &amp; portable ZIP</a>
          </div>
          <p class="article-cta-fine">v1.5.0 &middot; Windows 10/11 x64 &middot; MIT licensed</p>
        </aside>

        <div class="author-box">
          <img src="../icon.png" width="52" height="52" alt="" loading="lazy" />
          <div>
            <strong>Poshith Nandyala</strong>
            <p>I build Airframe, a free floating YouTube player for Windows. These guides cover the window tricks behind it and the setups that actually work.</p>
            <a href="https://github.com/poshithNandyala" target="_blank" rel="noopener">GitHub profile</a>
          </div>
        </div>

        <nav class="related" aria-labelledby="related-title">
          <h2 id="related-title">Related guides</h2>
          <div class="related-grid">${relatedCards}
          </div>
        </nav>
      </div>
    </article>
  </main>
${footer()}

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script src="../site.js"></script>
</body>
</html>
`;
}

for (const page of pages) {
  const dir = path.join(docs, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), renderPage(page), 'utf8');
  console.log(`wrote docs/${page.slug}/index.html`);
}

const urls = [
  {
    loc: `${SITE}/`,
    priority: '1.0',
    changefreq: 'weekly',
    images: [
      {
        loc: `${SITE}/launcher.png`,
        title: 'Airframe 1.5.0 launcher with YouTube ready',
        caption:
          'The Airframe launcher: YouTube is ready, with Prime Video, Netflix and Twitch coming soon.',
      },
      {
        loc: `${SITE}/og.png`,
        title: 'Airframe floating YouTube player for Windows',
        caption:
          'Airframe keeps YouTube in an always-on-top window while you work.',
      },
    ],
  },
  ...pages.map((page) => ({
    loc: `${SITE}/${page.slug}/`,
    priority: page.priority || '0.7',
    changefreq: 'monthly',
    images: [],
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${entry.images.length
  ? `${entry.images
      .map(
        (image) => `    <image:image>
      <image:loc>${image.loc}</image:loc>
      <image:title>${image.title}</image:title>
      <image:caption>${image.caption}</image:caption>
    </image:image>`
      )
      .join('\n')}\n`
  : ''}  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(docs, 'sitemap.xml'), sitemap, 'utf8');
console.log('wrote docs/sitemap.xml');

const pageList = pages
  .map((page) => `- [${page.h1}](${SITE}/${page.slug}/) — ${page.card}`)
  .join('\n');

const llms = `# Airframe

> Airframe is a free, open-source, always-on-top YouTube player for Windows 10 and 11. It keeps YouTube in a borderless floating window that can fade to any opacity, become click-through, hide from screen share, and be controlled with global Alt shortcuts.

## Key facts

- Name: Airframe
- Version: 1.5.0 (released November 22, 2026)
- Platform: Windows 10 and Windows 11, 64-bit
- Price: free, MIT licensed
- Source: https://github.com/poshithNandyala/airframe
- Download: ${INSTALLER}
- Portable ZIP: ${PORTABLE}
- Website: ${SITE}/
- Author: Poshith Nandyala (https://github.com/poshithNandyala)

## What it does

- Always-on-top YouTube window with no title bar or taskbar button
- 0-100% opacity and true click-through display mode
- Screen-share shield using Windows display affinity
- 14 global Alt shortcuts, including shortcuts that do not stick in the app you are typing in
- Touchpad back/forward gestures and mouse side buttons
- Ad and tracker filtering
- Local-only YouTube sign-in in %APPDATA%\\Airframe; no account, server or telemetry
- Prime Video, Netflix and Twitch screens are planned (coming soon)

## Guides

${pageList}

## Limitations

- Windows 10/11 x64 only
- YouTube is the only finished screen today
- Rented or DRM-only YouTube movies may not play
- The installer is not code-signed yet, so SmartScreen may warn
`;

fs.writeFileSync(path.join(docs, 'llms.txt'), llms, 'utf8');
console.log('wrote docs/llms.txt');
