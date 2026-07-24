@echo off
if /i "%~1"=="web-site" (
    call "%~dp0start.bat"
) else (
    echo.
    echo  Invalid argument!
    echo  Usage: ipl web-site
    echo.
)
