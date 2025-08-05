# PowerShell Backup Script for Subscription Management Project
# Usage: .\backup.ps1 [-Incremental]

param(
    [switch]$Incremental = $false
)

# Configuration
$projectRoot = Get-Location
$backupBaseDir = Join-Path $projectRoot "backups"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path $backupBaseDir "backup_$timestamp"

# Files and directories to backup
$criticalFiles = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next.config.js",
    ".env",
    ".env.local",
    ".gitignore",
    "README-PAYMENT-METHOD-REUSE.md"
)

$directoriesToBackup = @(
    "app",
    "lib",
    "prisma",
    "templates",
    "public"
)

# Create backup directory
if (-not (Test-Path $backupBaseDir)) {
    New-Item -ItemType Directory -Path $backupBaseDir | Out-Null
}

New-Item -ItemType Directory -Path $backupDir | Out-Null

Write-Host "Starting backup to: $backupDir" -ForegroundColor Green

# Backup critical files
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $backupDir
        Write-Host "✓ Backed up: $file" -ForegroundColor DarkGreen
    } else {
        Write-Host "⚠ Skipped (not found): $file" -ForegroundColor Yellow
    }
}

# Backup directories
foreach ($dir in $directoriesToBackup) {
    if (Test-Path $dir) {
        $destDir = Join-Path $backupDir $dir
        Copy-Item $dir -Destination $destDir -Recurse -Force
        Write-Host "✓ Backed up directory: $dir" -ForegroundColor DarkGreen
    } else {
        Write-Host "⚠ Skipped directory (not found): $dir" -ForegroundColor Yellow
    }
}

# Create backup manifest
$manifest = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    incremental = $Incremental
    files = $criticalFiles
    directories = $directoriesToBackup
    gitCommit = if (Test-Path ".git") { git rev-parse HEAD } else { "N/A" }
}

$manifest | ConvertTo-Json | Out-File (Join-Path $backupDir "backup_manifest.json")

# Create checksum file
$checksumFile = Join-Path $backupDir "checksums.txt"
Get-ChildItem -Path $backupDir -Recurse -File | 
    Where-Object { $_.Name -ne "checksums.txt" } |
    ForEach-Object {
        $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        "$hash $($_.FullName.Substring($backupDir.Length + 1))" | Out-File -Append $checksumFile
    }

Write-Host "`nBackup completed successfully!" -ForegroundColor Green
Write-Host "Location: $backupDir" -ForegroundColor Cyan
Write-Host "Size: $([math]::Round((Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)) MB" -ForegroundColor Cyan

# Optional: Create zip archive
$zipPath = "$backupDir.zip"
Compress-Archive -Path $backupDir -DestinationPath $zipPath -Force
Write-Host "Zip archive created: $zipPath" -ForegroundColor Green