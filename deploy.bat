@echo off
REM ============================================================
REM  TAPP - one-click GitHub push helper (Windows)
REM  Double-click this file, paste your GitHub repo URL when asked.
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ====================================================
echo   TAPP  -  push to GitHub
echo ====================================================
echo.

REM --- check git is installed ---
where git >nul 2>nul
if errorlevel 1 (
  echo [X] Git is not installed or not on PATH.
  echo     Install it from https://git-scm.com/download/win
  echo     then re-run this file.
  echo.
  pause
  exit /b 1
)

REM --- clear any partial .git folder from earlier attempts ---
if exist ".git" (
  echo Removing existing .git folder...
  rmdir /s /q ".git"
)

REM --- ask for the repo URL ---
echo Create an EMPTY repo at https://github.com/new  (no README),
echo then copy its URL. It looks like:
echo     https://github.com/your-username/tapp.git
echo.
set /p REPO="Paste your GitHub repo URL: "

if "%REPO%"=="" (
  echo [X] No URL entered. Exiting.
  pause
  exit /b 1
)

echo.
echo --- Initialising repository ---
git init || goto :fail

REM --- make sure git knows who you are (needed to commit) ---
git config user.name "EwillAI"
git config user.email "35ejwilliams@gmail.com"

echo --- Staging files ---
git add . || goto :fail
echo --- Creating commit ---
git commit -m "TAPP: Analyze, Copilot, Trade, Dashboard" || goto :fail
git branch -M main || goto :fail

echo.
echo --- Connecting to GitHub and pushing ---
git remote remove origin >nul 2>nul
git remote add origin "%REPO%" || goto :fail
git push -u origin main || goto :fail

echo.
echo ====================================================
echo   SUCCESS - code is on GitHub.
echo   Next: import the repo at https://vercel.com
echo   (see DEPLOY.md, steps 2-3, for the env keys).
echo ====================================================
echo.
pause
exit /b 0

:fail
echo.
echo [X] Something went wrong above. Read the last message,
echo     fix it, and run this file again. Common causes:
echo       - wrong repo URL
echo       - GitHub login prompt was cancelled
echo       - repo already had commits (create a fresh empty repo)
echo.
pause
exit /b 1
