# Installation Instructions - Unit 1

## Clean-Slate Reinstall

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm ls --all > dependency-tree-after.txt
npm audit
npm outdated
```

## PowerShell Equivalent

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
npm ls --all > dependency-tree-after.txt
npm audit
npm outdated
```

## Notes
- `--legacy-peer-deps` is temporary for staged migration.
- Build and runtime validation occur after install.
