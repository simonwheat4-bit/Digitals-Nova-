@echo off
title DigitalsNova Retail Mart & General Store - Desktop POS Software
echo ==============================================================================
echo   DIGITALSNOVA RETAIL MART & GENERAL STORE
echo   Dedicated Cloud POS ^& Offline Desktop Client
echo ==============================================================================
echo.
echo Launching standalone POS window...

set "URL=https://digitalsnova.com/portal/?sector=RETAIL_MART"
set "BROWSER="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if defined BROWSER (
    start "" "%BROWSER%" --app="%URL%" --disable-translate --start-maximized --user-data-dir="%LOCALAPPDATA%\DigitalsNova\RETAIL_MART"
) else (
    start "" "%URL%"
)
exit
