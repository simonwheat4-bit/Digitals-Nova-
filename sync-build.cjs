const fs = require('fs');
const path = require('path');

console.log('--- 1. Syncing cloud-pos-saas.html to public and root ---');
fs.copyFileSync('digitalsnove-hostinger-cpanel/cloud-pos-saas.html', 'public/cloud-pos-saas.html');
fs.copyFileSync('digitalsnove-hostinger-cpanel/cloud-pos-saas.html', 'cloud-pos-saas.html');
console.log('Copied cloud-pos-saas.html');

console.log('--- 2. Syncing HTML pages to public ---');
const files = fs.readdirSync('digitalsnove-hostinger-cpanel');
files.forEach((f) => {
  if (f.endsWith('.html') && f !== 'index.html') {
    fs.copyFileSync(path.join('digitalsnove-hostinger-cpanel', f), path.join('public', f));
  }
});
console.log('Synced subpages to public/');

console.log('--- 3. Writing public/_redirects ---');
const redirects = `/cloud-pos-saas    /cloud-pos-saas.html    200
/portal/*          /portal/index.html      200
/*                 /index.html             200
`;
fs.writeFileSync('public/_redirects', redirects, 'utf8');

console.log('--- 4. Writing netlify.toml ---');
const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/cloud-pos-saas"
  to = "/cloud-pos-saas.html"
  status = 200

[[redirects]]
  from = "/portal/*"
  to = "/portal/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
fs.writeFileSync('netlify.toml', netlifyToml, 'utf8');

console.log('--- 5. Sync complete! ---');
