'use strict';

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
base = fso.GetParentFolderName(WScript.ScriptFullName)
exe = base & "\dist\Airframe-win32-x64\Airframe.exe"

If fso.FileExists(exe) Then
  shell.Run """" & exe & """", 0, False
Else
  shell.Run "cmd /c cd /d """ & base & """ && npx electron .", 0, False
End If
