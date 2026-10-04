# ⚡ VYBE — Smart Campus Event Discovery & Wayfinding

> **"Don't just find the event. Get to it."**  
> An intelligent, full-stack campus navigation and smart event management platform designed for **Adi Shankara Institute of Engineering & Technology (ASIET) Kalady**, crafted with an authentic **Hand-Drawn Sketchbook & Architectural Blueprint** aesthetic.
>
> 🌐 **Live Production Link**: [https://vybe-xi-ecru.vercel.app](https://vybe-xi-ecru.vercel.app)

---

## 🎨 Design Philosophy: Hand-Drawn Sketchbook System

VYBE intentionally rejects sterile corporate SaaS conventions—no generic glassmorphism, no ambient blurry drop-shadows, and no cold `#000000` blacks. Instead, it captures the warm, tactile feel of an engineering student's physical notebook and drafting table:

* **Warm Paper & Dot-Grid Canvas**: `#fdfbf7` paper with `24px x 24px` notebook dot-grid drafting texture.
* **Chalkboard Blueprint Dark Mode**: One-click sun/moon toggle switching to a high-contrast chalkboard slate (`#141312` / `#1e1d1b`) with architectural white chalk lines, vibrant marker accents, and persistent theme memory (`localStorage`).
* **Tactile Mechanical Buttons**: Physical card press animations on hover/click with collapsed offset shadows (`4px 4px 0px #2d2d2d` → `0px 0px`).
* **Sketchbook Accents**: Loose-leaf yellow sticky notes (`#fff9c4`), red thumbtacks with specular highlights, and translucent drafting tape strips.
* **Typographic Voice**: Headings set in **Kalam** (bold marker, 700), body text and notes in **Patrick Hand** (cursive, 400).

---

## 🚀 Key Features & Protocols

### 1. 🛡️ Dedicated Admin Protocol (`/admin`)
* **Role-Based Authentication**: Secure login using credentials (`admin` / `admin123`) automatically redirects to the dedicated Admin Desk.
* **Event Approval Pipeline**: Dean / Faculty moderation workflow to review, approve, or reject student-submitted event proposals.
* **Venue Double-Booking & Clash Guardrails**: Instant collision alerts if two events request the same hall at overlapping hours.
* **Live Capacity Tracker**: Real-time RSVP monitoring against hall seating limits (e.g., Turing Lab: 40 seats, Shankara Auditorium: 350 seats).
* **One-Click Demo Reset**: Restores all seed events and cleans state for judging demonstrations.

### 2. 🎓 Dedicated Student Protocol (`/student`)
* **Persona & Profile Center**: Displays registered department, accessibility preferences, and active schedule.
* **My Active RSVPs & Passes**: Quick-access drawer for all registered events with one-click entry pass loading.
* **Timetable Sync & Schedule Insights**: View booked lectures alongside campus activities.

### 3. 🧭 Smart Graph Navigation Engine (`/events`)
* **25-Node Weighted Topological Campus Graph**: Models building entrances, outdoor plazas, stairs, accessible ramps, and covered arcades across ASIET Kalady.
* **Dijkstra Dynamic Pathfinder**:
  - **Standard Walk**: Optimal walking route with real-time distance and ETA calculations (at pedestrian standard `1.2 m/s`).
  - **Step-Free / Accessible Mode**: Automatically filters out stairs and steep inclines to route exclusively via ramps and elevators.
  - **Rain Mode (Sheltered Walkways)**: Applies penalty weights to uncovered outdoor paths, prioritizing covered corridors and arcades during Kerala monsoons.
* **Voice Turn-by-Turn Directions**: Integrated **Web Speech API** (`window.speechSynthesis`) providing spoken turn-by-turn guidance with step highlighting.

### 4. ⚡ Intelligent Clash & Conflict Engine
* **Personal Timetable Collision Detection**: Flags direct schedule clashes when an event overlaps with a student's lectures or labs.
* **Walking Buffer Time Analysis**: Evaluates whether travel between consecutive venues across campus is physically feasible within the break window.
* **Conflict-Free Alternatives**: Automatically recommends non-conflicting, reachable event alternatives with one-click RSVP.

### 5. 🔍 Free-Gap Finder ("What fits my free hour?")
* Scans a student's daily schedule for empty periods between classes.
* Computes walking transit time to and from venues, filtering and ranking activities that conclude safely before the next class begins.

### 6. 🎟️ Offline QR Entry Pass & Check-In
* Real-time RSVP generation producing an authentic, printable/scannable QR event pass ticket.
* Built-in door check-in simulator that logs timestamps and updates attendance metrics in real time.

---

## 💾 Database & State Management Architecture

* **In-Memory Graph & Relational State**: Powered by Python FastAPI with high-performance in-memory data structures and JSON persistence models.
* **Graph Topology**: Maintained as a bidirectional weighted adjacency graph using **NetworkX**, enabling sub-millisecond pathfinding calculations.
* **Timetable Interval Tree**: Efficient temporal overlap calculations for student lecture hours and event windows.
* **Client Session**: Authenticated user state, active role tokens, and custom preferences persist safely via browser `localStorage`.

---

## 📐 Technical Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19, Vite 8, React Router v7 | Single Page Application with dynamic multi-entrypoint routing |
| **Styling** | Tailwind CSS v3, PostCSS | Custom hand-drawn wobbly radii, sketch shadows, and chalkboard dark mode |
| **Motion & Audio** | Framer Motion v13, Web Speech API | Physical spring animations and spoken turn-by-turn navigation |
| **Backend** | Python 3.12+, FastAPI, Uvicorn | Async REST API with hot-reloading and Pydantic v2 schema validation |
| **Algorithms** | NetworkX, NumPy | Dijkstra graph routing, schedule interval overlap, multi-factor ranking |
| **Deployment** | Vercel Multi-Services | Unified multi-service deployment with clean-url SPA fallbacks and `/api/*` proxies |

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
│   ├── public/
│   │   └── vercel.json          # Deployed SPA cleanUrls rewrite fallback
│   ├── src/
│   │   ├── config.js            # Unified API client configuration (VITE_API_URL || '/api')
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Hero landing page, campus trail intro, theme toggle
│   │   │   ├── AdminPage.jsx    # Dedicated Admin & Moderation Portal (/admin)
│   │   │   ├── StudentPage.jsx  # Dedicated Student Cockpit (/student)
│   │   │   ├── EventsPage.jsx   # Event feed showcase, filtering & campus map cockpit (/events)
│   │   │   └── EventDetailPage.jsx # Detailed event view, dedicated routing & voice TTS
│   │   ├── components/
│   │   │   ├── auth/            # LoginModal (Student & Admin login / registration)
│   │   │   ├── common/          # SketchButton, SketchCard, StickyNote, DemoBadge
│   │   │   ├── feed/            # EventCard, ClashBanner, FreeGapFinder
│   │   │   ├── map/             # CampusMapSvg, RouteControls, StepDirections
│   │   │   ├── organizer/       # EventCreateModal (with image upload)
│   │   │   └── student/         # QrPassModal (SVG QR ticket generator & door check-in)
│   │   ├── hooks/               # useSpeech (browser Web Speech API wrapper)
│   │   ├── styles/              # handDrawn.css (chalkboard dark mode, wobbly borders, tape)
│   │   └── App.jsx              # Main routing shell, role redirects & global handlers
│   ├── vite.config.js           # Multi-entrypoint SPA fallback plugin for Vercel cleanUrls
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

## ☁️ Deployment on Vercel

The application is deployed using Vercel's **Multi-Service Project Architecture**:
* **Backend Service**: Serves FastAPI endpoints on `/api/*` and file uploads on `/uploads/*`.
* **Frontend Service**: Serves the Vite React Single Page Application with `cleanUrls: true`.
* **SPA Routing Fix**: A custom Vite build plugin emits static entrypoints (`admin.html`, `student.html`, `events.html`, and `404.html`) so direct navigation to subpaths never returns 404 errors.

---

## 🔑 Demo Credentials

| Role | Username / ID | Password | Target Page | Access Capabilities |
|---|---|---|---|---|
| **Admin** | `admin` | `admin123` | [`/admin`](https://vybe-xi-ecru.vercel.app/admin) | Event approval desk, venue conflict logs, capacity analytics, demo reset |
| **Student** | Any self-registered ID (e.g., `ASIET-2024-CS`) | Custom | [`/student`](https://vybe-xi-ecru.vercel.app/student) | Personalized event ranking, RSVP tickets, QR check-in, clash alerts |

---

## 🔒 Data Honesty & Compliance

* **Campus Graph**: Built upon an authentic 25-node topological architectural graph representing actual college facilities (Aryabhata Block, Turing Lab, Kalam Auditorium, Central Library).
* **Walking Speed Standard**: Walking travel times are strictly calculated based on the pedestrian benchmark of `1.2 m/s` (~`4.3 km/h`).
* **Indoor Positioning**: Transparently operates on landmark-based routing without unverified claims of indoor GPS micro-location.
