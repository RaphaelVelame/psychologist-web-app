# Site de Gabriela Medeiros Mota — projeto completo

Site institucional responsivo e editável para uma profissional de Psicologia, com duas atividades interativas reais e base para incorporar jogos autorais. **Este é um modelo demonstrativo**, não um site publicado na internet. Nada precisa ser instalado para visualizar a página localmente. Se o navegador bloquear jogos incorporados quando abertos diretamente por `file://`, utilize o Live Server conforme as instruções abaixo.

## 1. Como abrir agora

1. Extraia o ZIP inteiro (não mova apenas `index.html`).
2. Entre na pasta `site-gabriela-medeiros`.
3. Abra `index.html` com duplo clique no navegador.
4. Clique em **Recursos** para testar os jogos e no menu para explorar as seções.

Se preferir usar o VS Code, instale a extensão *Live Server*, abra a pasta e escolha **Open with Live Server** em `index.html`. Isso também facilita testar jogos locais e futuras integrações.

## 2. O que tem em cada arquivo

```text
site-gabriela-medeiros/
├── index.html                    # Estrutura visual/semântica das seções
├── assets/
│   ├── styles.css                # Identidade visual, componentes e celular
│   ├── foto-exemplo.svg          # Imagem provisória (não é foto real)
│   └── favicon.svg               # Ícone exibido na aba do navegador
├── js/
│   ├── config.js                 # TEXTOS, contatos, CRP, serviços e FAQ
│   ├── games.js                  # Catálogo de jogos e perguntas das cartas
│   └── main.js                   # Menu, filtros, modal, cartas e contatos
└── jogos/
    └── memoria-emocoes/
        └── index.html            # Exemplo de jogo independente por iframe
```

## 3. Substitua as informações da profissional

Abra `js/config.js`. Ali estão as informações públicas do site, separadas da lógica. Um exemplo:

```js
window.SITE_CONFIG = {
  modoDemonstracao: true,
  nome: 'Gabriela Medeiros Mota',
  crp: '',
  foto: 'assets/foto-exemplo.svg',
  whatsapp: '',
  email: '',
};
```

**Preencha primeiro:**

- `crp`: número de registro real + Regional, sem inventar ou omitir;
- `foto`: substitua o SVG por uma foto para a qual exista autorização. Coloque a foto em `assets/` e use, por exemplo, `foto: 'assets/gabriela.jpg'`;
- `fotoAlt`: descrição curta da foto para acessibilidade;
- `whatsapp`: número com DDI `55`, DDD e número, somente dígitos;
- `email`: endereço profissional;
- `heroTitle`, `heroDescription`, `aboutLead`, `aboutBody`, `philosophyTitle`, `philosophyBody`: seus próprios textos;
- `servicos`: só mantenha modalidades, públicos e atividades efetivamente oferecidas;
- `perguntas`: substitua os exemplos pelos procedimentos reais.

Quando estiver tudo conferido, altere `modoDemonstracao: false`. Isso esconde a faixa e o aviso visual de edição, mas **não valida automaticamente os dados**. A conferência profissional permanece indispensável.

**Importante:** o botão de WhatsApp **não envia mensagens automaticamente**. Ele abre o WhatsApp com um texto já preparado. O botão de e-mail abre o aplicativo padrão de e-mail. Com campos vazios, os botões mostram um aviso em vez de inventar destinos.

## 4. Como adicionar os jogos feitos por Gabriela

Você pode escolher entre três opções, sem mudar a estrutura do site:

### Opção A: Jogo HTML/CSS/JS próprio (recomendado)

Crie a pasta `jogos/meu-jogo/`, salve seu jogo em `jogos/meu-jogo/index.html` (ele pode ter outros arquivos nessa pasta). Abra `js/games.js` e acrescente ao array `window.SITE_GAMES`:

```js
{
  id: 'meu-jogo',
  tipo: 'iframe',
  filtro: 'jogo',
  numero: '03',
  etiqueta: 'JOGO AUTORAL',
  titulo: 'Meu novo jogo',
  descricao: 'Uma descrição curta, acolhedora e realista.',
  tema: 'verde', 
  acento: '✳',      
  publico: 'Recurso lúdico',
  src: 'jogos/meu-jogo/index.html'
}
```

A página de entrada desse jogo será aberta numa janela modal dentro do site. O arquivo `jogos/memoria-emocoes/index.html` é um exemplo funcional de como desenvolver um jogo autônomo.

### Opção B: Jogo hospedado em outro site

Use o mesmo objeto acima e substitua `src` por uma URL **HTTPS**:

```js
src: 'https://seudominio.com/jogos/exemplo/'
```

**Atenção:** o código aceita URL HTTPS externa, inclusive com caminho terminado em `/`. Entretanto, provedores externos podem impedir o uso em `iframe` por `X-Frame-Options` ou `Content-Security-Policy`, e podem coletar dados conforme suas próprias políticas. Uma alternativa é criar um card que abra o jogo em nova aba.

### Opção C: Jogo criado dentro do mesmo site

O jogo de cartas é nativo: veja a função `montarCartas()` em `js/main.js` e as perguntas em `js/games.js`. Para criar outro tipo nativo, implemente uma nova função `montarSeuJogo(container)` no `main.js` e acrescente mais uma condição em `abrirJogo()`.

**Nunca inclua informações identificáveis de pacientes reais nos jogos públicos.** Não coloque fichas clínicas, respostas de sessões ou dados de crianças no front-end. Para jogos que exijam registro de respostas, perfis ou contas, será necessário desenhar um backend, autenticação, autorização, segurança, LGPD e política de retenção de dados antes de divulgar.

## 5. Aprendizado: arquitetura e responsabilidade de cada parte

### HTML (`index.html`)

Define a estrutura e o significado das seções. `header` contém marca e navegação; `main` contém seções nomeadas (`id="sobre"`, `id="recursos"` etc.); `footer` oferece navegação final. O elemento nativo `<dialog>` cria a janela onde os jogos são abertos. Usamos `aria-label`, `aria-expanded`, `aria-pressed` e uma tecla para pular conteúdo para dar suporte à acessibilidade.

### CSS (`assets/styles.css`)

No início, `:root` guarda cores, fontes e larguras. Assim, você pode trocar `--green` e `--peach` uma vez em vez de buscar todas as ocorrências. `display: grid` organiza colunas; `display: flex` organiza itens lineares. As regras `@media` reorganizam tudo em celulares. `prefers-reduced-motion` desativa animações para quem preferir menos movimento. Não há fontes, frameworks ou scripts externos.

### Configuração (`js/config.js`)

É um objeto de dados que separa conteúdo e código. Mudar a apresentação profissional não exige mexer em lógica, o que reduz erros. O sistema não obtém nem verifica esses dados — você é responsável por conferir seu conteúdo antes de publicá-lo.

### Lógica (`js/main.js`)

A função `el()` cria elementos com `document.createElement()` e usa `textContent` para textos vindos da configuração — isso reduz risco de injeção de HTML. `montarServicos()` e `montarPerguntas()` geram áreas a partir de arrays. `montarJogos()` filtra por categoria. `abrirJogo()` controla o `<dialog>`. `montarCartas()` aplica o algoritmo Fisher–Yates para embaralhar sem repetir cartas durante o ciclo. `montarIframe()` isola os jogos e permite trocar o jogo sem reconstruir a página inteira.

### Jogos (`js/games.js`, `jogos/...`)

Um pequeno **catálogo** transforma um array de objetos em cards. Ele facilita escalar: um jogo novo geralmente precisa de apenas uma pasta e uma entrada no array. O jogo de memória possui seu próprio código, portanto pode ser testado e reaproveitado fora do site institucional.

## 6. O que funciona e o que ainda exigiria desenvolvimento

**Já funciona:** layout responsivo, menu móvel, filtros de jogos, cartas embaralháveis, jogo da memória, modal fechável por clique/Escape, perguntas expansíveis, ano automático, abertura de WhatsApp/e-mail depois de configurar os contatos.

**Não incluído:** área administrativa/CMS, login, cadastro de pacientes, banco de dados, prontuário, agenda em tempo real, envio de formulário por servidor, análise de visitantes, hospedagem e domínio próprio. Para ter um painel de edição online, seria necessário acrescentar backend/CMS e configurar permissões adequadas.

## 7. Publicação gratuita — GitHub Pages

1. Crie uma conta/repositório no GitHub (se já tiver, use o existente).
2. Envie todos os arquivos, mantendo a estrutura de pastas.
3. Vá a **Settings → Pages** do repositório.
4. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`.
5. Salve e abra o endereço que a própria plataforma informar quando estiver publicado.

Também é possível arrastar a pasta para serviços de hospedagem estática compatíveis. Só após publicar existirá um endereço público real. Não é possível gerar um domínio público apenas a partir de um arquivo local.

## 8. Segurança, privacidade e orientações profissionais

- Não inclua nomes, imagens, depoimentos, casos clínicos ou quaisquer dados sensíveis de pacientes nos arquivos públicos.
- Nesta versão, os dois jogos funcionam no navegador e não gravam respostas. O site não possui formulário nem banco de dados. Mesmo assim, serviços de hospedagem podem armazenar logs técnicos de acesso; consulte a política do provedor.
- Serviços externos, inclusive jogos integrados de terceiros, podem exigir política de privacidade própria; revise-os antes de integrar. Caso adicione coleta de dados, será necessário preparar aviso de privacidade conforme a LGPD e medidas técnicas apropriadas.
- Use hospedagem HTTPS e atualize regularmente qualquer futura biblioteca ou plugin.
- Não divulgue técnicas, especialidades ou qualificações sem respaldo, nem promessas de resultados. O CRP verdadeiro e o nome completo devem estar presentes na publicidade profissional.
- Confirme eventuais requisitos para atendimento por meio de tecnologias de informação e comunicação junto às normas aplicáveis.

**Referências utilizadas na pesquisa do projeto:**
- Orientações do CRP/SC sobre publicidade em Psicologia: https://site.crpsc.org.br/publicidade-e-uso-de-redes-sociais-na-psicologia/
- Publicidade profissional, Conselho Regional de Psicologia: https://transparencia.cfp.org.br/crp10/pergunta-frequente/publicidade-profissional/
- Padrões de sites de terapeutas: https://psychology.com/practice-guides/therapist-website-examples
- Exemplos visuais brasileiros de sites de psicólogos: https://psicologos.assertivus.com.br/

A inspiração é estrutural (apresentação clara, serviços, dúvidas, contato), e **nenhum design, fotografia ou texto de outro profissional foi copiado**.
