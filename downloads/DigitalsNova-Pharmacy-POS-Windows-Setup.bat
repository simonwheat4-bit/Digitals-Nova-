@echo off
title DigitalsNova Pharmacy Cloud POS - Desktop POS Software
echo ==============================================================================
echo   DIGITALSNOVA PHARMACY CLOUD POS
echo   Dedicated Cloud POS ^& Offline Desktop Client
echo ==============================================================================
echo.
echo Launching standalone POS window...

set "URL=https://digitalsnova.com/portal/?sector=PHARMACY"
set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if defined BROWSER (
    start "" "%BROWSER%" --app="%URL%" --disable-translate --start-maximized --user-data-dir="%LOCALAPPDATA%\DigitalsNova\PHARMACY"
) else (
    start "" "%URL%"
)
exit
