import math
from typing import List, Dict, Any, Tuple
from .models import StudentPersona, Event, RankedEventResponse, FreeGapRecommendation
from .graph import find_campus_route, CAMPUS_NODES
from .seed_data import SEED_VENUES

def calculate_interest_similarity(student: StudentPersona, event: Event) -> Tuple[float, List[str]]:
    student_tags = set([t.lower() for t in student.interests])
    event_tags = set([t.lower() for t in event.tags] + [event.category.lower()])
    
    # Check title words as well
    title_words = set(event.title.lower().split())
    combined_event = event_tags.union(title_words)
    
    overlap = student_tags.intersection(combined_event)
    matched_interests = [t for t in student.interests if t.lower() in overlap]
    
    if not student_tags:
        return 0.5, []
    
    sim = len(overlap) / max(1, len(student_tags))
    return min(1.0, sim * 1.5 + (0.3 if overlap else 0.05)), matched_interests

def time_to_minutes(t_str: str) -> int:
    parts = t_str.strip().split(":")
    return int(parts[0]) * 60 + int(parts[1])

def calculate_time_fit(student: StudentPersona, event: Event) -> Tuple[float, str]:
    e_start = time_to_minutes(event.start)
    e_end = time_to_minutes(event.end)
    
    # Check if inside any free period
    for slot in student.timetable_today:
        if "free" in slot.subject.lower() or slot.node_id is None:
            g_start = time_to_minutes(slot.start)
            g_end = time_to_minutes(slot.end)
            if e_start >= g_start and e_end <= g_end:
                return 1.0, f"Fits your {slot.start} free period"
    
    # Check if after last class
    last_class_end = max([time_to_minutes(s.end) for s in student.timetable_today if s.node_id is not None], default=1020)
    if e_start >= last_class_end:
        return 0.95, "Happens after your classes finish"

    # Check for direct clash
    for slot in student.timetable_today:
        if "free" not in slot.subject.lower() and slot.node_id is not None:
            s_start = time_to_minutes(slot.start)
            s_end = time_to_minutes(slot.end)
            if max(e_start, s_start) < min(e_end, s_end):
                return 0.05, f"Clashes with {slot.subject}"
                
    return 0.5, "Between study periods"

def rank_single_event(student: StudentPersona, event: Event) -> RankedEventResponse:
    # 1. Interest Score (50%)
    interest_score, matched_tags = calculate_interest_similarity(student, event)
    
    # 2. Time Fit Score (20%)
    time_fit_score, time_fit_text = calculate_time_fit(student, event)
    
    # 3. Distance & Route (15%)
    origin_node = student.current_location_node or "N01"
    route = find_campus_route(origin_node, event.node_id, step_free=student.needs_step_free)
    
    if route:
        dist_m = route["total_distance_m"]
        eta_min = route["eta_minutes"]
    else:
        dist_m = 400
        eta_min = 6
        
    distance_score = max(0.1, 1.0 - (dist_m / 800.0))
    
    # 4. Popularity (15%)
    popularity_score = min(1.0, (event.rsvp_count / 150.0))
    
    # Final Formula
    final_score = (
        0.50 * interest_score +
        0.20 * time_fit_score +
        0.15 * distance_score +
        0.15 * popularity_score
    )
    
    # Generate Explainable One-Line Reason
    reason_parts = []
    if matched_tags:
        match_str = " + ".join(matched_tags[:2])
        reason_parts.append(f"Matches your interest in {match_str}")
    elif interest_score > 0.5:
        reason_parts.append(f"Trending in {student.department.split()[0]}")
    else:
        reason_parts.append("Popular campus highlight")

    if time_fit_score >= 0.9:
        reason_parts.append(time_fit_text.lower())
    
    if student.needs_step_free:
        reason_parts.append(f"accessible ramp route ({eta_min} min walk)")
    else:
        origin_name = CAMPUS_NODES.get(origin_node, {}).get("name", "current spot")
        reason_parts.append(f"{eta_min} min walk from {origin_name}")
        
    reason = "; ".join(reason_parts[:2]).capitalize() + "."
    venue_info = SEED_VENUES.get(event.venue_id)
    venue_name = venue_info.name if venue_info else event.venue_id

    # Check clash state
    has_clash = (time_fit_score < 0.2)
    clash_reason = time_fit_text if has_clash else None

    return RankedEventResponse(
        event=event,
        score=round(final_score, 3),
        reason=reason,
        distance_m=dist_m,
        walk_eta_min=eta_min,
        has_clash=has_clash,
        clash_reason=clash_reason,
        venue_name=venue_name
    )

def rank_events_for_student(student: StudentPersona, events: List[Event]) -> List[RankedEventResponse]:
    ranked = [rank_single_event(student, ev) for ev in events]
    # Sort descending by score
    ranked.sort(key=lambda x: x.score, reverse=True)
    return ranked

def find_events_for_free_gaps(student: StudentPersona, events: List[Event]) -> List[FreeGapRecommendation]:
    recommendations = []
    
    for slot in student.timetable_today:
        if "free" in slot.subject.lower() or slot.node_id is None:
            g_start = time_to_minutes(slot.start)
            g_end = time_to_minutes(slot.end)
            duration = g_end - g_start
            
            if duration >= 45:  # PRD requirement: gaps >= 45 mins
                # Candidate events that start within or fit inside this window
                matching = []
                for ev in events:
                    e_start = time_to_minutes(ev.start)
                    e_end = time_to_minutes(ev.end)
                    
                    # Estimate travel time from student's current node to event node
                    route = find_campus_route(student.current_location_node, ev.node_id, step_free=student.needs_step_free)
                    walk_min = route["eta_minutes"] if route else 5
                    
                    # Must be reachable and conclude before gap closes
                    if (e_start >= g_start + walk_min) and (e_end <= g_end):
                        ranked_item = rank_single_event(student, ev)
                        matching.append(ranked_item)
                        
                matching.sort(key=lambda x: x.score, reverse=True)
                recommendations.append(FreeGapRecommendation(
                    gap_start=slot.start,
                    gap_end=slot.end,
                    duration_minutes=duration,
                    matching_events=matching
                ))
                
    return recommendations
