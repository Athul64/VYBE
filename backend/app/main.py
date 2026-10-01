import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .models import (
    Event, EventCreateRequest, RSVPRequest, CheckInRequest, 
    RouteResponse, RankedEventResponse, ClashCheckResult, FreeGapRecommendation,
    LoginRequest, LoginResponse, RegisterRequest, EventModerateRequest,
    Venue, StudentPersona
)
from .graph import CAMPUS_NODES, CAMPUS_EDGES, find_campus_route
from .seed_data import DEMO_PERSONAS, SEED_VENUES, SEED_EVENTS, SEED_USERS
from .ranking import rank_events_for_student, find_events_for_free_gaps
from .clash import check_student_clash, check_time_overlap, time_to_minutes

app = FastAPI(
    title="VYBE API",
    description="Smart Campus Event Discovery & Navigation Engine - Hackathon PRD Implementation",
    version="1.0.0"
)

# Enable CORS for local Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads folder exists and is mounted for static file serving
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# In-memory mutable state initialized from seed data (Clean empty start)
events_db: List[Event] = [ev.model_copy(deep=True) for ev in SEED_EVENTS]
student_rsvps: Dict[str, List[str]] = {}
checkin_records: List[Dict[str, Any]] = []

@app.get("/")
def root():
    return {
        "app": "VYBE API",
        "status": "online",
        "demo_mode": True,
        "nodes_count": len(CAMPUS_NODES),
        "edges_count": len(CAMPUS_EDGES),
        "tagline": "Don't just find the event. Get to it."
    }

@app.post("/api/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    clean_id = payload.student_id.strip().upper()
    if not clean_id:
        raise HTTPException(status_code=400, detail="Student / Staff ID cannot be empty.")
    if len(payload.password.strip()) < 3:
        raise HTTPException(status_code=400, detail="Password must be at least 3 characters long.")
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Please provide your full name.")

    # Check if already registered
    if clean_id in SEED_USERS:
        raise HTTPException(status_code=400, detail=f"Student ID '{clean_id}' is already registered. Please sign in.")

    persona_slug = clean_id.lower().replace("-", "_")
    role = payload.role.strip().lower() if payload.role else "student"
    if "ADMIN" in clean_id or "DEAN" in clean_id:
        role = "admin"

    dept = payload.department.strip() if payload.department else "Computer Science & Engineering"

    # Register in SEED_USERS
    SEED_USERS[clean_id] = {
        "student_id": clean_id,
        "password": payload.password.strip(),
        "name": payload.name.strip(),
        "role": role,
        "persona_key": persona_slug,
        "department": dept,
        "current_location_node": payload.current_location_node or "N01",
        "needs_step_free": bool(payload.needs_step_free),
    }

    # Register persona dynamically in DEMO_PERSONAS
    from .models import StudentPersona, TimetableSlot
    DEMO_PERSONAS[persona_slug] = StudentPersona(
        id=clean_id,
        name=payload.name.strip(),
        department=dept,
        needs_step_free=bool(payload.needs_step_free),
        interests=["AI", "Hackathons", "Robotics", "Design", "Cultural", "Open Source"],
        current_location_node=payload.current_location_node or "N01",
        timetable_today=[
            TimetableSlot(subject="Morning Session", start="09:30", end="11:00", node_id="N05"),
            TimetableSlot(subject="Free Break", start="11:00", end="13:00", node_id=None),
            TimetableSlot(subject="Afternoon Lab", start="13:30", end="15:30", node_id="N08"),
        ]
    )

    return LoginResponse(
        success=True,
        student_id=clean_id,
        name=payload.name.strip(),
        role=role,
        persona_key=persona_slug,
        department=dept,
        token=f"tk_{uuid.uuid4().hex[:12]}"
    )

@app.post("/api/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    clean_id = payload.student_id.strip()
    user = SEED_USERS.get(clean_id.upper())
    if not user:
        for uid, udata in SEED_USERS.items():
            if uid.lower() == clean_id.lower() or udata["student_id"].lower() == clean_id.lower():
                user = udata
                break

    if not user or user["password"] != payload.password.strip():
        raise HTTPException(
            status_code=401,
            detail="Invalid ID or Password. For Admin, use ID: admin with Password: admin123 (or register a new student account)."
        )

    return LoginResponse(
        success=True,
        student_id=user["student_id"],
        name=user["name"],
        role=user["role"],
        persona_key=user["persona_key"],
        department=user["department"],
        token=f"tk_{uuid.uuid4().hex[:12]}"
    )

@app.get("/api/campus")
def get_campus_data():
    return {
        "nodes": CAMPUS_NODES,
        "edges": CAMPUS_EDGES,
        "venues": {k: v.model_dump() for k, v in SEED_VENUES.items()}
    }

@app.get("/api/personas")
def get_personas():
    return {
        key: {
            "id": p.id,
            "name": p.name,
            "department": p.department,
            "needs_step_free": p.needs_step_free,
            "interests": p.interests,
            "current_location_node": p.current_location_node,
            "location_name": CAMPUS_NODES.get(p.current_location_node, {}).get("name", "Unknown"),
            "timetable_today": [s.model_dump() for s in p.timetable_today]
        }
        for key, p in DEMO_PERSONAS.items()
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    if not ext:
        ext = ".jpg"
    safe_name = f"poster_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = os.path.join(UPLOADS_DIR, safe_name)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_url = f"http://localhost:8000/uploads/{safe_name}"
    return {
        "success": True,
        "filename": safe_name,
        "url": file_url
    }

def get_effective_persona(student: Optional[str] = None) -> StudentPersona:
    from .models import TimetableSlot
    if not student:
        return StudentPersona(
            id="GUEST",
            name="Guest Student",
            department="Campus Visitor",
            needs_step_free=False,
            interests=["Technology", "Cultural", "Innovation"],
            current_location_node="N01",
            timetable_today=[]
        )
    
    clean_raw = student.strip()
    clean_key = clean_raw.lower()
    clean_id = clean_raw.upper()

    # 1. Direct match in DEMO_PERSONAS
    if clean_key in DEMO_PERSONAS:
        return DEMO_PERSONAS[clean_key]
    for p in DEMO_PERSONAS.values():
        if p.id.upper() == clean_id or p.name.lower() == clean_key:
            return p

    # 2. Match in SEED_USERS
    if clean_id in SEED_USERS:
        u = SEED_USERS[clean_id]
        role = u.get("role", "student")
        p = StudentPersona(
            id=u.get("student_id", clean_id),
            name=u.get("name", "Student"),
            department=u.get("department", "Computer Science & Engineering"),
            needs_step_free=bool(u.get("needs_step_free", False)),
            interests=["AI", "Technology", "Design", "Cultural"],
            current_location_node=u.get("current_location_node", "N01"),
            timetable_today=[] if role == "admin" else [
                TimetableSlot(subject="Morning Session", start="09:30", end="11:00", node_id="N05"),
                TimetableSlot(subject="Free Break", start="11:00", end="13:00", node_id=None),
                TimetableSlot(subject="Afternoon Lab", start="13:30", end="15:30", node_id="N08"),
            ]
        )
        DEMO_PERSONAS[clean_key] = p
        return p

    # 3. If admin identity
    if "ADMIN" in clean_id:
        return StudentPersona(
            id="ADMIN",
            name="Campus Administrator",
            department="Campus Administration (ASIET)",
            needs_step_free=False,
            interests=["Technology"],
            current_location_node="N13",
            timetable_today=[]
        )

    # 4. Registered student identity (e.g. athul / ASI053)
    dynamic_student = StudentPersona(
        id=clean_id,
        name=clean_raw.split()[0].capitalize() if clean_raw else "Student",
        department="Computer Science & Engineering",
        needs_step_free=False,
        interests=["AI", "Technology", "Design", "Cultural"],
        current_location_node="N01",
        timetable_today=[
            TimetableSlot(subject="Morning Session", start="09:30", end="11:00", node_id="N05"),
            TimetableSlot(subject="Free Break", start="11:00", end="13:00", node_id=None),
            TimetableSlot(subject="Afternoon Lab", start="13:30", end="15:30", node_id="N08"),
        ]
    )
    DEMO_PERSONAS[clean_key] = dynamic_student
    return dynamic_student

@app.get("/api/events", response_model=List[RankedEventResponse])
def get_ranked_events(
    student: Optional[str] = Query(None, description="Persona identifier")
):
    persona = get_effective_persona(student)
    # Crucial PRD rule: Only approved events are showcased to students!
    approved_events = [e for e in events_db if e.status == "approved"]
    return rank_events_for_student(persona, approved_events)

@app.get("/api/events/{event_id}")
def get_single_event(
    event_id: str,
    student: Optional[str] = Query(None, description="Persona identifier")
):
    ev = next((e for e in events_db if e.id == event_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found.")
    persona = get_effective_persona(student)
    ranked = rank_events_for_student(persona, [ev])
    if ranked:
        return ranked[0]
    return {
        "event": ev,
        "score": 0.85,
        "reason": f"Campus event at {ev.venue_id}",
        "distance_m": 120,
        "walk_eta_min": 2,
        "has_clash": False,
        "clash_reason": None,
        "venue_name": SEED_VENUES.get(ev.venue_id, Venue(id=ev.venue_id, name=ev.venue_id, node_id=ev.node_id, capacity=ev.capacity)).name
    }

@app.post("/api/events")
def create_event(payload: EventCreateRequest):
    # 1. Double-booking check: Venue clash check against approved or pending events
    venue = SEED_VENUES.get(payload.venue_id)
    if not venue:
        raise HTTPException(status_code=400, detail=f"Venue '{payload.venue_id}' not found.")

    overlapping_event = None
    for ev in events_db:
        if ev.status in ["approved", "pending"] and ev.venue_id == payload.venue_id:
            if check_time_overlap(payload.start, payload.end, ev.start, ev.end):
                overlapping_event = ev
                break

    if overlapping_event:
        # Suggest alternative free venues during this slot
        available_venues = []
        for vid, vobj in SEED_VENUES.items():
            if vid == payload.venue_id:
                continue
            is_busy = any(
                e.venue_id == vid and e.status in ["approved", "pending"] and check_time_overlap(payload.start, payload.end, e.start, e.end)
                for e in events_db
            )
            if not is_busy:
                available_venues.append(vobj.name)

        alt_str = ", ".join(available_venues[:2]) if available_venues else "no other halls currently free"
        return {
            "success": False,
            "error_type": "DOUBLE_BOOKING_CONFLICT",
            "message": f"Venue clash! '{venue.name}' is already booked for '{overlapping_event.title}' ({overlapping_event.start} – {overlapping_event.end}).",
            "suggested_free_venues": available_venues[:3],
            "recommendation": f"Consider booking: {alt_str} instead."
        }

    # 2. Check if submitted by admin or student
    is_admin = False
    sub_id = (payload.submitted_by or "admin").strip()
    user_record = SEED_USERS.get(sub_id.upper())
    if user_record and user_record.get("role") == "admin":
        is_admin = True
    elif "ADMIN" in sub_id.upper() or "DEAN" in sub_id.upper():
        is_admin = True

    event_status = "approved" if is_admin else "pending"
    admin_note = "Directly approved by Campus Administration" if is_admin else "Queued for Admin verification"

    new_event = Event(
        id=f"EVT-{str(uuid.uuid4())[:4].upper()}",
        title=payload.title,
        category=payload.category,
        description=payload.description,
        start=payload.start,
        end=payload.end,
        venue_id=payload.venue_id,
        node_id=venue.node_id,
        organizer=payload.organizer,
        capacity=venue.capacity,
        rsvp_count=0,
        checked_in_count=0,
        tags=[payload.category, "Campus"],
        status=event_status,
        submitted_by=sub_id,
        admin_notes=admin_note,
        image_url=payload.image_url or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"
    )
    events_db.append(new_event)

    return {
        "success": True,
        "requires_approval": not is_admin,
        "status": event_status,
        "message": (
            f"Event '{new_event.title}' booked & approved directly by Admin!"
            if is_admin else
            f"Event '{new_event.title}' submitted! It is now pending Admin approval before being showcased to all students."
        ),
        "event": new_event.model_dump()
    }

@app.post("/api/rsvp")
def handle_rsvp(payload: RSVPRequest):
    persona = get_effective_persona(payload.student_id)
    persona_key = persona.id.lower()
    
    event = next((e for e in events_db if e.id == payload.event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    curr_rsvps = student_rsvps.get(persona_key, [])
    
    # Run comprehensive clash check against timetable and travel time
    clash_result = check_student_clash(persona, event, events_db, curr_rsvps)
    
    # If student confirms or no clash, record RSVP
    already_rsvpd = payload.event_id in curr_rsvps
    if not already_rsvpd:
        curr_rsvps.append(payload.event_id)
        student_rsvps[persona_key] = curr_rsvps
        event.rsvp_count += 1

    # Capacity warning check
    capacity_warning = None
    if event.rsvp_count > event.capacity:
        capacity_warning = f"Demand exceeds capacity! {event.rsvp_count} RSVPs for a {event.capacity}-seat hall."

    return {
        "success": True,
        "already_rsvpd": already_rsvpd,
        "rsvp_count": event.rsvp_count,
        "capacity_warning": capacity_warning,
        "clash_check": clash_result.model_dump(),
        "event": event.model_dump()
    }

@app.post("/api/check-clash")
def handle_check_clash(payload: RSVPRequest):
    persona = get_effective_persona(payload.student_id)
    event = next((e for e in events_db if e.id == payload.event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    curr_rsvps = student_rsvps.get(payload.student_id.lower(), [])
    clash_result = check_student_clash(persona, event, events_db, curr_rsvps)
    return {
        "success": True,
        "clash_check": clash_result.model_dump()
    }

@app.get("/api/free-gaps", response_model=List[FreeGapRecommendation])
def get_free_gaps(
    student: Optional[str] = Query(None, description="Persona identifier")
):
    persona = get_effective_persona(student)
    approved_events = [e for e in events_db if e.status == "approved"]
    return find_events_for_free_gaps(persona, approved_events)

@app.get("/api/admin/pending-events")
def get_pending_events():
    pending = []
    for e in events_db:
        if e.status == "pending":
            item = e.model_dump()
            vinfo = SEED_VENUES.get(e.venue_id)
            item["venue_name"] = vinfo.name if vinfo else e.venue_id
            pending.append(item)
    return pending

@app.post("/api/admin/moderate-event")
def moderate_event(payload: EventModerateRequest):
    event = next((e for e in events_db if e.id == payload.event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    if payload.action == "approve":
        event.status = "approved"
        event.admin_notes = payload.admin_notes or "Verified & approved by Campus Affairs Dean."
        msg = f"Event '{event.title}' approved! It is now live on the student event discover feed."
    elif payload.action == "reject":
        event.status = "rejected"
        event.admin_notes = payload.admin_notes or "Declined by Dean of Student Affairs."
        msg = f"Event '{event.title}' was rejected."
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'.")

    return {
        "success": True,
        "message": msg,
        "event": event.model_dump()
    }

@app.get("/api/student/my-events")
def get_student_events(student_id: str = Query(...)):
    clean_id = student_id.strip().upper()
    matches = []
    for e in events_db:
        sub = (e.submitted_by or "").strip().upper()
        if sub and (clean_id == sub or clean_id in sub or sub in clean_id):
            item = e.model_dump()
            vinfo = SEED_VENUES.get(e.venue_id)
            item["venue_name"] = vinfo.name if vinfo else e.venue_id
            matches.append(item)
    return matches

@app.get("/api/route", response_model=RouteResponse)
def get_route(
    from_alias: Optional[str] = Query(None, alias="from"),
    to_alias: Optional[str] = Query(None, alias="to"),
    from_node: Optional[str] = Query(None),
    to_node: Optional[str] = Query(None),
    stepfree_alias: Optional[bool] = Query(None, alias="stepfree"),
    step_free: Optional[bool] = Query(None),
    covered_alias: Optional[bool] = Query(None, alias="covered"),
    rain_mode: Optional[bool] = Query(None)
):
    src = from_alias or from_node
    dst = to_alias or to_node
    if not src or not dst:
        raise HTTPException(status_code=400, detail="Missing required 'from' and 'to' node parameters.")
    
    use_step_free = bool(stepfree_alias if stepfree_alias is not None else (step_free or False))
    use_rain_mode = bool(covered_alias if covered_alias is not None else (rain_mode or False))

    route = find_campus_route(src, dst, step_free=use_step_free, rain_mode=use_rain_mode)
    if not route:
        raise HTTPException(
            status_code=404, 
            detail="No accessible path found between selected nodes with current constraints."
        )
    return route

@app.post("/api/checkin")
def handle_checkin(payload: CheckInRequest):
    event = next((e for e in events_db if e.id == payload.event_id), None)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    ts = payload.timestamp or datetime.now().isoformat()
    checkin_records.append({
        "student_id": payload.student_id,
        "event_id": payload.event_id,
        "timestamp": ts
    })
    event.checked_in_count += 1

    return {
        "success": True,
        "message": f"Attendance recorded for {payload.student_id} at '{event.title}'!",
        "checked_in_count": event.checked_in_count,
        "timestamp": ts
    }

@app.get("/api/admin/stats")
def get_admin_stats():
    total_events = len(events_db)
    total_rsvps = sum(e.rsvp_count for e in events_db)
    total_checkins = sum(e.checked_in_count for e in events_db)
    
    venue_utilization = []
    for vid, v in SEED_VENUES.items():
        v_events = [e for e in events_db if e.venue_id == vid]
        v_rsvps = sum(e.rsvp_count for e in v_events)
        v_checkins = sum(e.checked_in_count for e in v_events)
        is_overbooked = any(e.rsvp_count > v.capacity for e in v_events)
        venue_utilization.append({
            "venue_id": vid,
            "name": v.name,
            "capacity": v.capacity,
            "events_count": len(v_events),
            "total_rsvps": v_rsvps,
            "total_checkins": v_checkins,
            "occupancy_rate": round((v_rsvps / max(1, v.capacity * len(v_events))) * 100, 1) if v_events else 0,
            "overbooked_alert": is_overbooked
        })

    # Build category mix counts
    category_mix = {}
    for e in events_db:
        category_mix[e.category] = category_mix.get(e.category, 0) + 1

    pending_events = []
    for e in events_db:
        if e.status == "pending":
            item = e.model_dump()
            vinfo = SEED_VENUES.get(e.venue_id)
            item["venue_name"] = vinfo.name if vinfo else e.venue_id
            pending_events.append(item)

    return {
        "total_events": total_events,
        "total_rsvps": total_rsvps,
        "total_checkins": total_checkins,
        "pending_approvals_count": len(pending_events),
        "pending_events": pending_events,
        "overall_turnout_percent": round((total_checkins / max(1, total_rsvps)) * 100, 1),
        "venue_utilization": venue_utilization,
        "category_mix": category_mix,
        "capacity_alerts": [
            {
                "event_title": e.title, 
                "venue": SEED_VENUES.get(e.venue_id).name if SEED_VENUES.get(e.venue_id) else e.venue_id,
                "rsvps": e.rsvp_count, 
                "capacity": e.capacity
            }
            for e in events_db if e.rsvp_count > e.capacity
        ]
    }

@app.post("/api/reset-demo")
def reset_demo_state():
    global events_db, student_rsvps, checkin_records
    events_db = [ev.model_copy(deep=True) for ev in SEED_EVENTS]
    student_rsvps = {}
    checkin_records = []
    return {"status": "reset_successful", "message": "Campus event board reset to clean state."}
