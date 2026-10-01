import networkx as nx

CAMPUS_NODES = {
    # ASIET Main Entrance & Quad (MC Road, Mattoor, Kalady)
    "N01": {"name": "ASIET Main Arch Gate (Kalady)", "x": 100, "y": 550, "type": "entrance"},
    "N02": {"name": "Main Security Checkpost & Visitors Desk", "x": 160, "y": 500, "type": "outdoor"},
    "N03": {"name": "Central Quadrangle & Saraswathi Statue", "x": 300, "y": 420, "type": "outdoor"},
    "N04": {"name": "Gulmohar Courtyard & Palm Garden", "x": 240, "y": 340, "type": "outdoor"},
    
    # Aryabhata Academic Block (CSE, AI-DS & Computing Labs)
    "N05": {"name": "Aryabhata Block Ground Foyer", "x": 180, "y": 240, "type": "building"},
    "N06": {"name": "Aryabhata West Stairs", "x": 140, "y": 180, "type": "stairs"},
    "N07": {"name": "Aryabhata Divyangjan Ramp (Accessible)", "x": 220, "y": 200, "type": "ramp"},
    "N08": {"name": "Turing Advanced Computing Lab (CSE)", "x": 160, "y": 120, "type": "building"},
    "N09": {"name": "Aryabhata Seminar Hall", "x": 240, "y": 120, "type": "building"},
    
    # Connecting Covered Walkway (Rain Arcades)
    "N10": {"name": "Covered Inter-Block Arcade West", "x": 280, "y": 240, "type": "covered"},
    "N11": {"name": "Pergola Walkway (ASIET Central)", "x": 380, "y": 240, "type": "covered"},
    "N12": {"name": "Covered Inter-Block Arcade East", "x": 480, "y": 240, "type": "covered"},

    # Shankara Administrative Block & Central Auditorium
    "N13": {"name": "Shankara Block Main Foyer & Admin", "x": 520, "y": 220, "type": "building"},
    "N14": {"name": "Auditorium Grand Marble Steps", "x": 560, "y": 160, "type": "stairs"},
    "N15": {"name": "Auditorium Accessible Ramp & Lift", "x": 500, "y": 150, "type": "lift"},
    "N16": {"name": "Adi Shankara Central Auditorium", "x": 540, "y": 90, "type": "building"},

    # Student Amenities, Canteen & Library
    "N17": {"name": "ASIET Canteen Plaza & Cafeteria", "x": 420, "y": 420, "type": "outdoor"},
    "N18": {"name": "Main Dining Hall & Coffee Bar", "x": 450, "y": 500, "type": "building"},
    "N19": {"name": "Central Library & Digital Knowledge Centre", "x": 620, "y": 380, "type": "building"},
    "N20": {"name": "Library Portico Steps", "x": 660, "y": 320, "type": "stairs"},
    "N21": {"name": "Library Accessible Ramp", "x": 600, "y": 300, "type": "ramp"},
    "N22": {"name": "Digital Reference Wing & E-Learning Hub", "x": 640, "y": 240, "type": "building"},
    
    # Innovation Hub, OAT & East Gate
    "N23": {"name": "ASIET Fab Lab & IEDC Maker Space", "x": 700, "y": 160, "type": "building"},
    "N24": {"name": "ASIET Open-Air Amphitheatre (OAT)", "x": 340, "y": 520, "type": "outdoor"},
    "N25": {"name": "East Gate (Hostel & Sports Complex)", "x": 750, "y": 360, "type": "entrance"},
}

# (node_u, node_v, distance_meters, accessible_bool, covered_bool)
CAMPUS_EDGES = [
    ("N01", "N02", 70, True, False),
    ("N02", "N03", 150, True, False),
    ("N02", "N04", 170, True, False),
    ("N04", "N05", 110, True, False),
    ("N05", "N06", 60, False, True),   # Stairs inside Block A
    ("N05", "N07", 75, True, True),    # Wheelchair ramp
    ("N06", "N08", 65, False, True),
    ("N07", "N08", 85, True, True),
    ("N08", "N09", 80, True, True),
    ("N05", "N10", 90, True, True),
    ("N10", "N11", 100, True, True),
    ("N11", "N12", 100, True, True),
    ("N12", "N13", 50, True, True),
    ("N03", "N11", 160, True, False),  # Open lawn shortcut (uncovered)
    ("N13", "N14", 70, False, True),   # Aud steps
    ("N13", "N15", 55, True, True),    # Aud Lift
    ("N14", "N16", 70, False, True),
    ("N15", "N16", 75, True, True),
    ("N03", "N17", 120, True, False),
    ("N17", "N18", 80, True, True),
    ("N17", "N19", 190, True, False),  # Lawn walk to library
    ("N12", "N19", 180, True, True),   # Covered arcade path
    ("N19", "N20", 65, False, False),  # Library steps
    ("N19", "N21", 80, True, False),   # Library ramp
    ("N20", "N22", 80, False, True),
    ("N21", "N22", 90, True, True),
    ("N16", "N23", 160, True, False),
    ("N22", "N23", 110, True, True),
    ("N03", "N24", 110, True, False),
    ("N19", "N25", 130, True, False),
]

def build_campus_graph():
    G = nx.Graph()
    for n_id, data in CAMPUS_NODES.items():
        G.add_node(n_id, **data)
    for u, v, dist, acc, cov in CAMPUS_EDGES:
        G.add_edge(u, v, distance=dist, accessible=acc, covered=cov)
    return G

def find_campus_route(from_node: str, to_node: str, step_free: bool = False, rain_mode: bool = False):
    if from_node == to_node:
        name = CAMPUS_NODES.get(from_node, {}).get("name", from_node)
        return {
            "path_nodes": [from_node],
            "total_distance_m": 0,
            "eta_minutes": 0,
            "steps": [f"You are already at {name}"],
            "used_accessible_only": step_free,
            "rain_penalty_applied": rain_mode,
        }

    G = build_campus_graph()
    
    # Subgraph construction for constraints
    sub_edges = []
    for u, v, data in G.edges(data=True):
        if step_free and not data["accessible"]:
            continue
        # Rain mode penalty: uncovered paths cost 3x distance
        weight = data["distance"] * (1.0 if (data["covered"] or not rain_mode) else 3.0)
        sub_edges.append((u, v, {**data, "weight": weight}))
    
    H = nx.Graph()
    H.add_nodes_from(G.nodes(data=True))
    H.add_edges_from(sub_edges)
    
    try:
        path = nx.dijkstra_path(H, from_node, to_node, weight="weight")
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        return None
        
    total_dist = 0
    steps = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        edge_data = G[u][v]
        total_dist += edge_data["distance"]
        u_name = G.nodes[u]["name"]
        v_name = G.nodes[v]["name"]
        modifier = ""
        if not edge_data["accessible"]:
            modifier = " (stairs ⚠️ not step-free)"
        elif edge_data["covered"]:
            modifier = " (covered corridor ☂️)"
        else:
            modifier = " (open path ☀️)"
        steps.append(f"Walk {edge_data['distance']}m from {u_name} to {v_name}{modifier}")
        
    walking_speed_mps = 1.2  # PRD speed 1.2 m/s
    eta_seconds = int(total_dist / walking_speed_mps)
    eta_minutes = max(1, round(eta_seconds / 60))
    
    return {
        "path_nodes": path,
        "total_distance_m": total_dist,
        "eta_minutes": eta_minutes,
        "steps": steps,
        "used_accessible_only": step_free,
        "rain_penalty_applied": rain_mode,
    }
