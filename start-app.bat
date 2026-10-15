@echo off
title Insigra Reports Portal - Dev Server
cd /d "%~dp0"

echo =========================================================
echo       INSIGRA REPORTS - MULTI-TENANT ANALYTICS PORTAL
echo =========================================================
echo.

if not exist node_modules (
    echo [1/2] Installing dependencies with npm...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed. Please check your internet connection or Node.js install.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed.
)

echo.
echo [2/2] Starting Vite development server...
echo The app will open in your default browser at http://localhost:5173
echo.
call npm run dev

pause
