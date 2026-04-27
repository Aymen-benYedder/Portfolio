Param(
  [string]$BaseUrl = 'https://aymen.benyedder.top'
)

Write-Host "Running sitemap generator with BASE_URL=$BaseUrl"
$env:BASE_URL = $BaseUrl

$scriptPath = Join-Path $PSScriptRoot 'generate-sitemap.mjs'
if (-Not (Test-Path $scriptPath)) { Write-Error "Could not find generator at $scriptPath"; exit 1 }

& node $scriptPath
if ($LASTEXITCODE -ne 0) { Write-Error "sitemap generator exited with code $LASTEXITCODE"; exit $LASTEXITCODE }

Write-Host "sitemap generation complete. Files: sitemap.xml, robots.txt (if template present)"
