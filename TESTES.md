# Testes e prontidão para publicação

Revisão de 5 de novembro de 2026, após remover a seção “Um pouco sobre a escuta” e os jogos.

## Como repetir

Com Node.js 22 ou superior disponível no terminal, execute na raiz:

```sh
node --test
node scripts/validate.mjs
node scripts/validate.mjs --publicacao
```

Os testes usam apenas módulos nativos do Node.js. Não é necessário executar `npm install`. Node.js é necessário para essas ferramentas locais; a hospedagem do site estático não precisa executá-lo.

## Resultados

- 48 testes aprovados, sem falhas, cancelamentos ou testes ignorados: 13 cenários de interação, 25 verificações HTTP, 9 cenários do validador e o teste que agrupa as verificações HTTP.
- Verificação técnica aprovada: sintaxe dos scripts do navegador, arquivos referenciados, capitalização e âncoras.
- Os textos de apresentação foram substituídos pelo conteúdo fornecido. A verificação de publicação continua identificando o modo de demonstração ativo. Use a saída atual do comando com `--publicacao` para acompanhar as pendências enquanto edita o conteúdo.

## Cobertura

- `tests/interactions.test.mjs`: renderização dos serviços, FAQ e dados profissionais; tratamento dos textos como texto; modo de demonstração; fallback da foto; abertura e fechamento do menu; destinos dos contatos; bloqueio de contatos inválidos e aviso temporário.
- `tests/server.test.mjs`: 9 recursos com HTTP 200, MIME correto, tamanho correto e bytes iguais aos arquivos; HEAD; query string; POST recusado; bloqueio de arquivos internos e caminhos inválidos. Os quatro arquivos removidos dos jogos retornam 404. O servidor do teste é encerrado ao terminar.
- `tests/validation.test.mjs`: falhas deliberadas de sintaxe, arquivos, capitalização, âncoras e IDs; recusa de dados obrigatórios ausentes, contatos inválidos e conteúdo provisório; aprovação de uma configuração fictícia tecnicamente válida. As alterações ocorrem em cópias temporárias removidas ao terminar.
- `tests/helpers/browser.mjs`: DOM mínimo e relógio controlado para executar os scripts reais.

## Limites

O DOM simulado verifica a lógica, os textos e os atributos; não comprova layout, contraste, navegação nativa por teclado ou foco nativo. A expansão da FAQ usa o elemento nativo `<details>` e precisa ser conferida no navegador.

Os testes HTTP se referem ao servidor local. HTTPS e proteção dos arquivos no provedor devem ser conferidos depois da publicação. Os testes não confirmam entrega de e-mail, existência da conta no WhatsApp ou veracidade dos dados profissionais.

A revisão visual em desktop e celular permanece pendente: a ferramenta encerrou o controle do navegador por não conseguir identificar a URL atual com segurança.

## Antes de publicar

- Conferir os textos de apresentação, os serviços e a FAQ; confirmar dados profissionais, contatos e autorização das fotos.
- Após a revisão, definir `modoDemonstracao: false` em `js/config.js`.
- Conferir em desktop e celular: navegação, FAQ, fotos, contatos e navegação por teclado.
- Publicar `index.html`, `assets/` e `js/` em hospedagem estática e repetir a conferência no endereço HTTPS.

As instruções de hospedagem estão em [PUBLICACAO.md](PUBLICACAO.md). Backend, banco de dados, login e build não são necessários para as funcionalidades atuais.
