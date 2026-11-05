(function () {
  'use strict';
  const config = window.SITE_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  document.documentElement.classList.add('js');

  const campos = [
    'heroTitle',
    'heroDescription',
    'heroNote',
    'aboutLead',
    'aboutBody',
    'contactDescription',
  ];
  campos.forEach((campo) => {
    const node = $(`[data-bind="${campo}"]`);
    if (node && typeof config[campo] === 'string') {
      if (campo === 'heroTitle') {
        const partes = config[campo].trim().match(/^(.*\s)(\S+)$/);
        if (partes) {
          node.replaceChildren(document.createTextNode(partes[1]), el('em', '', partes[2]));
        } else node.textContent = config[campo];
      } else node.textContent = config[campo];
    }
  });
  $$('[data-bind="nome"]').forEach((node) => {
    node.textContent = config.nome || 'Gabriela Medeiros Mota';
  });
  document.title = `${config.nome || 'Gabriela Medeiros Mota'} | Psicóloga`;
  const crp = config.crp ? `· ${config.crp}` : '· CRP a preencher';
  $$('[data-bind="crp"]').forEach((node) => {
    node.textContent = crp;
  });
  $('#current-year').textContent = String(new Date().getFullYear());
  if (config.modoDemonstracao === false) {
    $('#demo-banner').hidden = true;
    $('#services-hint').hidden = true;
  }
  if (config.foto) {
    const foto = $('#profile-photo');
    if (config.fotoAlt) foto.alt = config.fotoAlt;
    foto.addEventListener(
      'error',
      () => {
        foto.src = 'assets/foto-exemplo.svg';
        foto.alt = 'Imagem ilustrativa: fotografia indisponível';
      },
      { once: true }
    );
    foto.src = config.foto;
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
      top.append(
        el('span', 'service-symbol', item.simbolo || '✳'),
        el('span', 'service-number', item.numero)
      );
      card.append(
        top,
        el('h3', '', item.titulo),
        el('p', '', item.descricao),
        el('span', 'service-detail', item.detalhe || 'Saiba mais no contato')
      );
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
  function fecharMenu(devolverFoco = false) {
    const estavaAberto = nav.classList.contains('is-open');
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    if (devolverFoco && estavaAberto) menu.focus();
  }
  menu.addEventListener('click', () => {
    const aberto = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(aberto));
    menu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });
  $$('#primary-nav a').forEach((link) => link.addEventListener('click', () => fecharMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menu.contains(event.target)) fecharMenu();
  });
  window.matchMedia('(max-width: 850px)').addEventListener('change', () => fecharMenu());

  let toastTimer;
  function avisar(mensagem) {
    const toast = $('#toast');
    toast.textContent = mensagem;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4300);
  }
  const whatsapp = String(config.whatsapp || '').trim();
  const email = String(config.email || '').trim();
  const contatos = {
    whatsapp: /^[1-9]\d{11,14}$/.test(whatsapp)
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(config.mensagemWhatsapp || 'Olá!')}`
      : null,
    email: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)
      ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Informações sobre atendimento')}`
      : null,
  };
  $$('[data-contact]').forEach((link) => {
    const destino = contatos[link.dataset.contact];
    if (destino) {
      link.href = destino;
      if (link.dataset.contact === 'whatsapp') {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    } else {
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        avisar('Este canal está indisponível no momento. Tente o outro meio de contato.');
      });
    }
  });
  if (Object.values(contatos).some(Boolean))
    $('#contact-status').textContent =
      'Ao entrar em contato, evite enviar informações clínicas sensíveis na primeira mensagem.';

  montarServicos();
  montarPerguntas();
})();
