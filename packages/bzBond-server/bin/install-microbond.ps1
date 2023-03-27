param (
  [string]$Name,
  [string]$Url,
  [string]$Proxy
)

Write-Output "===================================="
Write-Output "bzBond Server Microbond Installation"
Write-Output "===================================="

### require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Warning "This script requires admin permissions. Try again as admin."
  break
}

### run node installation script
node "C:\Program Files\bzBond-server\scripts\install-microbond.js" -n "$Name" -u "$Url" -x "$Proxy"