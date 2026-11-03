# Cypress do Zero à Nuvem

[![Testes E2E](https://github.com/cristhferr/cypress_do_zero_a_nuvem/actions/workflows/ci.yml/badge.svg)](https://github.com/cristhferr/cypress_do_zero_a_nuvem/actions/workflows/ci.yml)

Projeto de automação de testes end-to-end com Cypress, desenvolvido para praticar fluxos de cadastro, autenticação, compras e validações da aplicação Advantage Online Shopping.

## Pré-requisitos

- Node.js
- npm

## Instalação

Na raiz do projeto, instale as dependências:

```bash
npm install
```

## Executar os testes

Para executar todos os testes em modo headless:

```bash
npm test
```

Para abrir o Cypress em modo interativo:

```bash
npm run cy:open
```

Para executar com viewport mobile:

```bash
npm run test:mobile
```

## Integração contínua

O workflow do [GitHub Actions](./.github/workflows/ci.yml) executa os testes em cada push e pull request. Também é possível iniciar uma execução manualmente em **Actions > End-to-end tests > Run workflow**. Para registrar as execuções no Cypress Cloud, configure o segredo `CYPRESS_RECORD_KEY` em **Settings > Secrets and variables > Actions** no repositório.

## Créditos e licença

Este projeto foi iniciado a partir do material educacional [Cypress, do Zero à Nuvem](https://github.com/wlsf82/cypress-do-zero-a-nuvem) e adaptado para fins de estudo e prática. A licença MIT e seus avisos de copyright permanecem no arquivo [LICENSE](./LICENSE).
