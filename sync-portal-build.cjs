const fs = require('fs');
const path = require('path');

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

const portalDist = path.resolve('..', 'Digitalsnove client portal', 'dist');
console.log('Syncing from:', portalDist);

const targetPortalDirs = [
  path.resolve('portal'),
  path.resolve('public', 'portal'),
  path.resolve('dist', 'portal'),
  path.resolve('digitalsnove-hostinger-cpanel', 'portal')
];

targetPortalDirs.forEach(dir => {
  console.log('Copying to:', dir);
  copyFolderRecursiveSync(portalDist, dir);
});

console.log('✓ Successfully synced compiled client portal to all 4 locations!');
