param (
  [string]$name
)

Write-Output "======================================"
Write-Output "bzBond Server Microbond Uninstallation"
Write-Output "======================================"

### require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Warning "This script requires admin permissions. Try again as admin."
  break
}

### run node installation script
node "C:\Program Files\bzBond-server\scripts\uninstall-microbond.js" "$name"