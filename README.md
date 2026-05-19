# AdGenius AI

> Tu agencia de marketing. En segundos.

Plataforma SaaS impulsada por IA que funciona como una agencia de publicidad y creación de contenido automatizada.

## Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS + Zustand + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **IA Texto**: OpenAI GPT-4o
- **IA Imágenes**: DALL-E 3

## Setup rápido

### 1. Variables de entorno

**Backend** (`backend/.env`):
```
SUPABASE_URL=https://aflgbaedasmivsectzvh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
OPENAI_API_KEY=tu_openai_key
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```
VITE_SUPABASE_URL=https://aflgbaedasmivsectzvh.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_API_URL=http://localhost:3001
```

### 2. Base de datos

Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase:
https://supabase.com/dashboard/project/aflgbaedasmivsectzvh/sql

### 3. Instalar dependencias

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Iniciar desarrollo

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Abre http://localhost:5173

## Flujo principal

1. El usuario describe su negocio
2. La IA analiza y detecta propuesta de valor, dolores y diferenciadores
3. Se generan 10 ideas de campaña con hooks y conceptos creativos
4. El usuario elige una campaña
5. La IA genera el post completo (headline, copy, CTA, hashtags)
6. La IA construye un prompt visual y genera la imagen
7. Opcional: guion completo de video con storyboard

## Sistema de créditos

| Acción | Créditos |
|--------|----------|
| Ideas de campaña | 1 |
| Post / Story / Reel | 2 |
| Carrusel | 3 |
| Guion de video | 3 |
| Imagen (DALL-E 3) | 5 |
| Video generado | 10 |

Nuevos usuarios reciben **20 créditos gratis** al registrarse.
