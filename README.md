# Hookin - Webhook Inspector

Uma aplicação moderna para capturar, inspecionar e gerenciar requisições webhook em tempo real. Desenvolvida como um monorepo com arquitetura separada entre API e interface web.

## 📋 Visão Geral

O Hookin é uma ferramenta de desenvolvimento que permite criar endpoints personalizados para receber webhooks, capturando e armazenando todas as informações relevantes de cada requisição, incluindo headers, body, query parameters, endereço IP e código de status. Ideal para desenvolvedores que precisam debugar e monitorar integrações com serviços externos.

### Principais Funcionalidades

- 🎯 **Endpoints Personalizados**: Crie endpoints únicos com slugs customizados
- 📥 **Captura de Webhooks**: Receba e armazene automaticamente todas as requisições
- 🔍 **Inspeção Detalhada**: Visualize headers, body, query params e metadados completos
- 📊 **Interface Moderna**: Dashboard intuitivo com React e Tailwind CSS
- 📚 **Documentação Automática**: API documentada com Swagger/Scalar UI
- 🗄️ **Persistência**: Armazenamento em PostgreSQL com Drizzle ORM

## 🛠️ Stack Tecnológica

### Backend (API)
- **Runtime**: Node.js com TypeScript
- **Framework**: Fastify 5.6
- **ORM**: Drizzle ORM 0.44
- **Banco de Dados**: PostgreSQL 17
- **Validação**: Zod 4.1
- **Documentação**: Scalar API Reference
- **Formatação**: Biome

### Frontend (Web)
- **Framework**: React 19
- **Build Tool**: Vite 7
- **Roteamento**: TanStack Router 1.132
- **Estilização**: Tailwind CSS 4.1
- **UI Components**: Radix UI
- **Ícones**: Lucide React
- **Syntax Highlighting**: Shiki
- **Formatação**: Biome

### Infraestrutura
- **Gerenciador de Pacotes**: pnpm 10.15.0
- **Monorepo**: pnpm workspaces
- **Containerização**: Docker & Docker Compose

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **pnpm** 10.15.0 (gerenciado automaticamente via `packageManager`)
- **Docker** e **Docker Compose** (para o banco de dados PostgreSQL)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd hookin
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` no diretório `api/`:

```bash
cd api
cp .env.example .env  # Se existir um arquivo de exemplo
```

Configure as seguintes variáveis:

```env
NODE_ENV=development
PORT=3333
DATABASE_URL=postgresql://docker:docker@localhost:5432/webhooks
BASE_URL=http://localhost:3333
```

### 4. Inicie o banco de dados

```bash
# Ainda no diretório api/
docker compose up -d
```

### 5. Execute as migrações

```bash
pnpm db:generate  # Gera as migrações a partir do schema
pnpm db:migrate   # Aplica as migrações no banco de dados
```

### 6. (Opcional) Popule o banco com dados de exemplo

```bash
pnpm db:seed
```

## 💻 Uso

### Desenvolvimento

#### API (Backend)

No diretório `api/`:

```bash
pnpm dev
```

O servidor estará disponível em:
- **API**: `http://localhost:3333`
- **Documentação**: `http://localhost:3333/docs`

#### Web (Frontend)

Em um novo terminal, no diretório `web/`:

```bash
pnpm dev
```

A aplicação web estará disponível em `http://localhost:5173` (porta padrão do Vite).

### Comandos Disponíveis

#### API (`api/`)

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento com hot reload |
| `pnpm start` | Inicia o servidor em modo produção |
| `pnpm format` | Formata o código com Biome |
| `pnpm db:generate` | Gera migrações Drizzle a partir das mudanças no schema |
| `pnpm db:migrate` | Aplica migrações pendentes no banco de dados |
| `pnpm db:studio` | Abre o Drizzle Studio (GUI para o banco) |
| `pnpm db:seed` | Popula o banco com dados de exemplo |

#### Web (`web/`)

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento Vite |
| `pnpm build` | Type-check e build para produção |
| `pnpm preview` | Preview do build de produção localmente |
| `pnpm format` | Formata o código com Biome |

## 📁 Estrutura do Projeto

```
hookin/
├── api/                    # Backend (Fastify + PostgreSQL)
│   ├── src/
│   │   ├── db/            # Configuração do banco de dados
│   │   │   ├── schema/    # Schemas Drizzle (tabelas)
│   │   │   └── migrations/# Migrações SQL geradas
│   │   ├── routes/        # Rotas da API (plugins Fastify)
│   │   ├── utils/         # Utilitários
│   │   ├── env.ts         # Validação de variáveis de ambiente
│   │   └── server.ts      # Configuração do servidor Fastify
│   ├── docker-compose.yml # Configuração do PostgreSQL
│   └── drizzle.config.ts  # Configuração do Drizzle ORM
│
├── web/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   └── ui/        # Componentes UI reutilizáveis
│   │   ├── routes/        # Rotas (file-based routing)
│   │   ├── http/          # Schemas e tipos para API
│   │   ├── config.ts      # Configurações da aplicação
│   │   └── main.tsx       # Entry point da aplicação
│   └── vite.config.ts     # Configuração do Vite
│
├── pnpm-workspace.yaml     # Configuração do monorepo
└── package.json            # Workspace root
```

## 🔌 API

### Endpoints Principais

#### Endpoints
- `GET /endpoints` - Lista todos os endpoints criados
- `GET /endpoints/:slug` - Obtém detalhes de um endpoint específico
- `POST /endpoints` - Cria um novo endpoint

#### Webhooks
- `GET /webhooks` - Lista todos os webhooks capturados
- `GET /webhooks/:id` - Obtém detalhes de um webhook específico
- `DELETE /webhooks/:id` - Remove um webhook

#### Captura
- `POST /:slug` - Endpoint dinâmico para capturar webhooks (onde `:slug` é o slug do endpoint criado)

### Documentação Interativa

Acesse `http://localhost:3333/docs` para visualizar a documentação completa da API com Scalar UI, incluindo schemas, exemplos de requisição/resposta e a capacidade de testar endpoints diretamente.

## 🗄️ Banco de Dados

### Schema

O banco de dados utiliza PostgreSQL com as seguintes tabelas principais:

- **endpoints**: Armazena os endpoints criados pelos usuários
- **webhooks**: Armazena todas as requisições webhook capturadas

### Workflow de Migrações

Ao fazer alterações no schema:

1. Edite os arquivos de schema em `api/src/db/schema/`
2. Execute `pnpm db:generate` para gerar a migração SQL
3. Revise o SQL gerado em `api/src/db/migrations/`
4. Execute `pnpm db:migrate` para aplicar as migrações
5. Commit das migrações junto com as mudanças no schema

### Drizzle Studio

Para visualizar e gerenciar o banco de dados via interface gráfica:

```bash
cd api
pnpm db:studio
```

## 🎨 Desenvolvimento

### Padrões de Código

- **Formatação**: Biome (não Prettier/ESLint)
- **TypeScript**: Versão ~5.9.3 em ambos os workspaces
- **Convenções**: 
  - Tabelas em snake_case (configurado no Drizzle)
  - Primary keys usando UUIDv7 para IDs ordenados temporalmente
  - Rotas como plugins Fastify com validação Zod

### Roteamento

#### API
Cada rota é um plugin Fastify exportado como `FastifyPluginAsyncZod`, com:
- Validação automática via Zod
- Documentação OpenAPI/Swagger automática
- Type-safety completo

#### Web
Utiliza TanStack Router com file-based routing:
- Rotas definidas em `src/routes/`
- Árvore de rotas auto-gerada em `src/routeTree.gen.ts` (não editar manualmente)

### Docker

O PostgreSQL é executado via Docker Compose com as seguintes credenciais padrão:

- **Usuário**: `docker`
- **Senha**: `docker`
- **Banco**: `webhooks`
- **Porta**: `5432`

## 📝 Notas Importantes

- ⚠️ Sempre use `pnpm`, nunca `npm` ou `yarn`
- ⚠️ Comandos devem ser executados no workspace específico (`api/` ou `web/`), não na raiz
- ⚠️ O servidor API roda na porta 3333 com CORS habilitado para desenvolvimento local
- ⚠️ O arquivo `routeTree.gen.ts` é auto-gerado - não edite manualmente
- ⚠️ Revise sempre as migrações SQL geradas antes de aplicá-las em produção

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Faça commit das mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
3. Push para a branch (`git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

---

Desenvolvido com ❤️ usando tecnologias modernas e melhores práticas de desenvolvimento.

