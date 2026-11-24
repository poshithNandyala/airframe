# Airframe SEO plan

Live site: https://poshithnandyala.github.io/airframe/
Repo: https://github.com/poshithNandyala/airframe

This is the working map for the first 10 days and the maintenance rules after that. The on-page work is done. Rankings still depend on indexing, links and time, so the plan below is ordered by what can actually move in 10 days.

## What shipped

- Keyword-focused homepage: title, description, H1, hero copy, FAQ, guide hub and internal links.
- Eight long-tail guide pages, each with a unique title, description, H1, FAQ, sources and download CTA.
- Structured data: `SoftwareApplication`, `WebSite`, `WebPage`, `Organization`, `Person`, `FAQPage`, `HowTo`, `Article` and `BreadcrumbList`.
- `sitemap.xml` with all 9 URLs and image entries for the launcher and OG image.
- `robots.txt`, `llms.txt`, an updated web manifest and a 1200x630 Open Graph image.
- Canonical URLs, Open Graph/Twitter cards, `max-image-preview:large` and descriptive alt text.
- No external fonts, no analytics, no render-blocking third-party scripts.
- IndexNow key file and submission after deploy.

## Keyword map

| Page | Primary keyword | Supporting queries | Intent |
| --- | --- | --- | --- |
| `/` | floating YouTube player for Windows | always on top YouTube player, YouTube overlay Windows, picture-in-picture alternative | Commercial |
| `/always-on-top-youtube-player/` | always on top YouTube player | keep YouTube on top Windows 11, pin YouTube on top, floating YouTube window | Commercial |
| `/watch-youtube-while-working/` | watch YouTube while working | YouTube while working from home, background YouTube, floating YouTube while working | Informational |
| `/picture-in-picture-alternative/` | picture in picture alternative Windows 11 | better than PiP, PiP replacement, floating video player Windows | Commercial |
| `/youtube-mini-player-windows-11/` | YouTube mini player Windows 11 | YouTube mini player desktop, mini player not working, floating mini player | Informational |
| `/hide-window-from-screen-share/` | hide window from screen share | hide YouTube from screen share, hide app from Teams, screen share privacy | Informational |
| `/make-window-click-through-windows/` | make window click through Windows | click through overlay, transparent click through window, WS_EX_TRANSPARENT | Informational/developer |
| `/watch-youtube-while-gaming/` | watch YouTube while gaming | YouTube overlay for gaming, floating YouTube over game, YouTube while playing | Informational |
| `/best-floating-youtube-player-windows/` | best floating YouTube player Windows | best always on top video player, Airframe vs PiP, YouTube overlay app | Commercial |

Rule: one page per intent. Do not add another page that targets the same query with different wording; improve the existing page instead.

## 10-day plan

### Day 0 - deploy and submit

- [ ] Deploy the SEO build to GitHub Pages.
- [ ] Submit all URLs to IndexNow (Bing, Yandex and partners).
- [ ] Verify the IndexNow key file returns 200.
- [ ] Confirm every URL in `sitemap.xml` returns 200.

### Day 1 - Google Search Console

1. Open https://search.google.com/search-console.
2. Add a **URL prefix** property: `https://poshithnandyala.github.io/airframe/`.
3. Verify with the HTML tag method (paste the meta tag into `docs/index.html`) or the HTML file method (put the file in `docs/`). Send the token and it can be added in one commit.
4. Submit `sitemap.xml`.
5. Use **URL inspection** on the homepage and the top three guides, then **Request indexing**. Google limits requests per day, so do the rest over the next two days.

### Day 2 - Bing Webmaster Tools

1. Open https://www.bing.com/webmasters.
2. Add the site, or import it from Google Search Console.
3. Submit `sitemap.xml`.
4. Check **IndexNow** status. The key file is `docs/7f3c9a2e5b8d4c61a0f2e9d7c4b1a683.txt` and the key location is `https://poshithnandyala.github.io/airframe/7f3c9a2e5b8d4c61a0f2e9d7c4b1a683.txt`.

### Day 3 - GitHub surface area

- Set the repository homepage to the live site (already done if `gh repo edit` succeeded).
- Keep the description keyword-rich: floating, always-on-top, click-through, screen-share, Windows.
- Topics: `always-on-top`, `electron`, `overlay`, `picture-in-picture`, `productivity`, `windows`, `youtube`, `youtube-player`, `floating-window`, `screen-share`, `click-through`, `windows-11`, `privacy`, `open-source`, `desktop-app`.
- Add a social preview image in GitHub repo settings (use `docs/og.png`). GitHub does not expose this through the REST API.
- Link the website in the release notes for v1.5.0.

### Day 4 - directories and communities

- Create an **AlternativeTo** listing. Category: video player / productivity. Mention free, open source, Windows, screen-share shield.
- Draft a **Product Hunt** listing. Tagline: "Watch YouTube while you work, without a second monitor." Do not launch until the demo video exists.
- Post in **r/Windows11** and **r/software** with a value-first post, not a bare link. Disclose that you are the developer and answer every comment.
- Read each community's self-promotion rules first. One removed post is worse than a delayed one.

### Day 5 - Show HN

Post **Show HN: Airframe - an always-on-top YouTube player for Windows**. Keep the body short: the problem, what it does, tech stack, free/MIT, what is still rough. Reply to technical questions with details, not marketing.

### Day 6 - demo video

Record a 60-90 second demo:

1. YouTube floating over an editor.
2. Opacity change.
3. Click-through with a visible cursor.
4. Screen-share shield in a solo Teams/Zoom call or OBS.
5. Prime Video, Netflix and Twitch shown as "Soon".

Upload to YouTube, embed it on the homepage and the always-on-top guide, and add `VideoObject` schema. Video results and embeds improve time on page and give another surface in search.

### Day 7 - answer real questions

Find questions where Airframe is a genuine answer:

- Stack Exchange **Software Recommendations**: "Windows YouTube client, borderless, always on top".
- Microsoft Q&A: "keep a window always on top".
- Reddit threads about floating YouTube, PiP alternatives and screen-share privacy.

Answer the question fully first. Link only if the tool is directly relevant, and disclose that you build it.

### Day 8 - outreach

- Send 5-10 short, personal emails to small Windows/productivity blogs and newsletters. Lead with the screen-share shield and the open-source angle, not "please review my app".
- Open PRs to 2-3 relevant awesome lists (Windows tools, self-hosted/privacy tools, productivity).
- Ask 3-5 friends or users for honest GitHub stars or feedback. Do not buy links or reviews.

### Day 9 - read the data

- Search Console → Performance → Queries. Look for queries with impressions but low CTR.
- Rewrite the title and description of the pages that already get impressions. That is usually faster than writing a new page.
- Add one or two real "People also ask" questions to the matching guide.
- Fix any crawl or indexing errors before adding more content.

### Day 10 - report and double down

- Export the queries, impressions, clicks and average position.
- Keep the pages that are getting impressions; improve them instead of starting over.
- Pick the next two long-tail pages only if they target genuinely different intent. Candidates: "Airframe vs PowerToys", "floating YouTube player for coding", "YouTube overlay for OBS".

## What 10 days can and cannot do

**Can:** get all 9 pages indexed, rank for low-competition long-tail queries, earn the brand query, and collect the first impressions and click data.

**Cannot:** guarantee page 1 for "always on top YouTube player" or other head terms. Those SERPs include established apps and listicles. Head terms need links, reviews and months of signals. Anyone promising #1 in 10 days is guessing.

The honest target for day 10 is: indexed, appearing for long-tail queries, and a clear list of queries to improve.

## Measurement

- **Google Search Console:** impressions, clicks, CTR, average position, indexed pages, Core Web Vitals.
- **Bing Webmaster Tools:** same, plus IndexNow status.
- **GitHub:** release download counts, referrers, stars, issues.
- **Server logs:** not available on GitHub Pages, so rely on Search Console and GitHub.
- Do not add analytics that contradict the "no telemetry" promise without saying so on the site.

## Maintenance rules

When a new release ships, update these together:

1. `docs/site.js` - version, installer URL, portable URL.
2. `docs/index.html` - JSON-LD `softwareVersion`, `dateModified`, `downloadUrl`, `releaseNotes`, checksums, sizes.
3. `docs/*/index.html` - any hardcoded version mention (the guide CTAs use `data-download`, so most update automatically).
4. `docs/sitemap.xml` - `lastmod`.
5. `docs/llms.txt` - version and release date.
6. `README.md` - download link and website link.
7. Release notes - link to the website and the relevant guide.

Run `node scripts/validate-seo.mjs` before every deploy. It checks titles, descriptions, canonicals, JSON-LD, internal links, sitemap coverage and mojibake.

## Launch copy

### Reddit

**Title:** I built a free, open-source floating YouTube player for Windows that hides from screen share

**Body:**

> I work with a video in the corner all day, and browser picture-in-picture kept getting in the way: too small, no opacity, no click-through, and it showed up in screen shares.
>
> So I built Airframe. It is a borderless YouTube window for Windows 10/11 that stays on top, fades to any opacity, lets clicks pass through to the app behind it, and uses Windows display affinity to stay out of Teams/Zoom/Meet/OBS captures.
>
> It is free and MIT licensed, with no account or telemetry. YouTube is ready; Prime Video, Netflix and Twitch are coming soon. It is Windows-only and the installer is not code-signed yet, so SmartScreen warns.
>
> Site: https://poshithnandyala.github.io/airframe/
> Source: https://github.com/poshithNandyala/airframe
>
> I would like feedback on the click-through behavior and the screen-share shield, especially on multi-monitor setups.

### Show HN

**Title:** Show HN: Airframe - an always-on-top YouTube player for Windows

**Body:**

> Airframe is a free, MIT-licensed Electron app that keeps YouTube in a borderless, always-on-top window. It supports 0-100% opacity, true click-through (including WinUI 3/WebView2 targets), a screen-share shield based on Windows display affinity, and global Alt shortcuts.
>
> The interesting part was making click-through reliable: Chromium's DirectComposition window uses WS_EX_NOREDIRECTIONBITMAP, which blocks pointer routing even with WS_EX_TRANSPARENT. Disabling DirectComposition for the top-level window restores the classic redirection surface and makes ghost mode work with WinUI 3 apps.
>
> Windows 10/11 only. YouTube today; Prime Video, Netflix and Twitch are planned. No account or telemetry.

### Product Hunt

**Tagline:** Watch YouTube while you work, without a second monitor.

**Description:** Airframe is a free, open-source floating YouTube player for Windows. Keep a video always on top, fade it to any opacity, click through to the app behind it, and hide it from screen share. No account, no telemetry.

### AlternativeTo

**Short description:** A free, open-source always-on-top YouTube player for Windows with opacity, click-through and screen-share protection.

**Tags:** video player, YouTube, always on top, picture-in-picture, productivity, privacy, open source, Windows.

## Verification checklist

- [ ] All 9 URLs return 200 on the live site.
- [ ] `robots.txt` and `sitemap.xml` return 200 with the right content types.
- [ ] `og.png` returns 200 and is 1200x630.
- [ ] IndexNow key file returns 200 and matches the submitted key.
- [ ] Google Search Console verified and sitemap submitted.
- [ ] Bing Webmaster Tools verified and sitemap submitted.
- [ ] GitHub homepage, description and topics set.
- [ ] No "YouTube Music" copy anywhere on the site.
- [ ] Prime Video, Netflix and Twitch still marked "Soon".
- [ ] Download buttons return the installer/ZIP with `Content-Disposition: attachment`.
