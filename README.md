# ⚡ VYBE — Smart Campus Event Discovery & Wayfinding

> **"Don't just find the event. Get to it."**  
> Built for College Hackathon (12-Hour Build) adhering strictly to the **Hand-Drawn Sketchbook Design System** and complete PRD functional requirements.

---

## 🎨 The Hand-Drawn Sketchbook Design System

VYBE rejects corporate SaaS clichés—no sterile glassmorphism, no ambient blurred shadows, no rounded pill badges, and never pure `#000000` blacks. Instead, it feels like an authentic college student's physical notebook:

* **Warm Paper Texture**: `#fdfbf7` with `24px x 24px` notebook dot-grid background (`#e5e0d8`).
* **Graphite Pencil Outlines**: Soft pencil `#2d2d2d` borders (`3px solid`).
* **Mechanical Flat-Press Buttons**: Physical card press on hover/click with collapsed offset shadows (`4px 4px 0px #2d2d2d` → `0px 0px`).
* **Authentic Notebook Artefacts**: Loose-leaf yellow sticky notes (`#fff9c4`), red thumbtacks with specular highlights, and translucent drafting tape strips.
* **Typographic Voice**: Headings in **Kalam** (bold marker, 700), body text and labels in **Patrick Hand** (cursive, 400).

---

## 📐 Technology Architecture

```
event-trail/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI router, CORS & live check-in endpoints
│   │   ├── graph.py             # 25-node campus architectural graph & Dijkstra pathfinder
│   │   ├── ranking.py           # PRD multi-factor ranking & explainability generator
│   │   ├── clash.py             # Timetable overlap & walking travel time buffer analysis
│   │   ├── seed_data.py         # Seeded personas (Meera, Arjun), timetables, venues, events
│   │   └── models.py            # Pydantic v2 schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/               # Multi-Page Architecture
│   │   │   ├── LandingPage.jsx  # Hero landing page & persona selector
│   │   │   ├── EventsPage.jsx   # Event list showcase & campus map cockpit
│   │   │   └── EventDetailPage.jsx # Rich event view with dedicated route & TTS
│   │   ├── components/
│   │   │   ├── common/          # SketchButton, SketchCard, StickyNote, DemoBadge
│   │   │   ├── feed/            # EventCard, ClashBanner, FreeGapFinder
│   │   │   ├── map/             # CampusMapSvg, RouteControls, StepDirections
│   │   │   ├── organizer/       # EventCreateModal, AdminDashboard
│   │   │   └── student/         # PersonaSwitcher, QrPassModal
│   │   ├── hooks/               # useSpeech (Browser Text-To-Speech)
│   │   ├── styles/              # handDrawn.css (wobbly keyframes, tape, dot-grid)
│   │   ├── App.jsx              # React Router setup & global modal triggers
│   │   └── index.css
│   ├── tailwind.config.js       # Hand-drawn wobbly radii & sketch shadow tokens
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start (Run Locally)

### 1. Start the Backend API (FastAPI)

```bash
cd event-trail/backend
python -m uvicorn app.main:app --reload --port 8000
```
*API docs and live Swagger explorer available at:* `http://localhost:8000/docs`

### 2. Start the Frontend (Vite + React)

```bash
cd event-trail/frontend
npm run dev
```
*Open your browser at:* `http://localhost:5173`

---

## 🚀 3-Minute Hackathon Judging Walkthrough Script

An interactive sticky guide is pinned directly in the web app with 1-click test triggers:

1. **Persona Discovery & Explainability (Meera — CS 2nd Year)**
   * Load the app as **Meera**. Notice her active location is `N08 (Turing Lab)`.
   * Her top ranked event is **AI & ML Club Hands-on Sprint**.
   * Note the plain-language explainability reason line:  
     *`"Matches your interest in Machine Learning + Hackathons; fits your 11:00 free period."`*

2. **Schedule Conflict & Alternative Suggestions (FR-3 & FR-4)**
   * Click **"RSVP: Going! ✍️"** on the 1:30 PM *Web3 & Cloud DevFest*.
   * The red marker **Clash Banner** immediately appears:  
     *`"Direct clash with 'Discrete Mathematics' (13:00 – 14:30 @ Ada Lovelace Hall)"`*.
   * It presents 2 conflict-free alternatives with one-click RSVP options.

3. **Free-Gap Finder ("What fits my free hour?" - FR-10)**
   * Click **"What fits my free hour?"** in the top navigation or clash banner.
   * The drawer scans Meera's schedule, locates her **11:00 AM – 1:00 PM free gap**, calculates transit walk times, and recommends reachable events that conclude before her 1:00 PM class.

4. **Wheelchair Step-Free Routing (Arjun — Mech 3rd Year - FR-6)**
   * Switch to **Arjun** (wheelchair user persona).
   * Notice default **Step-Free Mode** is active.
   * View path to Turing Lab (`N05` → `N08`):  
     The path completely avoids `N06` (West Stairs) and routes through `N07` (South Ramp)!

5. **Rain Mode (Sheltered Walkways - FR-11)**
   * On the campus map, toggle **Rain Mode ☂️**.
   * Uncovered lawn paths receive a 3× weight penalty. The route dynamically diverts through the covered arcade corridor (`N10` → `N11` → `N12` → `N19`).

6. **Web Speech Turn-by-Turn TTS (FR-13)**
   * In Trail Directions, click **"Read Aloud 🔊"**.
   * The browser synthesizes turn-by-turn speech while dynamically highlighting the active step.

7. **Organizer Double-Booking & Capacity Guardrails (FR-8 & FR-12)**
   * Click **"Post Event (Organizer)"** and tap *"⚡ Fill Double-Booking Clash Test"*.
   * Attempting to book Ada Lovelace Hall at 11:45 AM triggers rejection:  
     *`"Venue clash! Ada Lovelace Hall is already booked for AI & ML Club Sprint (11:30 – 12:30). Consider booking Turing Lab 101 or APJ Kalam Auditorium."`*
   * Open the **Admin Ledger** to inspect the live demand alert:  
     *`"RoboRace: 82 RSVPs recorded for a 50-seat hall (+32 overflow!). Consider reassigning to Grand Seminar Hall."`*

8. **QR Attendance Pass & Door Check-In (FR-9)**
   * RSVP for an event and open the handwritten ticket pass.
   * Click **"Simulate Door Check-in (Scan)"** to record attendance with a live timestamp, updating the Admin Ledger in real time.

---

## 🔒 Data Honesty & Compliance

As mandated by the PRD:
* A pinned sticky-tape badge in the top viewport explicitly declares:  
  `DEMO DATA: Hand-drawn 25-node campus zone. Walking ETAs based on 1.2 m/s.`
* No false claims of live indoor GPS positioning are made; users select start and target landmarks on the authentic 25-node graph.
