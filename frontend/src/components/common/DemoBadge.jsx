import React from 'react';
import { RotateCcw } from 'lucide-react';

export const DemoBadge = ({ onResetDemo }) => {
  return (
    <div className="fixed bottom-2 right-2 z-50 pointer-events-auto select-none">
      <div className="bg-paper-yellow/95 border-2 border-pencil rounded-lg px-2.5 py-1 shadow-[2px_2px_0px_#2d2d2d] text-xs font-sans text-pencil flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
        <span className="font-bold text-pencil uppercase tracking-wider text-[11px]">ASIET CAMPUS:</span>
        <span className="text-[11px] text-pencil/80 font-medium hidden sm:inline">25-node trail • ETAs at 1.2 m/s</span>
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            title="Reset event board to clean state"
            className="ml-1 p-1 hover:bg-pencil/10 rounded-full cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-pencil" />
          </button>
        )}
      </div>
    </div>
  );
};
