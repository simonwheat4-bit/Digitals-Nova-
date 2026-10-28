const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/Ubaid Ur Rehman/Downloads/Digitals Nove/digitalsnove-hostinger';
const cssContent = fs.readFileSync(path.join(baseDir, 'css/style.css'), 'utf8');
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html') && f !== 'index.html');

files.forEach(f => {
  const filePath = path.join(baseDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('<!-- Embedded Fallback Stylesheet -->')) {
    const styleTag = `\n  <!-- Embedded Fallback Stylesheet -->\n  <style>\n${cssContent}\n  </style>\n</head>`;
    content = content.replace('</head>', styleTag);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', f, 'with embedded fallback styling.');
  }
});
