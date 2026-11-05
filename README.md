# Site de Gabriela Medeiros Mota

Site institucional responsivo em HTML, CSS e JavaScript, com apresentação profissional, atendimentos, perguntas frequentes e contato por WhatsApp/e-mail.

A seção “Um pouco sobre a escuta” e os jogos foram removidos. O site não depende de bibliotecas externas, backend, banco de dados ou etapa de build.

## Prévia local

Abra a pasta no VS Code e use Live Server, ou execute com Node.js 22 ou superior:

```sh
node scripts/serve.mjs
```

Abra http://127.0.0.1:4173. O servidor é apenas para desenvolvimento local. Os arquivos do site podem ser hospedados diretamente em um serviço de hospedagem estática.

## Arquivos

```text
index.html                  # Estrutura das seções e navegação
assets/styles.css           # Identidade visual e layout responsivo
assets/FotoProfissional.jpeg # Fotografia principal
assets/FotoProfissional2.jpeg # Fotografia da apresentação
assets/foto-exemplo.svg      # Ilustração usada se a foto principal falhar
assets/favicon.svg          # Ícone da aba
js/config.js                # Textos, dados profissionais, serviços e FAQ
js/main.js                  # Renderização do conteúdo, menu e contatos
scripts/serve.mjs           # Servidor de prévia local
scripts/validate.mjs        # Verificação técnica e de publicação
tests/                     # Testes automatizados sem dependências
```

## Conteúdo

Edite `js/config.js` e salve antes de atualizar a prévia. Os dados desse arquivo são públicos: não inclua senhas ou informações de pacientes.

Configure nome, CRP, foto e descrição acessível, WhatsApp com DDI/DDD e somente dígitos, e-mail, apresentação, serviços e perguntas frequentes. Mantenha apenas informações confirmadas pela profissional.

Após concluir a revisão, altere `modoDemonstracao` para `false`. Isso oculta os avisos de preparação, mas não confirma a veracidade dos dados.

O contato por WhatsApp abre uma conversa com mensagem preparada, sem enviá-la automaticamente. O contato por e-mail abre o aplicativo de e-mail. Canais com formato inválido ficam indisponíveis e mostram um aviso.

## Verificações

Com Node.js 22 ou superior, execute na raiz:

```sh
node --test
node scripts/validate.mjs
node scripts/validate.mjs --publicacao
```

Não é necessário executar `npm install`. A suíte verifica conteúdo, menu, contatos, respostas HTTP e regressões do validador. A verificação de publicação retorna erro enquanto houver pendências reconhecidas de conteúdo/configuração.

Consulte [TESTES.md](TESTES.md) para cobertura e limites, e [PUBLICACAO.md](PUBLICACAO.md) para o checklist e as instruções de hospedagem.
