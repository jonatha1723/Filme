import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from dist/public
const publicPath = join(__dirname, 'dist', 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
} else {
  console.warn(`Public directory not found at ${publicPath}`);
}

// API routes - proxy to the built server
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API not configured' });
});

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
