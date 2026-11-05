import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);

function get(port, pathname, method = 'GET') {
  // http.request preserva os caminhos maliciosos; fetch normalizaria ../ antes do envio.
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path: pathname, method }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
    req.setTimeout(3000, () => req.destroy(new Error('Timeout HTTP')));
    req.end();
  });
}

test('servidor de prévia responde corretamente por HTTP', { timeout: 15000 }, async (t) => {
  const reservation = createServer();
  await new Promise((resolve, reject) => { reservation.once('error', reject); reservation.listen(0, '127.0.0.1', resolve); });
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, ['scripts/serve.mjs'], {
    cwd: fileURLToPath(root), env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => {
    if (child.exitCode !== null) return;
    await new Promise((resolve) => { child.once('exit', resolve); child.kill(); });
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Servidor não iniciou')), 5000);
    const finish = (callback, value) => { clearTimeout(timer); callback(value); };
    child.once('error', (error) => finish(reject, error));
    child.once('exit', (code) => finish(reject, new Error(`Servidor encerrou: ${code}`)));
    child.stdout.on('data', (data) => { if (String(data).includes('Prévia local:')) finish(resolve); });
  });

  const resources = [
    ['/', 'index.html', 'text/html'],
    ['/index.html', 'index.html', 'text/html'],
    ['/assets/styles.css', 'assets/styles.css', 'text/css'],
    ['/assets/favicon.svg', 'assets/favicon.svg', 'image/svg+xml'],
    ['/assets/foto-exemplo.svg', 'assets/foto-exemplo.svg', 'image/svg+xml'],
    ['/assets/FotoProfissional.jpeg', 'assets/FotoProfissional.jpeg', 'image/jpeg'],
    ['/assets/FotoProfissional2.jpeg', 'assets/FotoProfissional2.jpeg', 'image/jpeg'],
    ['/js/config.js', 'js/config.js', 'text/javascript'],
    ['/js/main.js', 'js/main.js', 'text/javascript'],
  ];
  for (const [url, filename, contentType] of resources) {
    await t.test(`GET ${url}`, async () => {
      const response = await get(port, url);
      assert.equal(response.status, 200);
      assert.ok(response.headers['content-type'].startsWith(contentType));
      assert.equal(response.headers['cache-control'], 'no-store');
      assert.deepEqual(response.body, await readFile(new URL(filename, root)));
      assert.equal(Number(response.headers['content-length']), response.body.length);
    });
  }
  await t.test('HEAD retorna os mesmos metadados, sem corpo', async () => {
    const head = await get(port, '/index.html', 'HEAD');
    const full = await get(port, '/index.html');
    assert.equal(head.status, 200);
    assert.equal(head.body.length, 0);
    assert.equal(head.headers['content-length'], full.headers['content-length']);
  });
  await t.test('query string não impede servir um recurso', async () => {
    assert.equal((await get(port, '/js/main.js?v=123')).status, 200);
  });
  for (const pathname of ['/js/games.js', '/jogos/memoria-emocoes/index.html', '/jogos/memoria-emocoes/game.js', '/jogos/memoria-emocoes/styles.css', '/.git/config', '/.env', '/scripts/serve.mjs', '/tests/interactions.test.mjs', '/assets/%2e%2e/%2e%2e/.env', '/assets/%5c..%5c..%5c.env', '/assets/%E0%A4%A', '/nao-existe.html', '/assets/']) {
    await t.test(`não expõe caminho ${pathname}`, async () => {
      assert.equal((await get(port, pathname)).status, 404);
    });
  }
  await t.test('POST é recusado e informa os métodos permitidos', async () => {
    const response = await get(port, '/index.html', 'POST');
    assert.equal(response.status, 405);
    assert.equal(response.headers.allow, 'GET, HEAD');
  });
});
