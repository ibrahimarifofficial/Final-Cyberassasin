# Git LFS Setup for Large Build Files

## Problem
`.next` folder ki files 25MB se zyada hain, isliye GitHub directly push nahi kar sakta.

## Solution: Git LFS (Large File Storage)

### Step 1: Git LFS Install karein
1. Download karein: https://git-lfs.github.com/
2. Install karein
3. Verify: `git lfs version`

### Step 2: Git LFS Initialize karein
```bash
git lfs install
```

### Step 3: Large files ko track karein
```bash
git lfs track ".next/**"
git lfs track ".next/cache/**"
git lfs track ".next/static/**"
git lfs track ".next/server/**"
```

### Step 4: Files add karein
```bash
git add .gitattributes
git add .next/
git commit -m "Add build files with Git LFS"
git push -u origin main
```

## Alternative: Without Git LFS

Agar Git LFS install nahi karna chahte, to:

1. `.next` folder ko compress karein (ZIP)
2. ZIP file ko GitHub Releases mein upload karein
3. Ya phir `.next` folder ko exclude karein (recommended - kyunki Vercel automatically build karega)

## Important Note
⚠️ **Best Practice**: Build files ko GitHub par push nahi karna chahiye kyunki:
- Vercel/Netlify automatically `npm run build` karte hain
- Build files har deployment par regenerate hote hain
- Repository size unnecessarily badh jata hai

Lekin agar aapko zaroorat hai, to Git LFS use karein.

