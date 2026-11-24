export const pagesA = [
  {
    slug: 'always-on-top-youtube-player',
    title: 'Always on Top YouTube Player for Windows 10 & 11 | Airframe',
    description:
      'Keep YouTube above every other window on Windows 10 and 11. Compare Airframe, PowerToys and picture-in-picture, then set up a floating player in minutes.',
    h1: 'Always-on-top YouTube player for Windows',
    shortTitle: 'Always on top',
    eyebrow: 'Windows guide',
    lede: "Windows will happily let YouTube disappear behind your editor. Here is how to keep it above everything else, which tools actually do it, and where each one stops.",
    card: 'Keep YouTube above every other window on Windows 10 and 11.',
    priority: '0.9',
    keywords: [
      'always on top youtube player',
      'always on top youtube windows',
      'keep youtube on top windows 11',
      'floating youtube window',
      'pin youtube on top',
    ],
    quick:
      'Airframe is a free Windows app that keeps YouTube in a borderless, always-on-top window. Install it, pick YouTube, and the video stays above your work. Press Alt+T to toggle pinning and Alt+L to make the window click-through.',
    related: [
      'picture-in-picture-alternative',
      'make-window-click-through-windows',
      'watch-youtube-while-working',
    ],
    sources: [
      {
        label: 'Microsoft PowerToys: Always on Top',
        url: 'https://learn.microsoft.com/en-us/windows/powertoys/always-on-top',
      },
      {
        label: 'Electron: BrowserWindow setAlwaysOnTop',
        url: 'https://www.electronjs.org/docs/latest/api/browser-window#winsetalwaysontopflag-level-relativelevel',
      },
    ],
    faqs: [
      {
        q: 'Is there a built-in always-on-top YouTube player in Windows?',
        a: 'No. Windows can pin a whole window with PowerToys Always on Top, and browsers can float a video with picture-in-picture. Neither gives you a dedicated, borderless YouTube window with opacity, click-through and a screen-share shield. Airframe fills that gap.',
      },
      {
        q: 'Does Airframe work over fullscreen games?',
        a: 'It works best when the game runs in borderless windowed mode. Exclusive fullscreen can cover any always-on-top window because the game takes direct control of the display. If the video disappears, switch the game to borderless or windowed mode.',
      },
      {
        q: 'Is Airframe free?',
        a: 'Yes. Airframe is free and open source under the MIT license. You can download the installer or the portable ZIP from GitHub Releases.',
      },
      {
        q: 'Does it work with YouTube Premium?',
        a: 'Yes. Sign in as usual and Premium videos play. Rented movies and DRM-only content may not play because Electron does not ship Google Widevine.',
      },
      {
        q: 'Can I use Airframe on macOS or Linux?',
        a: 'No. Airframe is built for Windows 10 and Windows 11, 64-bit only.',
      },
      {
        q: 'Why does the video sometimes sit under another window?',
        a: 'Always-on-top is a request, not an absolute rule. Another topmost window, an exclusive-fullscreen game, or a system prompt such as UAC can appear above Airframe. Press Alt+T to re-assert pinning, or close the other topmost window.',
      },
    ],
    body: `        <p>Windows has no built-in switch that says "keep this YouTube video on top of everything." The usual workarounds are picture-in-picture in a browser or PowerToys Always on Top. Both work, but they leave you with a tiny video or a browser window with its title bar, tabs and address bar attached.</p>

        <p>Airframe is a small Windows app built for the other job: a full YouTube window that behaves like part of your desktop. It is borderless, stays above normal windows, and adds the controls a pinned browser tab cannot offer &mdash; opacity, click-through, a screen-share shield and global shortcuts.</p>

        <h2 id="what-always-on-top-means">What "always on top" actually means</h2>

        <p>Windows stacks windows in a z-order. The active window is normally at the top, and clicking another window moves that one above. A window with the <em>topmost</em> flag stays above normal windows even when it is not focused. That is the flag Airframe sets by default.</p>

        <p>Two details matter in practice:</p>

        <ul>
          <li><strong>Topmost is not exclusive.</strong> Another topmost window can still sit above Airframe. So can UAC prompts and some system dialogs.</li>
          <li><strong>Exclusive fullscreen bypasses the normal desktop compositor.</strong> A game in true fullscreen can cover every always-on-top window. Borderless windowed mode is the reliable setup.</li>
        </ul>

        <p>Airframe also removes the title bar, taskbar button and tray icon, so the window reads as a screen rather than another app. You move it by dragging the thin strip at the top or any edge, and you resize it from any edge.</p>

        <h2 id="three-ways">Three ways to keep YouTube on top on Windows</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Method</th><th>Best for</th><th>What you get</th><th>What is missing</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Browser picture-in-picture</strong></td>
                <td>A quick clip with no install</td>
                <td>Video floats above other windows; play/pause and back-to-tab controls</td>
                <td>Small by default, one video, no opacity, no click-through, no screen-share shield</td>
              </tr>
              <tr>
                <td><strong>PowerToys Always on Top</strong></td>
                <td>Pinning any app, not just video</td>
                <td>Win+Ctrl+T pins the active window above others</td>
                <td>Browser chrome stays, no opacity, no click-through, no dedicated shield</td>
              </tr>
              <tr>
                <td><strong>Airframe</strong></td>
                <td>A permanent floating YouTube screen while you work</td>
                <td>Full YouTube window, 0&ndash;100% opacity, click-through, screen-share shield, 14 global shortcuts</td>
                <td>Windows only; YouTube is the only finished screen today; installer is not code-signed yet</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>If you only need a video visible for five minutes, browser picture-in-picture is fine. If you want a YouTube window that lives on your desktop all day, a dedicated player is less friction and far more controllable.</p>

        <h2 id="why-dedicated">Why a dedicated window beats pinning a browser tab</h2>

        <p>A pinned browser still behaves like a browser. The tab bar, address bar and window controls take space, the page can be reloaded by accident, and the window is tied to the rest of your browsing session. Airframe strips all of that away and keeps the YouTube session in its own profile.</p>

        <p>The practical differences:</p>

        <ul>
          <li><strong>No title bar or taskbar button.</strong> The video does not clutter Alt+Tab or your taskbar. The launcher is the only visible entry point.</li>
          <li><strong>Opacity from 0 to 100%.</strong> Fade the video to a hint over an editor, or bring it back with <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd>. The default is 93%, which keeps the video readable without feeling like a second monitor.</li>
          <li><strong>True click-through.</strong> <kbd>Alt</kbd><kbd>L</kbd> sends clicks, scrolling, dragging and hover to the app behind the video. You keep watching while you work in the window underneath.</li>
          <li><strong>Screen-share shield.</strong> The window is excluded from most Windows capture paths, including Teams, Zoom, Meet and OBS. It is on by default.</li>
          <li><strong>Global shortcuts.</strong> Every control works while another app has focus, so you do not have to hunt for the video window.</li>
          <li><strong>Touchpad and mouse gestures.</strong> Two-finger swipe goes back and forward, and mouse side buttons work like a browser.</li>
        </ul>

        <h2 id="setup">How to set up Airframe in three steps</h2>

        <ol class="steps">
          <li><strong>Download the installer.</strong> The Windows installer is about 121 MB. A portable ZIP is available if you prefer not to install. Both come from the <a href="https://github.com/poshithNandyala/airframe/releases/tag/v1.5.0" target="_blank" rel="noopener">v1.5.0 GitHub release</a>.</li>
          <li><strong>Run it.</strong> No admin rights are required. SmartScreen may warn because the installer is not code-signed yet; choose <em>More info</em> and then <em>Run anyway</em> if you are comfortable with the source.</li>
          <li><strong>Pick YouTube.</strong> The launcher opens the YouTube screen. Sign in if you want your subscriptions and playlists. The window stays on top by default.</li>
        </ol>

        <p>From there, resize the window to the corner you want and set opacity with <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd> or <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&darr;</kbd>. If you need your mouse back, press <kbd>Alt</kbd><kbd>L</kbd> after bringing the app you want to use to the front.</p>

        <h2 id="shortcuts">The shortcuts worth memorizing</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Action</th><th>Shortcut</th><th>When to use it</th></tr>
            </thead>
            <tbody>
              <tr><td>Toggle always on top</td><td><kbd>Alt</kbd><kbd>T</kbd></td><td>When another topmost window is fighting the video</td></tr>
              <tr><td>Toggle click-through</td><td><kbd>Alt</kbd><kbd>L</kbd></td><td>When you need to type or click in the app behind the video</td></tr>
              <tr><td>More / less visible</td><td><kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd> / <kbd>&darr;</kbd></td><td>Fading the video over an editor or document</td></tr>
              <tr><td>Hide / show</td><td><kbd>Alt</kbd><kbd>H</kbd></td><td>Instantly clearing the screen without closing the video</td></tr>
              <tr><td>Fullscreen</td><td><kbd>Alt</kbd><kbd>F</kbd></td><td>Watching a video properly between tasks</td></tr>
              <tr><td>Next monitor / recenter</td><td><kbd>Alt</kbd><kbd>Shift</kbd><kbd>D</kbd></td><td>Moving between laptop and external displays</td></tr>
              <tr><td>Screen-share shield</td><td><kbd>Alt</kbd><kbd>S</kbd></td><td>Checking or toggling capture protection</td></tr>
            </tbody>
          </table>
        </div>

        <p>The full list, including window movement and touchpad gestures, is on the <a href="../#shortcuts">Airframe shortcuts section</a>.</p>

        <h2 id="troubleshooting">If YouTube will not stay on top</h2>

        <p>Start with <kbd>Alt</kbd><kbd>T</kbd>. It is easy to unpin the window by accident, and the launcher shows the current state. If pinning is on and the video still disappears, check these in order:</p>

        <ul>
          <li><strong>The other app is exclusive fullscreen.</strong> Switch the game or video app to borderless windowed mode.</li>
          <li><strong>Another topmost window is above it.</strong> Task Manager, some launchers and a few utilities also use topmost. Close or unpin them.</li>
          <li><strong>The window is on another monitor.</strong> Press <kbd>Alt</kbd><kbd>Shift</kbd><kbd>D</kbd> to move it to the next display or recenter it.</li>
          <li><strong>The app is hidden.</strong> Press <kbd>Alt</kbd><kbd>H</kbd>, then check opacity with <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd>.</li>
          <li><strong>UAC or a secure desktop is showing.</strong> Windows intentionally puts those above normal windows. Nothing in user mode can cover them.</li>
        </ul>

        <h2 id="bottom-line">The bottom line</h2>

        <p>Browser picture-in-picture is the fastest way to float one video. PowerToys is the right tool if you want to pin any window. Airframe is the option to pick when YouTube itself should live on your desktop: a full window, any opacity, click-through when you need it, and a shield for screen shares.</p>

        <p><a class="inline-cta" href="../#download">Download Airframe for Windows <span aria-hidden="true">&rarr;</span></a></p>`,
  },
  {
    slug: 'watch-youtube-while-working',
    title: 'How to Watch YouTube While Working on Windows | Airframe',
    description:
      'Watch YouTube while working on Windows without losing screen space. Floating windows, opacity, click-through, and how to keep videos out of screen shares.',
    h1: 'How to watch YouTube while you work',
    shortTitle: 'Watch while working',
    eyebrow: 'Productivity guide',
    lede: "A second monitor is not the only way to keep a video in view. This is the single-screen setup that stays out of your way, including during screen shares.",
    card: 'A five-minute floating setup that does not take over your screen.',
    priority: '0.8',
    keywords: [
      'watch youtube while working',
      'youtube while working from home',
      'watch youtube while working windows',
      'floating youtube while working',
      'youtube background while working',
    ],
    quick:
      'Use a small always-on-top YouTube window instead of a second browser tab. Keep it in a corner, fade it to 30&ndash;60% opacity, and turn on click-through when you need your mouse. If you share your screen, use a player that can be excluded from capture.',
    related: [
      'always-on-top-youtube-player',
      'hide-window-from-screen-share',
      'picture-in-picture-alternative',
    ],
    sources: [
      {
        label: 'Electron: BrowserWindow setContentProtection',
        url: 'https://www.electronjs.org/docs/latest/api/browser-window#winsetcontentprotectionenable-windows-macos',
      },
    ],
    faqs: [
      {
        q: 'Can I watch YouTube while working without it showing in Teams or Zoom?',
        a: 'Airframe uses Windows display affinity to exclude its window from most screen captures. Teams, Zoom, Meet and OBS commonly respect it. Test with a recording or a solo meeting before relying on it, because capture tools and company policies vary.',
      },
      {
        q: 'Does a floating YouTube window use a lot of CPU?',
        a: 'Video playback uses some CPU and GPU, but Chromium hardware-decodes most YouTube streams. A small window at 720p is light on a modern laptop. 4K, multiple players and heavy browser tabs are the bigger drains.',
      },
      {
        q: 'Can I listen to YouTube without the video showing?',
        a: 'Airframe does not have a separate audio-only mode, but you can fade the window to 0% opacity or hide it with Alt+H. Playback continues, and Alt+Shift+Up brings the video back.',
      },
      {
        q: 'Does Airframe work with YouTube playlists?',
        a: 'Yes. Airframe loads the normal YouTube site, so playlists, subscriptions, search and your sign-in all work as usual.',
      },
      {
        q: 'Is watching YouTube at work allowed?',
        a: 'That depends on your employer and your contract. Airframe is a playback tool, not a way around company policy. Check your workplace rules before using it during work hours or on a managed device.',
      },
    ],
    body: `        <p>Watching YouTube while you work sounds simple until you try it. A second browser tab disappears behind your editor. A snapped window takes half the screen. Picture-in-picture is always on top, but it is small, hard to control and tied to the browser tab that created it.</p>

        <p>The setup that actually works is a small floating window with three controls: pin it above your work, fade it so it does not compete for attention, and let clicks pass through when you need the app behind it. Airframe was built around that workflow.</p>

        <h2 id="why-not-second-monitor">Why a second monitor is not always the answer</h2>

        <p>A second display is still the best experience if you have one. But plenty of people work on a single laptop screen, in a shared office, on a train, or with a dock that only wakes one monitor. A floating window uses the screen you already have and does not require a hardware change.</p>

        <p>It also fits a different attention pattern. A second monitor encourages a full second window. A small floating video is deliberately peripheral: visible when you glance at it, out of the way when you are reading or typing.</p>

        <h2 id="four-setups">Four ways to watch YouTube while working</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Setup</th><th>Screen cost</th><th>Controls</th><th>Best for</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Snapped browser tab</strong></td><td>Half or a quarter of the screen</td><td>Full browser and YouTube controls</td><td>Watching a talk or tutorial you are actively following</td></tr>
              <tr><td><strong>Browser picture-in-picture</strong></td><td>Small floating box</td><td>Play, pause, mute, back to tab</td><td>A quick clip with no install</td></tr>
              <tr><td><strong>PowerToys Always on Top</strong></td><td>Whole browser window</td><td>Whatever the browser exposes</td><td>Pinning a reference window you already use</td></tr>
              <tr><td><strong>Airframe</strong></td><td>Any size you choose</td><td>Full YouTube, 14 shortcuts, opacity, click-through, shield</td><td>A permanent background video or music screen</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="screen-share">The screen-share problem</h2>

        <p>If you share your entire screen in Teams, Zoom or Meet, everything on it is fair game: the video, the recommendations sidebar, the tab you meant to close. Moving the window to a second monitor helps only if you share a single display. Sharing the whole desktop can include every monitor.</p>

        <p>Airframe's screen-share shield asks Windows to exclude the window from capture. It is on by default and toggles with <kbd>Alt</kbd><kbd>S</kbd>. In most standard capture paths the video is simply absent or appears black to viewers while you still see it normally. The <a href="../hide-window-from-screen-share/">screen-share guide</a> covers what the shield can and cannot hide.</p>

        <p>Two practical rules:</p>

        <ul>
          <li><strong>Test before the meeting.</strong> Start a solo meeting or a local recording, share your screen, and confirm what viewers see.</li>
          <li><strong>Pause during active discussion.</strong> Even a hidden video can distract you, and some capture tools behave differently. <kbd>Alt</kbd><kbd>H</kbd> hides it instantly.</li>
        </ul>

        <h2 id="setup">A five-minute setup</h2>

        <ol class="steps">
          <li><strong>Install Airframe.</strong> Use the installer or the portable ZIP from the <a href="../#download">download section</a>. No admin rights are required.</li>
          <li><strong>Open YouTube and pick something long.</strong> A playlist, a livestream or a music mix works better than a queue of short videos you will keep checking.</li>
          <li><strong>Resize and park it.</strong> Drag the top strip to move the window. Put it in a corner that does not cover your editor's minimap, terminal or chat.</li>
          <li><strong>Set the opacity.</strong> <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&darr;</kbd> fades it. Somewhere around 30&ndash;60% is a good starting point for background video; 0% makes it invisible but keeps the audio.</li>
          <li><strong>Turn on click-through.</strong> Bring your editor or browser to the front, then press <kbd>Alt</kbd><kbd>L</kbd>. Clicks and scrolling now reach the app behind the video. Press it again to take the video window back.</li>
        </ol>

        <h2 id="workflow">Make it part of the workday</h2>

        <p>The difference between background video that helps and video that derails you is usually the content and the size, not willpower. A few patterns that work:</p>

        <ul>
          <li><strong>Music and ambient video:</strong> keep the window small and dim. Treat it as audio with a visual hint.</li>
          <li><strong>Talks and tutorials:</strong> keep the window larger while you follow along, then shrink it when you switch to doing the work.</li>
          <li><strong>Livestreams:</strong> park them in a corner and use <kbd>Alt</kbd><kbd>H</kbd> during calls or deep-work blocks.</li>
          <li><strong>Focus sessions:</strong> hide the video entirely and leave the audio running. The shortcut is faster than finding the tab.</li>
        </ul>

        <p>Opacity is the underrated control. At full brightness a video competes with your document for attention. At 40% it becomes part of the desktop, like a wallpaper that happens to move.</p>

        <h2 id="when-not-to">When not to use it</h2>

        <p>A floating video is a bad idea during interviews, exams, client demos, recorded presentations and any meeting where you are the person sharing. It is also a poor fit on battery saver or while rendering video, when the GPU is already busy.</p>

        <p>If you need to share your screen and keep the video running, use the shield and test first. If you need to concentrate, close it. The tool is supposed to reduce friction, not become another tab to manage.</p>

        <h2 id="bottom-line">The bottom line</h2>

        <p>You do not need a second monitor to watch YouTube while you work. You need a window that stays on top, takes up only the space you give it, fades into the background and gets out of the way of your mouse. Airframe does those four things without a browser attached.</p>

        <p><a class="inline-cta" href="../#download">Download Airframe for Windows <span aria-hidden="true">&rarr;</span></a></p>`,
  },
  {
    slug: 'picture-in-picture-alternative',
    title: 'Picture-in-Picture Alternative for Windows 11 | Airframe',
    description:
      'Browser PiP is small and limited. Compare the best picture-in-picture alternatives for Windows 10/11, including floating, opacity and click-through options.',
    h1: 'A better picture-in-picture alternative for Windows',
    shortTitle: 'PiP alternative',
    eyebrow: 'Comparison',
    lede: "Picture-in-picture is a small window with a short leash. If you have outgrown it, these are the Windows options worth comparing, and the trade-offs that matter.",
    card: 'Why browser PiP feels limited, and what to use instead on Windows.',
    priority: '0.8',
    keywords: [
      'picture in picture alternative windows',
      'picture in picture alternative windows 11',
      'better than picture in picture',
      'pip replacement windows',
      'floating video player windows',
    ],
    quick:
      'Browser picture-in-picture is great for a quick clip, but it is small, limited to one video and has no opacity, click-through or screen-share shield. Airframe is a full YouTube window that can shrink to PiP size while keeping those controls.',
    related: [
      'always-on-top-youtube-player',
      'youtube-mini-player-windows-11',
      'best-floating-youtube-player-windows',
    ],
    sources: [
      {
        label: 'Google Chrome Help: picture-in-picture',
        url: 'https://support.google.com/chrome/answer/12378596',
      },
      {
        label: 'Microsoft PowerToys: Always on Top',
        url: 'https://learn.microsoft.com/en-us/windows/powertoys/always-on-top',
      },
      {
        label: 'WindowTop',
        url: 'https://windowtop.info/',
      },
    ],
    faqs: [
      {
        q: 'Is Airframe a replacement for picture-in-picture?',
        a: 'For YouTube on Windows, yes. Airframe is a full YouTube window that can be resized to a small floating box or run large, with opacity, click-through and a screen-share shield. Browser PiP still works and remains useful for non-YouTube sites.',
      },
      {
        q: 'Does Airframe support Netflix, Prime Video or Twitch?',
        a: 'Not yet. YouTube is ready today. Prime Video, Netflix and Twitch appear in the launcher as coming soon.',
      },
      {
        q: 'Is Airframe free?',
        a: 'Yes. Airframe is free and open source under the MIT license. The installer and portable ZIP are on GitHub Releases.',
      },
      {
        q: 'Can I use Airframe and browser PiP at the same time?',
        a: 'Yes. They are independent. You could keep a YouTube video in Airframe and a different site in browser PiP, subject to your GPU and screen space.',
      },
      {
        q: 'Does Airframe play rented YouTube movies?',
        a: 'Rented or DRM-only movies may not play because Electron does not include Google Widevine. Normal YouTube videos and Premium playback work.',
      },
    ],
    body: `        <p>Picture-in-picture solved a real problem: you can keep a video visible while you work in another window. But browser PiP was designed as a lightweight escape hatch, not as a permanent desktop player. Once you use it every day, the limits show up quickly.</p>

        <p>This guide compares the realistic alternatives on Windows 10 and 11, including when browser PiP is still the right choice.</p>

        <h2 id="pip-strengths">What browser picture-in-picture gets right</h2>

        <ul>
          <li><strong>Zero install.</strong> Chrome, Edge, Firefox and most Chromium browsers support it.</li>
          <li><strong>Always on top.</strong> The PiP window stays above normal windows without any configuration.</li>
          <li><strong>Fast.</strong> Two clicks or a keyboard shortcut, and the video is floating.</li>
          <li><strong>Cross-platform.</strong> The same habit works on Windows, macOS, Linux and ChromeOS.</li>
        </ul>

        <p>For a five-minute clip during a call, that is hard to beat.</p>

        <h2 id="pip-limits">Where picture-in-picture falls short</h2>

        <ul>
          <li><strong>It is small and fiddly.</strong> You can resize it, but the controls are minimal and the window is easy to lose.</li>
          <li><strong>It is video-only.</strong> No search, playlists, recommendations, comments or channel pages. To change the video you go back to the tab.</li>
          <li><strong>One video per browser.</strong> A second PiP usually replaces the first.</li>
          <li><strong>No opacity.</strong> The video is either visible at full strength or closed.</li>
          <li><strong>No click-through.</strong> The floating box still catches clicks, so it can block the app underneath.</li>
          <li><strong>No screen-share shield.</strong> Depending on the capture method, the PiP window can appear in a share.</li>
          <li><strong>It dies with the tab.</strong> Close the browser and the video goes with it.</li>
        </ul>

        <p>None of that makes PiP bad. It makes it a snack, not a meal.</p>

        <h2 id="alternatives">The alternatives at a glance</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Tool</th><th>Type</th><th>Always on top</th><th>Opacity</th><th>Click-through</th><th>Screen-share shield</th><th>Price</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Airframe</strong></td>
                <td>Dedicated YouTube player</td>
                <td>Yes</td>
                <td>Yes, 0&ndash;100%</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Free, MIT</td>
              </tr>
              <tr>
                <td><strong>Browser PiP</strong></td>
                <td>Built into the browser</td>
                <td>Yes</td>
                <td>No</td>
                <td>No</td>
                <td>No</td>
                <td>Free</td>
              </tr>
              <tr>
                <td><strong>PowerToys Always on Top</strong></td>
                <td>Window pinning utility</td>
                <td>Yes</td>
                <td>No</td>
                <td>No</td>
                <td>No</td>
                <td>Free, open source</td>
              </tr>
              <tr>
                <td><strong>WindowTop</strong></td>
                <td>Window effects utility</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Varies</td>
                <td>Free tier + Pro</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>Feature sets change, especially in small utilities. Check each project's current documentation before you buy or install. The table is a starting point, not a permanent spec sheet.</p>

        <h2 id="airframe-difference">Why Airframe is a different kind of PiP replacement</h2>

        <p>Airframe does not try to float a single video element. It opens the real YouTube site in a borderless window and then gives that window desktop powers:</p>

        <ul>
          <li><strong>Full YouTube when you want it.</strong> Search, playlists, subscriptions and settings are all there. Resize the window down to 400&times;225 when you want the PiP feel.</li>
          <li><strong>Any opacity.</strong> Fade the video to a hint over your editor. The window remains interactive until you enable click-through.</li>
          <li><strong>True click-through.</strong> Bring your editor forward, press <kbd>Alt</kbd><kbd>L</kbd>, and your pointer works through the video. This is the part PiP cannot do.</li>
          <li><strong>Screen-share shield.</strong> The window is excluded from most Windows capture paths and is on by default.</li>
          <li><strong>Global shortcuts.</strong> Hide, fullscreen, opacity, monitor switching and click-through work while another app has focus.</li>
          <li><strong>No browser attached.</strong> No tabs, address bar or taskbar button. The YouTube session lives in its own local profile.</li>
        </ul>

        <p>It is still a web view, so YouTube's own changes apply. That is a feature: you get the real site, not a cut-down clone.</p>

        <h2 id="when-pip">When browser PiP is still the better choice</h2>

        <ul>
          <li>You need a video for two minutes and do not want to install anything.</li>
          <li>You are on macOS, Linux or ChromeOS, where Airframe does not run.</li>
          <li>You want to float a non-YouTube site that supports PiP.</li>
          <li>You are on a locked-down work machine that blocks new applications.</li>
          <li>You need the lowest possible resource use and the browser is already open.</li>
        </ul>

        <h2 id="switch">How to switch from PiP to Airframe</h2>

        <ol class="steps">
          <li>Download and run the Airframe installer, or unzip the portable build.</li>
          <li>Open YouTube from the launcher and sign in if you want your subscriptions.</li>
          <li>Resize the window to the size you used for PiP. A 16:9 box around 400&times;225 is a good match.</li>
          <li>Set opacity with <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd> or <kbd>&darr;</kbd>.</li>
          <li>Bring your work app to the front and press <kbd>Alt</kbd><kbd>L</kbd> for click-through.</li>
        </ol>

        <p>You can keep browser PiP installed. Nothing conflicts, and it remains useful for the rest of the web.</p>

        <h2 id="bottom-line">The bottom line</h2>

        <p>If you want the smallest possible floating video with no install, browser PiP is still excellent. If you want a YouTube window that can be small or large, fade, click through and stay out of screen shares, Airframe is the more capable alternative on Windows.</p>

        <p><a class="inline-cta" href="../#download">Try Airframe free for Windows <span aria-hidden="true">&rarr;</span></a></p>`,
  },
  {
    slug: 'youtube-mini-player-windows-11',
    title: 'YouTube Mini Player for Windows 11: Built-in vs Floating',
    description:
      "How YouTube's mini player works on Windows 11, why it disappears, and how to get a real floating mini player that stays on top of other windows.",
    h1: 'YouTube mini player on Windows 11',
    shortTitle: 'Mini player',
    eyebrow: 'Windows 11 guide',
    lede: "The mini player inside YouTube is not the same as a floating Windows window. Here is the difference, why the built-in one disappears, and how to get the behavior you actually wanted.",
    card: 'Get a real floating mini player instead of the in-tab version.',
    priority: '0.7',
    keywords: [
      'youtube mini player windows 11',
      'youtube mini player desktop',
      'youtube mini player not working',
      'floating youtube mini player',
      'youtube small player windows',
    ],
    quick:
      "YouTube's mini player lives inside the YouTube website or app. On Windows 11 it is not a system-wide always-on-top window. For a real floating mini player, use Airframe, resize it to a 16:9 box, and pin it above your work.",
    related: [
      'picture-in-picture-alternative',
      'always-on-top-youtube-player',
      'watch-youtube-while-working',
    ],
    faqs: [
      {
        q: 'Where is the mini player on YouTube desktop?',
        a: "On youtube.com, start a video and browse to another YouTube page. The small player appears in the corner of the site. It is part of the page, not a Windows overlay, so it stays inside the browser window.",
      },
      {
        q: 'Why does the YouTube mini player disappear on Windows 11?',
        a: 'Because it belongs to the browser tab. Closing the tab, navigating away from YouTube, or letting the browser discard the tab ends it. It also sits behind other windows unless the browser itself is on top.',
      },
      {
        q: 'Can I resize the YouTube mini player?',
        a: "The in-page mini player has a fixed small size. Browser picture-in-picture can be resized within limits. An Airframe window can be resized freely, including down to a 320x180 or 400x225 box.",
      },
      {
        q: 'Does Airframe keep the mini player on top of other apps?',
        a: 'Yes. Airframe is always on top by default, so the video stays above your editor, browser or game in borderless windowed mode.',
      },
      {
        q: 'Is Airframe free on Windows 11?',
        a: 'Yes. It is free and open source under the MIT license. Windows 11 and Windows 10 are both supported.',
      },
    ],
    body: `        <p>Search for "YouTube mini player Windows 11" and you will find two different things: YouTube's own mini player inside the website, and the small floating window people actually want on their desktop. They are not the same feature, and the gap explains most of the confusion.</p>

        <h2 id="what-it-is">What YouTube's mini player actually is</h2>

        <p>On youtube.com, start a video and then browse to another YouTube page. YouTube shrinks the playing video into a small player in the corner so the audio and video continue while you look at something else on the site. On mobile, the YouTube app has a similar mini player that can keep playing while you use other apps, depending on your subscription and settings.</p>

        <p>On Windows, the web mini player is still part of the browser tab. It is not a Windows-level window. It has no taskbar button, no always-on-top flag and no presence outside the browser. If you switch to your editor, the mini player goes behind it with the rest of the browser.</p>

        <h2 id="why-broken">Why the built-in mini player feels broken on Windows</h2>

        <ul>
          <li><strong>It is trapped in the tab.</strong> The browser must stay open, and the tab must stay alive.</li>
          <li><strong>It is not always on top.</strong> It sits in normal window order, so your work covers it.</li>
          <li><strong>It cannot be moved outside the browser.</strong> You can move it around the page, not around the desktop.</li>
          <li><strong>It is not a system media window.</strong> It does not appear in the taskbar or respond to global shortcuts.</li>
          <li><strong>Tab discarding can end it.</strong> Browsers unload background tabs to save memory, especially on laptops.</li>
        </ul>

        <p>YouTube Premium does not change this. Premium removes ads and enables background playback in the mobile app; it does not add a Windows desktop mini player.</p>

        <h2 id="three-ways">Three ways to get a real floating mini player</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Option</th><th>Size</th><th>Always on top</th><th>Controls</th><th>Best for</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Browser picture-in-picture</strong></td>
                <td>Small, resizable within limits</td>
                <td>Yes</td>
                <td>Play, pause, mute, back to tab</td>
                <td>One quick video with no install</td>
              </tr>
              <tr>
                <td><strong>PowerToys Always on Top</strong></td>
                <td>Whatever the browser window is</td>
                <td>Yes</td>
                <td>Full browser controls</td>
                <td>Pinning a browser you already have open</td>
              </tr>
              <tr>
                <td><strong>Airframe</strong></td>
                <td>Any size, down to a small box</td>
                <td>Yes</td>
                <td>Full YouTube, 14 shortcuts, opacity, click-through</td>
                <td>A permanent floating mini player</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="make-mini">Make Airframe behave like a mini player</h2>

        <ol class="steps">
          <li><strong>Install and open YouTube.</strong> Use the installer or portable ZIP from the <a href="../#download">download section</a>.</li>
          <li><strong>Pick a video or playlist.</strong> A playlist keeps the mini player useful after the first video ends.</li>
          <li><strong>Resize to 16:9.</strong> Drag an edge until the window is roughly 400&times;225 or 480&times;270. The top strip and edges are draggable.</li>
          <li><strong>Park it in a corner.</strong> Bottom-right is the classic spot; top-right works well if your editor has a minimap or terminal on the right.</li>
          <li><strong>Set opacity.</strong> <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&darr;</kbd> fades it. 70&ndash;90% keeps the video readable; lower values make it more peripheral.</li>
          <li><strong>Turn on click-through.</strong> Bring your work app to the front, then press <kbd>Alt</kbd><kbd>L</kbd>. Your pointer now works through the mini player.</li>
        </ol>

        <h2 id="sizing">Sizing and placement tips</h2>

        <p>Sixteen-by-nine sizes that scale cleanly:</p>

        <ul>
          <li><strong>320&times;180:</strong> a true mini player; best for music and ambient video.</li>
          <li><strong>400&times;225:</strong> readable for talking-head videos and tutorials.</li>
          <li><strong>480&times;270:</strong> a good compromise for a laptop screen.</li>
          <li><strong>640&times;360:</strong> large enough to follow a demo without taking half the display.</li>
        </ul>

        <p>Keep the window away from the corner where your OS shows notifications, and away from any app controls you use constantly. If it covers something, click-through is faster than moving it.</p>

        <h2 id="zero-opacity">What happens at 0% opacity</h2>

        <p>At 0% the window is invisible and click-through, so it cannot block your work. Audio keeps playing. <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd> brings it back. This is the closest Airframe gets to an audio-only mode, and it is useful for music, podcasts and long livestreams you only want to hear.</p>

        <h2 id="bottom-line">The bottom line</h2>

        <p>YouTube's mini player is a convenience inside the site, not a Windows feature. If you want a small video that stays above your work, responds to global shortcuts, and can fade or click through, use a dedicated floating window. Airframe is free, and a 400&times;225 window is a near-perfect PiP replacement.</p>

        <p><a class="inline-cta" href="../#download">Download Airframe for Windows 11 <span aria-hidden="true">&rarr;</span></a></p>`,
  },
];
