export const pagesB = [
  {
    slug: 'hide-window-from-screen-share',
    title: 'Hide a Window From Screen Share on Windows | Airframe',
    description:
      "Keep YouTube or any app out of Teams, Zoom, Meet and OBS shares on Windows 10/11. How display affinity works, what it can't hide, and how to set it up.",
    h1: 'How to hide a window from screen share on Windows',
    shortTitle: 'Screen-share privacy',
    eyebrow: 'Privacy guide',
    lede: "Windows can exclude a window from capture without hiding it from you. Here is how the shield works, which apps respect it, and where the limits are.",
    card: 'Keep YouTube out of Teams, Zoom, Meet and OBS screen shares.',
    priority: '0.9',
    keywords: [
      'hide window from screen share',
      'hide window from screen share windows',
      'hide youtube from screen share',
      'hide app from teams screen share',
      'screen share privacy windows',
      'wda_excludefromcapture',
    ],
    quick:
      "On Windows 10 (2004 or newer) and Windows 11, an app can ask Windows to exclude its window from screen capture. Airframe does this by default. Press Alt+S to toggle the shield. It works with most standard capture tools, but not with a camera pointed at your screen or external capture hardware.",
    related: [
      'watch-youtube-while-working',
      'always-on-top-youtube-player',
      'watch-youtube-while-gaming',
    ],
    sources: [
      {
        label: 'Microsoft: SetWindowDisplayAffinity',
        url: 'https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowdisplayaffinity',
      },
      {
        label: 'Electron: BrowserWindow setContentProtection',
        url: 'https://www.electronjs.org/docs/latest/api/browser-window#winsetcontentprotectionenable-windows-macos',
      },
    ],
    faqs: [
      {
        q: 'Does Airframe hide YouTube from screen share?',
        a: 'Yes, in most standard capture paths. The shield uses Windows display affinity and is on by default. Teams, Zoom, Meet, OBS and most screenshot tools respect it. Test with your specific tool before relying on it in a meeting.',
      },
      {
        q: 'Does the shield hide the window from screenshots?',
        a: 'Most screenshots taken through the normal Windows desktop compositor exclude the window or show it as black. Kernel-level capture tools, external capture hardware and a phone camera are not covered.',
      },
      {
        q: 'Is the screen-share shield on by default?',
        a: 'Yes. Airframe starts with the shield enabled. Alt+S toggles it, and a toast confirms the new state.',
      },
      {
        q: 'Can viewers tell that a window is hidden?',
        a: 'They may see a black rectangle, an empty space, or nothing at all, depending on the capture tool. The goal is privacy, not invisibility magic. If a clean share matters, share a single app window instead of the entire desktop.',
      },
      {
        q: 'Does it work on Windows 10?',
        a: 'Yes. The strongest exclusion uses WDA_EXCLUDEFROMCAPTURE, which requires Windows 10 version 2004 or newer. Windows 11 supports it. Older Windows 10 builds may fall back to a different protection mode.',
      },
      {
        q: 'Does it hide my whole desktop?',
        a: 'No. It only affects the Airframe window. Other apps, notifications and browser tabs remain visible in a full-screen share.',
      },
    ],
    body: `        <p>Sharing your screen should not mean sharing everything on it. A YouTube video, a personal message, a half-finished document or a tab you forgot about can end up in a client call or a recorded demo. Windows has a mechanism for this, and Airframe exposes it as a one-key shield.</p>

        <h2 id="how-it-works">How Windows screen sharing sees your screen</h2>

        <p>Most Windows capture tools do not read the physical display directly. They ask the Desktop Window Manager (DWM) for a composed image, or they capture a specific window through the Windows Graphics Capture API. Windows lets an app mark its own window with a <em>display affinity</em> value that tells DWM how the window should appear to those capture paths.</p>

        <p>The relevant API is <a href="https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowdisplayaffinity" target="_blank" rel="noopener"><code>SetWindowDisplayAffinity</code></a>. The strongest option, <code>WDA_EXCLUDEFROMCAPTURE</code>, makes the window invisible to capture while it remains visible on the physical display. Electron wraps this as <a href="https://www.electronjs.org/docs/latest/api/browser-window#winsetcontentprotectionenable-windows-macos" target="_blank" rel="noopener"><code>win.setContentProtection(true)</code></a>, which is what Airframe calls.</p>

        <p>In practice, a captured desktop often shows a black rectangle where the protected window sits. Some tools crop it out or show the desktop behind it. The exact result depends on the capture API and the app doing the capturing.</p>

        <h2 id="airframe-shield">What Airframe's screen-share shield does</h2>

        <ul>
          <li><strong>On by default.</strong> You do not have to enable it before a call.</li>
          <li><strong>Toggles with <kbd>Alt</kbd><kbd>S</kbd>.</strong> A toast confirms whether the shield is on or off.</li>
          <li><strong>Protects the Airframe window only.</strong> It does not hide your other apps, notifications or desktop.</li>
          <li><strong>Keeps the video visible to you.</strong> The window is excluded from capture, not from your own display.</li>
          <li><strong>Works alongside click-through and opacity.</strong> You can fade the video and still keep it out of a share.</li>
        </ul>

        <h2 id="hide-youtube">Hide YouTube during a Teams, Zoom or Meet call</h2>

        <ol class="steps">
          <li><strong>Open the video in Airframe.</strong> Start playback before you join the call so you can confirm the window looks right.</li>
          <li><strong>Check the shield.</strong> Press <kbd>Alt</kbd><kbd>S</kbd> if you are unsure. The toast should say the shield is on.</li>
          <li><strong>Join and share.</strong> Choose the screen or window you normally share.</li>
          <li><strong>Verify.</strong> Ask a colleague, start a solo meeting, or make a local recording. Confirm the video is absent or black in the capture.</li>
          <li><strong>If it still appears, share a single window.</strong> Sharing one app window is more predictable than sharing the entire desktop. The video is less likely to be included at all.</li>
        </ol>

        <p>If the meeting is recorded, the recording follows the same capture path as the live share. Test the recording if the distinction matters.</p>

        <h2 id="obs">Does it work with OBS?</h2>

        <p>OBS Display Capture normally respects Windows display affinity, so the Airframe window is excluded. OBS Window Capture of the Airframe window may show black. OBS Game Capture only captures the game, so the video is not included in the first place.</p>

        <p>If you want viewers to see the video, turn the shield off with <kbd>Alt</kbd><kbd>S</kbd> and capture the window or display normally. If you want it hidden, leave the shield on and use Display Capture for the rest of the desktop.</p>

        <h2 id="limits">What the shield cannot hide</h2>

        <p>Display affinity is a Windows compositor feature. Anything that bypasses the compositor is outside its scope:</p>

        <ul>
          <li><strong>A camera pointed at your screen.</strong> No software can hide from that.</li>
          <li><strong>External capture hardware.</strong> An HDMI capture card or a second PC sees the physical output.</li>
          <li><strong>Some remote-support and forensic tools.</strong> Kernel-level capture or a tool running with higher privileges may not honor the flag.</li>
          <li><strong>The UAC secure desktop.</strong> Windows draws it separately, above normal windows.</li>
          <li><strong>Older Windows 10 builds.</strong> The strongest exclusion needs Windows 10 version 2004 or newer.</li>
          <li><strong>Someone looking over your shoulder.</strong> Privacy from capture is not privacy from the room.</li>
        </ul>

        <p>It also does not hide the fact that you are running an app. A viewer may see a black rectangle and ask about it. If you need a completely clean desktop, close or move the sensitive content before sharing.</p>

        <h2 id="other-options">Other ways to keep a window out of a share</h2>

        <ul>
          <li><strong>Share one app window.</strong> The most reliable option, and it avoids notifications and other tabs.</li>
          <li><strong>Move the window to another monitor.</strong> This works only if you share a single display and the tool respects that choice.</li>
          <li><strong>Use a second desktop.</strong> Virtual desktops help with organization, but sharing the desktop you are on can still include it.</li>
          <li><strong>Close what you do not need.</strong> The oldest privacy control is still the best one.</li>
        </ul>

        <h2 id="privacy">Use it for privacy, not for deception</h2>

        <p>The shield is useful for personal content during work calls: a video in the background, a private message, a document that is not ready to share. It is not a way to misrepresent what you are doing, and it does not override your employer's screen-sharing or recording policies. Use it the way you would use a privacy screen or a closed door.</p>

        <h2 id="bottom-line">The bottom line</h2>

        <p>Windows can exclude a window from screen capture, and Airframe turns that into a default-on shield with a single shortcut. It covers the common tools &mdash; Teams, Zoom, Meet, OBS and most screenshots &mdash; but it is not undetectable and it cannot beat a camera. Test your exact setup once, then stop worrying about the video in the corner.</p>

        <p><a class="inline-cta" href="../#download">Download Airframe with the shield on <span aria-hidden="true">&rarr;</span></a></p>`,
  },
  {
    slug: 'make-window-click-through-windows',
    title: 'How to Make a Window Click-Through on Windows 10/11',
    description:
      "Make a floating video or overlay click-through so your clicks reach the app behind it. Airframe's Alt+L, how it works, and what to check when it doesn't.",
    h1: 'How to make a window click-through on Windows',
    shortTitle: 'Click-through',
    eyebrow: 'Windows guide',
    lede: "A floating video should not block the app underneath it. This is how click-through works on Windows, how to use it in Airframe, and what to do when a window refuses to cooperate.",
    card: 'Make clicks reach the app behind the video, not the video itself.',
    priority: '0.7',
    keywords: [
      'make window click through windows',
      'click through window windows 11',
      'click through overlay windows',
      'transparent click through window',
      'ws_ex_transparent',
      'setignoremouseevents',
    ],
    quick:
      'Bring the app you want to use to the front, then press Alt+L in Airframe. The video becomes click-through: clicks, scrolling, dragging and hover go to the window behind it. Press Alt+L again to take the video window back.',
    related: [
      'always-on-top-youtube-player',
      'picture-in-picture-alternative',
      'watch-youtube-while-gaming',
    ],
    sources: [
      {
        label: 'Microsoft: Extended window styles (WS_EX_TRANSPARENT)',
        url: 'https://learn.microsoft.com/en-us/windows/win32/winmsg/extended-window-styles',
      },
      {
        label: 'Electron: BrowserWindow setIgnoreMouseEvents',
        url: 'https://www.electronjs.org/docs/latest/api/browser-window#winsetignoremouseeventsignore-options',
      },
    ],
    faqs: [
      {
        q: 'What does Alt+L do in Airframe?',
        a: 'It toggles click-through. When it is on, pointer input goes to the top window behind Airframe. When it is off, the video window receives clicks again. A toast confirms the change.',
      },
      {
        q: 'Can I still control the video while click-through is on?',
        a: 'Not with the mouse. Use the global shortcuts for play, opacity, hide and show, or press Alt+L to turn click-through off and use the YouTube controls.',
      },
      {
        q: 'Is click-through the same as transparency?',
        a: 'No. Opacity changes how visible the window is. Click-through changes where mouse input goes. Airframe lets you use either one independently, and at 0% opacity the window is both invisible and click-through.',
      },
      {
        q: 'Does click-through work with games?',
        a: 'It works best with games in borderless windowed mode. Some games use raw input or exclusive fullscreen and may not receive the forwarded pointer input. Test with the specific game.',
      },
      {
        q: 'Why does the click-through target the wrong window?',
        a: 'Airframe targets the top window behind it. Bring the app you want to use to the front before pressing Alt+L. If an elevated app or UAC prompt is involved, Windows may block input from reaching it.',
      },
      {
        q: 'Is there a built-in Windows setting for click-through?',
        a: 'No. Windows exposes it to developers through extended window styles. End users normally need an app such as Airframe, a window utility, or a script.',
      },
    ],
    body: `        <p>A floating video is only useful if it does not become a wall between you and your work. Click-through fixes that: the video stays visible, but your mouse acts on the window underneath it. Windows can do this, but there is no checkbox for it. It is a window-style trick, and the implementation details matter.</p>

        <h2 id="what-it-means">What click-through actually means</h2>

        <p>Normally, the topmost window under your pointer receives the click. Click-through tells Windows to skip that window for hit-testing, so the click goes to the next eligible window below. Scrolling, dragging and hover can follow the same path.</p>

        <p>It is separate from transparency. A window can be fully opaque and click-through, or fully transparent and still capture clicks. Airframe exposes both controls independently because they solve different problems.</p>

        <h2 id="airframe">How Airframe does it</h2>

        <p>Airframe's display mode is toggled with <kbd>Alt</kbd><kbd>L</kbd>. The flow is deliberately simple:</p>

        <ol class="steps">
          <li><strong>Bring the app you want to use to the front.</strong> Airframe targets the top window behind it, so the order matters.</li>
          <li><strong>Press <kbd>Alt</kbd><kbd>L</kbd>.</strong> A toast names the target window.</li>
          <li><strong>Work through the video.</strong> Clicks, wheel, drag and hover reach the target. The video keeps playing.</li>
          <li><strong>Press <kbd>Alt</kbd><kbd>L</kbd> again.</strong> The video window takes mouse input back.</li>
        </ol>

        <p>Under the hood, Airframe uses Electron's <code>setIgnoreMouseEvents</code> and re-asserts the state after display changes or taskbar interaction. It also disables Chromium's DirectComposition path for its top-level window. That detail matters for WinUI 3 and WebView2 apps: a Chromium window created with <code>WS_EX_NOREDIRECTIONBITMAP</code> can refuse to route pointer input through, even when the transparent style is set. The classic redirection surface makes click-through work with those apps.</p>

        <h2 id="windows-api">How Windows click-through works for developers</h2>

        <p>At the Win32 level, the usual combination is two extended window styles:</p>

        <ul>
          <li><code>WS_EX_TRANSPARENT</code> (<code>0x00000020</code>) makes the window transparent to hit-testing.</li>
          <li><code>WS_EX_LAYERED</code> (<code>0x00080000</code>) is often required for the effect to behave consistently, especially with per-pixel alpha.</li>
        </ul>

        <p>An AutoHotkey toggle for the active window looks like this:</p>

        <pre><code>; AutoHotkey v1 - toggle WS_EX_TRANSPARENT on the active window
F8::
  WinGet, activeId, ID, A
  WinSet, ExStyle, ^0x20, ahk_id %activeId%
return</code></pre>

        <p>The <code>^</code> XORs the style, so the same hotkey turns it back off. Keep that undo path in mind: once a window is click-through, you may not be able to click its own close button. A global hotkey still works.</p>

        <p>In Electron, the equivalent is:</p>

        <pre><code>win.setIgnoreMouseEvents(true, { forward: true });</code></pre>

        <p>The <code>forward</code> option forwards mouse move messages so hover effects can still work. It does not forward clicks; those go to the window below.</p>

        <h2 id="setup">Set up click-through in Airframe</h2>

        <ol class="steps">
          <li>Open YouTube in Airframe and start the video.</li>
          <li>Open the app you want to work in and click its title bar so it is the front window.</li>
          <li>Press <kbd>Alt</kbd><kbd>L</kbd>. The toast should name that app.</li>
          <li>Click, scroll and drag through the video. If the target is correct, the app responds.</li>
          <li>Press <kbd>Alt</kbd><kbd>L</kbd> to reclaim the video, or use the global shortcuts to control playback.</li>
        </ol>

        <p>At 0% opacity, the window is invisible and click-through automatically. <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd> brings it back. That combination is useful for audio-only playback or a video you only want to hear.</p>

        <h2 id="troubleshooting">When click-through does not work</h2>

        <ul>
          <li><strong>The target app is elevated.</strong> A normal-privilege app generally cannot send input to an administrator window. Run both at the same level if you control them.</li>
          <li><strong>A UAC prompt is open.</strong> The secure desktop is above everything and is not a normal click-through target.</li>
          <li><strong>The game is exclusive fullscreen.</strong> Use borderless windowed mode.</li>
          <li><strong>Another topmost window is above the target.</strong> Close or unpin it, then bring the target forward again.</li>
          <li><strong>The target is minimized.</strong> Restore it before toggling.</li>
          <li><strong>The app uses raw input.</strong> Some games and drawing apps read the device directly and ignore synthesized or forwarded pointer messages.</li>
          <li><strong>A shortcut conflict.</strong> Another app may be capturing <kbd>Alt</kbd><kbd>L</kbd>. Close it or use <kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>L</kbd>, which Airframe also accepts.</li>
        </ul>

        <h2 id="uses">What click-through is good for</h2>

        <ul>
          <li><strong>Tutorials over an editor.</strong> Follow along in Photoshop, Premiere or VS Code without moving the video.</li>
          <li><strong>Reference video over a document.</strong> Keep a talk or demo visible while you take notes.</li>
          <li><strong>Music video as a desktop element.</strong> Fade it, click through it, and forget it is a window.</li>
          <li><strong>Borderless games.</strong> Keep a guide or stream visible while the game receives your input.</li>
          <li><strong>Presenting.</strong> Keep a clip visible while you drive the app behind it.</li>
        </ul>

        <h2 id="bottom-line">The bottom line</h2>

        <p>Click-through is the feature that turns a floating video from an obstacle into part of the desktop. Airframe gives it a global shortcut and handles the Chromium/WinUI edge cases that make naive implementations fail. Bring the target forward, press <kbd>Alt</kbd><kbd>L</kbd>, and work through the video.</p>

        <p><a class="inline-cta" href="../#download">Download Airframe for Windows <span aria-hidden="true">&rarr;</span></a></p>`,
  },
  {
    slug: 'watch-youtube-while-gaming',
    title: 'Watch YouTube While Gaming on Windows: Floating Overlay',
    description:
      'Watch YouTube over a game on Windows 10/11 with a floating always-on-top window. Borderless vs fullscreen, performance tips, and capture privacy.',
    h1: 'How to watch YouTube while gaming on Windows',
    shortTitle: 'Watch while gaming',
    eyebrow: 'Gaming guide',
    lede: "One monitor is enough if the game runs borderless and the video knows how to stay out of the way. Here is the setup, the performance cost, and how to keep it off your stream.",
    card: 'Borderless setup, performance tips and capture privacy for a single screen.',
    priority: '0.7',
    keywords: [
      'watch youtube while gaming',
      'youtube overlay for gaming',
      'floating youtube over game',
      'watch youtube while gaming windows',
      'youtube while playing games',
    ],
    quick:
      'Set the game to borderless windowed mode, open YouTube in Airframe, and park the video in a corner. Exclusive fullscreen can cover any always-on-top window. A second monitor is still the best option for performance.',
    related: [
      'always-on-top-youtube-player',
      'make-window-click-through-windows',
      'hide-window-from-screen-share',
    ],
    faqs: [
      {
        q: 'Does watching YouTube lower FPS?',
        a: 'It can. Video decode and Chromium composition use some CPU and GPU. A small 720p or 1080p window is usually light on a modern system; 4K, high frame rates and multiple players cost more. Measure with your game overlay and lower the video resolution if you notice stutter.',
      },
      {
        q: 'Does Airframe work over fullscreen games?',
        a: 'It works best in borderless windowed mode. Exclusive fullscreen can cover every always-on-top window because the game takes direct control of the display. Switch the game to borderless or windowed mode if the video disappears.',
      },
      {
        q: 'Can I use Airframe on a single monitor?',
        a: 'Yes. That is the main use case. Resize the video to a corner, set opacity, and use click-through so your mouse controls the game.',
      },
      {
        q: 'Will an overlay get me banned by anti-cheat?',
        a: 'Airframe is a separate window. It does not inject into the game or hook its process. Always-on-top overlays are generally allowed, but anti-cheat policies vary. Check the game and publisher rules if you are unsure.',
      },
      {
        q: 'Can I hide the video from my stream?',
        a: 'Yes, in most cases. Leave the screen-share shield on and use OBS Display Capture. The window is excluded from the capture. Turn the shield off if you want viewers to see it.',
      },
      {
        q: 'Does Airframe work with HDR or variable refresh rate?',
        a: 'HDR and VRR behavior depends on the game, the display mode and the GPU driver. Borderless windowed mode can change how both are handled. Test the game with the overlay before committing to a ranked match.',
      },
    ],
    body: `        <p>Watching a guide, a stream or a video essay while you game is a normal second-screen habit. On a single monitor it takes a little more setup, because the game and the video are competing for the same display. The key is borderless windowed mode and a video window that knows how to stay out of the way.</p>

        <h2 id="fullscreen">Borderless windowed vs exclusive fullscreen</h2>

        <p>Exclusive fullscreen gives the game direct control of the display. That is good for latency and some HDR setups, but it also means the game can cover every normal window, including an always-on-top video. Borderless windowed mode keeps the game inside the Windows desktop compositor, where overlays can appear.</p>

        <p>Most modern games call this "Borderless," "Fullscreen Windowed" or "Windowed Fullscreen." The exact label varies, but the behavior is the same: the game fills the screen without taking exclusive control. If the video disappears when you alt-tab back into the game, this setting is the first thing to change.</p>

        <h2 id="three-ways">Three ways to watch YouTube while gaming</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Setup</th><th>Performance</th><th>Screen space</th><th>Best for</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Second monitor</strong></td><td>Best</td><td>Needs a second display</td><td>Long sessions, high-end setups</td></tr>
              <tr><td><strong>Airframe over a borderless game</strong></td><td>Good on modern hardware</td><td>One screen, any size</td><td>Single-monitor setups and laptop gaming</td></tr>
              <tr><td><strong>Browser picture-in-picture</strong></td><td>Good</td><td>Small floating box</td><td>A quick clip with no install</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="setup">Set up Airframe over a game</h2>

        <ol class="steps">
          <li><strong>Switch the game to borderless windowed mode.</strong> Apply the setting and restart the game if it asks.</li>
          <li><strong>Launch Airframe and open YouTube.</strong> Start the video or playlist before you go back to the game.</li>
          <li><strong>Resize and park the window.</strong> A corner works best. Avoid the area where the game shows its minimap, kill feed or ability bar.</li>
          <li><strong>Set opacity.</strong> <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&darr;</kbd> fades the video. 60&ndash;80% is a reasonable starting point for a game.</li>
          <li><strong>Bring the game to the front and press <kbd>Alt</kbd><kbd>L</kbd>.</strong> Your mouse now controls the game through the video.</li>
          <li><strong>Use <kbd>Alt</kbd><kbd>H</kbd> to hide the video instantly.</strong> Useful for a cutscene, a boss fight or a ranked match.</li>
        </ol>

        <p>Airframe has no taskbar button, so you will not find it in Alt+Tab. Use its global shortcuts &mdash; <kbd>Alt</kbd><kbd>H</kbd> to show it again, <kbd>Alt</kbd><kbd>B</kbd> to return to the launcher, and <kbd>Alt</kbd><kbd>Q</kbd> to quit.</p>

        <h2 id="performance">Performance tips</h2>

        <ul>
          <li><strong>Match the video to the job.</strong> 720p is enough for a small corner window. 1080p is fine on most discrete GPUs; 4K is usually wasted on a 400-pixel-wide box.</li>
          <li><strong>Pause when you are not watching.</strong> A paused video still holds a window, but it stops decoding.</li>
          <li><strong>Close other browser tabs and players.</strong> Two YouTube windows are two decoders.</li>
          <li><strong>Use hardware acceleration.</strong> Chromium hardware-decodes common YouTube codecs by default. If you have disabled it globally, expect more CPU use.</li>
          <li><strong>Watch the frame-time graph, not just average FPS.</strong> A video can cost a few frames without changing the average much, but cause uneven pacing.</li>
          <li><strong>Try exclusive fullscreen for competitive games.</strong> If you do not need the video during a match, hide Airframe and switch modes.</li>
        </ul>

        <h2 id="streaming">Keep the video out of your stream</h2>

        <p>If you stream or record, the last thing you want is a random YouTube recommendation in the corner of the VOD. Airframe's shield is on by default. In OBS, use Display Capture for the desktop; the protected window is excluded. Game Capture only captures the game, so the overlay is not included either.</p>

        <p>If you want viewers to see the video, turn the shield off with <kbd>Alt</kbd><kbd>S</kbd> and capture the window or display normally. If you are streaming copyrighted music or video, check the platform's rules and the rights holder's policy. That is a separate problem from the capture setup.</p>

        <h2 id="anticheat">Anti-cheat and fair play</h2>

        <p>Airframe is an Electron window that sits above the game. It does not inject code into the game process, hook DirectX, or modify game memory. That makes it different from a traditional game overlay, but it does not guarantee that every anti-cheat or tournament ruleset allows it.</p>

        <p>For competitive play, check the game's rules. For casual play, a video in the corner is usually fine. Do not use any overlay to gain information the game does not give you; that is a cheating problem, not a video-player problem.</p>

        <h2 id="bottom-line">The bottom line</h2>

        <p>On a single monitor, borderless windowed mode plus a small floating YouTube window is the practical setup. Airframe keeps the video on top, lets you fade it, lets your mouse pass through to the game, and keeps it out of most captures. Start at 720p, park it in a corner, and hide it when the game needs your full attention.</p>

        <p><a class="inline-cta" href="../#download">Download Airframe for Windows <span aria-hidden="true">&rarr;</span></a></p>`,
  },
  {
    slug: 'best-floating-youtube-player-windows',
    title: 'Best Floating YouTube Player for Windows in 2026',
    description:
      'Compare Airframe, browser picture-in-picture, PowerToys, WindowTop, FloatingYT and Glaze for watching YouTube in a floating window on Windows 10/11.',
    h1: 'Best floating YouTube player for Windows',
    shortTitle: 'Best floating player',
    eyebrow: 'Buyer guide',
    lede: "Dedicated player, browser PiP, or a window utility? The right answer depends on whether you want a quick clip, a pinned browser, or a YouTube window that lives on your desktop.",
    card: 'Airframe vs browser PiP, PowerToys, WindowTop and other floating players.',
    priority: '0.8',
    keywords: [
      'best floating youtube player windows',
      'best always on top video player windows',
      'floating youtube player windows 11',
      'youtube overlay app windows',
      'airframe vs picture in picture',
    ],
    quick:
      'For a dedicated, privacy-focused YouTube window on Windows, Airframe is the best fit: free, open source, always on top, with opacity, click-through and a screen-share shield. Browser PiP wins when you want zero install; PowerToys wins when you need to pin any app.',
    related: [
      'always-on-top-youtube-player',
      'picture-in-picture-alternative',
      'hide-window-from-screen-share',
    ],
    sources: [
      {
        label: 'Microsoft PowerToys: Always on Top',
        url: 'https://learn.microsoft.com/en-us/windows/powertoys/always-on-top',
      },
      {
        label: 'WindowTop',
        url: 'https://windowtop.info/',
      },
      {
        label: 'FloatingYT',
        url: 'https://norzaxxx.itch.io/floating-yt',
      },
      {
        label: 'Glaze',
        url: 'https://protagonistlabs.app/glaze',
      },
    ],
    faqs: [
      {
        q: 'What is the best floating YouTube player for Windows?',
        a: 'For a dedicated YouTube window with privacy controls, Airframe is the best fit. It is free, open source, always on top, and adds opacity, click-through and a screen-share shield. Browser picture-in-picture is better if you do not want to install anything.',
      },
      {
        q: 'Is Airframe really free?',
        a: 'Yes. Airframe is free and open source under the MIT license. There is no account, subscription or telemetry.',
      },
      {
        q: 'Does Airframe work with Netflix, Prime Video or Twitch?',
        a: 'Not yet. YouTube is ready today. Prime Video, Netflix and Twitch are shown as coming soon in the launcher.',
      },
      {
        q: 'Can I use these players on macOS or Linux?',
        a: 'Browser picture-in-picture works across platforms. Airframe is Windows 10/11 only. PowerToys and WindowTop are Windows tools. Check each project for current platform support.',
      },
      {
        q: 'Are floating player apps safe to install?',
        a: 'Download from the official project page or GitHub release. Airframe is open source, so you can inspect the code. Its installer is not code-signed yet, so SmartScreen may warn. Avoid repacks and third-party download sites.',
      },
    ],
    body: `        <p>There is no shortage of ways to float a YouTube video on Windows. The right choice depends on whether you want a quick clip, a pinned browser, a general-purpose window utility, or a dedicated player that behaves like part of your desktop.</p>

        <p><strong>Disclosure:</strong> we build Airframe, so treat this as a biased comparison with the bias stated up front. The table uses documented features and obvious trade-offs; check each project's current page before you install or buy.</p>

        <h2 id="criteria">How we compared them</h2>

        <ul>
          <li><strong>Always on top:</strong> does the video stay above normal windows?</li>
          <li><strong>Full YouTube controls:</strong> can you search, browse playlists and stay signed in?</li>
          <li><strong>Opacity:</strong> can you fade the video without closing it?</li>
          <li><strong>Click-through:</strong> can your mouse work in the app behind the video?</li>
          <li><strong>Screen-share shield:</strong> can the window be excluded from capture?</li>
          <li><strong>Global shortcuts:</strong> can you control it while another app has focus?</li>
          <li><strong>Price and license:</strong> free, open source, paid, subscription?</li>
          <li><strong>Platform:</strong> Windows only or cross-platform?</li>
        </ul>

        <h2 id="short-list">The short list</h2>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Tool</th><th>Best for</th><th>Always on top</th><th>Opacity</th><th>Click-through</th><th>Shield</th><th>Price</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Airframe</strong></td>
                <td>Dedicated YouTube + privacy</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Free, MIT</td>
              </tr>
              <tr>
                <td><strong>Browser PiP</strong></td>
                <td>Zero-install quick clip</td>
                <td>Yes</td>
                <td>No</td>
                <td>No</td>
                <td>No</td>
                <td>Free</td>
              </tr>
              <tr>
                <td><strong>PowerToys Always on Top</strong></td>
                <td>Pinning any window</td>
                <td>Yes</td>
                <td>No</td>
                <td>No</td>
                <td>No</td>
                <td>Free, open source</td>
              </tr>
              <tr>
                <td><strong>WindowTop</strong></td>
                <td>Advanced window effects</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Yes</td>
                <td>Varies</td>
                <td>Free tier + Pro</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="airframe">Airframe: best for work and privacy</h2>

        <p>Airframe is the only tool in this list built specifically around YouTube as a desktop window. It opens the real YouTube site in a borderless window, removes the title bar and taskbar button, and adds the controls that make a video livable on a work desktop:</p>

        <ul>
          <li>0&ndash;100% opacity, with <kbd>Alt</kbd><kbd>Shift</kbd><kbd>&uarr;</kbd> and <kbd>&darr;</kbd>.</li>
          <li>True click-through with <kbd>Alt</kbd><kbd>L</kbd>, including WinUI 3 and WebView2 targets.</li>
          <li>Screen-share shield on by default, toggled with <kbd>Alt</kbd><kbd>S</kbd>.</li>
          <li>14 global shortcuts, touchpad back/forward and mouse side buttons.</li>
          <li>No account, no server, no telemetry. The YouTube session stays in <code>%APPDATA%\\Airframe</code>.</li>
          <li>Free and MIT licensed.</li>
        </ul>

        <p><strong>Limitations:</strong> Windows 10/11 x64 only. YouTube is the only finished screen; Prime Video, Netflix and Twitch are coming soon. The installer is not code-signed, so SmartScreen may warn. Rented or DRM-only YouTube movies may not play.</p>

        <h2 id="pip">Browser picture-in-picture: best if you want zero install</h2>

        <p>Chrome, Edge and Firefox all offer PiP. It is free, fast and cross-platform. The trade-offs are the small default size, limited controls, no opacity, no click-through, no shield, and one video per browser. For a five-minute clip, none of that matters. For an all-day window, it does.</p>

        <h2 id="powertoys">PowerToys Always on Top: best for pinning any app</h2>

        <p>Microsoft PowerToys is free, open source and genuinely useful. Enable Always on Top and press <kbd>Win</kbd><kbd>Ctrl</kbd><kbd>T</kbd> to pin the active window. It works on any app, not just video. What it does not do is remove browser chrome, fade the window, pass clicks through, or shield it from capture. It is a pin, not a player.</p>

        <h2 id="windowtop">WindowTop: best for advanced window effects</h2>

        <p>WindowTop is a general-purpose window utility with always-on-top, opacity, click-through and picture-in-picture features. It is a good fit if you want those effects across many apps. It is not YouTube-specific, and some features sit behind a Pro tier. Check the current pricing and feature list.</p>

        <h2 id="others">Other options worth a look</h2>

        <p><strong>FloatingYT</strong> is a lightweight Windows app for a floating online video window. <strong>Glaze</strong> is a free Windows YouTube desktop client with PiP and always-on-top options. Both are worth evaluating if you want a YouTube-only window and do not need Airframe's shield or click-through. Feature sets in small projects change quickly, so verify the current build before relying on a specific control.</p>

        <h2 id="choose">Which should you pick?</h2>

        <ul>
          <li><strong>Just a quick clip:</strong> browser PiP.</li>
          <li><strong>Pin any app above the rest:</strong> PowerToys Always on Top.</li>
          <li><strong>Advanced window effects across apps:</strong> WindowTop.</li>
          <li><strong>YouTube all day, with opacity, click-through and screen-share privacy:</strong> Airframe.</li>
          <li><strong>Netflix, Prime Video or Twitch today:</strong> none of the dedicated options are finished yet; use the site's own player or browser PiP until those screens ship.</li>
        </ul>

        <h2 id="bottom-line">The bottom line</h2>

        <p>The best floating YouTube player is the one that matches your day. If YouTube is background noise while you work, Airframe is built for that exact job. If you only need a video for a minute, the browser already has you covered.</p>

        <p><a class="inline-cta" href="../#download">Try Airframe free for Windows <span aria-hidden="true">&rarr;</span></a></p>`,
  },
];
