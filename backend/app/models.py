from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TimetableSlot(BaseModel):
    subject: str
    start: str  # HH:MM
    end: str    # HH:MM
    node_id: Optional[str] = None

class StudentPersona(BaseModel):
    id: str
    name: str
    department: str
    needs_step_free: bool = False
    interests: List[str]
    current_location_node: str
    timetable_today: List[TimetableSlot]

class Venue(BaseModel):
    id: str
    name: str
    node_id: str
    capacity: int

class Event(BaseModel):
    id: str
    title: str
    category: str
    description: str
    start: str  # HH:MM
    end: str    # HH:MM
    venue_id: str
    node_id: str
    organizer: str
    capacity: int
    rsvp_count: int = 0
    checked_in_count: int = 0
    tags: List[str] = []

class EventCreateRequest(BaseModel):
    title: str
    category: str
    description: str
    start: str  # HH:MM
    end: str    # HH:MM
    venue_id: str
    organizer: str

class RSVPRequest(BaseModel):
    student_id: str
    event_id: str

class CheckInRequest(BaseModel):
    student_id: str
    event_id: str
    timestamp: Optional[str] = None

class RouteResponse(BaseModel):
    path_nodes: List[str]
    total_distance_m: int
    eta_minutes: int
    steps: List[str]
    used_accessible_only: bool
    rain_penalty_applied: bool

class RankedEventResponse(BaseModel):
    event: Event
    score: float
    reason: str
    distance_m: int
    walk_eta_min: int
    has_clash: bool = False
    clash_reason: Optional[str] = None
    venue_name: str

class ClashCheckResult(BaseModel):
    is_clash: bool
    severity: str = "none"  # "blocking", "warning", "none"
    message: str
    conflicting_slot: Optional[Dict[str, Any]] = None
    walking_time_min: int = 0
    alternative_events: List[RankedEventResponse] = []

class FreeGapRecommendation(BaseModel):
    gap_start: str
    gap_end: str
    duration_minutes: int
    matching_events: List[RankedEventResponse]
