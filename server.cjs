const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Auto-detect public directory containing index.html
const candidateDirs = [
  path.join(__dirname, 'digitalsnove-hostinger-cpanel'),
  path.join(__dirname, 'digitalsnove-hostinger'),
  path.join(__dirname, 'public'),
  __dirname
];
let PUBLIC_DIR = candidateDirs.find(d => fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html'))) || candidateDirs[0];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (!reqPath || reqPath === '/') reqPath = '/index.html';

  let cleanPath = reqPath.replace(/\/$/, '');
  let filePath = path.join(PUBLIC_DIR, cleanPath);

  // If path doesn't have an extension, try matching .html or /index.html
  if (!path.extname(cleanPath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Check if file exists and is a file
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 fallback to 404.html
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      if (fs.existsSync(notFoundPath)) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        fs.createReadStream(notFoundPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception caught:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection caught:', reason);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DigitalSnove Localhost Server running at: http://localhost:${PORT}`);
  console.log(`Serving files from: ${PUBLIC_DIR}`);
  console.log(`Direct link to SaaS: http://localhost:${PORT}/cloud-pos-saas`);
});
