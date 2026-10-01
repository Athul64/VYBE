from typing import Dict, List
from .models import StudentPersona, TimetableSlot, Venue, Event

DEMO_PERSONAS: Dict[str, StudentPersona] = {
    "meera": StudentPersona(
        id="student_01",
        name="Meera",
        department="Computer Science (2nd Year)",
        needs_step_free=False,
        interests=["Machine Learning", "Hackathons", "Robotics", "Open Source"],
        current_location_node="N08",  # Turing Lab
        timetable_today=[
            TimetableSlot(subject="Data Structures Lab", start="09:00", end="11:00", node_id="N08"),
            TimetableSlot(subject="Free Period", start="11:00", end="13:00", node_id=None),  # 2-hour free gap
            TimetableSlot(subject="Discrete Mathematics", start="13:00", end="14:30", node_id="N09"),
            TimetableSlot(subject="Database Systems", start="15:00", end="16:30", node_id="N08"),
        ],
    ),
    "arjun": StudentPersona(
        id="student_02",
        name="Arjun",
        department="Mechanical & Design (3rd Year)",
        needs_step_free=True,  # Wheelchair user persona
        interests=["Design Systems", "Robotics", "3D Printing", "CAD"],
        current_location_node="N01",  # Main Arch Gate
        timetable_today=[
            TimetableSlot(subject="Manufacturing Processes", start="10:00", end="12:00", node_id="N05"),
            TimetableSlot(subject="Free Period", start="12:00", end="14:00", node_id=None),  # 2-hour free gap
            TimetableSlot(subject="Finite Element Analysis", start="14:30", end="16:00", node_id="N13"),
        ],
    ),
}

SEED_VENUES: Dict[str, Venue] = {
    "V01": Venue(id="V01", name="Turing Lab 101", node_id="N08", capacity=40),
    "V02": Venue(id="V02", name="Ada Lovelace Hall", node_id="N09", capacity=80),
    "V03": Venue(id="V03", name="APJ Abdul Kalam Auditorium", node_id="N16", capacity=350),
    "V04": Venue(id="V04", name="Grand Seminar Hall", node_id="N13", capacity=120),
    "V05": Venue(id="V05", name="Canteen Plaza", node_id="N17", capacity=150),
    "V06": Venue(id="V06", name="Digital Reference Wing", node_id="N22", capacity=60),
    "V07": Venue(id="V07", name="Maker Space Workshop", node_id="N23", capacity=50),
    "V08": Venue(id="V08", name="Open-Air Amphitheatre", node_id="N24", capacity=200),
}

SEED_EVENTS: List[Event] = [
    Event(
        id="EVT-01",
        title="AI & ML Club Hands-on Sprint",
        category="Workshop",
        description="Build real-time agentic pipelines and small vision models. Bring your laptop!",
        start="11:30",
        end="12:30",
        venue_id="V02",
        node_id="N09",
        organizer="Google Developer Student Club",
        capacity=80,
        rsvp_count=64,
        checked_in_count=28,
        tags=["Machine Learning", "Hackathons", "Open Source", "Python"],
    ),
    Event(
        id="EVT-02",
        title="Web3 & Cloud DevFest Keynote",
        category="Keynote",
        description="Distributed consensus and decentralized identity architectures across universities.",
        start="13:30",
        end="15:00",
        venue_id="V03",
        node_id="N16",
        organizer="Blockchain & Cloud SIG",
        capacity=350,
        rsvp_count=142,
        checked_in_count=65,
        tags=["Hackathons", "Cloud", "Open Source", "Web3"],
    ),
    Event(
        id="EVT-03",
        title="RoboRace: Autonomous Bot Arena",
        category="Competition",
        description="High-speed line follower & obstacle maneuvering showdown. High energy & live telemetry!",
        start="12:15",
        end="13:45",
        venue_id="V07",
        node_id="N23",
        organizer="Robotics & Automation Society",
        capacity=50,
        rsvp_count=82,  # Exceeds capacity 50 to test warning
        checked_in_count=24,
        tags=["Robotics", "3D Printing", "CAD", "Hardware"],
    ),
    Event(
        id="EVT-04",
        title="Design Systems & Micro-Interactions",
        category="Design",
        description="Mastering physical sketch feedback, optical spacing, and tactile web interfaces.",
        start="16:00",
        end="17:30",
        venue_id="V06",
        node_id="N22",
        organizer="Student Design Guild",
        capacity=60,
        rsvp_count=48,
        checked_in_count=15,
        tags=["Design Systems", "UI/UX", "Product Design"],
    ),
    Event(
        id="EVT-05",
        title="Open Source Lightning Talks & Pizza",
        category="Meetup",
        description="5-minute rapid demos of student projects + git contribution clinic with mentors.",
        start="17:00",
        end="18:30",
        venue_id="V04",
        node_id="N13",
        organizer="Campus FOSS Initiative",
        capacity=120,
        rsvp_count=98,
        checked_in_count=42,
        tags=["Open Source", "Hackathons", "Networking"],
    ),
    Event(
        id="EVT-06",
        title="Acoustic Sunset Jam & Open Mic",
        category="Cultural",
        description="Unplugged musical performances, poetry slams, and chai at the amphitheatre steps.",
        start="17:30",
        end="19:00",
        venue_id="V08",
        node_id="N24",
        organizer="Campus Arts Society",
        capacity=200,
        rsvp_count=165,
        checked_in_count=60,
        tags=["Music", "Cultural", "Campus Life"],
    ),
]
