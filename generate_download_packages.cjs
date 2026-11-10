const fs = require('fs');
const path = require('path');

const sectors = [
  {
    key: 'CLINIC_HMS',
    title: 'DigitalsNova Clinic & Hospital HMS',
    shortName: 'Clinic HMS',
    fileName: 'DigitalsNova-Clinic-HMS',
    desc: 'Hospital & Clinic Management System - OPD Tokens, EMR, Doctor Commissions.'
  },
  {
    key: 'RESTAURANT',
    title: 'DigitalsNova Restaurant & Cafe POS',
    shortName: 'Restaurant POS',
    fileName: 'DigitalsNova-Restaurant-POS',
    desc: 'Instant KOT, Dining Table Floor T1-T12, Waiter Tracking, Recipe Inventory.'
  },
  {
    key: 'PHARMACY',
    title: 'DigitalsNova Pharmacy Cloud POS',
    shortName: 'Pharmacy POS',
    fileName: 'DigitalsNova-Pharmacy-POS',
    desc: 'Batch & Expiry Date Tracking, Laser Barcode Scanning, Strips & Loose Dispenser.'
  },
  {
    key: 'RETAIL_MART',
    title: 'DigitalsNova Retail Mart & General Store',
    shortName: 'Retail Mart POS',
    fileName: 'DigitalsNova-Retail-POS',
    desc: 'High-speed Barcode Scanner Checkout, Hold Bill F4, 1-Click Z-Report Closing.'
  }
];

const targetDirs = [
  'downloads',
  'portal/downloads',
  'public/downloads',
  'dist/downloads',
  'digitalsnove-hostinger-cpanel/downloads'
];

// Clean up any obsolete broken stub .apk files and ensure target directories exist
targetDirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  } else {
    for (const f of fs.readdirSync(d)) {
      if (f.endsWith('.apk')) {
        try { fs.unlinkSync(path.join(d, f)); } catch (_) {}
      }
    }
  }
});

function escCmdUnquoted(str) {
  return String(str || '').replace(/[&|<>^]/g, '^$&').replace(/%/g, '%%');
}

function safeCmdQuoted(str) {
  return String(str || '').replace(/["%]/g, '').trim();
}

function buildWindowsSetupBat({ url, title, shortName, desc }) {
  const safeTitleCmd = escCmdUnquoted(title);
  const safeShortCmd = escCmdUnquoted(shortName);
  const lines = [
    '@echo off',
    'setlocal EnableExtensions',
    `title ${safeTitleCmd} - Windows Desktop Installer`,
    'echo ==============================================================================',
    `echo   ${safeTitleCmd.toUpperCase()}`,
    'echo   Windows Desktop App Shortcut Installer ^& Standalone POS Launcher',
    'echo ==============================================================================',
    'echo.',
    `set "DN_URL=${safeCmdQuoted(url)}"`,
    `set "DN_LINK_NAME=${safeCmdQuoted(shortName)} - DigitalsNova POS.lnk"`,
    `set "DN_DESC=${safeCmdQuoted(desc)}"`,
    'set "DN_BROWSER="',
    'if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" set "DN_BROWSER=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"',
    'if not defined DN_BROWSER if exist "%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe" set "DN_BROWSER=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"',
    'if not defined DN_BROWSER if exist "%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe" set "DN_BROWSER=%LOCALAPPDATA%\\Google\\Chrome\\Application\\chrome.exe"',
    'if not defined DN_BROWSER if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" set "DN_BROWSER=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"',
    'if not defined DN_BROWSER if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" set "DN_BROWSER=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"',
    'if not defined DN_BROWSER if exist "%LOCALAPPDATA%\\Microsoft\\Edge\\Application\\msedge.exe" set "DN_BROWSER=%LOCALAPPDATA%\\Microsoft\\Edge\\Application\\msedge.exe"',
    '',
    'if not defined DN_BROWSER goto :open_default',
    'set "VBS=%TEMP%\\dn_shortcut_%RANDOM%.vbs"',
    'if not defined VBS goto :launch_app',
    'echo [1/2] Creating Desktop ^& Start Menu shortcuts...',
    '(',
    '  echo Set oWS = WScript.CreateObject^("WScript.Shell"^)',
    '  echo Set oEnv = oWS.Environment^("Process"^)',
    '  echo sUrl = oEnv^("DN_URL"^)',
    '  echo sBrowser = oEnv^("DN_BROWSER"^)',
    '  echo sLink = oEnv^("DN_LINK_NAME"^)',
    '  echo sDesc = oEnv^("DN_DESC"^)',
    '  echo sDesktop = oWS.SpecialFolders^("Desktop"^)',
    '  echo sPrograms = oWS.SpecialFolders^("Programs"^)',
    '  echo Set oL1 = oWS.CreateShortcut^(sDesktop ^& "\\" ^& sLink^)',
    '  echo oL1.TargetPath = sBrowser',
    '  echo oL1.Arguments = "--app=" ^& Chr^(34^) ^& sUrl ^& Chr^(34^) ^& " --start-maximized"',
    '  echo oL1.Description = sDesc',
    '  echo oL1.IconLocation = sBrowser ^& ",0"',
    '  echo oL1.Save',
    '  echo Set oL2 = oWS.CreateShortcut^(sPrograms ^& "\\" ^& sLink^)',
    '  echo oL2.TargetPath = sBrowser',
    '  echo oL2.Arguments = "--app=" ^& Chr^(34^) ^& sUrl ^& Chr^(34^) ^& " --start-maximized"',
    '  echo oL2.Description = sDesc',
    '  echo oL2.IconLocation = sBrowser ^& ",0"',
    '  echo oL2.Save',
    ') > "%VBS%"',
    'cscript //nologo "%VBS%" >nul 2>&1',
    'if defined VBS if exist "%VBS%" del /f /q "%VBS%" >nul 2>&1',
    ':launch_app',
    `echo [2/2] Launching ${safeShortCmd} in standalone Desktop App Mode...`,
    'start "" "%DN_BROWSER%" --app="%DN_URL%" --start-maximized',
    'goto :done',
    ':open_default',
    'echo Chrome or Microsoft Edge not found in standard folders. Opening default browser...',
    'start "" "%DN_URL%"',
    ':done',
    'echo.',
    'echo Shortcut saved to your Desktop. You can close this window safely.',
    'exit /b 0',
    ''
  ];
  return lines.join('\r\n');
}

sectors.forEach(sec => {
  const url = `https://digitalsnova.com/portal/?sector=${sec.key}`;
  const batScript = buildWindowsSetupBat({
    url,
    title: sec.title,
    shortName: sec.shortName,
    desc: sec.desc
  });

  targetDirs.forEach(dest => {
    fs.writeFileSync(path.join(dest, `${sec.fileName}-Windows-Setup.bat`), batScript, 'utf8');
  });

  console.log(`✓ Generated ${sec.fileName}-Windows-Setup.bat (${batScript.length} bytes)`);
});

console.log('All sector Windows Desktop setup packages generated cleanly.');
