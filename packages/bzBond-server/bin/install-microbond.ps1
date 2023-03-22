param (
    [string]$name,
    [string]$url
)

Write-Output "===================================="
Write-Output "bzBond Server Microbond Installation"
Write-Output "===================================="

### require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  write-Warning "This setup needs admin permissions. Please run this file as admin."     
  break
}

### run node installation script
node "C:\Program Files\bzBond-server\scripts\install-microbond.js" $name $url