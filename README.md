# School Management System

Full-stack school fee management system built with:
- **Backend**: FastAPI + SQLAlchemy + Alembic + Neon DB (PostgreSQL)
- **Frontend (Main)**: React + Vite + Tailwind CSS
- **Frontend (Learning)**: Plain HTML + Tailwind CDN + Vanilla JS

---

## Project Structure

```
school-backend/          ← FastAPI backend
school-frontend/         ← React (Vite) — main project
school-frontend-html/    ← Plain HTML version — for learning comparison
```

---

## Backend Setup

### 1. Install dependencies
```bash
cd school-backend
pip install -r requirements.txt
```

### 2. Configure Neon DB
Copy `.env.example` to `.env` and fill in your Neon DB credentials:
```bash
cp .env.example .env
```

Get your connection string from https://console.neon.tech
It should look like:
```
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxxx.us-east-1.aws.neon.tech/school_db?ssl=require
SYNC_DATABASE_URL=postgresql+psycopg2://user:password@ep-xxxx.us-east-1.aws.neon.tech/school_db?ssl=require
```

### 3. Run migrations
```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### 4. Start the server
```bash
uvicorn app.main:app --reload
```

API docs available at: http://localhost:8000/docs

---

## React Frontend Setup

```bash
cd school-frontend
npm install
npm run dev
```

Opens at: http://localhost:5173

### Build for production
```bash
npm run build      # Creates dist/ folder
npm run preview    # Preview the production build
```

### Environment variable
Create `school-frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api/v1
```
For production, set this to your deployed backend URL.

---

## Plain HTML Version

Just open `school-frontend-html/index.html` in a browser.

By default it connects to `http://localhost:8000`. To change:
```html
<!-- Add before closing </body> -->
<script>window.API_URL = 'https://your-backend.com'</script>
```

Or serve it with any static file server:
```bash
cd school-frontend-html
npx serve .
```

---

## Deployment

### Backend → Render.com (Free tier)
1. Push to GitHub
2. Create new Web Service on render.com
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env`

### React Frontend → Vercel (Free)
1. Push `school-frontend/` to GitHub
2. Import on vercel.com
3. Set `VITE_API_URL` environment variable to your Render backend URL
4. Deploy

### Plain HTML → Netlify (Free)
1. Drag & drop `school-frontend-html/` folder to netlify.com/drop
2. Done — update `API_URL` in the script tag to point to your backend

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/v1/dashboard/stats | Dashboard statistics |
| GET/POST | /api/v1/students | List / create students |
| GET/PATCH/DELETE | /api/v1/students/{id} | Student detail |
| GET | /api/v1/students/{id}/siblings | Get siblings |
| POST | /api/v1/students/{id}/parents | Link parent |
| GET/POST | /api/v1/parents | List / create parents |
| GET/POST | /api/v1/fees | List / create fee types |
| POST | /api/v1/fees/{id}/overrides | Add class override |
| GET/POST | /api/v1/invoices | List / create invoices |
| GET | /api/v1/invoices/{id} | Invoice detail |
| GET/POST | /api/v1/payments | List / record payments |

---

## React vs Plain HTML — Key Differences

| Concept | React (Vite) | Plain HTML |
|---------|-------------|------------|
| State | `useState` hook | JS variables |
| Routing | react-router-dom | Manual show/hide |
| API calls | axios library | `fetch()` |
| Styling | Tailwind classes in JSX | Tailwind CDN + inline styles |
| Components | Reusable .jsx files | Functions in `<script>` |
| Build step | Yes (npm run build) | No build needed |
| File count | ~15 files | 1 file |
| Best for | Large apps, teams | Quick prototypes, learning |
