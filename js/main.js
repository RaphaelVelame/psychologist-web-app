
(function () {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const jogos = window.SITE_GAMES || [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const campos = ['heroTitle', 'heroDescription', 'heroNote', 'aboutLead', 'aboutBody',
    'philosophyTitle', 'philosophyBody', 'contactDescription'];
  campos.forEach((campo) => {
    const node = $(`[data-bind="${campo}"]`);
    if (node && typeof config[campo] === 'string') {
      if (campo === 'heroTitle') {
        const partes = config[campo].trim().match(/^(.*\s)(\S+)$/);
        if (partes) { node.replaceChildren(document.createTextNode(partes[1]), el('em', '', partes[2])); }
        else node.textContent = config[campo];
      } else node.textContent = config[campo];
    }
  });
  $$('[data-bind="nome"]').forEach((node) => { node.textContent = config.nome || 'Gabriela Medeiros Mota'; });
  document.title = `${config.nome || 'Gabriela Medeiros Mota'} | Psicóloga`;
  const crp = config.crp ? `· ${config.crp}` : '· CRP a preencher';
  $$('[data-bind="crp"]').forEach((node) => { node.textContent = crp; });
  $('#current-year').textContent = String(new Date().getFullYear());
  if (!config.modoDemonstracao) {
    $('#demo-banner').hidden = true;
    $('#services-hint').hidden = true;
  }
  if (config.foto) {
    const foto = $('#profile-photo');
    foto.src = config.foto;
    if (config.fotoAlt) foto.alt = config.fotoAlt;
    foto.addEventListener('error', () => {
      foto.src = 'assets/foto-exemplo.svg';
      foto.alt = 'Imagem ilustrativa: fotografia indisponível';
    }, { once: true });
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }
  function montarServicos() {
    const area = $('#service-grid');
    area.replaceChildren();
    (config.servicos || []).forEach((item) => {
      const card = el('article', 'service-card');
      const top = el('div', 'service-top');
      top.append(el('span', 'service-symbol', item.simbolo || '✳'), el('span', 'service-number', item.numero));
      card.append(top, el('h3', '', item.titulo), el('p', '', item.descricao), el('span', 'service-detail', item.detalhe || 'Saiba mais no contato'));
      area.append(card);
    });
  }
  function montarPerguntas() {
    const area = $('#faq-list');
    area.replaceChildren();
    (config.perguntas || []).forEach((item) => {
      const details = el('details', 'faq-item');
      details.append(el('summary', '', item.pergunta), el('p', '', item.resposta));
      area.append(details);
    });
  }
  const menu = $('#menu-toggle');
  const nav = $('#primary-nav');
  function fecharMenu() {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
  }
  menu.addEventListener('click', () => {
    const aberto = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(aberto));
    menu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#primary-nav a').forEach((link) => link.addEventListener('click', fecharMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') fecharMenu(); });

  let toastTimer;
  function avisar(mensagem) {
    const toast = $('#toast');
    toast.textContent = mensagem;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 4300);
  }
  $$('[data-contact]').forEach((button) => button.addEventListener('click', () => {
    const canal = button.dataset.contact;
    if (canal === 'whatsapp' && /^\d{10,15}$/.test(config.whatsapp || '')) {
      const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.mensagemWhatsapp || 'Olá!')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (canal === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email || '')) {
      window.location.href = `mailto:${config.email}?subject=${encodeURIComponent('Informações sobre atendimento')}`;
    } else {
      avisar('Canal ainda não configurado. Edite os dados de contato no arquivo js/config.js.');
    }
  }));
  if (config.whatsapp || config.email) $('#contact-status').textContent = 'Ao entrar em contato, evite enviar informações clínicas sensíveis na primeira mensagem.';

  const filtroEstado = { atual: 'todos' };
  function montarJogos() {
    const area = $('#game-grid');
    area.replaceChildren();
    const visiveis = jogos.filter((j) => filtroEstado.atual === 'todos' || j.filtro === filtroEstado.atual);
    visiveis.forEach((jogo) => {
      const card = el('article', 'game-card');
      card.dataset.tema = jogo.tema || 'pessego';
      const visual = el('div', 'game-illustration');
      visual.setAttribute('aria-hidden', 'true');
      visual.append(el('span', 'game-glyph', jogo.acento || '✳'));
      const content = el('div', 'game-card-content');
      content.append(el('span', 'game-label', jogo.etiqueta), el('h3', '', jogo.titulo), el('p', '', jogo.descricao));
      const button = el('button', 'game-action');
      button.type = 'button';
      button.setAttribute('aria-label', `Abrir ${jogo.titulo}`);
      button.textContent = 'Abrir atividade ';
      button.append(el('span', '', '↗'));
      button.addEventListener('click', () => abrirJogo(jogo));
      content.append(button);
      card.append(visual, content);
      area.append(card);
    });
    if (!visiveis.length) area.append(el('p', '', 'Ainda não há jogos nessa categoria.'));
  }
  $$('.filter-chip').forEach((button) => button.addEventListener('click', () => {
    filtroEstado.atual = button.dataset.filter;
    $$('.filter-chip').forEach((b) => {
      const ativo = b === button;
      b.classList.toggle('active', ativo);
      b.setAttribute('aria-pressed', String(ativo));
    });
    montarJogos();
  }));

  const dialog = $('#game-dialog');
  const areaJogo = $('#dialog-content');
  let ultimoFoco = null;
  $('#close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  window.addEventListener('message', (event) => {
    const iframeAtivo = $('.game-iframe', areaJogo);
    if (iframeAtivo && event.source === iframeAtivo.contentWindow &&
        event.data && event.data.tipo === 'fechar-jogo-gabriela' && dialog.open) dialog.close();
  });
  dialog.addEventListener('close', () => {
    areaJogo.replaceChildren();
    document.body.classList.remove('modal-open');
    if (ultimoFoco && ultimoFoco.isConnected) ultimoFoco.focus();
  });
  function abrirJogo(jogo) {
    ultimoFoco = document.activeElement;
    $('#dialog-title').textContent = jogo.titulo;
    areaJogo.replaceChildren();
    if (jogo.tipo === 'cartas') montarCartas(areaJogo);
    else if (jogo.tipo === 'iframe') montarIframe(areaJogo, jogo);
    else areaJogo.append(el('p', '', 'Tipo de atividade não reconhecido.'));
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  function montarCartas(container) {
    const cartas = [...(window.CARTAS_CONVERSA || [])];
    const box = el('div', 'card-game');
    const categoria = el('p', 'card-game-category');
    const pergunta = el('p', 'card-game-question');
    const contador = el('p', 'card-game-counter');
    const actions = el('div', 'card-game-buttons');
    const proxima = el('button', '', 'Próxima carta →');
    const reiniciar = el('button', 'secondary', 'Embaralhar');
    proxima.type = 'button'; reiniciar.type = 'button';
    actions.append(proxima, reiniciar);
    box.append(categoria, pergunta, contador, actions);
    container.append(box);
    let deck = [], indice = 0;
    function embaralhar() {
      deck = [...cartas];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      indice = 0;
      mostrarCarta();
    }
    function mostrarCarta() {
      if (!deck.length) { pergunta.textContent = 'Adicione perguntas em js/games.js.'; return; }
      const atual = deck[indice];
      categoria.textContent = atual.categoria;
      pergunta.textContent = atual.pergunta;
      contador.textContent = `Carta ${indice + 1} de ${deck.length}`;
      proxima.textContent = indice === deck.length - 1 ? 'Recomeçar ↻' : 'Próxima carta →';
    }
    proxima.addEventListener('click', () => {
      if (indice === deck.length - 1) embaralhar();
      else { indice++; mostrarCarta(); }
    });
    reiniciar.addEventListener('click', embaralhar);
    embaralhar();
  }

  function montarIframe(container, jogo) {
    const src = String(jogo.src || '').trim();
    const externo = /^https:\/\//i.test(src);
    const local = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9_./-]+\.html$/.test(src);
    if (!externo && !local) {
      container.append(el('p', '', 'Endereço inválido. Use um arquivo HTML local ou HTTPS.'));
      return;
    }
    const iframe = el('iframe', 'game-iframe');
    iframe.title = jogo.titulo;
    if (window.INLINE_GAME_HTML && window.INLINE_GAME_HTML[src]) {
      iframe.srcdoc = window.INLINE_GAME_HTML[src]; 
    } else iframe.src = src;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer';
    iframe.setAttribute('sandbox', externo ? 'allow-scripts allow-forms' : 'allow-scripts allow-same-origin');
    container.append(iframe);
  }

  montarServicos();
  montarPerguntas();
  montarJogos();
}());
