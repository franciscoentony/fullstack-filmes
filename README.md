# Gerenciador de Filmes - Fullstack

> Última atualização: Configuração de deploy backend concluída.

Este repositório contém o projeto unificado (Frontend + Backend) para facilitar o gerenciamento e deploy.

## Estrutura de Pastas

- `/frontend`: Aplicação React (Vite) de interface do usuário.
- `/backend`: API Node.js (Express) com MongoDB.

## Pré-requisitos

1. Node.js instalado.
2. MongoDB Atlas (ou local) configurado.

## Configuração Local

### 1. Variáveis de Ambiente

Crie os arquivos `.env` seguindo os exemplos:

#### Backend (`/backend/.env`):

```env
PORT=4000
MONGODB_URI=seu_mongodb_uri
JWT_SECRET=sua_chave_secreta
```

#### Frontend (`/frontend/.env`):

```env
VITE_API_URL=http://localhost:4000
```

### 2. Comandos Úteis (na Raiz)

- `npm install:all`: Instala todas as dependências do front e back.
- `npm run dev`: Inicia ambos os servidores simultaneamente.

## Deploy

Para o deploy, certifique-se de configurar as mesmas variáveis de ambiente na sua plataforma (Vercel, Railway, Render, etc).

- O Frontend deve apontar `VITE_API_URL` para a URL do seu backend em produção.
- O Backend deve ter o `MONGODB_URI` e `JWT_SECRET` configurados.
