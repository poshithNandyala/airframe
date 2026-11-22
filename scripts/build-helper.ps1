$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'helper\AltHotkeys.cs'
$output = Join-Path $root 'helper\AltHotkeys.exe'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path $csc)) {
  $csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
}
if (-not (Test-Path $csc)) { throw 'The .NET Framework C# compiler was not found.' }
& $csc /nologo /target:winexe /optimize+ "/out:$output" $source
if ($LASTEXITCODE -ne 0) { throw 'Hotkey helper build failed.' }
Get-Item $output | Select-Object FullName, Length, LastWriteTime
