# Preparação e publicação

O projeto é um site estático em HTML, CSS e JavaScript. Não precisa de backend, banco de dados, instalação de bibliotecas ou etapa de build para ser hospedado na versão atual. Os contatos abrem WhatsApp e e-mail; não há agendamento automático.

## O que ainda falta

- [x] Substituir os textos provisórios de apresentação em `js/config.js`: `aboutLead` e `aboutBody`.
- [ ] Conferir os serviços e as respostas de perguntas frequentes.
- [ ] Conferir nome, CRP, e-mail e telefone com Gabriela. O telefone foi ajustado para `5575999075653`, acrescentando o DDI brasileiro ao número existente. Isso não confirma que o número tenha uma conta ativa no WhatsApp.
- [ ] Confirmar que a fotografia pode ser divulgada e que os serviços, públicos, modalidades e horários descritos correspondem à atuação real.
- [ ] Testar em navegador de computador e celular: menu, perguntas frequentes e os dois contatos.
- [ ] Depois da revisão, alterar `modoDemonstracao` para `false` em `js/config.js`.
- [ ] Escolher a hospedagem, enviar os arquivos e verificar o endereço HTTPS publicado.

Não é necessário comprar domínio para colocar o site no ar. Um domínio próprio pode ser configurado depois. Login, painel administrativo e agenda só são necessários se você quiser acrescentar essas funcionalidades.

## Testar localmente

No VS Code, abra a pasta do projeto e use **Open with Live Server** em `index.html` se já tiver a extensão instalada.

Como alternativa, com Node.js 22 ou superior disponível no terminal:

```sh
node scripts/serve.mjs
```

Abra `http://127.0.0.1:4173`. Use `Ctrl+C` no terminal para encerrar. Esse servidor é apenas uma prévia local; ele não publica o site. Prefira HTTP local para conferir o carregamento dos arquivos.

Para repetir as verificações automáticas:

```sh
node --test
node scripts/validate.mjs
node scripts/validate.mjs --publicacao
```

`node --test` executa a suíte persistida em `tests/`: lógica das interações em DOM simulado, respostas HTTP do servidor local e regressões do validador. Consulte [TESTES.md](TESTES.md) para os resultados e os limites. Esses testes não substituem a conferência visual em um navegador real e no celular.

`node scripts/validate.mjs` confere sintaxe dos scripts do navegador, arquivos referenciados, capitalização dos nomes e âncoras. Com `--publicacao`, também identifica dados obrigatórios vazios, contatos com formato inválido, modo de demonstração ativo e textos provisórios conhecidos. Ele retorna erro enquanto essas pendências existirem. A aprovação automática não confirma a veracidade dos dados, a entrega dos contatos, o visual ou todas as possíveis frases provisórias.

Node.js é opcional para essas ferramentas de desenvolvimento; a hospedagem deste site não precisa executar Node.js.

## Publicar no GitHub Pages

O remoto Git deste projeto aponta para `RaphaelVelame/psychologist-web-app`. Estas instruções não confirmam que o Pages já esteja ativado ou que sua conta tenha permissão administrativa no repositório.

1. Conclua o checklist e revise os arquivos alterados no controle de versão.
2. Faça commit e envie as alterações para a branch que será publicada.
3. No GitHub, abra o repositório e entre em **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**.
5. Selecione a branch que recebeu os arquivos e a pasta **/(root)**. Salve.
6. Aguarde a publicação e abra o endereço informado pelo próprio GitHub.
7. Teste novamente o menu, as perguntas frequentes e os contatos no endereço HTTPS, incluindo no celular.

A disponibilidade do Pages depende da visibilidade do repositório e do plano da conta. O arquivo `.nojekyll` foi incluído para servir os arquivos estáticos sem processamento pelo Jekyll. Todos os caminhos do site são relativos, permitindo hospedagem em uma subpasta de projeto.

Referência: [Configurar a origem de publicação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Publicar em outra hospedagem estática

Envie os arquivos abaixo preservando os nomes e a estrutura. A pasta publicada deve conter `index.html` diretamente na raiz:

```text
index.html
assets/
js/
```

Não envie `.git/`, arquivos `.env`, credenciais ou dados de pacientes. O arquivo `js/config.js` contém informações públicas e fica acessível aos visitantes. Não armazene segredos nele.

Após definir o domínio definitivo, você pode acrescentar URL canônica, metadados de compartilhamento e sitemap. Eles ajudam na divulgação e indexação, mas não impedem a primeira publicação. Se integrar formulários, métricas ou agenda, revise o comportamento e o tratamento de dados desses serviços antes de divulgá-los.

## Verificações desta revisão

Em 5 de novembro de 2026, após a remoção da seção de escuta e dos jogos:

- Verificação técnica dos arquivos: aprovada.
- Suíte automatizada: 48 testes aprovados pelo executor Node.js, sem falhas. São 13 cenários de interação, 25 verificações HTTP e 9 cenários do validador, além do teste que agrupa as verificações HTTP.
- Prévia HTTP: página, estilos, as duas fotos, SVGs e scripts restantes responderam com status 200. Os antigos endereços dos jogos retornam 404.
- Verificação de publicação: consulte a saída atual de `node scripts/validate.mjs --publicacao`, pois o conteúdo é editável.
- A conferência visual em navegador e celular permanece pendente. O controle do navegador foi encerrado pela ferramenta por não conseguir identificar a URL atual com segurança. Os testes em DOM simulado não verificam layout ou foco nativo.

Nenhuma publicação, commit ou push foi realizado nesta revisão.
