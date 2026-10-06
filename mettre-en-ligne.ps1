# Mise en ligne de Gaïa Trajectoire sur Vercel (production), puis vérification.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
Write-Host "Déploiement en cours..." -ForegroundColor Cyan
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) { Write-Host "Échec du déploiement (code $LASTEXITCODE)." -ForegroundColor Red; Read-Host "Appuyez sur Entrée pour fermer"; exit 1 }
Write-Host "Vérification du site..." -ForegroundColor Cyan
Start-Sleep 5
$base = 'https://xn--gaa-trajectoire-jps-r2b.com'
foreach ($p in '/', '/forum/', '/styles.css', '/home.css') {
  try { $c = (Invoke-WebRequest "$base$p" -UseBasicParsing -Headers @{'Cache-Control'='no-cache'}).StatusCode } catch { $c = $_.Exception.Response.StatusCode.value__ }
  Write-Host ("{0,-12} {1}" -f $p, $c)
}
Start-Process "$base/"
Read-Host "Terminé. Appuyez sur Entrée pour fermer"
