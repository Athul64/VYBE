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
  targetEventNode = null,
  className = ""
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
    <div className={`relative w-full overflow-hidden border-2 border-pencil rounded-xl bg-paper-bg p-3 shadow-sketch select-none flex flex-col ${className}`}>
      
      {/* Map header */}
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
          {edges.map(([u, v, dist, accessible, covered], idx) => {
            const p1 = getCoordinates(u);
            const p2 = getCoordinates(v);
            const isRouteEdge = activeRoute?.path_nodes && 
              activeRoute.path_nodes.some((n, i) => 
                (n === u && activeRoute.path_nodes[i+1] === v) || 
                (n === v && activeRoute.path_nodes[i+1] === u)
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
          {Object.entries(nodes).map(([id, node]) => {
            const isStart = activeRoute?.path_nodes?.[0] === id || currentLocationNode === id;
            const isDestination = activeRoute?.path_nodes?.slice(-1)[0] === id || targetEventNode === id;
            const isInRoute = activeRoute?.path_nodes?.includes(id);
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
                <text
                  x="10"
                  y="4"
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
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
