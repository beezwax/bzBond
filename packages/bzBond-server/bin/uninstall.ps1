Write-Output "=========================="
Write-Output "bzBond Server Uninstall"
Write-Output "=========================="

### require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Warning "This script requires admin permissions. Try again as admin."
  break
}

### uninstall service
node "C:\Program Files\bzBond-server\scripts\uninstall-win-service.js"

### remove files
Remove-Item -Path "C:\Program Files\bzBond-server" -Recurse -Force