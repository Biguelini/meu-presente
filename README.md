# 🎁 Meu Presente

Sistema web em PT-BR para criação e gerenciamento de listas de presentes.

## ✨ Funcionalidades

- Criação de múltiplas listas de presentes por usuário
- Lista pública compartilhável por link (sem expor dados do dono)
- Sistema de marcação de presentes como comprados (preserva surpresa)
- Ordenação por prioridade via drag & drop
- Ordenações secundárias (nome, preço, data de inserção)
- Lista global com todos os presentes do usuário

## 🛠 Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB (Mongoose)
- JWT (access + refresh tokens)
- bcrypt

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- dnd-kit (drag & drop)
- React Router v6
- Axios

## 📁 Estrutura do Projeto

```
meu-presente/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações (DB, env)
│   │   ├── controllers/    # Controllers REST
│   │   ├── middlewares/    # Auth, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Lógica de negócio
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilitários
│   │   └── server.ts       # Entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── contexts/       # React Context (Auth)
    │   ├── pages/          # Páginas da aplicação
    │   ├── services/       # API clients
    │   ├── types/          # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- MongoDB (local ou Atlas)
- npm ou yarn

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Executar em desenvolvimento
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar tokens
- `POST /api/auth/logout` - Logout

### Listas (privado)
- `GET /api/lists` - Listar todas as listas
- `POST /api/lists` - Criar lista
- `GET /api/lists/:id` - Obter lista com presentes
- `PUT /api/lists/:id` - Atualizar lista
- `DELETE /api/lists/:id` - Excluir lista
- `GET /api/lists/global` - Lista global (todos os presentes)

### Presentes (privado)
- `POST /api/lists/:listaId/gifts` - Adicionar presente
- `PUT /api/gifts/:id` - Atualizar presente
- `DELETE /api/gifts/:id` - Excluir presente
- `PATCH /api/lists/:listaId/gifts/reorder` - Reordenar na lista
- `PATCH /api/lists/global/gifts/reorder` - Reordenar globalmente

### Público (sem autenticação)
- `GET /api/public/lists/:slug` - Ver lista pública
- `POST /api/public/gifts/:id/mark-bought` - Marcar como comprado

## 🔒 Regras de Negócio

1. **Presentes comprados somem para todos** - Ao marcar como comprado, o presente desaparece de todas as visualizações (inclusive do dono), preservando a surpresa.

2. **Conflito de compra** - Se alguém tentar comprar um presente já comprado, recebe erro HTTP 409.

3. **Privacidade** - Listas públicas não mostram o nome do dono, apenas um identificador como "Lista #AB12F9".

4. **Drag & Drop** - Funciona apenas quando a ordenação está em "prioridade". Outras ordenações desativam o arraste.

5. **Preços nulos** - Na ordenação por preço, itens sem preço vão para o final.

## 🔧 Variáveis de Ambiente (Backend)

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/meu-presente
JWT_ACCESS_SECRET=seu-segredo-aqui
JWT_REFRESH_SECRET=seu-segredo-aqui
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 📝 Licença

MIT
