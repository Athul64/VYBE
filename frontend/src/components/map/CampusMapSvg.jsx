import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_NODES = {
  "N01": { "name": "ASIET Main Arch Gate (Kalady)", "x": 100, "y": 550, "type": "entrance" },
  "N02": { "name": "Main Security Checkpost", "x": 160, "y": 500, "type": "outdoor" },
  "N03": { "name": "Central Quad & Saraswathi Statue", "x": 300, "y": 420, "type": "outdoor" },
  "N04": { "name": "Gulmohar Courtyard", "x": 240, "y": 340, "type": "outdoor" },
  "N05": { "name": "Aryabhata Block Foyer", "x": 180, "y": 240, "type": "building" },
  "N06": { "name": "Aryabhata West Stairs", "x": 140, "y": 180, "type": "stairs" },
  "N07": { "name": "Aryabhata Accessible Ramp", "x": 220, "y": 200, "type": "ramp" },
  "N08": { "name": "Turing Advanced Computing Lab", "x": 160, "y": 120, "type": "building" },
  "N09": { "name": "Aryabhata Seminar Hall", "x": 240, "y": 120, "type": "building" },
  "N10": { "name": "Covered Arcade West", "x": 280, "y": 240, "type": "covered" },
  "N11": { "name": "Pergola Walkway (Central)", "x": 380, "y": 240, "type": "covered" },
  "N12": { "name": "Covered Arcade East", "x": 480, "y": 240, "type": "covered" },
  "N13": { "name": "Shankara Main Foyer & Admin", "x": 520, "y": 220, "type": "building" },
  "N14": { "name": "Auditorium Grand Steps", "x": 560, "y": 160, "type": "stairs" },
  "N15": { "name": "Auditorium Ramp & Lift", "x": 500, "y": 150, "type": "lift" },
  "N16": { "name": "Central Auditorium", "x": 540, "y": 90, "type": "building" },
  "N17": { "name": "ASIET Canteen Plaza", "x": 420, "y": 420, "type": "outdoor" },
  "N18": { "name": "Main Dining Hall", "x": 450, "y": 500, "type": "building" },
  "N19": { "name": "Central Library Hub", "x": 620, "y": 380, "type": "building" },
  "N20": { "name": "Library Portico Steps", "x": 660, "y": 320, "type": "stairs" },
  "N21": { "name": "Library Accessible Ramp", "x": 600, "y": 300, "type": "ramp" },
  "N22": { "name": "Digital Reference Wing", "x": 640, "y": 240, "type": "building" },
  "N23": { "name": "ASIET Fab Lab & IEDC", "x": 700, "y": 160, "type": "building" },
  "N24": { "name": "Open-Air Amphitheatre (OAT)", "x": 340, "y": 520, "type": "outdoor" },
  "N25": { "name": "East Gate (Hostels)", "x": 750, "y": 360, "type": "entrance" }
};

const DEFAULT_EDGES = [
  ["N01", "N02", 70, true, false],
  ["N02", "N03", 150, true, false],
  ["N02", "N04", 170, true, false],
  ["N04", "N05", 110, true, false],
  ["N05", "N06", 60, false, true],
  ["N05", "N07", 75, true, true],
  ["N06", "N08", 65, false, true],
  ["N07", "N08", 85, true, true],
  ["N08", "N09", 80, true, true],
  ["N05", "N10", 90, true, true],
  ["N10", "N11", 100, true, true],
  ["N11", "N12", 100, true, true],
  ["N12", "N13", 50, true, true],
  ["N03", "N11", 160, true, false],
  ["N13", "N14", 70, false, true],
  ["N13", "N15", 55, true, true],
  ["N14", "N16", 70, false, true],
  ["N15", "N16", 75, true, true],
  ["N03", "N17", 120, true, false],
  ["N17", "N18", 80, true, true],
  ["N17", "N19", 190, true, false],
  ["N12", "N19", 180, true, true],
  ["N19", "N20", 65, false, false],
  ["N19", "N21", 80, true, false],
  ["N20", "N22", 80, false, true],
  ["N21", "N22", 90, true, true],
  ["N16", "N23", 160, true, false],
  ["N22", "N23", 110, true, true],
  ["N03", "N24", 110, true, false],
  ["N19", "N25", 130, true, false]
];

export const CampusMapSvg = ({ 
  nodes = {}, 
  edges = [], 
  activeRoute = null, 
  stepFree = false, 
  rainMode = false, 
  onSelectNode = () => {},
  selectedNode = null,
  currentLocationNode = null,
  targetEventNode = null,
  className = "",
  compact = false
}) => {
  const effectiveNodes = (nodes && Object.keys(nodes).length > 0) ? nodes : DEFAULT_NODES;
  const effectiveEdges = (edges && edges.length > 0) ? edges : DEFAULT_EDGES;

  // Default preview route if none supplied in compact mode
  const effectiveRoute = activeRoute || (compact ? {
    path_nodes: ["N08", "N05", "N10", "N11", "N12", "N13", "N15", "N16"],
    total_distance_m: 540,
    eta_minutes: 2
  } : null);

  const effectiveStartNode = currentLocationNode || (compact ? "N08" : null);
  const effectiveTargetNode = targetEventNode || (compact ? "N16" : null);

  // Coordinate helper: viewbox is 0 0 850 600
  const getCoordinates = (nodeId) => {
    const node = effectiveNodes[nodeId];
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Convert active path nodes into an SVG path "M x y L x y..."
  const routePathD = effectiveRoute?.path_nodes?.reduce((acc, curr, index) => {
    const { x, y } = getCoordinates(curr);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "") || "";

  // Campus building footprints for Adi Shankara Institute of Engineering & Technology (ASIET), Kalady
  const buildingFootprints = [
    { name: "Aryabhata Block (CSE & AI)", x: 120, y: 75, w: 160, h: 185, labelX: 130, labelY: 100 },
    { name: "Shankara Admin & Central Aud.", x: 480, y: 55, w: 140, h: 185, labelX: 490, labelY: 80 },
    { name: "Central Library & Digital Hub", x: 580, y: 220, w: 155, h: 180, labelX: 595, labelY: 370 },
    { name: "ASIET Canteen Plaza", x: 395, y: 395, w: 110, h: 125, labelX: 405, labelY: 505 },
    { name: "ASIET Fab Lab & IEDC", x: 670, y: 125, w: 115, h: 85, labelX: 680, labelY: 145 },
    { name: "Open-Air Amphitheatre (OAT)", x: 310, y: 490, w: 85, h: 65, labelX: 318, labelY: 535, isOval: true },
    { name: "Saraswathi Statue Quad", x: 270, y: 390, w: 75, h: 55, labelX: 278, labelY: 418, isOval: true },
  ];

  return (
    <div className={`relative w-full overflow-hidden select-none flex flex-col ${
      compact ? className : `border-2 border-pencil rounded-xl bg-paper-bg p-3 shadow-sketch ${className}`
    }`}>
      
      {/* Map header - only in full view */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2 pb-1.5 border-b border-pencil/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-marker text-lg text-pencil">Adi Shankara (ASIET) Kalady Campus Trail</span>
            <span className="text-[11px] bg-paper-muted px-2 py-0.5 border border-pencil rounded font-semibold">Scale: 1:500</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-pencil">
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 border-t-2 border-dashed border-pencil/70"></span> Uncovered
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-1.5 bg-marker-blue rounded-sm"></span> Covered ☂️
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#2d5da1] border border-pencil"></span> Start
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-marker-red border border-pencil"></span> Destination
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 820 600" className="w-full h-full max-h-[420px] object-contain select-none bg-[#fdfbf7]">
          
          {/* Background Grid Lines */}
          <g stroke="#e5e0d8" strokeWidth="0.8" opacity="0.6">
            {Array.from({ length: 17 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 35} x2="820" y2={i * 35} />
            ))}
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 35} y1="0" x2={i * 35} y2="600" />
            ))}
          </g>

          {/* Campus Building Zones */}
          {buildingFootprints.map((b, i) => (
            <g key={`bldg-${i}`}>
              {b.isOval ? (
                <ellipse
                  cx={b.x + b.w / 2}
                  cy={b.y + b.h / 2}
                  rx={b.w / 2}
                  ry={b.h / 2}
                  fill="#f4efe6"
                  stroke="#2d2d2d"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              ) : (
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  fill="#f7f3ec"
                  stroke="#2d2d2d"
                  strokeWidth="2"
                  rx="6"
                />
              )}
              <text
                x={b.labelX}
                y={b.labelY}
                fontFamily="system-ui, sans-serif"
                fontSize="12"
                fontWeight="700"
                fill="#6e685f"
                className="select-none tracking-wide"
              >
                {b.name}
              </text>
            </g>
          ))}

          {/* Central Quad Lawn & Saraswathi Statue */}
          <path
            d="M 270 380 Q 320 350 370 410 Q 350 460 290 450 Z"
            fill="#edf4e8"
            stroke="#93a886"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text 
            x="285" 
            y="415" 
            fontFamily="system-ui, sans-serif" 
            fontSize="11" 
            fontWeight="600" 
            fill="#5f7753" 
            className="select-none"
          >
            Saraswathi Quad
          </text>

          {/* Edges */}
          {effectiveEdges.map(([u, v, dist, accessible, covered], idx) => {
            const p1 = getCoordinates(u);
            const p2 = getCoordinates(v);
            const isRouteEdge = effectiveRoute?.path_nodes && 
              effectiveRoute.path_nodes.some((n, i) => 
                (n === u && effectiveRoute.path_nodes[i+1] === v) || 
                (n === v && effectiveRoute.path_nodes[i+1] === u)
              );

            return (
              <line
                key={`edge-${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={covered ? "#2d5da1" : "#8c877d"}
                strokeWidth={covered ? "3.5" : "2"}
                strokeDasharray={accessible ? (covered ? "none" : "6 4") : "3 3"}
                strokeLinecap="round"
                className={`${isRouteEdge ? 'opacity-30' : 'opacity-80'} transition-opacity`}
              />
            );
          })}

          {/* Animated Route in Red Marker */}
          {routePathD && (
            <motion.path
              d={routePathD}
              fill="none"
              stroke="#ff4d4d"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
            />
          )}

          {/* Nodes with High-Contrast Legible Labels */}
          {Object.entries(effectiveNodes).map(([id, node]) => {
            const isStart = effectiveRoute?.path_nodes?.[0] === id || effectiveStartNode === id;
            const isDestination = effectiveRoute?.path_nodes?.slice(-1)[0] === id || effectiveTargetNode === id;
            const isInRoute = effectiveRoute?.path_nodes?.includes(id);
            const isSelected = selectedNode === id;

            let fillColor = "#ffffff";
            let radius = 6;
            if (isDestination) {
              fillColor = "#ff4d4d";
              radius = 9;
            } else if (isStart) {
              fillColor = "#2d5da1";
              radius = 8;
            } else if (isInRoute) {
              fillColor = "#fff9c4";
              radius = 6.5;
            } else if (isSelected) {
              fillColor = "#ffeb3b";
              radius = 7;
            }

            return (
              <g 
                key={id} 
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode(id)}
                className="cursor-pointer group"
              >
                {/* Ping ring for destination */}
                {isDestination && (
                  <circle
                    r="15"
                    fill="none"
                    stroke="#ff4d4d"
                    strokeWidth="2"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={radius}
                  fill={fillColor}
                  stroke="#2d2d2d"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />

                {/* Clean, Razor-Sharp Readable Label with White Outline Halo */}
                {(!compact || isStart || isDestination) && (
                  <text
                    x={compact && isStart ? "-10" : "10"}
                    y={compact && isStart ? "-8" : "4"}
                    textAnchor={compact && isStart ? "end" : "start"}
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fontSize={isDestination || isStart ? "13" : isSelected ? "12" : "11"}
                    fontWeight={isDestination || isStart || isSelected ? "700" : "600"}
                    fill={isDestination ? "#ff4d4d" : isStart ? "#2d5da1" : isInRoute ? "#2d2d2d" : "#4a4641"}
                    className="pointer-events-none select-none"
                    style={{
                      paintOrder: "stroke fill",
                      stroke: "#ffffff",
                      strokeWidth: "3px",
                      strokeLinejoin: "round"
                    }}
                  >
                    {compact 
                      ? (isDestination ? "Central Auditorium 🎯" : isStart ? "Turing Lab 📍" : node.name)
                      : node.name
                    }
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
