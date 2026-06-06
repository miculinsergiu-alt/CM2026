# 🏆 CM 2026 Predicții

Aplicație pentru centralizarea predicțiilor de scor la Campionatul Mondial 2026.

## Structură
```
wc2026/
├── server/        → Node.js + Express + PostgreSQL  (Web Service pe Render)
└── client/        → React + Vite                    (Static Site pe Render)
```

---

## Deploy pe Render — pas cu pas

### 1. Creezi baza de date PostgreSQL
- Render Dashboard → **New** → **PostgreSQL**
- Name: `wc2026-db` → **Create Database**
- Copiezi **Internal Database URL** (îl folosești la pasul 3)

### 2. Creezi Web Service (backend)
- **New** → **Web Service** → conectezi GitHub repo
- **Root Directory:** `server`  ← important!
- **Build Command:** `npm install`
- **Start Command:** `node index.js`
- **Environment Variables:**
  ```
  DATABASE_URL  = <Internal Database URL de la pasul 1>
  NODE_ENV      = production
  FRONTEND_URL  = https://<numele-static-site-ului>.onrender.com
  ```
  *(FRONTEND_URL îl adaugi după ce creezi Static Site-ul)*
- **Create Web Service** → copiezi URL-ul (ex: `https://wc2026-api.onrender.com`)

### 3. Creezi Static Site (frontend)
- **New** → **Static Site** → același GitHub repo
- **Root Directory:** `client`  ← important!
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment Variables:**
  ```
  VITE_API_URL = https://wc2026-api.onrender.com  ← URL-ul de la pasul 2
  ```
- **Create Static Site**

### 4. Actualizezi FRONTEND_URL pe Web Service
- Mergi la Web Service → Environment → adaugi/actualizezi:
  ```
  FRONTEND_URL = https://<numele-static-site-ului>.onrender.com
  ```

---

## Parola admin
```
admin2026
```

## Development local
```bash
npm install
cd client && npm install && cd ..
```

Creează `.env` în root:
```
DATABASE_URL=postgresql://...
NODE_ENV=development
```

Creează `client/.env`:
```
VITE_API_URL=http://localhost:3001
```
