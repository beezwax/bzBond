# Get microbond name from user
$name = Read-Host "Enter Microbond name"

if ([string]::IsNullOrWhiteSpace($name)) {
  Write-Output "Microbond name is required"
  break
}

git clone https://github.com/beezwax/bzbond-server-microbond-example.git "$name"
Set-Location "$name"
Remove-Item -Path .git -Recurse -Force
(Get-Content package.json).
  replace('"name": "bzmb-hello-world"', '"name": "' + $name + '"').
  replace('"version": "1.0.0"', '"verison": "0.1.0"').
  replace('"author": "Beezwax"', '"author": "author"').
  replace('minimal example ', '') | Set-Content package.json
git init

Write-Output "Microbond $name created!"
Write-Output "A git repository has been created for you."
Write-Output ""
Write-Output "Next steps:"
Write-Output " - Read the documentation in README.md"
Write-Output " - Start hacking away by editing the 'index.js' file"
Write-Output " - Manage your microbond's version, name, and description in package.json"