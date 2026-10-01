from typing import Dict, Any, List, Optional, Tuple
from .models import StudentPersona, Event, TimetableSlot, ClashCheckResult, RankedEventResponse
from .graph import find_campus_route, CAMPUS_NODES

def time_to_minutes(t_str: str) -> int:
    parts = t_str.strip().split(":")
    return int(parts[0]) * 60 + int(parts[1])

def minutes_to_time(mins: int) -> str:
    h = mins // 60
    m = mins % 60
    return f"{h:02d}:{m:02d}"

def check_time_overlap(s1: str, e1: str, s2: str, e2: str) -> bool:
    m_s1, m_e1 = time_to_minutes(s1), time_to_minutes(e1)
    m_s2, m_e2 = time_to_minutes(s2), time_to_minutes(e2)
    return max(m_s1, m_s2) < min(m_e1, m_e2)

def check_slot_or_travel_clash(student: StudentPersona, event: Event, rsvp_event_ids: List[str], all_events: List[Event]) -> Tuple[bool, str, Optional[Dict[str, Any]], int]:
    e_start_m = time_to_minutes(event.start)
    e_end_m = time_to_minutes(event.end)

    # 1. Check against class timetable (excluding free periods)
    for slot in student.timetable_today:
        if "free" in slot.subject.lower() or slot.node_id is None:
            continue
        
        s_start_m = time_to_minutes(slot.start)
        s_end_m = time_to_minutes(slot.end)

        # Check direct time overlap
        if max(e_start_m, s_start_m) < min(e_end_m, s_end_m):
            venue_name = CAMPUS_NODES.get(slot.node_id, {}).get("name", "Classroom")
            return (
                True, 
                f"Direct clash with '{slot.subject}' ({slot.start} – {slot.end} @ {venue_name})",
                {"subject": slot.subject, "start": slot.start, "end": slot.end, "node_id": slot.node_id},
                0
            )

        # Check travel buffer if slot ends right before event
        if s_end_m <= e_start_m and (e_start_m - s_end_m) < 45:
            route = find_campus_route(slot.node_id, event.node_id, step_free=student.needs_step_free)
            walk_min = route["eta_minutes"] if route else 10
            gap_available = e_start_m - s_end_m
            if gap_available < walk_min:
                return (
                    True,
                    f"Insufficient travel time from '{slot.subject}' ending at {slot.end}. Walk takes ~{walk_min} mins but gap is only {gap_available} mins!",
                    {"subject": slot.subject, "start": slot.start, "end": slot.end, "node_id": slot.node_id},
                    walk_min
                )

    # 2. Check against already RSVP'd events
    for other_id in rsvp_event_ids:
        if other_id == event.id:
            continue
        other_evt = next((e for e in all_events if e.id == other_id), None)
        if other_evt and check_time_overlap(event.start, event.end, other_evt.start, other_evt.end):
            return (
                True,
                f"Overlaps with your existing RSVP for '{other_evt.title}' ({other_evt.start} – {other_evt.end})",
                {"subject": other_evt.title, "start": other_evt.start, "end": other_evt.end, "node_id": other_evt.node_id},
                0
            )

    return False, "No clashes", None, 0

def check_student_clash(
    student: StudentPersona,
    event: Event,
    all_events: List[Event],
    rsvp_event_ids: List[str]
) -> ClashCheckResult:
    is_clash, msg, slot, walk_min = check_slot_or_travel_clash(student, event, rsvp_event_ids, all_events)
    if is_clash:
        alts = find_non_clashing_alternatives(student, event, all_events, rsvp_event_ids)
        return ClashCheckResult(
            is_clash=True,
            severity="blocking",
            message=msg,
            conflicting_slot=slot,
            walking_time_min=walk_min,
            alternative_events=alts
        )

    return ClashCheckResult(
        is_clash=False,
        severity="none",
        message="No timetable clashes detected. You have clear transit to this event!",
        conflicting_slot=None,
        walking_time_min=0,
        alternative_events=[]
    )

def find_non_clashing_alternatives(
    student: StudentPersona,
    clashing_event: Event,
    all_events: List[Event],
    rsvp_event_ids: List[str],
    limit: int = 2
) -> List[RankedEventResponse]:
    alts = []
    from .ranking import rank_single_event
    for ev in all_events:
        if ev.id == clashing_event.id:
            continue
        is_clash, _, _, _ = check_slot_or_travel_clash(student, ev, rsvp_event_ids, all_events)
        if not is_clash:
            ranked_item = rank_single_event(student, ev)
            alts.append(ranked_item)
            if len(alts) >= limit:
                break
    return alts
