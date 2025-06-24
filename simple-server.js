const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const BUILD_DIR = path.join(__dirname, 'build');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(BUILD_DIR, pathname);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found, serve index.html for React routing
      const indexPath = path.join(BUILD_DIR, 'index.html');
      fs.readFile(indexPath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
      return;
    }
    
    // File exists, serve it
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      
      const ext = path.extname(filePath);
      let contentType = mimeTypes[ext] || 'application/octet-stream';
      let headers = { 'Content-Type': contentType };
      
      // Special handling for Unity WebGL files
      if (pathname.includes('/unity-builds/')) {
        if (pathname.endsWith('.framework.js.gz')) {
          headers = {
            'Content-Encoding': 'gzip',
            'Content-Type': 'text/javascript',
            'Cache-Control': 'public, max-age=31536000'
          };
        } else if (pathname.endsWith('.data.gz')) {
          headers = {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000'
          };
        } else if (pathname.endsWith('.wasm.gz')) {
          headers = {
            'Content-Encoding': 'gzip',
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'public, max-age=31536000'
          };
        } else if (pathname.endsWith('.loader.js')) {
          headers = {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'public, max-age=31536000'
          };
        }
      }
      
      res.writeHead(200, headers);
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Unity WebGL files will be served with proper compression headers');
  console.log('- framework.js.gz: Content-Type: text/javascript + gzip');
  console.log('- data.gz & wasm.gz: Content-Type: application/octet-stream + gzip');
});
