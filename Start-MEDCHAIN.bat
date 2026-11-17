
@echo off
title MEDCHAIN Launcher

set "PROJECT_DIR=C:\Users\Lenovo\Documents\Antigravity-Projects\IPFS and BLOCKCHAIN Based Secure Medical Data Strorage\medchain"

echo Starting MEDCHAIN...
start "MEDCHAIN Server" cmd /k "cd /d ""%PROJECT_DIR%"" && npm run dev"

timeout /t 8 /nobreak >nul

echo Starting Cloudflare Tunnel...
start "MEDCHAIN Public Link" cmd /k "cloudflared tunnel --url http://localhost:3000"

echo.
echo Both processes have been started.
pause

