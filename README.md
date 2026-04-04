# LedgerCast 📺

> Um catálogo de séries de TV com superpoderes — os dados vivem em uma blockchain imutável (Hyperledger Fabric via GoLedger). Cada série, temporada e episódio que você cadastrar fica registrado para sempre no ledger, e você ainda pode ver o histórico completo de cada transação.

Este projeto foi desenvolvido como resposta ao [GoLedger Challenge Web](https://github.com/goledgerdev/goledger-challenge-web).

---

## O que é isso, afinal?

Imagine um IMDB, mas onde nenhum dado pode ser apagado silenciosamente — toda criação, edição ou exclusão fica gravada na blockchain com timestamp e ID de transação. O LedgerCast é exatamente isso: uma interface moderna para catalogar séries, temporadas e episódios, com total transparência e rastreabilidade dos dados.

---

## Funcionalidades

- **Catálogo de séries** — visualize, adicione, edite e remova séries de TV
- **Temporadas** — gerencie as temporadas de cada série individualmente
- **Episódios** — cadastre episódios com número, título, data de lançamento, descrição e nota
- **Histórico de transações** — veja o histórico completo de qualquer asset na blockchain (quem criou, quando editou, quando deletou)
- **Exclusão em cascata** — ao deletar uma série, todas as temporadas e episódios relacionados são removidos junto
- **Cache inteligente** — as consultas são cacheadas e revalidadas automaticamente após mutações
- **UI responsiva e animada** — feita com Tailwind CSS, shadcn/ui e Framer Motion

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| Animações | Framer Motion |
| Formulários | React Hook Form + Zod |
| HTTP (cliente) | Axios |
| Notificações | Sonner |
| Testes | Jest 30 + jest-environment-node |
| Blockchain | GoLedger (Hyperledger Fabric) |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** `>=18.x`
- **npm** `>=9.x` (ou `yarn`/`pnpm`)
- Credenciais de acesso à API GoLedger (usuário e senha via Basic Auth)

---

## Configuração do ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# URL base da API GoLedger (blockchain)
API_BASE_URL=http://ec2-50-19-36-138.compute-1.amazonaws.com

# Credenciais de acesso (Basic Auth)
API_USERNAME=seu_usuario
API_PASSWORD=sua_senha

```

> **Atenção:** as variáveis `API_USERNAME` e `API_PASSWORD` são usadas **somente no servidor** (nunca expostas ao browser). O cliente sempre passa pelo proxy `/api/*` do Next.js.

---

## Instalação e execução

### 1. Clone o repositório

```bash
git clone https://github.com/wwilliamsantana/goledger-challenge-web.git
cd goledger-challenge-web
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o `.env.local`

Crie o arquivo conforme a seção acima.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot reload |
| `npm run build` | Gera o build otimizado de produção |
| `npm start` | Inicia a aplicação em modo produção (requer build prévio) |
| `npm run lint` | Executa o ESLint para verificar o código |
| `npm test` | Executa todos os testes unitários e de integração |
---

## Como usar a aplicação

### Navegando pelo catálogo

Ao abrir a aplicação, você verá a página inicial com todas as séries cadastradas na blockchain. Role a página para ver o catálogo completo.

### Criando uma série

1. Na página inicial, clique no botão **"Nova Série"**
2. Preencha o título, descrição e idade recomendada
3. Clique em **"Salvar"** — a série é criada na blockchain e o catálogo atualiza automaticamente

### Editando uma série

1. No card da série, clique no ícone de **edição** (lápis)
2. Altere os campos desejados
3. Confirme — a alteração fica registrada como uma nova transação no ledger

### Deletando uma série

1. No card da série, clique no ícone de **exclusão** (lixeira)
2. Um diálogo de confirmação aparecerá, informando que **todas as temporadas e episódios** relacionados também serão removidos
3. Confirme para prosseguir com a exclusão em cascata

### Gerenciando temporadas

1. Clique no card de uma série para acessar sua página de detalhe
2. Use o botão **"Nova Temporada"** para adicionar uma temporada (número e ano)
3. As temporadas podem ser editadas ou deletadas individualmente (excluir uma temporada remove todos os seus episódios)

### Gerenciando episódios

1. Na página de uma série, clique em uma temporada para acessá-la
2. Use **"Novo Episódio"** para adicionar um episódio com número, título, data de lançamento, descrição e nota (opcional)
3. Episódios podem ser editados ou deletados diretamente da listagem

### Visualizando o histórico

Em qualquer página (série, temporada ou episódio), clique no ícone de **histórico** para abrir a barra lateral com o histórico completo de transações daquele asset na blockchain — incluindo data, ID da transação e se foi uma criação, edição ou exclusão.

---

## Arquitetura

- **Server Components** fazem fetch direto para a blockchain com cache automático (revalidado a cada 30s)
- **Client Components** enviam mutações via Axios para os route handlers Next.js, que por sua vez chamam a blockchain e invalidam o cache
- As credenciais de Basic Auth **nunca saem do servidor**

## Testes

O projeto conta com testes unitários e de integração cobrindo as camadas de API e os route handlers:

```bash
# Executar todos os testes
npm test

# Ver cobertura de código
npm run test:coverage
```


## API GoLedger (referência rápida)

A documentação completa da API está disponível no Swagger: `http://ec2-50-19-36-138.compute-1.amazonaws.com/api-docs/index.html`

---

## Licença

Este projeto foi desenvolvido para o GoLedger Challenge e está disponível para fins de avaliação.
