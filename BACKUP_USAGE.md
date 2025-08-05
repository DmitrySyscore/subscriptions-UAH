# Quick Backup Usage Guide

## 🚀 Getting Started

### 1. First-Time Setup
```powershell
# Make scripts executable (run once)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Test the scripts
.\detect_changes.ps1
```

### 2. Create Your First Backup
```powershell
# Full backup
.\backup.ps1

# This creates: backups/backup_YYYYMMDD_HHMMSS/
```

### 3. Daily Workflow
```powershell
# Check for changes
.\detect_changes.ps1

# If changes detected, create backup
.\backup.ps1
```

## 📋 Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| **backup.ps1** | Create full backup | `.\backup.ps1` |
| **detect_changes.ps1** | Check what changed | `.\detect_changes.ps1` |
| **restore.ps1** | Restore from backup | `.\restore.ps1 -BackupPath "backups/backup_20250805_113245"` |

## 🔄 Quick Commands

### Check Status
```powershell
# See all backups
Get-ChildItem backups/ | Sort-Object LastWriteTime -Descending

# Check current vs last backup
.\detect_changes.ps1
```

### Create Backup
```powershell
# Standard backup
.\backup.ps1

# Creates: backups/backup_20250805_113245/
# Also creates: backup_20250805_113245.zip
```

### Restore Project
```powershell
# List available backups
Get-ChildItem backups/backup_* -Directory | Select-Object Name, LastWriteTime

# Restore specific backup
.\restore.ps1 -BackupPath "backups/backup_20250805_113245"

# Restore from zip
.\restore.ps1 -BackupPath "backups/backup_20250805_113245.zip"
```

## 📁 What Gets Backed Up

### ✅ Always Included
- Source code (`app/`, `lib/`)
- Database schema (`prisma/`)
- Configuration files (`package.json`, `next.config.js`)
- Environment files (`.env`, `.env.local`)
- Templates and assets

### ❌ Always Excluded
- `node_modules/` (use `npm install` to restore)
- `.next/` (build output)
- Generated PDFs
- Log files

## 🎯 Common Scenarios

### Scenario 1: Daily Development
```powershell
# Start of day - check for overnight changes
.\detect_changes.ps1

# End of day - backup your work
.\backup.ps1
```

### Scenario 2: Before Major Changes
```powershell
# Create safety backup
.\backup.ps1

# Make your changes
# If something breaks, restore:
.\restore.ps1 -BackupPath "backups/backup_20250805_113245"
```

### Scenario 3: Moving to New Computer
```powershell
# On old computer - create final backup
.\backup.ps1

# Copy backup_20250805_113245.zip to new computer

# On new computer - restore
.\restore.ps1 -BackupPath "backup_20250805_113245.zip"
```

## 🔧 Troubleshooting

### Script Execution Policy
```powershell
# If you get execution policy error
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Missing Dependencies After Restore
```powershell
# Manual dependency installation
npm install
npx prisma generate
npx prisma migrate deploy
```

### Environment Variables
After restore, check `.env` file:
```bash
# Required variables:
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 📊 Backup Storage Tips

### Local Storage
```
project-folder/
├── backups/
│   ├── backup_20250805_113245/
│   ├── backup_20250805_143012/
│   └── backup_20250805_163045/
```

### Cloud Storage
```powershell
# Copy to OneDrive/Dropbox
Copy-Item "backups\backup_20250805_113245.zip" "C:\Users\YourName\OneDrive\ProjectBackups\"
```

### Cleanup Old Backups
```powershell
# Keep only last 5 backups
Get-ChildItem backups/backup_* -Directory | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -Skip 5 | 
    Remove-Item -Recurse -Force
```

## 🚨 Emergency Recovery

### Complete Project Loss
1. Clone/download your latest backup
2. Run: `.\restore.ps1 -BackupPath "path/to/backup"`
3. Update `.env` with your actual values
4. Run: `npm install`
5. Run: `npm run dev`

### Database Recovery
```powershell
# If database issues
npx prisma migrate reset
npx prisma migrate deploy
```

## 📞 Quick Reference Card

### One-Line Commands
```powershell
# Daily backup
.\backup.ps1

# Check changes
.\detect_changes.ps1

# Restore latest
.\restore.ps1 -BackupPath (Get-ChildItem backups/backup_* | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
```

### Keyboard Shortcuts
- **F5** in VS Code: Run current script
- **Ctrl+Shift+P**: PowerShell terminal
- **Up Arrow**: Previous commands

## 🎓 Next Steps
1. Run `.\detect_changes.ps1` to see current status
2. Run `.\backup.ps1` to create your first backup
3. Add backup reminder to your calendar
4. Test restore process on a copy of your project