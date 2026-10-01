import React from 'react';
import { motion } from 'framer-motion';

export const CampusMapSvg = ({ 
  nodes = {}, 
  edges = [], 
  activeRoute = null, 
  stepFree = false, 
  rainMode = false, 
  onSelectNode = () => {},
  selectedNode = null,
  currentLocationNode = null,
  targetEventNode = null
}) => {
  // Coordinate helper: viewbox is 0 0 850 600
  const getCoordinates = (nodeId) => {
    const node = nodes[nodeId];
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  // Convert active path nodes into an SVG path "M x y L x y..."
  const routePathD = activeRoute?.path_nodes?.reduce((acc, curr, index) => {
    const { x, y } = getCoordinates(curr);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, "") || "";

  // Campus building footprints for realistic sketch architectural plan
  const buildingFootprints = [
    { name: "Block A (CS & Labs)", x: 120, y: 80, w: 160, h: 180, labelX: 130, labelY: 105 },
    { name: "Block B (Auditorium)", x: 480, y: 60, w: 130, h: 180, labelX: 490, labelY: 82 },
    { name: "Central Library", x: 580, y: 220, w: 150, h: 180, labelX: 595, labelY: 370 },
    { name: "Canteen Hub", x: 400, y: 400, w: 100, h: 120, labelX: 410, labelY: 510 },
    { name: "Maker Space", x: 670, y: 130, w: 110, h: 80, labelX: 680, labelY: 150 },
    { name: "Amphitheatre", x: 310, y: 490, w: 80, h: 60, labelX: 315, labelY: 540, isOval: true },
  ];

  return (
    <div className="relative w-full overflow-hidden border-[3px] border-pencil border-wobbly-md bg-paper-bg p-3 md:p-4 shadow-sketch select-none">
      {/* Tape decoration */}
      <div className="tape-strip" />

      {/* Map header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b-2 border-dashed border-pencil/30 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-marker text-2xl text-pencil">Campus Zone Architectural Plan</span>
          <span className="text-xs bg-paper-muted px-2 py-0.5 border border-pencil border-wobbly font-hand">Scale: 1:500</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-hand">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 border-t-2 border-dashed border-pencil/60"></span> Uncovered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-1.5 bg-marker-blue rounded-sm"></span> Covered Corridor ☂️
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#2d5da1] border border-pencil"></span> Start
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-marker-red border border-pencil"></span> Destination
          </span>
        </div>
      </div>

      <svg viewBox="0 0 820 600" className="w-full h-auto select-none bg-[#fdfbf7]">
        {/* Paper texture overlay SVG filter */}
        <defs>
          <filter id="hand-drawn-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Background Grid Lines (Paper Notebook style) */}
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
                strokeWidth="2.5"
                filter="url(#hand-drawn-filter)"
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
                strokeWidth="2.5"
                filter="url(#hand-drawn-filter)"
                rx="6"
              />
            )}
            <text
              x={b.labelX}
              y={b.labelY}
              fontFamily="Patrick Hand"
              fontSize="13"
              fontWeight="bold"
              fill="#8c877d"
              className="select-none"
            >
              {b.name}
            </text>
          </g>
        ))}

        {/* Central Quad Lawn */}
        <path
          d="M 270 380 Q 320 350 370 410 Q 350 460 290 450 Z"
          fill="#edf4e8"
          stroke="#93a886"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <text x="290" y="415" fontFamily="Patrick Hand" fontSize="12" fill="#78926b" className="select-none">
          Central Lawn
        </text>

        {/* Draw all campus edges */}
        {edges.map(([u, v, dist, accessible, covered], idx) => {
          const p1 = getCoordinates(u);
          const p2 = getCoordinates(v);
          const isRouteEdge = activeRoute?.path_nodes && 
            activeRoute.path_nodes.some((n, i) => 
              (n === u && activeRoute.path_nodes[i+1] === v) || 
              (n === v && activeRoute.path_nodes[i+1] === u)
            );

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={covered ? "#2d5da1" : "#8c877d"}
                strokeWidth={covered ? "3.5" : "2"}
                strokeDasharray={accessible ? (covered ? "none" : "6 4") : "3 3"}
                strokeLinecap="round"
                filter="url(#hand-drawn-filter)"
                className={`${isRouteEdge ? 'opacity-30' : 'opacity-70'} transition-opacity`}
              />
              {/* Optional distance marker on hover */}
            </g>
          );
        })}

        {/* Animated Shortest Path in Red Marker */}
        {routePathD && (
          <motion.path
            d={routePathD}
            fill="none"
            stroke="#ff4d4d"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#hand-drawn-filter)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}

        {/* Nodes / Landmark Footprints */}
        {Object.entries(nodes).map(([id, node]) => {
          const isStart = activeRoute?.path_nodes?.[0] === id || currentLocationNode === id;
          const isDestination = activeRoute?.path_nodes?.slice(-1)[0] === id || targetEventNode === id;
          const isInRoute = activeRoute?.path_nodes?.includes(id);
          const isSelected = selectedNode === id;

          // Node styling based on role
          let fillColor = "#ffffff";
          let radius = 6;
          if (isDestination) {
            fillColor = "#ff4d4d";
            radius = 10;
          } else if (isStart) {
            fillColor = "#2d5da1";
            radius = 9;
          } else if (isInRoute) {
            fillColor = "#fff9c4"; // Post-it yellow for route path
            radius = 7;
          } else if (isSelected) {
            fillColor = "#ffeb3b";
            radius = 8;
          }

          return (
            <g 
              key={id} 
              transform={`translate(${node.x}, ${node.y})`}
              onClick={() => onSelectNode(id)}
              className="cursor-pointer group"
            >
              {/* Pulsing ring for destination */}
              {isDestination && (
                <circle
                  r="16"
                  fill="none"
                  stroke="#ff4d4d"
                  strokeWidth="2"
                  className="animate-ping opacity-60"
                />
              )}

              {/* Node circle */}
              <circle
                r={radius}
                fill={fillColor}
                stroke="#2d2d2d"
                strokeWidth="2.5"
                filter="url(#hand-drawn-filter)"
                className="transition-transform group-hover:scale-130 shadow-sketch"
              />

              {/* Node Label */}
              <text
                x="11"
                y="4"
                fontFamily="Patrick Hand"
                fontSize={isDestination || isStart ? "14" : isSelected ? "13" : "11"}
                fontWeight={isDestination || isStart || isSelected ? "bold" : "normal"}
                fill={isDestination ? "#ff4d4d" : isStart ? "#2d5da1" : isInRoute ? "#2d2d2d" : "#6b665f"}
                className="pointer-events-none select-none transition-colors"
                style={{ paintOrder: "stroke", stroke: "#ffffff", strokeWidth: "3px", strokeLinejoin: "round" }}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
