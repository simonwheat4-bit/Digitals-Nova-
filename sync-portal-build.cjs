const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitalsnove client portal/dist';
const rootDir = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitals Nove';

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach((file) => {
      const curSource = path.join(source, file);
      const curTarget = path.join(target, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, curTarget);
      } else {
        fs.copyFileSync(curSource, curTarget);
      }
    });
  }
}

// 1. Copy dist to portal/
const portalTargets = [
  path.join(rootDir, 'portal'),
  path.join(rootDir, 'dist/portal'),
  path.join(rootDir, 'digitalsnove-hostinger-cpanel/portal'),
  path.join(rootDir, 'public/portal')
];

portalTargets.forEach(dest => {
  copyFolderRecursiveSync(srcDir, dest);
  console.log('✓ Synced portal build to:', dest);
});

// 2. Also ensure base href or relative paths work in portal/index.html
portalTargets.forEach(dest => {
  const indexPath = path.join(dest, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    // Ensure base href is set so scripts load correctly regardless of whether the URL is /super-admin or /portal
    if (!content.includes('<base href="/portal/">')) {
      content = content.replace('<head>', '<head>\n    <base href="/portal/">');
      fs.writeFileSync(indexPath, content, 'utf8');
    }
  }
});
console.log('✓ Added base href to portal/index.html');

// 3. Copy dist/assets to root assets/ and subfolder assets/ so any asset request succeeds
const assetTargets = [
  path.join(rootDir, 'assets'),
  path.join(rootDir, 'dist/assets'),
  path.join(rootDir, 'digitalsnove-hostinger-cpanel/assets'),
  path.join(rootDir, 'public/assets')
];

const builtAssetsDir = path.join(srcDir, 'assets');
if (fs.existsSync(builtAssetsDir)) {
  assetTargets.forEach(target => {
    copyFolderRecursiveSync(builtAssetsDir, target);
    console.log('✓ Synced JS/CSS assets to:', target);
  });
}

console.log('--- Portal build sync complete! ---');
