(function () {
  'use strict';
  const emocoes = [
    { palavra: 'Alegria', icone: '☀️' },
    { palavra: 'Calma', icone: '🌿' },
    { palavra: 'Surpresa', icone: '✨' },
    { palavra: 'Carinho', icone: '💛' },
    { palavra: 'Curiosidade', icone: '🔎' },
    { palavra: 'Coragem', icone: '🌟' },
  ];
  const tabuleiro = document.getElementById('tabuleiro');
  const contador = document.getElementById('contador');
  const mensagem = document.getElementById('mensagem');
  let selecionadas = [];
  let acertos = 0;
  let ocupado = false;
  let identificador = 0;
  let temporizador;
  function criar() {
    identificador++;
    clearTimeout(temporizador);
    selecionadas = [];
    acertos = 0;
    ocupado = false;
    contador.textContent = 'Pares: 0 / 6';
    mensagem.textContent = 'Vire duas cartas para encontrar um par.';
    tabuleiro.replaceChildren();
    const rodada = identificador;
    const baralho = [...emocoes, ...emocoes];
    for (let i = baralho.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
    }
    baralho.forEach((emocao, indice) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'card';
      botao.textContent = '✳';
      botao.dataset.posicao = String(indice + 1);
      botao.setAttribute('aria-label', `Carta ${indice + 1}, virada para baixo`);
      botao.addEventListener('click', () => virar(botao, emocao, rodada));
      tabuleiro.append(botao);
    });
  }
  function virar(botao, emocao, rodada) {
    if (
      rodada !== identificador ||
      ocupado ||
      botao.disabled ||
      selecionadas.some((x) => x.botao === botao)
    )
      return;
    const icone = document.createElement('span');
    icone.textContent = emocao.icone;
    icone.setAttribute('aria-hidden', 'true');
    const palavra = document.createElement('span');
    palavra.className = 'card-word';
    palavra.textContent = emocao.palavra;
    botao.replaceChildren(icone, palavra);
    botao.classList.add('revelada');
    botao.setAttribute('aria-label', `Carta ${botao.dataset.posicao}: ${emocao.palavra}`);
    selecionadas.push({ botao, emocao });
    if (selecionadas.length !== 2) return;
    const [a, b] = selecionadas;
    if (a.emocao.palavra === b.emocao.palavra) {
      a.botao.disabled = b.botao.disabled = true;
      a.botao.classList.add('acertou');
      b.botao.classList.add('acertou');
      selecionadas = [];
      acertos++;
      contador.textContent = `Pares: ${acertos} / 6`;
      mensagem.textContent =
        acertos === 6
          ? 'Você encontrou todos os pares! ✳'
          : 'Par encontrado! Escolha mais duas cartas.';
    } else {
      ocupado = true;
      mensagem.textContent = 'Essas cartas são diferentes. Tente outra combinação.';
      temporizador = setTimeout(() => {
        if (rodada !== identificador) return;
        [a, b].forEach((x) => {
          x.botao.textContent = '✳';
          x.botao.classList.remove('revelada');
          x.botao.setAttribute('aria-label', `Carta ${x.botao.dataset.posicao}, virada para baixo`);
        });
        selecionadas = [];
        ocupado = false;
        mensagem.textContent = 'Vire duas cartas para encontrar um par.';
      }, 900);
    }
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && window.parent !== window) {
      // O iframe é isolado por sandbox. A página principal confere event.source.
      window.parent.postMessage({ tipo: 'fechar-jogo-gabriela' }, '*');
    }
  });
  document.getElementById('reiniciar').addEventListener('click', criar);
  criar();
})();
