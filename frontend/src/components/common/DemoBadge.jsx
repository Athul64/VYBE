import React from 'react';
import { Info, RotateCcw } from 'lucide-react';

export const DemoBadge = ({ onResetDemo }) => {
  return (
    <div className="fixed top-2 right-2 md:top-3 md:right-4 z-50 pointer-events-auto">
      <div className="relative bg-paper-yellow border-[2.5px] border-pencil border-wobbly px-3 py-1.5 shadow-sketch text-xs md:text-sm font-hand text-pencil flex items-center gap-2 transform -rotate-1 hover:rotate-0 transition-transform">
        <div className="tape-strip !top-[-10px] !w-20 !h-4 opacity-80" />
        <span className="w-2 h-2 rounded-full bg-marker-red animate-pulse" />
        <span className="font-bold text-marker-red tracking-wider">DEMO DATA:</span>
        <span className="hidden sm:inline">Hand-drawn 25-node campus zone. Walking ETAs based on 1.2 m/s.</span>
        <span className="sm:hidden">25-node zone • 1.2 m/s</span>
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            title="Reset seeded demo state"
            className="ml-1 p-0.5 hover:bg-pencil/10 rounded-full cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-pencil stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
