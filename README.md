# eLingo – Telugu Dictionary 📚

A community-powered Telugu dictionary where words are published through community votes.

## Features

- 📖 **Browse** Telugu words with multiple definitions
- 🔍 **Search** by word or browse A–Z
- 👍 **Vote** to help words & definitions go live
- ✍️ **Add** new words and definitions
- 🔐 **Auth** – JWT-based register/login
- 📍 **Regional** tagging for dialect awareness

## How Publishing Works

| Content    | Likes needed | Status |
|------------|-------------|--------|
| New Word   | **20 likes** | Goes live for everyone |
| Definition | **10 likes** | Appears under the word |

---

## Tech Stack

| Layer    | Tech |
|----------|------|
| Backend  | Python + FastAPI + SQLAlchemy |
| Database | SQLite (easily upgradeable to PostgreSQL) |
| Frontend | React 18 + Vite + React Router |
| Auth     | JWT (python-jose + bcrypt) |

---

## Local Development

### Requirements
- Python 3.10+
- Node.js 18+
- npm

### Step 1 – Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Step 2 – Seed sample data

```bash
curl -X POST http://localhost:8000/api/seed
```

Or click "Load Sample Telugu Words" on the home page.

### Step 3 – Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:5173

---

## Production Deployment

### Option 1: Render.com (Recommended – Free)

**Backend (Web Service):**
1. Go to https://render.com → New Web Service
2. Connect your GitHub repo
3. Settings:
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env var: `SECRET_KEY=your-random-secret-here`
5. Deploy → copy the URL (e.g. `https://elingo-api.onrender.com`)

**Frontend (Static Site):**
1. New Static Site on Render
2. Root: `frontend`
3. Build: `npm install && npm run build`
4. Publish: `dist`
5. Add env var: `VITE_API_URL=https://elingo-api.onrender.com`

### Option 2: Railway.app (Free Tier)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Option 3: Single-Service Deploy (Backend serves Frontend)

Build the frontend and copy into backend:

```bash
cd frontend
VITE_API_URL="" npm run build
cp -r dist ../backend/

cd ../backend
# The FastAPI app serves the React build automatically
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Option 4: Docker

```bash
cd frontend && npm run build
docker-compose up --build
```

Open http://localhost:8000

---

## Environment Variables

| Variable      | Default | Description |
|---------------|---------|-------------|
| `SECRET_KEY`  | (insecure default) | JWT signing key – **change in production!** |
| `DATABASE_URL`| `sqlite:///./elingo.db` | Database URL |
| `VITE_API_URL`| (empty = same origin) | Backend URL for frontend |

---

## API Endpoints

```
POST /api/auth/register    – Create account
POST /api/auth/login       – Login
GET  /api/auth/me          – Current user

GET  /api/words            – List words (?search=&letter=&sort=&pending=)
GET  /api/words/{id}       – Word details with definitions
POST /api/words            – Submit new word (auth required)
POST /api/words/{id}/definitions – Add definition (auth required)

POST /api/vote/word/{id}        – Vote on word (auth required)
POST /api/vote/definition/{id}  – Vote on definition (auth required)

POST /api/flag/word/{id}        – Flag word (auth required)
POST /api/flag/definition/{id}  – Flag definition (auth required)

POST /api/seed             – Load sample Telugu words
```

---

## Project Structure

```
elingo/
├── backend/
│   ├── main.py         ← FastAPI app + all routes
│   ├── models.py       ← SQLAlchemy database models
│   ├── schemas.py      ← Pydantic request/response models
│   ├── auth.py         ← JWT auth helpers
│   ├── database.py     ← DB connection setup
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Router + Auth context
│   │   ├── api.js           ← All API calls
│   │   ├── pages/
│   │   │   ├── Home.jsx      ← Main dictionary view
│   │   │   ├── Details.jsx   ← Word detail page
│   │   │   ├── Login.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── AddWord.jsx   ← Add word / definition
│   │   └── components/
│   │       ├── Sidebar.jsx   ← Nav + alphabet search
│   │       └── WordCard.jsx  ← Word display card
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## Admin Account (after seeding)

Email: `admin@elingo.app`  
Password: `admin123`

---

## Upgrading to PostgreSQL

Change `DATABASE_URL`:
```
DATABASE_URL=postgresql://user:password@host/dbname
```

And add to requirements: `psycopg2-binary`

---

Built with ❤️ for Telugu speakers worldwide.
