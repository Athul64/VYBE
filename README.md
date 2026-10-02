# ⚡ VYBE — Smart Campus Event Discovery & Wayfinding

> **"Don't just find the event. Get to it."**  
> An intelligent, full-stack campus navigation and smart event management platform designed with an authentic **Hand-Drawn Sketchbook & Architectural Blueprint** aesthetic.

---

## 🎨 Design Philosophy: Hand-Drawn Sketchbook System

VYBE intentionally rejects sterile corporate SaaS conventions—no generic glassmorphism, no ambient blurry drop-shadows, and no cold `#000000` blacks. Instead, it captures the warm, tactile feel of an engineering student's physical notebook and drafting table:

* **Warm Paper & Dot-Grid Canvas**: `#fdfbf7` paper with `24px x 24px` notebook dot-grid drafting texture.
* **Chalkboard Blueprint Dark Mode**: One-click sun/moon toggle switching to a high-contrast chalkboard slate (`#141312` / `#1e1d1b`) with architectural white chalk lines, vibrant marker accents, and persistent theme memory (`localStorage`).
* **Tactile Mechanical Buttons**: Physical card press animations on hover/click with collapsed offset shadows (`4px 4px 0px #2d2d2d` → `0px 0px`).
* **Sketchbook Accents**: Loose-leaf yellow sticky notes (`#fff9c4`), red thumbtacks with specular highlights, and translucent drafting tape strips.
* **Typographic Voice**: Headings set in **Kalam** (bold marker, 700), body text and notes in **Patrick Hand** (cursive, 400).

---

## 🚀 Key Features

### 1. 🧭 Smart Graph Navigation Engine
* **25-Node Weighted Topological Campus Graph**: Models building entrances, intersections, ramps, and covered walkways.
* **Dijkstra Dynamic Pathfinder**:
  - **Standard Walk**: Optimal walking route with real-time distance and ETA calculations.
  - **Step-Free / Accessible Mode**: Automatically filters out stairs and steep inclines to route via ramps and elevators (tailored for wheelchair accessibility).
  - **Rain Mode (Sheltered Walkways)**: Applies penalty weights to uncovered lawn paths, prioritizing covered arcades, tunnels, and corridors.
* **Voice Turn-by-Turn Directions**: Integrated **Web Speech API** (`window.speechSynthesis`) providing spoken turn-by-turn guidance with active step highlighting.

### 2. ⚡ Intelligent Clash & Conflict Engine
* **Personal Timetable Collision Detection**: Flags direct schedule clashes when an event overlaps with a student's lectures or labs.
* **Walking Buffer Time Analysis**: Evaluates whether travel between consecutive venues across campus is physically feasible within the break window.
* **Conflict-Free Alternatives**: Automatically recommends non-conflicting, reachable event alternatives with one-click RSVP.

### 3. 🔍 Free-Gap Finder ("What fits my free hour?")
* Scans a student's daily schedule for empty periods between classes.
* Computes walking transit time to and from venues, filtering and ranking activities that conclude safely before the next class begins.

### 4. 🎟️ Offline QR Entry Pass & Check-In
* Real-time RSVP generation producing an authentic, printable/scannable QR event pass ticket.
* Built-in door check-in simulator that logs timestamps and updates attendance metrics in real time.

### 5. 🛡️ Role-Based Authentication & Moderation Desk
* **Student Self-Registration & Login**: Authentic sign-up with department selection and accessibility needs (`needs_step_free`).
* **Admin / Organizer Moderation Desk**:
  - Event approval/rejection pipeline.
  - Venue double-booking conflict guardrails.
  - Live capacity overflow alerts (e.g., alert when RSVPs exceed venue seating capacity).
* **Local System Poster Uploads**: Upload event posters and flyers directly from your device, served seamlessly via `/uploads/`.

---

## 📐 Technical Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite 8, React Router v7 | High-performance client-side SPA with Rolldown / ESBuild bundling |
| **Styling** | Tailwind CSS v3, PostCSS | Custom hand-drawn wobbly radii, sketch shadows, and chalkboard dark mode |
| **Motion & Audio** | Framer Motion v13, Web Speech API | Physical spring animations and spoken turn-by-turn navigation |
| **Backend** | Python 3.14, FastAPI, Uvicorn | Async REST API with hot-reloading and Pydantic v2 schema validation |
| **Algorithms** | NetworkX, NumPy | Dijkstra graph routing, schedule interval overlap, multi-factor ranking |
| **Deployment** | Vercel Multi-Services | Unified multi-service deployment with `/api/*` and `/uploads/*` rewrites |

---

## 📁 Repository Structure

```
event-trail/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application, route handlers, file upload endpoint
│   │   ├── graph.py             # 25-node campus architectural graph & Dijkstra pathfinder
│   │   ├── ranking.py           # Multi-factor event ranking & explainability generator
│   │   ├── clash.py             # Timetable overlap & walking travel time buffer analysis
│   │   ├── seed_data.py         # Seeded personas, timetables, venues, and demo events
│   │   └── models.py            # Pydantic v2 schemas and validation models
│   ├── uploads/                 # Storage directory for uploaded event posters
│   ├── main.py                  # Root entrypoint for Vercel Python runtime
│   └── requirements.txt         # FastAPI, Uvicorn, NetworkX, NumPy, Pydantic, python-multipart
├── frontend/
│   ├── src/
│   │   ├── config.js            # Unified API client configuration (VITE_API_URL || '/api')
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Hero landing page, campus trail intro, theme toggle
│   │   │   ├── EventsPage.jsx   # Event feed showcase, filtering & campus map cockpit
│   │   │   └── EventDetailPage.jsx # Detailed event view, dedicated routing & voice TTS
│   │   ├── components/
│   │   │   ├── auth/            # LoginModal (Student & Admin login / registration)
│   │   │   ├── common/          # SketchButton, SketchCard, StickyNote, DemoBadge
│   │   │   ├── feed/            # EventCard, ClashBanner, FreeGapFinder
│   │   │   ├── map/             # CampusMapSvg, RouteControls, StepDirections
│   │   │   ├── organizer/       # EventCreateModal (with image upload), AdminDashboard
│   │   │   └── student/         # QrPassModal (SVG QR ticket generator & door check-in)
│   │   ├── hooks/               # useSpeech (browser Web Speech API wrapper)
│   │   ├── styles/              # handDrawn.css (chalkboard dark mode, wobbly borders, tape)
│   │   └── App.jsx              # Main routing shell, theme state & global handlers
│   ├── vite.config.js           # Vite configuration with local dev proxy for /api and /uploads
│   ├── tailwind.config.js       # Hand-drawn theme extension & color variables
│   └── package.json
├── vercel.json                  # Vercel multi-service configuration & rewrite rules
├── .gitignore                   # Python, Node, and Vercel ignore rules
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Backend Setup (FastAPI)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

* Live Interactive Swagger API Docs: `http://localhost:8000/docs`
* API Root Status: `http://localhost:8000/`

### 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

* Open your browser at: `http://localhost:5173`
* Requests to `/api/*` and `/uploads/*` are automatically proxied to `http://localhost:8000`.

---

## ☁️ Deploying to Vercel

This repository is pre-configured for Vercel's **Multi-Service Project Architecture** using the root [`vercel.json`](./vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "backend": {
      "root": "backend",
      "framework": "fastapi"
    },
    "frontend": {
      "root": "frontend",
      "framework": "vite"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": { "service": "backend" } },
    { "source": "/uploads/(.*)", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}
```

### Steps to Deploy:
1. Push your changes to GitHub:
   ```bash
   git push origin main
   ```
2. In the [Vercel Dashboard](https://vercel.com), click **Add New...** → **Project**.
3. Import your GitHub repository (`Athul64/VYBE`).
4. Keep the **Root Directory** as `./`. Vercel will automatically detect `vercel.json`.
5. Click **Deploy**. Both services will build and link under your single custom domain!

---

## 🔑 Demo Credentials

| Role | Username / ID | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Event approval desk, venue conflict logs, capacity analytics, demo reset |
| **Student** | Any self-registered ID (e.g., `ASIET-2024-CS`) | Custom | Personalized event ranking, RSVP tickets, QR check-in, clash alerts |

---

## 🔒 Data Honesty & Compliance

* **Campus Graph**: Built upon an authentic 25-node topological architectural graph representing actual college facilities (Aryabhata Block, Turing Lab, Kalam Auditorium, Central Library).
* **Walking Speed Standard**: Walking travel times are strictly calculated based on the pedestrian benchmark of `1.2 m/s` (~`4.3 km/h`).
* **Indoor Positioning**: Transparently operates on landmark-based routing without unverified claims of indoor GPS micro-location.
