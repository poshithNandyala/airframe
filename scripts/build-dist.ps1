$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'build-helper.ps1')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$packager = Join-Path $root 'node_modules\.bin\electron-packager.cmd'
if (-not (Test-Path $packager)) { throw 'electron-packager is not installed.' }

$pkg = Get-Content (Join-Path $root 'package.json') -Raw | ConvertFrom-Json
$appVersion = $pkg.version
if (-not $appVersion) { throw 'package.json has no version.' }

$args = @(
  '.',
  'Airframe',
  '--platform=win32',
  '--arch=x64',
  '--out=dist',
  '--icon=assets/icon.ico',
  '--overwrite',
  '--asar',
  "--app-version=$appVersion",
  '--extra-resource=helper/AltHotkeys.exe',
  '--ignore=^/docs',
  '--ignore=^/helper',
  '--ignore=^/scripts'
)

$ok = $false
for ($attempt = 1; $attempt -le 3; $attempt++) {
  & $packager @args
  if ($LASTEXITCODE -eq 0) { $ok = $true; break }
  Write-Host "Packaging attempt $attempt failed; retrying..."
  Start-Sleep -Seconds 2
}
if (-not $ok) { exit 1 }

Copy-Item (Join-Path $root 'RELEASE-NOTES.md') (Join-Path $root 'dist\Airframe-win32-x64\RELEASE-NOTES.md') -Force
