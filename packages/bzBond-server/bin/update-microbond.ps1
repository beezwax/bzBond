param (
  [Parameter(Mandatory=$true)][string]$name
)

### require administator rights
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
  Write-Warning "This script requires admin permissions. Try again as admin."
  break
}

$currentLocation = Get-Location
Set-Location "C:\Program Files\bzBond-server\installed-microbonds\$name" -ErrorAction Stop
Write-Output "Updating $name"

git pull
if ($LASTEXITCODE) {
  Set-Location $currentLocation
  Write-Error "Cannot update: $name is not a git repository" -ErrorAction Stop
}

Write-Output "Microbond $name updated successfully"
Restart-Service -Name bzBond-server
Set-Location $currentLocation