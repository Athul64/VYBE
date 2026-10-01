import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    Event, EventCreateRequest, RSVPRequest, CheckInRequest, 
    RouteResponse, RankedEventResponse, ClashCheckResult, FreeGapRecommendation
)
from .graph import CAMPUS_NODES, CAMPUS_EDGES, find_campus_route
from .seed_data import DEMO_PERSONAS, SEED_VENUES, SEED_EVENTS
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

# In-memory mutable state initialized from seed data
events_db: List[Event] = [ev.model_copy(deep=True) for ev in SEED_EVENTS]
student_rsvps: Dict[str, List[str]] = {
    "meera": ["EVT-01"], # Meera has RSVP'd for AI sprint
    "arjun": ["EVT-03"], # Arjun has RSVP'd for RoboRace
}
checkin_records: List[Dict[str, Any]] = [
    {"student_id": "student_01", "event_id": "EVT-01", "timestamp": "2026-10-02T11:45:00"},
    {"student_id": "student_02", "event_id": "EVT-03", "timestamp": "2026-10-02T12:20:00"},
]

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

@app.get("/api/events", response_model=List[RankedEventResponse])
def get_ranked_events(
    student: str = Query("meera", description="Persona identifier (meera or arjun)")
):
    persona_key = student.lower()
    persona = DEMO_PERSONAS.get(persona_key, DEMO_PERSONAS["meera"])
    return rank_events_for_student(persona, events_db)

@app.post("/api/events")
def create_event(payload: EventCreateRequest):
    # 1. Double-booking check: Venue clash check
    venue = SEED_VENUES.get(payload.venue_id)
    if not venue:
        raise HTTPException(status_code=400, detail=f"Venue '{payload.venue_id}' not found.")

    overlapping_event = None
    for ev in events_db:
        if ev.venue_id == payload.venue_id:
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
                e.venue_id == vid and check_time_overlap(payload.start, payload.end, e.start, e.end)
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

    # 2. Create the event
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
        tags=[payload.category, "Campus"]
    )
    events_db.append(new_event)

    return {
        "success": True,
        "message": f"Event '{new_event.title}' booked successfully at {venue.name}!",
        "event": new_event.model_dump()
    }

@app.post("/api/rsvp")
def handle_rsvp(payload: RSVPRequest):
    persona_key = payload.student_id.lower()
    persona = DEMO_PERSONAS.get(persona_key, DEMO_PERSONAS["meera"])
    
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

@app.get("/api/free-gaps", response_model=List[FreeGapRecommendation])
def get_free_gaps(
    student: str = Query("meera", description="Persona identifier")
):
    persona_key = student.lower()
    persona = DEMO_PERSONAS.get(persona_key, DEMO_PERSONAS["meera"])
    return find_events_for_free_gaps(persona, events_db)

@app.get("/api/route", response_model=RouteResponse)
def get_route(
    from_node: str = Query(..., alias="from"),
    to_node: str = Query(..., alias="to"),
    step_free: bool = Query(False, alias="stepfree"),
    rain_mode: bool = Query(False, alias="covered")
):
    route = find_campus_route(from_node, to_node, step_free=step_free, rain_mode=rain_mode)
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

    category_mix = {}
    for ev in events_db:
        category_mix[ev.category] = category_mix.get(ev.category, 0) + 1

    return {
        "total_events": total_events,
        "total_rsvps": total_rsvps,
        "total_checkins": total_checkins,
        "overall_turnout_percent": round((total_checkins / max(1, total_rsvps)) * 100, 1),
        "venue_utilization": venue_utilization,
        "category_mix": category_mix,
        "capacity_alerts": [
            {
                "event_title": e.title, 
                "venue": SEED_VENUES.get(e.venue_id, {}).name,
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
    student_rsvps = {
        "meera": ["EVT-01"],
        "arjun": ["EVT-03"]
    }
    checkin_records = [
        {"student_id": "student_01", "event_id": "EVT-01", "timestamp": "2026-10-02T11:45:00"},
        {"student_id": "student_02", "event_id": "EVT-03", "timestamp": "2026-10-02T12:20:00"},
    ]
    return {"status": "reset_successful", "message": "Seeded state restored."}
