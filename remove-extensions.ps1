# Removes extension in windows during development

# Define the pattern of extensions to remove (wildcard match)
$extensionPattern = "jesperwilfing.clipster*"

# Get the extensions directory path
$extensionsDirectory = "$env:USERPROFILE\.vscode\extensions"

# Navigate to the extensions directory
Set-Location $extensionsDirectory

# Get all extensions matching the pattern
$extensionsToRemove = Get-ChildItem -Directory -Filter $extensionPattern

# Loop through each matching extension and remove it
foreach ($extension in $extensionsToRemove) {
    $extensionPath = $extension.FullName
    Write-Host "Removing extension: $($extension.Name)"
    Remove-Item -Recurse -Force $extensionPath
}

# Output the result
Write-Host "Completed the removal of all versions of Clipster."
