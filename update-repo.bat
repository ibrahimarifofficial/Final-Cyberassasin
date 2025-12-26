@echo off
echo ========================================
echo GitHub Repository Update Script
echo Repository: final cyberassassin
echo ========================================
echo.

echo Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo OR use GitHub Desktop: https://desktop.github.com/
    echo.
    pause
    exit /b 1
)

echo Git is installed!
echo.

echo Current directory:
cd
echo.

echo Initializing Git repository (if not already)...
git init

echo.
echo Adding all files...
git add .

echo.
echo Creating commit...
git commit -m "Update: Modern login page, SEO improvements, admin dashboard enhancements, logo updates"

echo.
echo ========================================
echo IMPORTANT: Next Steps
echo ========================================
echo.
echo 1. Connect to your GitHub repository:
echo    git remote add origin https://github.com/YOUR_USERNAME/final-cyberassassin.git
echo.
echo    OR if already connected:
echo    git remote set-url origin https://github.com/YOUR_USERNAME/final-cyberassassin.git
echo.
echo 2. Push to GitHub:
echo    git branch -M main
echo    git push -u origin main
echo.
echo Replace YOUR_USERNAME with your actual GitHub username!
echo.
pause

