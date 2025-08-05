# PowerShell Restore Script
# Usage: .\restore.ps1 -BackupPath <path> [-SkipDependencies]

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupPath,
    
    [switch]$SkipDependencies = $false,
    [switch]$Force = $false
)

# Validate backup path
if (-not (Test-Path $BackupPath)) {
    Write-Host "Error: Backup path not found: $BackupPath" -ForegroundColor Red
    exit 1
}

# Check if it's a zip file
if ($BackupPath.EndsWith(".zip")) {
    $extractPath = $BackupPath.Replace(".zip", "")
    if (-not (Test-Path $extractPath)) {
        Write-Host "Extracting zip archive..." -ForegroundColor Cyan
        Expand-Archive -Path $BackupPath -DestinationPath $extractPath -Force
    }
    $BackupPath = $extractPath
}

# Validate backup contents
$manifestPath = Join-Path $BackupPath "backup_manifest.json"
if (-not (Test-Path $manifestPath)) {
    Write-Host "Warning: No backup manifest found. Proceeding with file copy only." -ForegroundColor Yellow
} else {
    $manifest = Get-Content $manifestPath | ConvertFrom-Json
    Write-Host "Restoring backup from: $($manifest.timestamp)" -ForegroundColor Green
}

# Confirmation prompt
if (-not $Force) {
    Write-Host "`nThis will overwrite existing files in the current directory." -ForegroundColor Yellow
    $response = Read-Host "Continue? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Restore cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Get current directory
$projectRoot = Get-Location

Write-Host "`nStarting restoration..." -ForegroundColor Green

# Copy files from backup
$items = Get-ChildItem -Path $BackupPath -Exclude "backup_manifest.json", "checksums.txt"

foreach ($item in $items) {
    $destPath = Join-Path $projectRoot $item.Name
    
    if (Test-Path $destPath) {
        if ($item.PSIsContainer) {
            Remove-Item $destPath -Recurse -Force
        } else {
            Remove-Item $destPath -Force
        }
    }
    
    Copy-Item $item.FullName -Destination $projectRoot -Recurse -Force
    Write-Host "✓ Restored: $($item.Name)" -ForegroundColor DarkGreen
}

Write-Host "`nFile restoration completed!" -ForegroundColor Green

# Install dependencies if package.json was restored
if (-not $SkipDependencies -and (Test-Path "package.json")) {
    Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
    
    # Check if npm is available
    try {
        $npmVersion = npm --version
        Write-Host "Using npm version: $npmVersion" -ForegroundColor DarkCyan
        
        npm install
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠ npm not found. Please install dependencies manually: npm install" -ForegroundColor Yellow
    }
}

# Database restoration
if (Test-Path "prisma/schema.prisma") {
    Write-Host "`nSetting up database..." -ForegroundColor Cyan
    
    # Check if Prisma CLI is available
    try {
        $npxVersion = npx --version
        Write-Host "Using npx to run Prisma commands..." -ForegroundColor DarkCyan
        
        # Generate Prisma client
        Write-Host "Generating Prisma client..."
        npx prisma generate
        
        # Run migrations
        Write-Host "Running database migrations..."
        npx prisma migrate deploy
        
        Write-Host "✓ Database setup completed" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Prisma CLI not available. Please run manually:" -ForegroundColor Yellow
        Write-Host "  npx prisma generate" -ForegroundColor Yellow
        Write-Host "  npx prisma migrate deploy" -ForegroundColor Yellow
    }
}

# Verify restoration
Write-Host "`nVerifying restoration..." -ForegroundColor Cyan

$verification = @{
    packageJson = Test-Path "package.json"
    prismaSchema = Test-Path "prisma/schema.prisma"
    appDirectory = Test-Path "app"
    envFile = Test-Path ".env"
}

Write-Host "`nVerification results:" -ForegroundColor Cyan
$verification.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value) { "✓" } else { "✗" }
    Write-Host "  $status $($_.Key)" -ForegroundColor $(if ($_.Value) { "Green" } else { "Red" })
}

# Final instructions
Write-Host "`nRestoration completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review and update .env file with your actual values" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Test the application" -ForegroundColor White

# Create restoration log
$log = @{
    restoredFrom = $BackupPath
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    verification = $verification
    dependenciesInstalled = -not $SkipDependencies
}

$logPath = "restoration_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$log | ConvertTo-Json -Depth 3 | Out-File $logPath
Write-Host "`nRestoration log saved: $logPath" -ForegroundColor Green