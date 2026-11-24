import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('docs');
const pages = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index.html') pages.push(full);
  }
}
walk(root);

const issues = [];
const titles = new Map();
const descriptions = new Map();

function textOf(html, regex) {
  const match = html.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : '';
}

for (const file of pages) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const title = textOf(html, /<title>([\s\S]*?)<\/title>/i);
  const description = textOf(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = textOf(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];

  if (title.length < 40 || title.length > 68) {
    issues.push(`${rel}: title length ${title.length} (${title})`);
  }
  if (description.length < 120 || description.length > 168) {
    issues.push(`${rel}: description length ${description.length}`);
  }
  if (h1s.length !== 1) {
    issues.push(`${rel}: ${h1s.length} h1 elements`);
  }
  if (titles.has(title)) issues.push(`${rel}: duplicate title with ${titles.get(title)}`);
  titles.set(title, rel);
  if (descriptions.has(description)) {
    issues.push(`${rel}: duplicate description with ${descriptions.get(description)}`);
  }
  descriptions.set(description, rel);

  if (!canonical.startsWith('https://poshithnandyala.github.io/airframe/')) {
    issues.push(`${rel}: bad canonical ${canonical}`);
  }
  if (rel === 'index.html') {
    if (canonical !== 'https://poshithnandyala.github.io/airframe/') {
      issues.push(`${rel}: homepage canonical mismatch`);
    }
  } else {
    const expected = `https://poshithnandyala.github.io/airframe/${rel.replace(/\/index\.html$/, '/')}`;
    if (canonical !== expected) issues.push(`${rel}: canonical ${canonical} != ${expected}`);
  }

  if (html.includes('undefined')) issues.push(`${rel}: contains "undefined"`);

  const ldMatches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (ldMatches.length < 1) issues.push(`${rel}: no JSON-LD`);
  for (const match of ldMatches) {
    try {
      const data = JSON.parse(match[1]);
      const graph = data['@graph'] || [data];
      const faq = graph.find((node) => node['@type'] === 'FAQPage');
      if (faq && rel !== 'index.html') {
        const block = html.match(/<div class="article-faq">([\s\S]*?)<\/div>\s*<\/section>/i);
        const visible = block ? (block[1].match(/<details>/g) || []).length : 0;
        if (faq.mainEntity.length !== visible) {
          issues.push(`${rel}: FAQ schema ${faq.mainEntity.length} vs visible ${visible}`);
        }
      }
      const article = graph.find((node) => node['@type'] === 'Article');
      if (article && !article.headline) issues.push(`${rel}: Article missing headline`);
    } catch (error) {
      issues.push(`${rel}: invalid JSON-LD (${error.message})`);
    }
  }

  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    if (/^(https?:|mailto:|#|data:)/.test(href)) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = path.resolve(path.dirname(file), clean);
    const exists = fs.existsSync(target) && (fs.statSync(target).isDirectory() ? fs.existsSync(path.join(target, 'index.html')) : true);
    if (!exists) issues.push(`${rel}: broken link ${href}`);
  }

  if (/Â|â€™|â€œ|â€|Ã/.test(html)) issues.push(`${rel}: mojibake detected`);
}

const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const homeFaqs = [...homepage.matchAll(/<details class="reveal">\s*<summary>([\s\S]*?)<\/summary>/g)].length;
const homeLd = JSON.parse(homepage.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i)[1]);
const graph = homeLd['@graph'] || [];
const faqNode = graph.find((node) => node['@type'] === 'FAQPage');
if (!faqNode) issues.push('homepage: no FAQPage schema');
else if (faqNode.mainEntity.length !== homeFaqs) {
  issues.push(`homepage: FAQ schema ${faqNode.mainEntity.length} vs visible ${homeFaqs}`);
}
const app = graph.find((node) => node['@type'] === 'SoftwareApplication');
if (!app) issues.push('homepage: no SoftwareApplication schema');
else {
  for (const key of ['name', 'operatingSystem', 'softwareVersion', 'downloadUrl', 'offers']) {
    if (!app[key]) issues.push(`homepage: SoftwareApplication missing ${key}`);
  }
}

const siteJs = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
const siteVersion = siteJs.match(/version:\s*'([^']+)'/)?.[1];
const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
if (!siteVersion) issues.push('site.js: no version');
else if (siteVersion !== pkg.version) {
  issues.push(`version mismatch: site.js ${siteVersion} vs package.json ${pkg.version}`);
}
if (siteVersion && app?.softwareVersion !== siteVersion) {
  issues.push(`version mismatch: SoftwareApplication ${app?.softwareVersion} vs site.js ${siteVersion}`);
}
if (siteVersion && !homepage.includes(`v${siteVersion}/Airframe-Setup-${siteVersion}.exe`)) {
  issues.push('homepage: installer URL does not match site version');
}

const ogPath = path.join(root, 'og.png');
if (!fs.existsSync(ogPath)) issues.push('docs/og.png missing');
if (!homepage.includes('https://poshithnandyala.github.io/airframe/og.png')) {
  issues.push('homepage: OG image URL missing');
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const loc of sitemapLocs) {
  if (!loc.startsWith('https://poshithnandyala.github.io/airframe/')) {
    issues.push(`sitemap: foreign loc ${loc}`);
  }
}
for (const file of pages) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const expected = rel === 'index.html'
    ? 'https://poshithnandyala.github.io/airframe/'
    : `https://poshithnandyala.github.io/airframe/${rel.replace(/\/index\.html$/, '/')}`;
  if (!sitemapLocs.includes(expected)) issues.push(`sitemap: missing ${expected}`);
}

console.log(`pages=${pages.length} sitemapUrls=${sitemapLocs.length}`);
if (issues.length) {
  console.log(`issues=${issues.length}`);
  for (const issue of issues) console.log(` - ${issue}`);
  process.exitCode = 1;
} else {
  console.log('all checks passed');
}
