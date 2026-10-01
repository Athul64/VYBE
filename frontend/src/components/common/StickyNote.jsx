import React from 'react';

export const StickyNote = ({
  children,
  color = 'yellow', // 'yellow' | 'pink' | 'blue' | 'white'
  rotation = -1.5,
  withPin = true,
  className = ''
}) => {
  const colorMap = {
    yellow: 'bg-paper-yellow border-pencil',
    pink: 'bg-[#ffd1dc] border-pencil',
    blue: 'bg-[#d8e8f8] border-pencil',
    white: 'bg-white border-pencil',
    red: 'bg-[#ffe0e0] border-marker-red'
  };

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`relative p-4 border-[2.5px] border-wobbly sticky-curl ${colorMap[color] || colorMap.yellow} ${className}`}
    >
      {withPin && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-marker-red border-2 border-pencil shadow-[1px_1px_0px_#2d2d2d] z-10">
          <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full"></div>
        </div>
      )}
      {children}
    </div>
  );
};
