import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const publication = process.argv.includes('--publicacao');
const errors = [];
const pending = [];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist')
      continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(filename)));
    else files.push(filename);
  }
  return files;
}

// Confere maiúsculas/minúsculas mesmo no Windows, pois a hospedagem pode usar Linux.
async function checkLocalFile(filename, origin) {
  const relative = path.relative(root, filename);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    errors.push(`${origin}: caminho fora do projeto.`);
    return;
  }
  let current = root;
  try {
    for (const part of relative.split(path.sep)) {
      if (!(await readdir(current)).includes(part))
        throw new Error('Arquivo ausente ou nome incorreto');
      current = path.join(current, part);
    }
    if (!(await stat(current)).isFile()) throw new Error('O caminho não é um arquivo');
  } catch {
    errors.push(`${origin}: arquivo ausente ou capitalização incorreta: ${relative}`);
  }
}

const files = await listFiles(root);
for (const filename of files) {
  const extension = path.extname(filename);
  const relative = path.relative(root, filename);
  if (!['.html', '.css', '.js', '.mjs'].includes(extension)) continue;
  const source = await readFile(filename, 'utf8');
  if (extension === '.js') {
    try {
      new vm.Script(source, { filename: relative });
    } catch (error) {
      errors.push(`${relative}: ${error.message}`);
    }
  }
  if (extension === '.html') {
    const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    if (new Set(ids).size !== ids.length) errors.push(`${relative}: IDs duplicados.`);
    for (const match of source.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
      if (target.startsWith('#')) {
        if (!ids.includes(target.slice(1)))
          errors.push(`${relative}: âncora inexistente: ${target}`);
        continue;
      }
      await checkLocalFile(path.resolve(path.dirname(filename), target.split(/[?#]/)[0]), relative);
    }
  }
}

const context = vm.createContext({ window: {} });
new vm.Script(await readFile(path.join(root, 'js/config.js'), 'utf8')).runInContext(context, {
  timeout: 1000,
});
const config = context.window.SITE_CONFIG;
if (!config || typeof config !== 'object') throw new Error('Configuração inválida.');
if (typeof config.foto === 'string' && config.foto) {
  await checkLocalFile(path.resolve(root, config.foto), 'config.foto');
}

if (publication) {
  if (config.modoDemonstracao !== false)
    pending.push('Desativar modoDemonstracao depois de revisar o conteúdo.');
  for (const field of ['nome', 'crp', 'foto', 'fotoAlt', 'aboutLead', 'aboutBody']) {
    if (typeof config[field] !== 'string' || !config[field].trim())
      pending.push(`Preencher ${field}.`);
  }
  if (!/^[1-9]\d{11,14}$/.test(config.whatsapp || ''))
    pending.push('Conferir WhatsApp com DDI, DDD e número.');
  if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(config.email || ''))
    pending.push('Conferir o e-mail profissional.');
  for (const field of ['servicos', 'perguntas']) {
    if (!Array.isArray(config[field]) || !config[field].length) pending.push(`Preencher ${field}.`);
  }
  const placeholder =
    /substitua|descreva aqui|apresente, se|esclareça se|texto demonstrativo|personalize esta|atualize este|explique aqui|este é o espaço para apresentar|este trecho pode apresentar/i;
  function findPlaceholders(value, field = 'config') {
    if (typeof value === 'string' && placeholder.test(value))
      pending.push(`Revisar texto provisório em ${field}.`);
    else if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) findPlaceholders(item, `${field}.${key}`);
    }
  }
  findPlaceholders(config);
}

for (const message of errors) console.error(`ERRO: ${message}`);
for (const message of pending) console.error(`PENDENTE: ${message}`);
if (errors.length || pending.length) {
  console.error(
    `${errors.length} erro(s) técnico(s); ${pending.length} pendência(s) de publicação.`
  );
  process.exitCode = 1;
} else {
  console.log(
    publication
      ? 'Verificação de publicação concluída.'
      : 'Sintaxe, arquivos e âncoras verificados.'
  );
}
if (publication)
  console.log(
    'Esta verificação não confirma dados profissionais, entrega dos contatos ou funcionamento no navegador.'
  );
