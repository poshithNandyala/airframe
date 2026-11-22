using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

internal static class AltHotkeys
{
    private const int WM_QUIT = 0x0012;
    private const int WM_KEYDOWN = 0x0100;
    private const int WM_KEYUP = 0x0101;
    private const int WM_SYSKEYDOWN = 0x0104;
    private const int WM_SYSKEYUP = 0x0105;
    private const int WM_HOTKEY = 0x0312;
    private const int WH_KEYBOARD_LL = 13;

    private const uint MOD_ALT = 0x0001;
    private const uint MOD_CONTROL = 0x0002;
    private const uint MOD_SHIFT = 0x0004;
    private const int HOTKEY_CTRL_ALT_L = 1;
    private const int HOTKEY_ALT_SHIFT_L = 2;
    private const int HOTKEY_ALT_L = 10;
    private const int HOTKEY_ALT_H = 11;
    private const int HOTKEY_ALT_F = 12;
    private const int HOTKEY_ALT_B = 13;
    private const int HOTKEY_ALT_M = 14;
    private const int HOTKEY_ALT_S = 15;
    private const int HOTKEY_ALT_T = 16;
    private const int HOTKEY_ALT_R = 17;
    private const int HOTKEY_ALT_Q = 18;
    private const int HOTKEY_ALT_ENTER = 19;
    private const int HOTKEY_ALT_HOME = 20;
    private const int HOTKEY_ALT_SHIFT_D = 21;

    private const uint VK_CONTROL = 0x11;
    private const uint VK_MENU = 0x12;
    private const uint VK_SHIFT = 0x10;
    private const uint VK_LWIN = 0x5B;
    private const uint VK_RWIN = 0x5C;
    private const uint VK_RETURN = 0x0D;
    private const uint VK_HOME = 0x24;
    private const uint VK_LEFT = 0x25;
    private const uint VK_UP = 0x26;
    private const uint VK_RIGHT = 0x27;
    private const uint VK_DOWN = 0x28;
    private const uint VK_H = 0x48;
    private const uint VK_F = 0x46;
    private const uint VK_B = 0x42;
    private const uint VK_L = 0x4C;
    private const uint VK_M = 0x4D;
    private const uint VK_S = 0x53;
    private const uint VK_T = 0x54;
    private const uint VK_R = 0x52;
    private const uint VK_Q = 0x51;
    private const uint VK_D = 0x44;

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG
    {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int ptX;
        public int ptY;
        public uint lPrivate;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT
    {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;
    }

    private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [DllImport("user32.dll")]
    private static extern IntPtr WindowFromPoint(POINT point);

    [DllImport("user32.dll")]
    private static extern IntPtr GetAncestor(IntPtr hWnd, uint gaFlags);

    [DllImport("user32.dll")]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);

    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    private static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool fAttach);

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern bool EnumChildWindows(IntPtr hWndParent, EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll", EntryPoint = "GetWindowLongW")]
    private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", EntryPoint = "SetWindowLongW")]
    private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll")]
    private static extern IntPtr SendMessage(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);



    [DllImport("user32.dll")]
    private static extern bool IsWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern bool PostThreadMessage(uint idThread, uint msg, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll")]
    private static extern uint GetCurrentThreadId();

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll")]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern short GetAsyncKeyState(uint vKey);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    private static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll")]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    [DllImport("user32.dll")]
    private static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll")]
    private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    private static readonly BlockingCollection<string> Output = new BlockingCollection<string>();
    private static readonly bool[] BlockedKeys = new bool[256];
    private static readonly bool[] MoveActive = new bool[256];
    private static readonly bool[] OpacityActive = new bool[256];
    private static readonly bool[] HandledKeys = new bool[256];

    private static LowLevelKeyboardProc hookProc;
    private static IntPtr hookId = IntPtr.Zero;
    private static bool altDown;
    private static bool ctrlDown;
    private static bool shiftDown;
    private static bool winDown;
    private static bool shiftIntent;
    private static int parentProcessId;
    private static uint mainThreadId;
    // Must be a static field: a Timer only held by a local is garbage-collected
    // in release builds, which silently stops the parent-process watch.
    private static Timer parentWatch;

    private sealed class ChildState
    {
        public IntPtr Hwnd;
        public int ExStyle;
    }

    private static readonly List<ChildState> passChildren = new List<ChildState>();
    private static IntPtr passMain = IntPtr.Zero;

    private static readonly Dictionary<int, string> hotkeyActions = new Dictionary<int, string>();
    private static readonly List<int> hotkeyIds = new List<int>();
    private static readonly bool[] registeredAltLetter = new bool[256];
    private static bool registeredAltEnter;
    private static bool registeredAltHome;
    private static bool registeredAltShiftD;

    // Alt is held back until the next key shows what the chord is:
    //   Airframe shortcut -> handled here; the focused app never sees Alt, so
    //                        no menu bar and nothing left logically held.
    //   any other key     -> Alt down + that key are replayed to the app.
    //   Alt alone         -> a normal Alt tap is replayed (menus still work).
    private const int ALT_NONE = 0;     // Alt up, or Alt not being held back
    private const int ALT_PENDING = 1;  // Alt down swallowed, next key decides
    private const int ALT_CONSUMED = 2; // Alt used only for Airframe shortcuts
    private const int ALT_PASSED = 3;   // app has (or was given) Alt down
    private static int altMode;
    private static uint altVk;
    private static uint altScan;
    private static uint altFlags;
    // Tags our own replayed key events so the hook lets them straight through.
    private const long REPLAY_MARK = 0x41465246; // "AFRF"

    private static void RegisterAltLetter(int id, uint vk, string action)
    {
        if (RegisterHotKey(IntPtr.Zero, id, MOD_ALT, vk))
        {
            hotkeyActions[id] = action;
            hotkeyIds.Add(id);
            registeredAltLetter[vk] = true;
            Write("OK HOTKEY " + action);
        }
        else
        {
            Write("WARN HOTKEY " + action + " " + Marshal.GetLastWin32Error());
        }
    }

    private static void RegisterAltKey(int id, uint modifiers, uint vk, string action, string label)
    {
        if (RegisterHotKey(IntPtr.Zero, id, modifiers, vk))
        {
            hotkeyActions[id] = action;
            hotkeyIds.Add(id);
            if (vk == VK_RETURN)
            {
                registeredAltEnter = true;
            }
            else if (vk == VK_HOME)
            {
                registeredAltHome = true;
            }
            else if (vk == VK_D)
            {
                registeredAltShiftD = true;
            }
            Write("OK HOTKEY " + label);
        }
        else
        {
            Write("WARN HOTKEY " + label + " " + Marshal.GetLastWin32Error());
        }
    }

    private static int Main(string[] args)
    {
        StartWriter();
        uint threadId = GetCurrentThreadId();
        mainThreadId = threadId;
        int parentPid = 0;
        if (args.Length > 0)
        {
            int.TryParse(args[0], out parentPid);
        }
        parentProcessId = parentPid;

        try
        {
            hookProc = KeyboardHookProc;
            hookId = SetWindowsHookEx(WH_KEYBOARD_LL, hookProc, GetModuleHandle(null), 0);
            if (hookId == IntPtr.Zero)
            {
                Write("FAILED HOOK " + Marshal.GetLastWin32Error());
                Write("READY hook");
                Output.CompleteAdding();
                return 1;
            }

            altDown = (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;
            ctrlDown = (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
            shiftDown = (GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0;
            winDown = (GetAsyncKeyState(VK_LWIN) & 0x8000) != 0 || (GetAsyncKeyState(VK_RWIN) & 0x8000) != 0;
            shiftIntent = shiftDown;

            RegisterAltKey(HOTKEY_CTRL_ALT_L, MOD_CONTROL | MOD_ALT, VK_L, "GHOST", "CTRL_ALT_L");
            RegisterAltKey(HOTKEY_ALT_SHIFT_L, MOD_ALT | MOD_SHIFT, VK_L, "GHOST", "ALT_SHIFT_L");
            RegisterAltLetter(HOTKEY_ALT_L, VK_L, "GHOST");
            RegisterAltLetter(HOTKEY_ALT_H, VK_H, "HIDE");
            RegisterAltLetter(HOTKEY_ALT_F, VK_F, "FULLSCREEN");
            RegisterAltLetter(HOTKEY_ALT_B, VK_B, "HOME");
            RegisterAltLetter(HOTKEY_ALT_M, VK_M, "MUTE");
            RegisterAltLetter(HOTKEY_ALT_S, VK_S, "SHIELD");
            RegisterAltLetter(HOTKEY_ALT_T, VK_T, "TOPMOST");
            RegisterAltLetter(HOTKEY_ALT_R, VK_R, "RELOAD");
            RegisterAltLetter(HOTKEY_ALT_Q, VK_Q, "QUIT");
            RegisterAltKey(HOTKEY_ALT_ENTER, MOD_ALT, VK_RETURN, "FULLSCREEN", "ALT_ENTER");
            RegisterAltKey(HOTKEY_ALT_HOME, MOD_ALT, VK_HOME, "HOME", "ALT_HOME");
            RegisterAltKey(HOTKEY_ALT_SHIFT_D, MOD_ALT | MOD_SHIFT, VK_D, "NEXT_DISPLAY", "ALT_SHIFT_D");

            Write("OK HOOK");
            Write("READY hook");
        }
        catch (Exception ex)
        {
            Write("FAILED HOOK " + ex.Message);
            Write("READY hook");
            Output.CompleteAdding();
            return 1;
        }

        StartCommandReader();

        if (parentPid > 0)
        {
            parentWatch = new Timer(
                _ =>
                {
                    try
                    {
                        Process.GetProcessById(parentPid);
                    }
                    catch
                    {
                        PostThreadMessage(threadId, WM_QUIT, IntPtr.Zero, IntPtr.Zero);
                    }
                },
                null,
                2000,
                2000
            );
        }

        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0)
        {
            if (msg.message == WM_HOTKEY)
            {
                int hotkeyId = msg.wParam.ToInt32();
                string action;
                if (hotkeyActions.TryGetValue(hotkeyId, out action))
                {
                    if (action == "GHOST") WriteGhost();
                    else Write(action);
                }
                continue;
            }

            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }

        foreach (int id in hotkeyIds)
        {
            UnregisterHotKey(IntPtr.Zero, id);
        }
        if (hookId != IntPtr.Zero)
        {
            UnhookWindowsHookEx(hookId);
            hookId = IntPtr.Zero;
        }
        if (passMain != IntPtr.Zero)
        {
            ApplyPassThrough(passMain, false, false);
        }
        Output.CompleteAdding();
        return 0;
    }

    private static IntPtr KeyboardHookProc(int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (nCode >= 0)
        {
            int message = wParam.ToInt32();
            bool isDown = message == WM_KEYDOWN || message == WM_SYSKEYDOWN;
            bool isUp = message == WM_KEYUP || message == WM_SYSKEYUP;

            if (isDown || isUp)
            {
                KBDLLHOOKSTRUCT info = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
                int vk = (int)info.vkCode;

                if (info.dwExtraInfo.ToInt64() == REPLAY_MARK)
                {
                    return CallNextHookEx(IntPtr.Zero, nCode, wParam, lParam);
                }

                if (vk >= 0 && vk < 256)
                {
                    // Track modifiers ourselves. GetAsyncKeyState can lag
                    // synthetic input and Windows releases Shift during the
                    // Alt+Shift language-switch gesture.
                    if (vk == VK_MENU || vk == 0xA4 || vk == 0xA5)
                    {
                        return HandleAltKey(vk, isDown, info, nCode, wParam, lParam);
                    }
                    else if (vk == VK_SHIFT || vk == 0xA0 || vk == 0xA1)
                    {
                        shiftDown = isDown;
                        if (isDown)
                        {
                            shiftIntent = true;
                        }
                        else if (!altDown)
                        {
                            shiftIntent = false;
                        }
                    }
                    else if (vk == VK_CONTROL || vk == 0xA2 || vk == 0xA3)
                    {
                        ctrlDown = isDown;
                    }
                    else if (vk == VK_LWIN || vk == VK_RWIN)
                    {
                        winDown = isDown;
                    }

                    bool modifiersOk = altDown && !ctrlDown && !winDown;
                    // While Alt is held back, Windows does not know Alt is down,
                    // so RegisterHotKey cannot fire: the hook must act itself.
                    bool deferred = altMode == ALT_PENDING || altMode == ALT_CONSUMED;
                    bool isArrow = vk == VK_LEFT || vk == VK_UP || vk == VK_RIGHT || vk == VK_DOWN;

                    // Letters and Enter/Home: RegisterHotKey owns them when it
                    // succeeded, so Windows consumes the chord and the focused
                    // app never opens its menu bar. The hook remains the
                    // fallback when another app already owns the combination.
                    if (isDown && modifiersOk && !isArrow)
                    {
                        bool withShift = shiftDown || shiftIntent;
                        string action = HotkeyAction((uint)vk);
                        if (action != null)
                        {
                            bool registered =
                                (withShift && vk == VK_D && registeredAltShiftD) ||
                                (!withShift && vk == VK_RETURN && registeredAltEnter) ||
                                (!withShift && vk == VK_HOME && registeredAltHome) ||
                                (!withShift && registeredAltLetter[vk]);

                            if (registered && !deferred)
                            {
                                return CallNextHookEx(IntPtr.Zero, nCode, wParam, lParam);
                            }

                            if (deferred) altMode = ALT_CONSUMED;
                            if (!HandledKeys[vk])
                            {
                                HandledKeys[vk] = true;
                                if (action == "GHOST") WriteGhost();
                                else Write(action);
                            }
                            return (IntPtr)1;
                        }
                    }
                    else if (isUp && HandledKeys[vk])
                    {
                        HandledKeys[vk] = false;
                        return (IntPtr)1;
                    }

                    if (isArrow)
                    {
                        if (isUp && MoveActive[vk])
                        {
                            string stop = MoveStopAction(vk);
                            if (stop != null)
                            {
                                Write(stop);
                            }
                            MoveActive[vk] = false;
                            BlockedKeys[vk] = false;
                            return (IntPtr)1;
                        }

                        if (isUp && OpacityActive[vk])
                        {
                            string stop = OpacityStopAction(vk);
                            if (stop != null)
                            {
                                Write(stop);
                            }
                            OpacityActive[vk] = false;
                            BlockedKeys[vk] = false;
                            return (IntPtr)1;
                        }

                        if (isDown && modifiersOk)
                        {
                            if (BlockedKeys[vk])
                            {
                                return (IntPtr)1;
                            }

                            if (shiftDown || shiftIntent)
                            {
                                string action = OpacityStartAction(vk);
                                if (action != null)
                                {
                                    BlockedKeys[vk] = true;
                                    OpacityActive[vk] = true;
                                    if (deferred) altMode = ALT_CONSUMED;
                                    Write(action);
                                    return (IntPtr)1;
                                }
                            }
                            else
                            {
                                string action = MoveStartAction(vk);
                                if (action != null)
                                {
                                    BlockedKeys[vk] = true;
                                    MoveActive[vk] = true;
                                    if (deferred) altMode = ALT_CONSUMED;
                                    Write(action);
                                    return (IntPtr)1;
                                }
                            }
                        }
                    }

                    if (isDown && deferred)
                    {
                        // Not an Airframe shortcut (Tab, F4, E, numpad, Shift,
                        // Ctrl...): give the app Alt down, then this key, in
                        // order. Their physical key-ups pass through normally.
                        Replay(altVk, altScan, altFlags, false);
                        Replay((uint)vk, info.scanCode, info.flags, false);
                        altMode = ALT_PASSED;
                        return (IntPtr)1;
                    }
                }
            }
        }

        return CallNextHookEx(IntPtr.Zero, nCode, wParam, lParam);
    }

    private static IntPtr HandleAltKey(int vk, bool isDown, KBDLLHOOKSTRUCT info, int nCode, IntPtr wParam, IntPtr lParam)
    {
        if (isDown)
        {
            altDown = true;
            if (altMode == ALT_PENDING || altMode == ALT_CONSUMED) return (IntPtr)1; // auto-repeat
            if (altMode == ALT_PASSED) return CallNextHookEx(IntPtr.Zero, nCode, wParam, lParam);
            if (ctrlDown || winDown)
            {
                // Ctrl+Alt (includes AltGr on non-US layouts) and Win+Alt are
                // never Airframe's bare-Alt chords: leave them untouched.
                altMode = ALT_PASSED;
                return CallNextHookEx(IntPtr.Zero, nCode, wParam, lParam);
            }
            altMode = ALT_PENDING;
            altVk = (uint)vk;
            altScan = info.scanCode;
            altFlags = info.flags;
            return (IntPtr)1;
        }

        altDown = false;
        shiftIntent = false;
        int mode = altMode;
        altMode = ALT_NONE;
        if (mode == ALT_PENDING)
        {
            // Lone Alt tap: replay it so the app's menu bar works as usual.
            Replay(altVk, altScan, altFlags, false);
            Replay(altVk, altScan, altFlags, true);
            return (IntPtr)1;
        }
        if (mode == ALT_CONSUMED)
        {
            // The app never saw this Alt go down, so it must not see it go up.
            return (IntPtr)1;
        }
        return CallNextHookEx(IntPtr.Zero, nCode, wParam, lParam);
    }

    private static void Replay(uint vk, uint scan, uint llFlags, bool up)
    {
        uint flags = 0;
        if ((llFlags & 0x01) != 0) flags |= 0x0001; // LLKHF_EXTENDED -> KEYEVENTF_EXTENDEDKEY
        if (up) flags |= 0x0002;                     // KEYEVENTF_KEYUP
        try
        {
            keybd_event((byte)vk, (byte)scan, flags, new UIntPtr((ulong)REPLAY_MARK));
        }
        catch
        {
            // Best-effort; worst case the app misses one Alt press.
        }
    }

    private static string HotkeyAction(uint vk)
    {
        bool withShift = shiftDown || shiftIntent;
        if (vk == VK_D)
        {
            return withShift ? "NEXT_DISPLAY" : null;
        }
        if (withShift) return null;

        switch (vk)
        {
            case VK_H:
                return "HIDE";
            case VK_F:
                return "FULLSCREEN";
            case VK_B:
                return "HOME";
            case VK_L:
                return "GHOST";
            case VK_M:
                return "MUTE";
            case VK_S:
                return "SHIELD";
            case VK_T:
                return "TOPMOST";
            case VK_R:
                return "RELOAD";
            case VK_Q:
                return "QUIT";
            case VK_RETURN:
                return "FULLSCREEN";
            case VK_HOME:
                return "HOME";
            default:
                return null;
        }
    }

    private static string MoveStartAction(int vk)
    {
        switch ((uint)vk)
        {
            case VK_LEFT:
                return "MOVE_START_LEFT";
            case VK_RIGHT:
                return "MOVE_START_RIGHT";
            case VK_UP:
                return "MOVE_START_UP";
            case VK_DOWN:
                return "MOVE_START_DOWN";
            default:
                return null;
        }
    }

    private static string MoveStopAction(int vk)
    {
        switch ((uint)vk)
        {
            case VK_LEFT:
                return "MOVE_STOP_LEFT";
            case VK_RIGHT:
                return "MOVE_STOP_RIGHT";
            case VK_UP:
                return "MOVE_STOP_UP";
            case VK_DOWN:
                return "MOVE_STOP_DOWN";
            default:
                return null;
        }
    }

    private static string OpacityStartAction(int vk)
    {
        switch ((uint)vk)
        {
            case VK_UP:
            case VK_RIGHT:
                return "OPACITY_START_UP";
            case VK_DOWN:
            case VK_LEFT:
                return "OPACITY_START_DOWN";
            default:
                return null;
        }
    }

    private static string OpacityStopAction(int vk)
    {
        switch ((uint)vk)
        {
            case VK_UP:
            case VK_RIGHT:
                return "OPACITY_STOP_UP";
            case VK_DOWN:
            case VK_LEFT:
                return "OPACITY_STOP_DOWN";
            default:
                return null;
        }
    }

    private static void StartWriter()
    {
        var thread = new Thread(() =>
        {
            try
            {
                foreach (string line in Output.GetConsumingEnumerable())
                {
                    try
                    {
                        Console.Out.WriteLine(line);
                        Console.Out.Flush();
                    }
                    catch
                    {
                        // The parent may have closed the pipe while exiting.
                    }
                }
            }
            catch
            {
                // The process is exiting.
            }
        })
        {
            IsBackground = true,
            Name = "AltHotkeysOutput",
        };
        thread.Start();
    }

    private static void StartCommandReader()
    {
        var thread = new Thread(() =>
        {
            try
            {
                string line;
                while ((line = Console.In.ReadLine()) != null)
                {
                    string command = line.Trim();
                    if (string.Equals(command, "REPORT_FOREGROUND", StringComparison.OrdinalIgnoreCase))
                    {
                        ReportForeground();
                        continue;
                    }
                    if (command.StartsWith("FOCUS_UNDER_CURSOR", StringComparison.OrdinalIgnoreCase))
                    {
                        bool force = command.EndsWith("_FORCE", StringComparison.OrdinalIgnoreCase);
                        FocusUnderCursor(force);
                        continue;
                    }

                    string[] parts = command.Split(new[] { ' ' }, 2);
                    if (parts.Length == 2 && parts[0].StartsWith("PASSTHROUGH_", StringComparison.OrdinalIgnoreCase))
                    {
                        ulong handle;
                        if (!ulong.TryParse(parts[1], out handle)) continue;
                        bool enable = !parts[0].EndsWith("_OFF", StringComparison.OrdinalIgnoreCase);
                        bool soft = parts[0].EndsWith("_REFRESH", StringComparison.OrdinalIgnoreCase);
                        ApplyPassThrough(new IntPtr((long)handle), enable, soft);
                    }
                }
            }
            catch
            {
                // Pipe broke; treat like EOF.
            }
            // stdin closed means Airframe is gone. Exit so the keyboard hook
            // never outlives the app.
            PostThreadMessage(mainThreadId, WM_QUIT, IntPtr.Zero, IntPtr.Zero);
        })
        {
            IsBackground = true,
            Name = "AltHotkeysCommands",
        };
        thread.Start();
    }

    private static void ApplyPassThrough(IntPtr main, bool enable, bool soft)
    {
        lock (passChildren)
        {
            ApplyPassThroughLocked(main, enable, soft);
        }
    }

    private static void ApplyPassThroughLocked(IntPtr main, bool enable, bool soft)
    {
        try
        {
            if (main == IntPtr.Zero) return;

            if (!enable)
            {
                foreach (ChildState state in passChildren)
                {
                    if (!IsWindow(state.Hwnd)) continue;
                    SetWindowLong(state.Hwnd, -20, state.ExStyle);
                }
                passChildren.Clear();
                passMain = IntPtr.Zero;
                return;
            }

            if (passMain != IntPtr.Zero && passMain != main)
            {
                ApplyPassThroughLocked(passMain, false, false);
            }
            passMain = main;

            passChildren.RemoveAll(state => !IsWindow(state.Hwnd));

            var seen = new HashSet<IntPtr>();
            foreach (ChildState state in passChildren)
            {
                seen.Add(state.Hwnd);
            }

            EnumChildWindows(
                main,
                (hWnd, lParam) =>
                {
                    if (!seen.Contains(hWnd))
                    {
                        passChildren.Add(
                            new ChildState
                            {
                                Hwnd = hWnd,
                                ExStyle = GetWindowLong(hWnd, -20),
                            }
                        );
                        seen.Add(hWnd);
                    }
                    return true;
                },
                IntPtr.Zero
            );

            foreach (ChildState state in passChildren)
            {
                if (!IsWindow(state.Hwnd)) continue;
                int style = GetWindowLong(state.Hwnd, -20);
                // WS_EX_TRANSPARENT | WS_EX_NOACTIVATE
                SetWindowLong(state.Hwnd, -20, style | 0x20 | 0x08000000);
                if (!soft)
                {
                    // Cancels any mouse capture held by the YouTube renderer.
                    SendMessage(state.Hwnd, 0x001F, IntPtr.Zero, IntPtr.Zero);
                }
            }

            if (!soft)
            {
                SendMessage(main, 0x001F, IntPtr.Zero, IntPtr.Zero);
            }
        }
        catch
        {
            // Best-effort; Electron's window-level ignore still applies.
        }
    }

    private static void FocusUnderCursor(bool force)
    {
        try
        {
            IntPtr foreground = GetForegroundWindow();
            uint foregroundPid = 0;
            if (foreground != IntPtr.Zero)
            {
                GetWindowThreadProcessId(foreground, out foregroundPid);
                if (!force && foregroundPid != (uint)parentProcessId)
                {
                    // The user was already typing somewhere else. Leaving that
                    // app focused is the whole point of display-only mode.
                    WriteTarget("kept=1", foreground);
                    return;
                }
            }

            POINT point;
            if (!GetCursorPos(out point)) return;

            IntPtr hit = WindowFromPoint(point);
            IntPtr root = GetAncestor(hit, 2); // GA_ROOT
            if (root == IntPtr.Zero) return;

            uint targetPid;
            GetWindowThreadProcessId(root, out targetPid);
            if (parentProcessId != 0 && targetPid == (uint)parentProcessId)
            {
                WriteTarget("self=1", root);
                return;
            }

            if (IsIconic(root))
            {
                ShowWindow(root, 9); // SW_RESTORE
            }

            uint foregroundThread = 0;
            if (foreground != IntPtr.Zero)
            {
                foregroundThread = GetWindowThreadProcessId(foreground, out foregroundPid);
            }
            uint targetThread = GetWindowThreadProcessId(root, out targetPid);
            uint currentThread = GetCurrentThreadId();

            bool attachedTarget = false;
            bool attachedForeground = false;
            if (targetThread != 0 && targetThread != currentThread)
            {
                attachedTarget = AttachThreadInput(currentThread, targetThread, true);
            }
            if (foregroundThread != 0 && foregroundThread != currentThread && foregroundThread != targetThread)
            {
                attachedForeground = AttachThreadInput(currentThread, foregroundThread, true);
            }

            bool focused = SetForegroundWindow(root);

            if (attachedTarget) AttachThreadInput(currentThread, targetThread, false);
            if (attachedForeground) AttachThreadInput(currentThread, foregroundThread, false);

            WriteTarget(
                "focused=" + (focused ? "1" : "0") + " mode=" + (force ? "force" : "auto"),
                root
            );
        }
        catch
        {
            // Focus is best-effort; the user can still click through.
        }
    }

    private static void WriteGhost()
    {
        try
        {
            IntPtr foreground = GetForegroundWindow();
            uint pid = 0;
            if (foreground != IntPtr.Zero)
            {
                GetWindowThreadProcessId(foreground, out pid);
            }
            bool mine = parentProcessId != 0 && pid == (uint)parentProcessId;
            Write("GHOST " + (mine ? "1" : "0"));
        }
        catch
        {
            Write("GHOST 0");
        }
    }

    private static void ReportForeground()
    {
        try
        {
            IntPtr foreground = GetForegroundWindow();
            if (foreground != IntPtr.Zero)
            {
                WriteTarget("kept=1", foreground);
            }
        }
        catch
        {
            // Diagnostics only.
        }
    }

    private static void WriteTarget(string status, IntPtr hwnd)
    {
        try
        {
            uint pid;
            GetWindowThreadProcessId(hwnd, out pid);
            var title = new StringBuilder(256);
            GetWindowText(hwnd, title, title.Capacity);
            var cls = new StringBuilder(128);
            GetClassName(hwnd, cls, cls.Capacity);
            string cleanTitle = title.ToString()
                .Replace("\r", " ")
                .Replace("\n", " ")
                .Replace("\t", " ")
                .Trim();
            if (cleanTitle.Length > 80) cleanTitle = cleanTitle.Substring(0, 80);
            string cleanClass = cls.ToString().Replace("\t", " ").Trim();
            Write("TARGET " + status + " pid=" + pid + " class=" + cleanClass + " title=" + cleanTitle);
        }
        catch
        {
            // Diagnostics only.
        }
    }

    private static void Write(string line)
    {
        try
        {
            Output.Add(line);
        }
        catch
        {
            // Collection completed during shutdown.
        }
    }
}
