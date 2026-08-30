import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = '/app/browser';
const PORT = process.env.PORT || 4000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.ico': 'image/x-icon',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject', '.map': 'application/json',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

async function sendFile(res, file, status = 200) {
  const body = await readFile(file);
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    const s = await stat(file).catch(() => null);
    if (s && s.isFile()) return await sendFile(res, file);
    return await sendFile(res, join(ROOT, 'index.html'));
  } catch {
    try { return await sendFile(res, join(ROOT, 'index.html')); }
    catch { res.writeHead(500); res.end('server error'); }
  }
});

server.listen(PORT, () => console.log(`static server listening on :${PORT}`));
