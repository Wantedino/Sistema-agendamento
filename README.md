# Agenda Pro

Sistema de agendamento para pequenos negócios. Prestadores gerenciam sua agenda, clientes agendam pelo navegador.

## Stack

- Frontend: React + Vite + React Router DOM + Axios
- Backend: Node.js + Express + MongoDB + JWT

## Como rodar

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Variáveis de ambiente

Edite `backend/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agenda-pro
JWT_SECRET=sua_chave_secreta_aqui
```

## Rotas da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | /api/auth/register | ❌ | Cadastro |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/services | ✅ | Lista serviços |
| POST | /api/services | ✅ | Cria serviço |
| PUT | /api/services/:id | ✅ | Edita serviço |
| DELETE | /api/services/:id | ✅ | Remove serviço |
| GET | /api/appointments | ✅ | Lista agendamentos |
| POST | /api/appointments | ❌ | Cria agendamento |
| PUT | /api/appointments/:id/status | ✅ | Atualiza status |
| GET | /api/public/:userId/services | ❌ | Serviços públicos |
| GET | /api/public/:userId/slots | ❌ | Slots disponíveis |
