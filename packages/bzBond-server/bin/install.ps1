param(
  [string]$Proxy
)

Write-Output "=========================="
Write-Output "bzBond Server Installation"
Write-Output "=========================="

### require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Warning "This script requires admin permissions. Try again as admin."
  break
}

### check if bzbond is already installed
if (Test-Path -Path "C:\Program Files\bzBond-server") {
  Write-Output "bzBond already installed"
  break
}

### check node installed
if (Get-Command node -errorAction SilentlyContinue) {
  Write-Output "node installed"
} else {
  Write-Warning "node not found. Install nodejs from https://nodejs.org/en/download and try again."
  break
}

### check git installed
if (Get-Command git -errorAction SilentlyContinue) {
  Write-Output "git installed"
} else {
  Write-Warning "git not found. Install git from https://git-scm.com/downloads and try again."
  break
}

### clone bzBond from git
Write-Output "Downloading latest version..."
Set-Location $($env:USERPROFILE)\AppData\Local\Temp
git clone https://github.com/beezwax/bzBond.git
Copy-Item -Path $($env:USERPROFILE)\AppData\Local\Temp\bzBond\packages\bzBond-server -Destination "C:\Program Files\bzBond-server" -Recurse -Force

### install dependencies
Set-Location "C:\Program Files\bzBond-server"
if ($Proxy) {
  $npmCommand = "npm --proxy " + $Proxy + " install"
} else {
  $npmCommand = "npm install" 
}
$npmCommandNodeWindows = $npmCommand + " node-windows"
Invoke-Expression $npmCommand
Invoke-Expression $npmCommandNodeWindows
Remove-Item -Path $($env:USERPROFILE)\AppData\Local\bzBond -Recurse -Force

### install as service
node "C:\Program Files\bzBond-server\scripts\install-win-service.js"