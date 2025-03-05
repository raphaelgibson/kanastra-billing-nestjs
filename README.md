# Kanstra Billing

Este é um projeto de gerenciamento de faturamento utilizando o framework NestJS.

## Pré-requisitos

- Node.js (versão 22 ou superior)
- PNPM (versão 10 ou superior)
- Docker e Docker Compose

## Configuração do Ambiente

1. Clone o repositório:

```sh
git clone https://github.com/raphaelgibson/kanastra-billing-nestjs.git
cd kanastra-billing-nestjs
```

2. Instale as dependências:
```sh
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto e adicione as variáveis necessárias. Você pode usar o arquivo .env.example como referência.

## Executando o Projeto

### Modo de Desenvolvimento

Para iniciar o servidor em modo de desenvolvimento com hot-reload:

```sh
pnpm start:dev
```

### Modo de Produção

Para construir e iniciar o servidor em modo de produção:

```sh
pnpm build
pnpm start:prod
```

### Utilizando Docker

Para executar o projeto utilizando Docker:

```sh
docker-compose up --build
```

## Testes

### Testes Unitários
Para rodar os testes unitários:

```sh
pnpm test
```

### Testes E2E
Para rodar os testes end-to-end:

```sh
pnpm run test:e2e
```

### Testes com Cobertura
Para rodar os testes e gerar um relatório de cobertura:

```sh
pnpm run test:cov
```
