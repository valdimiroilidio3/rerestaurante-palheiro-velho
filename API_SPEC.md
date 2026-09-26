# 📡 Especificação da API do Palheiro Velho

## 🔐 Autenticação

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "admin@palheirovelho.pt",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "email": "admin@palheirovelho.pt",
    "role": "owner"
  },
  "expiresIn": 86400
}
```

---

## 📊 Dashboard

### GET `/api/dashboard/stats`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalReservations": 45,
  "pendingReservations": 3,
  "totalContacts": 12,
  "unreadContacts": 2,
  "upcomingEvents": 1,
  "totalMenuItems": 28,
  "monthlyRevenue": 15000,
  "occupancyRate": 0.85
}
```

---

## 🍽️ Menu

### GET `/api/menu`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "menu_1",
    "name": "Arroz de Marisco",
    "description": "Arroz fresco com mariscos do dia",
    "price": 28.50,
    "category": "prato-principal",
    "allergens": ["shellfish"],
    "available": true,
    "vegetarian": false,
    "vegan": false,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  }
]
```

### POST `/api/menu`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Arroz de Marisco",
  "description": "Arroz fresco com mariscos do dia",
  "price": 28.50,
  "category": "prato-principal",
  "allergens": ["shellfish"],
  "available": true
}
```

**Response:** `201 Created` + item criado

### PUT `/api/menu/{id}`

Atualiza um item existente. Mesmo format do POST.

### DELETE `/api/menu/{id}`

Remove um item do menu.

---

## 📅 Reservas

### GET `/api/reservations`

**Query Parameters:**
- `status` — filter: pending, confirmed, cancelled
- `from` — ISO date
- `to` — ISO date

**Response:**
```json
[
  {
    "id": "res_123",
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+351 913 456 789",
    "date": "2026-02-15",
    "time": "20:00",
    "guests": 4,
    "notes": "Aniversário",
    "status": "confirmed",
    "createdAt": "2026-01-10T14:30:00Z",
    "updatedAt": "2026-01-10T14:30:00Z"
  }
]
```

### POST `/api/reservations`

Criar nova reserva (pode ser do website ou admin).

### PUT `/api/reservations/{id}`

Atualizar status ou informações da reserva.

---

## 📧 Contactos

### GET `/api/contacts`

**Query Parameters:**
- `status` — filter: new, read, responded, archived

**Response:**
```json
[
  {
    "id": "contact_1",
    "name": "Maria Costa",
    "email": "maria@example.com",
    "phone": "+351 913 789 456",
    "subject": "Consulta sobre privé",
    "message": "Gostaria de saber sobre disponibilidade para evento corporativo",
    "status": "new",
    "createdAt": "2026-01-20T15:45:00Z"
  }
]
```

### PUT `/api/contacts/{id}`

Marcar como lido, respondido ou arquivado.

---

## 🎉 Eventos

### GET `/api/events`

**Query Parameters:**
- `published` — true/false
- `from` — ISO date
- `to` — ISO date

**Response:**
```json
[
  {
    "id": "event_1",
    "title": "Noite de Jazz",
    "description": "Uma noite especial com o projecto Jazz Trio",
    "startDate": "2026-02-21",
    "startTime": "21:00",
    "endTime": "23:30",
    "location": "esplanada",
    "capacity": 50,
    "tags": ["music", "wine", "dinner"],
    "published": true,
    "createdAt": "2026-01-15T10:00:00Z"
  }
]
```

### POST `/api/events`

Criar novo evento.

### PUT `/api/events/{id}`

Atualizar evento.

### DELETE `/api/events/{id}`

Remover evento.

---

## ℹ️ Informações da Casa

### GET `/api/info`

**Response:**
```json
{
  "name": "Palheiro Velho",
  "description": "Bar de praia com vista para o mar",
  "address": "Travessa da Barrinha",
  "locality": "Esmoriz",
  "region": "Aveiro",
  "phone": "+351 256 XXX XXX",
  "email": "info@palheirovelho.pt",
  "instagram": "@palheiro_velho_beach_bar",
  "facebook": "palheirovelho",
  "hours": {
    "monday": { "open": "12:00", "close": "23:00" },
    "tuesday": { "open": "12:00", "close": "23:00" },
    "wednesday": { "open": "12:00", "close": "23:00" },
    "thursday": { "open": "12:00", "close": "23:00" },
    "friday": { "open": "12:00", "close": "00:00" },
    "saturday": { "open": "12:00", "close": "00:00" },
    "sunday": { "open": "12:00", "close": "23:00" }
  }
}
```

### PUT `/api/info`

Atualizar informações da casa.

---

## 👥 Utilizadores

### GET `/api/users`

**Response:**
```json
[
  {
    "id": "user_1",
    "email": "admin@palheirovelho.pt",
    "role": "owner",
    "createdAt": "2025-06-01T10:00:00Z",
    "lastLogin": "2026-01-20T14:30:00Z"
  }
]
```

### POST `/api/users`

Criar novo utilizador (apenas owner).

### PUT `/api/users/{id}`

Atualizar role ou estado.

### DELETE `/api/users/{id}`

Remover utilizador.

---

## 🔄 Status HTTP

- `200` — OK
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not Found
- `500` — Server Error

---

## 📝 Notas

- Todos os endpoints exceto `/auth/login` requerem `Authorization: Bearer {token}`
- Os timestamps são em ISO 8601 (UTC)
- Os valores monetários estão em EUR
- Respostas de erro incluem `message` e opcionalmente `errors`

---

## 🛠️ Backend Recomendado

Esta API pode ser implementada com:

- **Node.js** + Express
- **Python** + Django/FastAPI
- **Go** + Gin
- **TypeScript** + NestJS

Sugestão: usar **NestJS** ou **Express** com TypeScript para manter consistência com o frontend.
