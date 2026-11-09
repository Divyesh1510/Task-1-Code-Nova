# NotesFlow - Production-Ready Full-Stack Notes CRUD Application

A modern, production-ready Full-Stack Notes CRUD (Create, Read, Update, Delete) application built with **FastAPI** (Python 3.10+) on the backend and **React + Vite + Tailwind CSS** on the frontend.

Designed and structured for the **CodeNova Internship Assignment**.

---

## 🌟 Features

- **RESTful FastAPI Backend**:
  - `GET /health` &mdash; System health check endpoint.
  - `GET /api/notes` &mdash; Retrieves all notes ordered by most recently updated.
  - `POST /api/notes` &mdash; Creates a new note with required `title` and `content`.
  - `PUT /api/notes/{id}` &mdash; Updates a note's title and/or content.
  - `DELETE /api/notes/{id}` &mdash; Deletes a note (HTTP 204 No Content).
  - SQLAlchemy 2.0 ORM with PostgreSQL support and automatic SQLite fallback for local development.
  - Comprehensive Pydantic v2 schemas and validation (handles 422 validation errors & 404 not found exceptions).
  - CORS Middleware configured for production domains or localhost.
- **Modern React (Vite) Frontend**:
  - Clean card and responsive grid layout built with Tailwind CSS.
  - Inline editing as well as dedicated Modal editing for seamless UX.
  - Delete with safety confirmation popover to prevent accidental deletions.
  - Real-time search/filter bar for instant note filtering.
  - Visual backend connection status indicator and manual refresh button.
  - Formatted relative/human-readable timestamps (`updated_at` / `created_at`).
  - Graceful error alerts and toast-style success feedback notifications.
- **Deployment Ready**:
  - Configured for **Neon / Supabase** (Postgres), **Render** (FastAPI backend), and **Firebase Hosting** / **Vercel** (Frontend).

---

## 📁 Repository Structure

```
├── backend/
│   ├── database.py         # SQLAlchemy engine, session maker, get_db dependency
│   ├── models.py           # Note database table definition
│   ├── schemas.py          # Pydantic v2 request/response models
│   ├── main.py             # FastAPI app, CORS, routes & exception handlers
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment variable template
│   └── .env                # Local environment configuration (git ignored)
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteCard.jsx      # Note card with inline-edit & delete confirm
│   │   │   ├── NoteForm.jsx      # Creation form with validation
│   │   │   ├── EditNoteModal.jsx # Modal dialog for focused editing
│   │   │   └── ErrorAlert.jsx    # UI error notifications
│   │   ├── api.js          # Fetch API client wrapper
│   │   ├── App.jsx         # Main application container
│   │   ├── index.css       # Tailwind CSS directives
│   │   └── main.jsx        # React entry point
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
├── firebase.json           # Firebase hosting configuration (Single Page App rewrite)
├── .firebaserc             # Firebase project config (`Task-1-CodeNova_Internship_divyeshreddy`)
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ (tested on Node v20/v26) & **npm**

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to `/backend`:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *By default, `DATABASE_URL=sqlite:///./notes.db` is configured for zero-setup local SQLite persistence.*

5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   - **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Health check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### 3. Frontend Setup (React + Vite)

1. In another terminal window, navigate to `/frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Ensure `VITE_API_URL=http://localhost:8000`)*

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Production Deployment Guide

### A. Database Deployment on Neon (Serverless Postgres)

1. Sign up or log into [Neon Console](https://console.neon.tech).
2. Create a new PostgreSQL database project (e.g. `notes-db`).
3. Under the **Dashboard**, copy the **Connection string** (PostgreSQL URI). It looks like:
   ```
   postgresql://user:password@ep-cool-sample.region.neon.tech/neondb?sslmode=require
   ```
4. Save this URI to configure in your backend hosting service.

---

### B. Backend Deployment on Render

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `CORS_ORIGINS`: `*` *(or your Firebase / Vercel frontend URL)*
6. Click **Deploy Web Service**.
7. Once deployed, note down your Render service URL (e.g. `https://notes-backend-xxxx.onrender.com`).

---

### C. Frontend Deployment to Firebase Hosting

The repository includes pre-configured `firebase.json` and `.firebaserc` pointing to project:
`Task-1-CodeNova_Internship_divyeshreddy`.

1. In `/frontend`, update `.env` or set environment variable:
   ```env
   VITE_API_URL=https://<your-render-backend-url>.onrender.com
   ```
2. Build the production React assets from the root or frontend folder:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```
3. Install the Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
4. Log into Firebase:
   ```bash
   firebase login
   ```
5. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```
   Your app will be live at:
   `https://Task-1-CodeNova_Internship_divyeshreddy.web.app`

---

### D. Alternative Frontend Deployment to Vercel

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com) and import your Git repository.
3. Configure the Project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-render-backend-url>.onrender.com`
5. Click **Deploy**.

---

## 🧪 Testing the API Endpoints

You can test the endpoints directly using `curl` or FastAPI's Swagger UI at `/docs`:

```bash
# 1. Health Check
curl -X GET http://localhost:8000/health

# 2. Create Note
curl -X POST http://localhost:8000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "Assignment Note", "content": "Complete full-stack CRUD assignment."}'

# 3. Get Notes
curl -X GET http://localhost:8000/api/notes

# 4. Update Note (replace 1 with actual note id)
curl -X PUT http://localhost:8000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "content": "Updated content successfully."}'

# 5. Delete Note
curl -X DELETE http://localhost:8000/api/notes/1
```

---

## 🛡️ License

Built for CodeNova Internship Evaluation by **Divyesh Reddy**.

