# PowerShell Change Detection Script
# Usage: .\detect_changes.ps1 [-LastBackup <path>]

param(
    [string]$LastBackup = $null
)

# Configuration
$projectRoot = Get-Location
$excludedDirs = @("node_modules", ".next", "backups", "public/generated-pdfs")
$excludedFiles = @("*.log", "*.tmp", ".DS_Store")

# Find last backup if not provided
if (-not $LastBackup) {
    $backupDir = Join-Path $projectRoot "backups"
    if (Test-Path $backupDir) {
        $lastBackup = Get-ChildItem -Path $backupDir -Directory -Name "backup_*" | 
                     Sort-Object -Descending | 
                     Select-Object -First 1
        if ($lastBackup) {
            $LastBackup = Join-Path $backupDir $lastBackup
        }
    }
}

if (-not $LastBackup -or -not (Test-Path $LastBackup)) {
    Write-Host "No previous backup found. Run backup.ps1 first." -ForegroundColor Yellow
    exit 1
}

Write-Host "Comparing with backup: $LastBackup" -ForegroundColor Cyan

# Get current project files
$currentFiles = Get-ChildItem -Path $projectRoot -Recurse -File |
    Where-Object {
        $file = $_
        -not ($excludedDirs | Where-Object { $file.FullName -like "*\$_\*" }) -and
        -not ($excludedFiles | Where-Object { $file.Name -like $_ })
    } |
    ForEach-Object {
        @{
            FullName = $_.FullName.Substring($projectRoot.Path.Length + 1)
            Length = $_.Length
            LastWriteTime = $_.LastWriteTime
            Hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        }
    }

# Get backup files
$backupFiles = Get-ChildItem -Path $LastBackup -Recurse -File |
    Where-Object { $_.Name -ne "checksums.txt" -and $_.Name -ne "backup_manifest.json" } |
    ForEach-Object {
        @{
            FullName = $_.FullName.Substring($LastBackup.Length + 1)
            Length = $_.Length
            LastWriteTime = $_.LastWriteTime
            Hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        }
    }

# Compare files
$changes = @()
$currentFileDict = @{}
$backupFileDict = @{}

$currentFiles | ForEach-Object { $currentFileDict[$_.FullName] = $_ }
$backupFiles | ForEach-Object { $backupFileDict[$_.FullName] = $_ }

# Check for new and modified files
foreach ($file in $currentFiles) {
    $relPath = $file.FullName
    if (-not $backupFileDict.ContainsKey($relPath)) {
        $changes += @{
            Type = "New"
            Path = $relPath
            Size = $file.Length
            Modified = $file.LastWriteTime
        }
    } elseif ($backupFileDict[$relPath].Hash -ne $file.Hash) {
        $changes += @{
            Type = "Modified"
            Path = $relPath
            Size = $file.Length
            Modified = $file.LastWriteTime
            OldSize = $backupFileDict[$relPath].Length
        }
    }
}

# Check for deleted files
foreach ($file in $backupFiles) {
    $relPath = $file.FullName
    if (-not $currentFileDict.ContainsKey($relPath)) {
        $changes += @{
            Type = "Deleted"
            Path = $relPath
            Size = $file.Length
            Modified = $file.LastWriteTime
        }
    }
}

# Display results
if ($changes.Count -eq 0) {
    Write-Host "No changes detected since last backup." -ForegroundColor Green
} else {
    Write-Host "`nChanges detected since last backup:" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    
    $newFiles = $changes | Where-Object { $_.Type -eq "New" }
    $modifiedFiles = $changes | Where-Object { $_.Type -eq "Modified" }
    $deletedFiles = $changes | Where-Object { $_.Type -eq "Deleted" }
    
    if ($newFiles.Count -gt 0) {
        Write-Host "`nNew files:" -ForegroundColor Green
        $newFiles | ForEach-Object {
            Write-Host "  + $($_.Path) ($([math]::Round($_.Size/1KB, 2)) KB)"
        }
    }
    
    if ($modifiedFiles.Count -gt 0) {
        Write-Host "`nModified files:" -ForegroundColor Yellow
        $modifiedFiles | ForEach-Object {
            $sizeDiff = $_.Size - $_.OldSize
            $sizeIndicator = if ($sizeDiff -gt 0) { "+" } else { "" }
            Write-Host "  ~ $($_.Path) ($sizeIndicator$([math]::Round($sizeDiff/1KB, 2)) KB)"
        }
    }
    
    if ($deletedFiles.Count -gt 0) {
        Write-Host "`nDeleted files:" -ForegroundColor Red
        $deletedFiles | ForEach-Object {
            Write-Host "  - $($_.Path)"
        }
    }
    
    Write-Host "`nTotal changes: $($changes.Count)" -ForegroundColor Cyan
    Write-Host "Total new data: $([math]::Round(($newFiles + $modifiedFiles | Measure-Object -Property Size -Sum).Sum / 1KB, 2)) KB" -ForegroundColor Cyan
    
    # Save changes to file
    $changesFile = "changes_since_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
    $changes | ConvertTo-Json -Depth 3 | Out-File $changesFile
    Write-Host "`nChanges saved to: $changesFile" -ForegroundColor Green
    
    # Prompt for backup
    $response = Read-Host "`nCreate new backup? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        & ".\backup.ps1"
    }
}