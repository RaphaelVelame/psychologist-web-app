import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

// Servidor de desenvolvimento: publica somente os arquivos do site em loopback.
const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const filename = path.resolve(root, relative);
    const safePath = path.relative(root, filename);
    if (
      safePath.startsWith('..') ||
      path.isAbsolute(safePath) ||
      safePath.split(path.sep).some((part) => part.startsWith('.')) ||
      !(relative === 'index.html' || /^(assets|js)\//.test(relative))
    ) {
      response.writeHead(404).end('Não encontrado');
      return;
    }
    const contentType = mimeTypes[path.extname(filename)];
    if (!contentType || !(await stat(filename)).isFile()) {
      response.writeHead(404).end('Não encontrado');
      return;
    }
    const content = await readFile(filename);
    response.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      'Cache-Control': 'no-store',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404).end('Não encontrado');
  }
});
server.on('error', (error) => {
  console.error(`Não foi possível iniciar a prévia: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`Prévia local: http://127.0.0.1:${port}`));
