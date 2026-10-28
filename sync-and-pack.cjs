const fs = require('fs');
const path = require('path');

const srcPortal = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitalsnove client portal/dist';
const targetDirs = [
  'digitalsnove-hostinger-cpanel/portal',
  'public/portal',
  'dist/portal'
];

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src).forEach((item) => {
    const s = path.join(src, item);
    const d = path.join(dest, item);
    if (fs.statSync(s).isDirectory()) {
      copyRecursiveSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  });
}

console.log('--- 1. Copying fresh portal build ---');
targetDirs.forEach((td) => {
  copyRecursiveSync(srcPortal, td);
  console.log('Copied to', td);

  // Fix relative links in portal/index.html
  const indexPath = path.join(td, 'index.html');
  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.replace(/href="\/manifest\.json"/g, 'href="./manifest.json"');
    html = html.replace(/src="\/assets\//g, 'src="./assets/');
    html = html.replace(/href="\/assets\//g, 'href="./assets/');
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Fixed relative paths in', indexPath);
  }
});

console.log('--- Portal build sync complete ---');
