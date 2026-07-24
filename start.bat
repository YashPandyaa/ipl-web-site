@echo off
echo ==========================================
echo   CLEANING UP PORT CONFLICTS
echo ==========================================

:: Kill any process occupying port 3000
echo Freeing up Port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul

:: Kill any process occupying port 8000
echo Freeing up Port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a 2>nul

echo.
echo ==========================================
echo   STARTING IPL STATS UNIVERSE SERVERS
echo ==========================================

:: 1. Start Backend Django Server in a new window
echo [1/3] Launching Django Backend on Port 8000...
start "IPL Django Backend" cmd /k "cd backend && venv\Scripts\python.exe manage.py runserver 8000"

:: 2. Start Frontend Next.js Server in a new window
echo [2/3] Launching Next.js Frontend on Port 3000...
start "IPL Next.js Frontend" cmd /k "cd frontend && npm run dev"

:: Wait 3 seconds for the Next.js dev server to boot up
timeout /t 3 /nobreak >nul

:: 3. Open Google Chrome to the frontend address
echo [3/3] Opening Google Chrome to http://localhost:3000...
start chrome http://localhost:3000

echo ==========================================
echo   All systems started successfully!
echo ==========================================

