# Airframe 1.5.0 — release notes

Released: 2026-11-22

## New

- **Touchpad swipe back/forward.** Two fingers right goes back (for example,
  from a video to your search results); two fingers left goes forward, like
  Chrome. A small arrow slides in from the edge while you swipe and turns
  white once letting go will navigate; swipe back before letting go to cancel.
  Vertical scrolling and sideways-scrolling rows are left alone.
- **Mouse back/forward side buttons** navigate the same way.
- **Launcher refresh.** Prime Video, Netflix and Twitch are listed as coming
  soon (YouTube Music removed).
- **Opens at 93% opacity** on every launch, so the desktop behind shows through
  just slightly.

## Changed

- **Click-through (Alt+L) no longer draws a red border** around the window or
  turns the top strip red. A short toast still confirms the switch.

---

# Airframe 1.4.1 — release notes

Released: 2026-11-22

Reliability release: fixes stuck Alt after Airframe shortcuts, plus the helper
lifetime, thread-safety, fallback-restart, and second-instance fixes.

## Changes

- **The helper can no longer outlive Airframe.** The parent-process watch timer
  is held in a static field, and the helper exits immediately when its stdin
  pipe closes. A killed or crashed Airframe no longer leaves a system-wide
  keyboard hook behind.
- **Click-through state is thread-safe.** The child-window list used by
  pass-through mode is now protected by a lock, so the command thread and the
  shutdown path cannot modify it at the same time.
- **Backup shortcuts are released before the helper restarts.** If the helper
  exits, Airframe registers Electron fallbacks; it now unregisters them before
  starting the replacement helper, so the new helper can register all of its
  hotkeys without conflicts.
- **Second-instance launches no longer steal focus in click-through mode.**
  Launching Airframe again while it is already visible uses `showInactive()`
  when ghost mode is on.
- **Build consistency.** The helper inside the packaged app is built from the
  current source (matching hash).

## Fixed: stuck Alt after an Airframe shortcut

**Before.** After an Airframe Alt shortcut (`Alt+H`, `Alt+M`, `Alt+←`...), the
next key in the focused app acted as `Alt+key` (in Notepad, `Alt+H` then `a`
typed nothing) until Alt was pressed again. The old helper let the app see Alt
go down but hid Alt going up, so the app thought Alt was still held. This was
present in 1.4.0 too.

**Now.** The helper holds Alt down back until the next key shows what the
chord is:

- Airframe shortcut: handled; the app never sees Alt at all, so no menu bar
  and nothing left held.
- Any other key (`Alt+Tab`, `Alt+F4`, `Alt+E`, Alt+numpad...): Alt and that
  key are passed to the app in order, as normal.
- Alt alone: a normal Alt tap is passed on, so menu bars still work.
- Ctrl+Alt and AltGr are never held back.

**Known limits.** Alt+mouse-click is seen by the app as a plain click while Alt
is being held back (rare on Windows). Shortcuts do not work while an
administrator window is focused (unchanged from before).

## Validation

- Packaged launch: version `1.4.1`, launcher visible, YouTube loads, 20 cookies
  loaded, all hotkeys registered.
- Helper restart: killing the helper while Airframe runs restarts it with no
  hotkey-conflict warnings. Killing Airframe leaves no helper process.
- Alt behavior: automated key test (classic Win32 menu window) passes all 8
  cases: `Alt+M`/`Alt+H`/`Alt+←`/`Alt+Shift+←`/double shortcut then typing,
  lone Alt opens the menu, `Alt+E` opens Edit, typing after menus. The 1.4.0
  helper fails all 8 on the same test. A physical-keyboard pass in Notepad is
  still recommended.

## Upgrade notes

- The signed-in YouTube profile in `%APPDATA%\Airframe` is preserved; no
  re-login is required.
- No configuration or shortcut changes.
- The desktop shortcut still points to
  `dist\Airframe-win32-x64\Airframe.exe`.
