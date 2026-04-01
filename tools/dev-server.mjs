import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const port = 5173;

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

function safePath(requestUrl) {
  const urlPath = new URL(requestUrl, 'http://localhost').pathname;
  const decodedPath = decodeURIComponent(urlPath);
  const normalized = path.normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, '');
  return path.join(rootDir, normalized);
}

async function readFileMaybe(filePath) {
  try {
    const data = await fs.readFile(filePath);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  let filePath = safePath(req.url);
  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    // fall through to attempt file read and return 404 if missing
  }

  const result = await readFileMaybe(filePath);
  if (!result.ok) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes.get(ext) || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
  });
  res.end(result.data);
});

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
  console.log(`Serving from ${rootDir}`);
});
