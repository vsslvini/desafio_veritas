# Desafio Fullstack - Mini Kanban (Veritas)

Este repositório contém a solução para o desafio técnico fullstack de um mini-quadro Kanban, utilizando **Go** no backend e **React com TypeScript** no frontend.

##  Features

O projeto vai além do MVP, implementando alguns requisitos bônus:

- API RESTful completa com CRUD de tarefas.
- Persistência de dados em arquivo JSON no backend.
- Funcionalidade completa de Drag and Drop (_dnd-kit_) para mover tarefas.
- Sistema de tema dinâmico (Dark Mode / Light Mode) com React Context e CSS Variables.

##  Tech Stack

**Backend**
- Go (Golang)
- Gin-gonic
- sync.Mutex

**Frontend**
- React
- TypeScript
- Vite
- Axios
- dnd-kit
- CSS Modules

**DevOps**
- Docker
- Docker Compose
- Nginx (Proxy Reverso)

##  Como Rodar o Projeto

Este projeto é 100% containerizado. O método recomendado para rodar a aplicação é usando Docker.

### Método 1: Docker (Recomendado)

Este método irá construir as imagens do backend e frontend, e rodar tudo em containers isolados, incluindo Nginx para servir o frontend e fazer proxy da API.

**Pré-requisitos:**
- Docker
- Docker Compose
- Bash

### 1.Clone o repositório
```
git clone https://github.com/vsslvini/desafio-fullstack-veritas.git
cd desafio-fullstack-veritas
```

### 2.Suba os containers

```
docker compose up --build -d
```
>O '--build' é necessário apenas na primeira vez ou se houver mudanças.

### 3.Para parar a aplicação

```
docker compose down
```
Pronto! A aplicação estará disponível em [http://localhost:8080](http://localhost:8080).
O backend (API) escuta na porta 8000, mas o Nginx (porta 8080) redireciona automaticamente as chamadas de `/api` para ele.

### Método 2: Manual (Ambiente de Desenvolvimento)

Útil para rodar os serviços separadamente, por exemplo, para debugging ou desenvolvimento com hot-reload.

<details>
<summary><strong>Clique para ver as instruções de setup manual</strong></summary>

**Pré-requisitos:**
- Go (v1.25+ recomendado)
- Node.js (v18+ recomendado)

**1. Backend (Go)**

### Clone o repositório

```
git clone https://github.com/vsslvini/desafio-fullstack-veritas.git
cd desafio-fullstack-veritas/backend/cmd
```

### cd desafio-fullstack-veritas/backend/cmd

```
go mod tidy
```

### Rode o servidor (use '.' para compilar todos os arquivos .go)

```
go run .
```
Um arquivo 'tasks.json' será criado neste diretório.

### Em outro terminal, navegue até a pasta frontend

```
cd ../../frontend
```

### Instale as dependências

```
npm install
```

### Rode o cliente de desenvolvimento do Vite

```
npm run dev
```
> O app estará disponível em http://localhost:5173 (ou outra porta indicada)
</details>

## API Endpoints

A API RESTful segue os padrões de mercado:

- `GET /api/tasks`: Retorna a lista de todas as tarefas.
- `POST /api/tasks`: Cria uma nova tarefa.
- `PUT /api/tasks/:id`: Atualiza uma tarefa (editar texto e status).
- `DELETE /api/tasks/:id`: Deleta uma tarefa.

## Decisões Técnicas

Principais decisões de arquitetura e tecnologia no desenvolvimento:

### Backend (Go)

- **Arquitetura Limpa** com separação de responsabilidades:
  - `main.go`: Inicialização do servidor, configuração de rotas/CORS.
  - `storage.go`: Define o `TaskStore` (map[int]Task) e lógica de persistência (leitura/escrita do JSON) com `sync.Mutex`.
  - `handlers.go`: Controllers do Gin; valida dados e mantém lógica de API separada da lógica de dados.
- **Persistência em JSON**: Ao iniciar, carrega os dados do `tasks.json`. Após ops de escrita (POST, PUT, DELETE), reescreve o arquivo.
- **Concorrência:** Todas operações são protegidas por `sync.Mutex` para evitar race conditions.
- **Validação:** Handlers verificam campos obrigatórios e status permitidos ('A Fazer', 'Em Progresso', 'Concluídas').

### Frontend (React)

- **Stack:** Vite + TypeScript para build rápido e HMR; TypeScript para type-safety.
- **Tema Dinâmico:** React Context (`ThemeContext.tsx`) gerencia tema e persiste no localStorage.
  - CSS Variables (`theme.css`): Define as cores da UI como variáveis globais, usando `:root` (light) e `[data-theme='dark']` (dark).
  - CSS Modules para escopo local, consumindo variáveis globais.
- **Gerenciamento de Estado:** `App.tsx` gerencia estado principal (`tasks`) e feedback visual de loading/error.
- **API:** Utiliza Axios com baseURL configurada centralizadamente.
- **Drag and Drop:** Biblioteca moderna `dnd-kit` escolhida para mover tarefas.
  - **Atualização Otimista:** Ao mover cards entre colunas, o estado é atualizado imediatamente e revertido se ocorrer falha.
- **Modal Única para CRUD:** `TaskModal` reutilizável para adicionar, editar ou excluir tarefas, centralizando lógica de formulário e UI consistente.

### Docker e DevOps

- O uso de **Docker** garante que todas as dependências (Go, Node.js, Nginx etc.) sejam encapsuladas e replicáveis, facilitando o setup em qualquer ambiente (dev e produção).
- Com **Docker Compose**, todo o ambiente de execução – backend, frontend e proxy reverso – pode ser iniciado e parado rapidamente, melhorando o onboarding de novos desenvolvedores e testes.
- O **Nginx** atua como proxy reverso, simplificando o roteamento de requisições e permitindo uma configuração robusta, tanto para dev quanto para produção.
- O armazenamento de dados (JSON) permanece persistente mesmo após reinícios dos containers, pois é montado em volumes Docker.

## Limitações Conhecidas

- Não há autenticação ou autorização de usuários — qualquer pessoa pode manipular as tarefas se tiver acesso à API.
- Persistência local em arquivo JSON não é indicada para ambientes distribuídos/concorrentes em escala, pois não há controle avançado de concorrência além do `sync.Mutex`.
- Arquivos, imagens ou anexos não são suportados, apenas tasks de texto.
- O sistema não possui gerenciamento em tempo real (websockets).

## Melhorias Futuras

- Implementar autenticação e controle de acesso (JWT, OAuth).
- Adicionar testes automatizados (unitários, integração e end-to-end).
- Migrar persistência para banco de dados relacional ou NoSQL, estruturando melhor o backend para deploys em escala.
- Melhorar acessibilidade e responsividade da interface.
- Implementar upload e manipulação de arquivos anexos às tarefas.
- Refinar experiência de usuário (UX) com templates de tarefas, filtros, labels e histórico de alterações.

