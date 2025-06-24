const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware for Unity compressed files
app.use('/unity-builds', (req, res, next) => {
  const filePath = req.path;
  
  if (filePath.endsWith('.framework.js.gz')) {
    res.set({
      'Content-Encoding': 'gzip',
      'Content-Type': 'text/javascript',
      'Cache-Control': 'public, max-age=31536000'
    });
  } else if (filePath.endsWith('.data.gz')) {
    res.set({
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000'
    });
  } else if (filePath.endsWith('.wasm.gz')) {
    res.set({
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000'
    });
  } else if (filePath.endsWith('.loader.js')) {
    res.set({
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=31536000'
    });
  }
  
  next();
});

// Serve static files from build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Unity WebGL files will be served with proper compression headers');
});
