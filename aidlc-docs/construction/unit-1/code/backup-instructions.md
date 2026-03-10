# Backup Instructions - Unit 1

Run these commands before dependency re-resolution:

```bash
cp package-lock.json package-lock.json.backup
npm ls --all > dependency-tree-before.txt
```

If `cp` is unavailable in PowerShell, use:

```powershell
Copy-Item package-lock.json package-lock.json.backup
npm ls --all > dependency-tree-before.txt
```
