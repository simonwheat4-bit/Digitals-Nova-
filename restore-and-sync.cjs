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

console.log('--- 1. Restoring Root Files from digitalsnove-hostinger-cpanel ---');
const cpanelDir = 'digitalsnove-hostinger-cpanel';
const allFiles = fs.readdirSync(cpanelDir);

allFiles.forEach(file => {
  const src = path.join(cpanelDir, file);
  const stat = fs.lstatSync(src);
  if (stat.isDirectory()) {
    console.log('Syncing directory to root:', file);
    copyFolderRecursiveSync(src, file);
  } else {
    console.log('Syncing file to root:', file);
    fs.copyFileSync(src, file);
  }
});

console.log('--- 2. Syncing to public/ and dist/ ---');
['public', 'dist'].forEach(destDir => {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  allFiles.forEach(file => {
    const src = path.join(cpanelDir, file);
    const dest = path.join(destDir, file);
    const stat = fs.lstatSync(src);
    if (stat.isDirectory()) {
      copyFolderRecursiveSync(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  });

  // Write _redirects to both
  const redirects = `/cloud-pos-saas    /cloud-pos-saas.html    200
/portal/*          /portal/index.html      200
`;
  fs.writeFileSync(path.join(destDir, '_redirects'), redirects, 'utf8');
});

// Also write _redirects to root
const rootRedirects = `/cloud-pos-saas    /cloud-pos-saas.html    200
/portal/*          /portal/index.html      200
`;
fs.writeFileSync('_redirects', rootRedirects, 'utf8');

console.log('--- 3. Updating netlify.toml ---');
const toml = `[build]
  publish = "."

[[redirects]]
  from = "/cloud-pos-saas"
  to = "/cloud-pos-saas.html"
  status = 200

[[redirects]]
  from = "/portal/*"
  to = "/portal/index.html"
  status = 200
`;
fs.writeFileSync('netlify.toml', toml, 'utf8');

console.log('--- RESTORE & SYNC FINISHED SUCCESSFULLY! ---');
