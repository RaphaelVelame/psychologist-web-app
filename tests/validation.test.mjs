import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const execFileAsync = promisify(execFile);

async function validate(directory, publication = false) {
  try {
    const result = await execFileAsync(process.execPath, [path.join(directory, 'scripts/validate.mjs'), ...(publication ? ['--publicacao'] : [])]);
    return { code: 0, output: result.stdout + result.stderr };
  } catch (error) {
    if (typeof error.code !== 'number') throw error;
    return { code: error.code, output: error.stdout + error.stderr };
  }
}

async function fixture(t, edit = async () => {}) {
  // As falhas são introduzidas em cópias descartáveis, nunca nos dados reais.
  const directory = await mkdtemp(path.join(tmpdir(), 'psychologist-tests-'));
  t.after(async () => {
    assert.equal(path.dirname(directory), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('psychologist-tests-'));
    await rm(directory, { recursive: true, force: true });
  });
  for (const filename of ['index.html', 'assets', 'js', 'scripts']) {
    await cp(new URL(filename, root), path.join(directory, filename), { recursive: true });
  }
  await edit(async (filename, transform) => {
    const target = path.join(directory, filename);
    await writeFile(target, transform(await readFile(target, 'utf8')));
  });
  return directory;
}

test('validador técnico aprova os arquivos atuais', async () => {
  const result = await validate(fileURLToPath(root));
  assert.equal(result.code, 0, result.output);
});

const failures = [
  ['sintaxe JavaScript inválida', 'js/main.js', (source) => source + '\nconst = ;', /js[\\/]main\.js/],
  ['arquivo ausente', 'index.html', (source) => source.replace('assets/styles.css', 'assets/ausente.css'), /arquivo ausente/i],
  ['capitalização incompatível com Linux', 'index.html', (source) => source.replace('assets/styles.css', 'assets/STYLES.css'), /capitalização incorreta/i],
  ['âncora inexistente', 'index.html', (source) => source.replace('href="#sobre"', 'href="#inexistente"'), /âncora inexistente/],
  ['ID HTML duplicado', 'index.html', (source) => source.replace('<body>', '<body><div id="inicio"></div>'), /IDs duplicados/],
];
for (const [name, filename, change, message] of failures) {
  test(`validador detecta ${name}`, async (t) => {
    const directory = await fixture(t, (edit) => edit(filename, change));
    const result = await validate(directory);
    assert.equal(result.code, 1, result.output);
    assert.match(result.output, message);
  });
}

test('publicação recusa demonstração e conteúdo provisório', async (t) => {
  const directory = await fixture(t, (edit) => edit('js/config.js', (source) => source + "\nwindow.SITE_CONFIG.modoDemonstracao = true; window.SITE_CONFIG.aboutBody = 'Substitua este texto';"));
  const result = await validate(directory, true);
  assert.equal(result.code, 1);
  assert.match(result.output, /modoDemonstracao/);
  assert.match(result.output, /config.aboutBody/);
});

test('publicação recusa dados obrigatórios vazios e contatos inválidos', async (t) => {
  const directory = await fixture(t, (edit) => edit('js/config.js', (source) => source + "\nObject.assign(window.SITE_CONFIG, { nome: '', crp: '', whatsapp: '123', email: 'invalido', servicos: [], perguntas: [] });"));
  const result = await validate(directory, true);
  assert.equal(result.code, 1);
  for (const message of ['Preencher nome', 'Preencher crp', 'Conferir WhatsApp', 'Conferir o e-mail', 'Preencher servicos', 'Preencher perguntas']) {
    assert.ok(result.output.includes(message), result.output);
  }
});

test('publicação aprova fixture sem placeholders e com dados de exemplo válidos', async (t) => {
  const directory = await fixture(t, (edit) => edit('js/config.js', (source) => source + `
    Object.assign(window.SITE_CONFIG, {
      modoDemonstracao: false, nome: 'Profissional de exemplo', crp: 'Registro de exemplo',
      whatsapp: '5511999999999', email: 'contato@example.com',
      aboutLead: 'Trajetória profissional.', aboutBody: 'Apresentação profissional.',
      servicos: [{ titulo: 'Atendimento', descricao: 'Informações sobre atendimento.' }],
      perguntas: [{ pergunta: 'Como agendar?', resposta: 'Entre em contato.' }],
    });`));
  const result = await validate(directory, true);
  assert.equal(result.code, 0, result.output);
  assert.match(result.output, /Verificação de publicação concluída/);
});
