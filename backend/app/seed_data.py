from typing import Dict, List
from .models import StudentPersona, TimetableSlot, Venue, Event

DEMO_PERSONAS: Dict[str, StudentPersona] = {
    "admin": StudentPersona(
        id="ADMIN",
        name="Campus Administrator",
        department="Campus Administration (ASIET)",
        needs_step_free=False,
        interests=["Machine Learning", "Hackathons", "Robotics", "Design", "Cultural", "Open Source"],
        current_location_node="N13",  # Shankara Block Admin Foyer
        timetable_today=[
            TimetableSlot(subject="Administrative Desk", start="09:00", end="17:00", node_id="N13"),
        ],
    ),
}

SEED_VENUES: Dict[str, Venue] = {
    "V01": Venue(id="V01", name="Turing Advanced Lab (Aryabhata Block)", node_id="N08", capacity=40),
    "V02": Venue(id="V02", name="Aryabhata Seminar Hall (ASIET)", node_id="N09", capacity=80),
    "V03": Venue(id="V03", name="Adi Shankara Central Auditorium", node_id="N16", capacity=350),
    "V04": Venue(id="V04", name="Shankara Block Executive Hall", node_id="N13", capacity=120),
    "V05": Venue(id="V05", name="ASIET Canteen Plaza", node_id="N17", capacity=150),
    "V06": Venue(id="V06", name="Digital Reference Wing (Central Library)", node_id="N22", capacity=60),
    "V07": Venue(id="V07", name="ASIET Fab Lab & Maker Space", node_id="N23", capacity=50),
    "V08": Venue(id="V08", name="Open-Air Amphitheatre (OAT)", node_id="N24", capacity=200),
}

SEED_EVENTS: List[Event] = []

SEED_USERS: Dict[str, Dict] = {
    "ADMIN": {
        "student_id": "admin",
        "password": "admin123",
        "name": "Campus Administrator",
        "role": "admin",
        "persona_key": "admin",
        "department": "Campus Administration (ASIET)",
        "current_location_node": "N13",
        "needs_step_free": False,
    }
}
