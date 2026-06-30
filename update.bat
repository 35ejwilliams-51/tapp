@echo off
REM ============================================================
REM  TAPP - push updates live (Windows)
REM  Double-click to send your latest changes to GitHub.
REM  Vercel auto-rebuilds the live site in about a minute.
REM ============================================================
setlocal
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo [X] Git is not installed. Get it from https://git-scm.com/download/win
  pause
  exit /b 1
)

if not exist ".git" (
  echo [X] This folder isn't connected to GitHub yet.
  echo     Run deploy.bat first (one-time setup), then use this file for updates.
  pause
  exit /b 1
)

echo --- Saving and pushing your changes ---
git add .
git commit -m "TAPP update %date% %time%"
if errorlevel 1 (
  echo.
  echo Nothing new to push, or commit failed. If it says "nothing to commit",
  echo your latest changes are already live.
  pause
  exit /b 0
)
git push
if errorlevel 1 (
  echo.
  echo [X] Push failed. If a GitHub login window appeared, approve it and run again.
  pause
  exit /b 1
)

echo.
echo ====================================================
echo   Pushed. Vercel will redeploy in about a minute.
echo   Refresh your site to see the updates.
echo ====================================================
pause
