param(
  [string]$Proxy
)

Write-Output "=========================="
Write-Output "bzBond Server Update"
Write-Output "=========================="

### Require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Warning "This script requires admin permissions. Try again as admin."
  break
}

### Save current location
$currentLocation = Get-Location

### Backup microbonds
Move-Item -Path "C:\Program Files\bzBond-server\microbonds.js" -Destination "C:\Program Files\bzBond-server\microbonds.js.bak" -Force

### Download latest version
Write-Output "Downloading latest version..."
Set-Location "$($env:USERPROFILE)\AppData\Local\Temp"
git clone https://github.com/beezwax/bzBond.git
Copy-Item -Path "$($env:USERPROFILE)\AppData\Local\Temp\bzBond\packages\bzBond-server\*" -Destination "C:\Program Files\bzBond-server" -Recurse -Force
Remove-Item -Path "$($env:USERPROFILE)\AppData\Local\Temp\bzBond" -Recurse -Force

### Restore microbonds
Move-Item -Path "C:\Program Files\bzBond-server\microbonds.js.bak" -Destination "C:\Program Files\bzBond-server\microbonds.js" -Force

### Restart service
Write-Output "bzBond-server updated"
Write-Output "Restarting service..."
Restart-Service -Name bzBond-server
Write-Output "Service restarted"
Set-Location $currentLocation