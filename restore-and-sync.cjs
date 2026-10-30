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

console.log('--- 1. Setting Authentic Agency Homepage as Root index.html ---');
// If netlify-live.html exists, that is the exact 100% authentic working live page from Netlify
if (fs.existsSync('netlify-live.html')) {
  fs.copyFileSync('netlify-live.html', 'index.html');
  console.log('✓ Restored root index.html directly from netlify-live.html');
} else if (fs.existsSync('agency-home.html')) {
  fs.copyFileSync('agency-home.html', 'index.html');
  console.log('✓ Restored root index.html from agency-home.html');
}

console.log('--- 2. Synchronizing to digitalsnove-hostinger-cpanel, public, and dist ---');
const targetDirectories = ['digitalsnove-hostinger-cpanel', 'public', 'dist'];

targetDirectories.forEach(destDir => {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy root HTML files
  if (fs.existsSync('index.html')) {
    fs.copyFileSync('index.html', path.join(destDir, 'index.html'));
  }
  if (fs.existsSync('cloud-pos-saas.html')) {
    fs.copyFileSync('cloud-pos-saas.html', path.join(destDir, 'cloud-pos-saas.html'));
  }
  if (fs.existsSync('agency-home.html')) {
    fs.copyFileSync('agency-home.html', path.join(destDir, 'agency-home.html'));
  }
  if (fs.existsSync('style.css')) {
    fs.copyFileSync('style.css', path.join(destDir, 'style.css'));
  }

  // Copy all other subpage HTML files
  const rootFiles = fs.readdirSync('.');
  rootFiles.forEach(file => {
    if (file.endsWith('.html') && file !== 'index.html' && file !== 'netlify-live.html') {
      fs.copyFileSync(file, path.join(destDir, file));
    }
  });

  // Copy folders: css, js, assets, portal
  ['css', 'js', 'assets', 'portal'].forEach(folder => {
    if (fs.existsSync(folder)) {
      copyFolderRecursiveSync(folder, path.join(destDir, folder));
    }
  });

  console.log(`✓ Synchronized root files and assets to: ${destDir}`);
});

// Also copy portal build assets to root assets/ so both ./assets/ and /assets/ resolve
if (fs.existsSync('portal/assets')) {
  copyFolderRecursiveSync('portal/assets', 'assets');
  targetDirectories.forEach(d => {
    copyFolderRecursiveSync('portal/assets', path.join(d, 'assets'));
  });
  console.log('✓ Synced portal JS/CSS chunks to assets/ directory');
}

console.log('--- 3. Writing Bulletproof Redirects & Netlify Config ---');
const redirectRules = `/admin              /portal/index.html?view=super-admin 200
/admin/*            /portal/index.html?view=super-admin 200
/super-admin        /portal/index.html?view=super-admin 200
/super-admin/*      /portal/index.html?view=super-admin 200
/portal/super-admin /portal/index.html?view=super-admin 200
/portal/admin       /portal/index.html?view=super-admin 200
/cloud-pos-saas     /cloud-pos-saas.html    200
/portal/*           /portal/index.html      200
`;

fs.writeFileSync('_redirects', redirectRules, 'utf8');
fs.writeFileSync('public/_redirects', redirectRules, 'utf8');
fs.writeFileSync('dist/_redirects', redirectRules, 'utf8');
fs.writeFileSync('digitalsnove-hostinger-cpanel/_redirects', redirectRules, 'utf8');
console.log('✓ Wrote _redirects to root, public/, dist/, and cPanel');

const tomlContent = `[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/admin"
  to = "/portal/index.html?view=super-admin"
  status = 200

[[redirects]]
  from = "/super-admin"
  to = "/portal/index.html?view=super-admin"
  status = 200

[[redirects]]
  from = "/portal/super-admin"
  to = "/portal/index.html?view=super-admin"
  status = 200

[[redirects]]
  from = "/portal/admin"
  to = "/portal/index.html?view=super-admin"
  status = 200

[[redirects]]
  from = "/cloud-pos-saas"
  to = "/cloud-pos-saas.html"
  status = 200

[[redirects]]
  from = "/portal/*"
  to = "/portal/index.html"
  status = 200
`;

fs.writeFileSync('netlify.toml', tomlContent, 'utf8');
console.log('✓ Wrote netlify.toml');

console.log('--- 4. Updating .htaccess ---');
const htaccessRules = `# ==============================================================================
# DigitalSnove — Hostinger / cPanel Apache Configuration (.htaccess)
# ==============================================================================

ErrorDocument 404 /404.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Dedicated Super Admin SaaS Control Panel Routes
  RewriteRule ^admin/?$ portal/index.html?view=super-admin [L,QSA]
  RewriteRule ^super-admin/?$ portal/index.html?view=super-admin [L,QSA]
  RewriteRule ^portal/super-admin/?$ portal/index.html?view=super-admin [L,QSA]
  RewriteRule ^portal/admin/?$ portal/index.html?view=super-admin [L,QSA]

  # Redirect /index.html to /
  RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /.*index\\.html\\ HTTP/ [NC]
  RewriteRule ^(.*)index\\.html$ /$1 [R=301,L]

  # Clean URLs
  RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /([^.]+)\\.html\\ HTTP/ [NC]
  RewriteRule ^ %1 [R=301,L]

  # If requested path does not exist as a directory, but exists with .html, serve it silently
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}\\.html -f
  RewriteRule ^(.*)$ $1.html [L]
</IfModule>

<IfModule mod_headers.c>
  # Disable caching on HTML so browser always displays latest live updates
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "-1"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE application/javascript application/x-javascript text/javascript
  AddOutputFilterByType DEFLATE application/json application/xml
  AddOutputFilterByType DEFLATE image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

AddDefaultCharset UTF-8
`;

fs.writeFileSync('.htaccess', htaccessRules, 'utf8');
fs.writeFileSync('dist/.htaccess', htaccessRules, 'utf8');
fs.writeFileSync('digitalsnove-hostinger-cpanel/.htaccess', htaccessRules, 'utf8');
console.log('✓ Wrote .htaccess to root, dist/, and digitalsnove-hostinger-cpanel/');

console.log('--- RESTORE & SYNC FINISHED SUCCESSFULLY! ---');
