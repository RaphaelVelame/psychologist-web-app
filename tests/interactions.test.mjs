import test from 'node:test';
import assert from 'node:assert/strict';
import { loadBrowser } from './helpers/browser.mjs';

test('renderiza os serviços, perguntas e dados da configuração', async () => {
  const app = await loadBrowser();
  const config = app.window.SITE_CONFIG;
  assert.equal(app.$$('#service-grid article').length, config.servicos.length);
  assert.equal(app.$$('#faq-list details').length, config.perguntas.length);
  assert.equal(app.document.title, `${config.nome} | Psicóloga`);
  assert.equal(app.$('#current-year').textContent, String(new Date().getFullYear()));
  for (const node of app.$$('[data-bind="crp"]')) assert.equal(node.textContent, `· ${config.crp}`);
});

test('trata os textos configurados como texto, sem criar HTML', async () => {
  const payload = '<img src=x onerror=alert(1)>';
  const app = await loadBrowser({ configure(window) {
    window.SITE_CONFIG.heroTitle = payload;
    window.SITE_CONFIG.servicos[0].titulo = payload;
    window.SITE_CONFIG.perguntas[0].resposta = payload;
  } });
  assert.equal(app.$('[data-bind="heroTitle"]').textContent, payload);
  assert.equal(app.$('#service-grid h3').textContent, payload);
  assert.equal(app.$('#faq-list p').textContent, payload);
  assert.equal(app.$$('#service-grid img').length, 0);
  assert.equal(app.$$('#faq-list img').length, 0);
});

test('só oculta os avisos de preparação quando a demonstração é false', async () => {
  const demo = await loadBrowser();
  assert.equal(demo.$('#demo-banner').hidden, false);
  const live = await loadBrowser({ configure: (window) => { window.SITE_CONFIG.modoDemonstracao = false; } });
  assert.equal(live.$('#demo-banner').hidden, true);
  assert.equal(live.$('#services-hint').hidden, true);
});

test('substitui uma foto indisponível pela ilustração de fallback', async () => {
  const app = await loadBrowser();
  const photo = app.$('#profile-photo');
  photo.dispatch('error');
  assert.equal(photo.src, 'assets/foto-exemplo.svg');
  assert.match(photo.alt, /fotografia indisponível/);
});

test('menu alterna estado e fecha por Escape devolvendo o foco', async () => {
  const app = await loadBrowser();
  const menu = app.$('#menu-toggle');
  menu.click();
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  assert.equal(menu.getAttribute('aria-label'), 'Fechar menu');
  assert.equal(app.$('#primary-nav').classList.contains('is-open'), true);
  app.document.dispatch('keydown', { key: 'Escape' });
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(app.document.activeElement, menu);
});

for (const action of ['link', 'fora', 'redimensionamento', 'segundo clique']) {
  test(`menu fecha por ${action}`, async () => {
    const app = await loadBrowser();
    app.$('#menu-toggle').click();
    if (action === 'link') app.$('#primary-nav a').click();
    if (action === 'fora') app.$('#conteudo').click();
    if (action === 'redimensionamento') app.media.dispatch('change');
    if (action === 'segundo clique') app.$('#menu-toggle').click();
    assert.equal(app.$('#menu-toggle').getAttribute('aria-expanded'), 'false');
    assert.equal(app.$('#primary-nav').classList.contains('is-open'), false);
  });
}

test('contatos configurados geram os destinos e a mensagem corretos', async () => {
  const app = await loadBrowser();
  const whatsapp = app.$('[data-contact="whatsapp"]');
  const url = new URL(whatsapp.href);
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, `/${app.window.SITE_CONFIG.whatsapp}`);
  assert.equal(url.searchParams.get('text'), app.window.SITE_CONFIG.mensagemWhatsapp);
  assert.equal(whatsapp.rel, 'noopener noreferrer');
  assert.equal(whatsapp.target, '_blank');
  const email = new URL(app.$('[data-contact="email"]').href);
  assert.equal(email.protocol, 'mailto:');
  assert.equal(decodeURIComponent(email.pathname), app.window.SITE_CONFIG.email);
  assert.equal(email.searchParams.get('subject'), 'Informações sobre atendimento');
});

for (const invalid of ['', 'javascript:alert(1)', 'valor?subject=injetado']) {
  test(`contatos inválidos são bloqueados: ${JSON.stringify(invalid)}`, async () => {
    const app = await loadBrowser({ configure(window) {
      window.SITE_CONFIG.whatsapp = invalid;
      window.SITE_CONFIG.email = invalid;
    } });
    for (const link of app.$$('[data-contact]')) {
      assert.equal(link.getAttribute('aria-disabled'), 'true');
      assert.equal(link.click().defaultPrevented, true);
      assert.equal(app.$('#toast').hidden, false);
    }
    app.advance(4300);
    assert.equal(app.$('#toast').hidden, true);
  });
}
