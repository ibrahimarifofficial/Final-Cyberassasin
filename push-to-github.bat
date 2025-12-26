@echo off
echo Initializing Git repository...
git init

echo Adding all files...
git add .

echo Committing files...
git commit -m "Initial commit: Production-ready CyberAssassin website"

echo Setting branch to main...
git branch -M main

echo Adding remote repository...
git remote add origin https://github.com/ibrahimarifofficial/cyber-build.git

echo Pushing to GitHub...
git push -u origin main

echo Done! Your code has been pushed to GitHub.
pause

