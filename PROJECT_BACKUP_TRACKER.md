# Project Backup & Change Tracking Guide

## Project Overview
**Project Type**: Next.js Subscription Management Application with Stripe Integration
**Database**: PostgreSQL with Prisma ORM
**Key Features**: User subscriptions, payment processing, referral system, invoice generation, document signing

## Critical Files for Backup

### 1. Source Code & Configuration
- [`package.json`](./package.json) - Dependencies and scripts
- [`tsconfig.json`](./tsconfig.json) - TypeScript configuration
- [`next.config.js`](./next.config.js) - Next.js configuration
- [`prisma/schema.prisma`](./prisma/schema.prisma) - Database schema
- [`lib/prisma.ts`](./lib/prisma.ts) - Database client configuration

### 2. Environment & Secrets
- [`.env`](./.env) - Environment variables (CRITICAL - contains API keys)
- [`.env.local`](./.env.local) - Local environment overrides

### 3. Application Source Code
- [`app/`](./app/) - Main application directory
  - [`app/page.tsx`](./app/page.tsx) - Main landing page
  - [`app/layout.tsx`](./app/layout.tsx) - Root layout
  - [`app/api/`](./app/api/) - API routes
  - [`app/components/`](./app/components/) - React components
  - [`app/(routes)/`](./app/(routes)/) - Route-specific pages

### 4. Database Migrations
- [`prisma/migrations/`](./prisma/migrations/) - Database schema changes
  - All migration files are critical for database consistency

### 5. Templates & Assets
- [`templates/`](./templates/) - HTML templates for invoices
- [`public/`](./public/) - Static assets
- [`images/`](./images/) - Product images

## Files to Exclude from Backup
- `node_modules/` - Dependencies (can be restored with `npm install`)
- `.next/` - Build output (can be regenerated)
- `public/generated-pdfs/` - Generated PDFs (can be regenerated)
- `npm-debug.log*` - Debug logs

## Change Tracking Strategy

### 1. Git-Based Tracking
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial backup"
```

### 2. File Categories for Differential Backup

#### Category A: Critical (Always backup)
- All `.ts`, `.tsx`, `.js`, `.json` files in root and app/
- All `.prisma` files
- All environment files
- All migration files
- All template files

#### Category B: Important (Backup when changed)
- Static assets in `public/` and `images/`
- Documentation files (`.md`, `.txt`)

#### Category C: Generated (Exclude from backup)
- `.next/` build directory
- `node_modules/` dependencies
- `public/generated-pdfs/` generated files

## Backup Commands & Scripts

### Quick Backup Script
Create a file named `backup.sh` (Linux/Mac) or `backup.bat` (Windows):

#### Windows Batch Script (`backup.bat`)
```batch
@echo off
set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
mkdir %BACKUP_DIR%

:: Copy critical files
xcopy package.json %BACKUP_DIR%\
xcopy tsconfig.json %BACKUP_DIR%\
xcopy next.config.js %BACKUP_DIR%\
xcopy .env %BACKUP_DIR%\
xcopy .env.local %BACKUP_DIR%\

:: Copy source code
xcopy app %BACKUP_DIR%\app\ /E /I
xcopy lib %BACKUP_DIR%\lib\ /E /I
xcopy prisma %BACKUP_DIR%\prisma\ /E /I
xcopy templates %BACKUP_DIR%\templates\ /E /I
xcopy public %BACKUP_DIR%\public\ /E /I
xcopy images %BACKUP_DIR%\images\ /E /I

echo Backup completed: %BACKUP_DIR%
pause
```

#### PowerShell Script (`backup.ps1`)
```powershell
$backupDir = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir | Out-Null

# Critical files
Copy-Item "package.json" -Destination $backupDir
Copy-Item "tsconfig.json" -Destination $backupDir
Copy-Item "next.config.js" -Destination $backupDir
Copy-Item ".env" -Destination $backupDir
Copy-Item ".env.local" -Destination $backupDir

# Directories
Copy-Item "app" -Destination "$backupDir\app" -Recurse
Copy-Item "lib" -Destination "$backupDir\lib" -Recurse
Copy-Item "prisma" -Destination "$backupDir\prisma" -Recurse
Copy-Item "templates" -Destination "$backupDir\templates" -Recurse
Copy-Item "public" -Destination "$backupDir\public" -Recurse
Copy-Item "images" -Destination "$backupDir\images" -Recurse

Write-Host "Backup completed: $backupDir"
```

### Git-Based Incremental Backup
```bash
# Add all changes
git add .

# Commit with timestamp
git commit -m "Backup $(date +%Y-%m-%d_%H-%M-%S)"

# Create archive of latest commit
git archive --format=zip --output=backup_$(date +%Y%m%d_%H%M%S).zip HEAD
```

## File Checksum Tracking

Create a file `file_checksums.txt` to track changes:

```bash
# Generate checksums for critical files
certutil -hashfile package.json SHA256
certutil -hashfile tsconfig.json SHA256
certutil -hashfile next.config.js SHA256
certutil -hashfile prisma/schema.prisma SHA256
```

## Restoration Process

### 1. From Backup Directory
```bash
# Copy files back to project root
xcopy backup_YYYYMMDD_HHMMSS\* . /E /I /Y

# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 2. From Git
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
copy .env.example .env
# Edit .env with your actual values

# Run database migrations
npx prisma migrate deploy
```

## Environment Variables Checklist
Ensure these are backed up securely:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Client-side Stripe key
- `YOUSIGN_API_KEY` - YouSign API key (if using)

## Database Backup Strategy

### 1. Schema Backup
```bash
# Export schema
npx prisma db pull
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema_backup.sql
```

### 2. Data Backup (PostgreSQL)
```bash
# Backup entire database
pg_dump $DATABASE_URL > database_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql $DATABASE_URL < database_backup_YYYYMMDD_HHMMSS.sql
```

## Change Detection Script

Create `detect_changes.ps1`:
```powershell
# Compare current files with last backup
$lastBackup = Get-ChildItem -Directory -Name "backup_*" | Sort-Object -Descending | Select-Object -First 1

if ($lastBackup) {
    $diff = Compare-Object (Get-ChildItem -Recurse -Exclude "node_modules",".next","generated-pdfs") (Get-ChildItem "$lastBackup\*" -Recurse)
    if ($diff) {
        Write-Host "Changes detected:"
        $diff | Format-Table -AutoSize
    } else {
        Write-Host "No changes detected since last backup"
    }
}
```

## Quick Reference Commands

| Task | Command |
|------|---------|
| **Full Backup** | `.\backup.ps1` |
| **Check Changes** | `.\detect_changes.ps1` |
| **Git Backup** | `git add . && git commit -m "Backup $(date)"` |
| **Restore Dependencies** | `npm install` |
| **Database Migration** | `npx prisma migrate deploy` |
| **Generate Client** | `npx prisma generate` |

## Security Notes
- Never commit `.env` files to version control
- Store backups in secure location
- Use encryption for sensitive backups
- Rotate backup files regularly
- Test restoration process periodically