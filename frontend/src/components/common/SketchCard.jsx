import React from 'react';

export const SketchCard = ({ 
  children, 
  decoration = null, // 'tape' | 'tack' | 'tack-blue' | 'tape-corner' | null
  className = '', 
  postit = false,
  rotation = 0,
  onClick = null
}) => {
  return (
    <div 
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={onClick}
      className={`relative p-5 md:p-6 border-[3px] border-pencil border-wobbly-md transition-all duration-150
        ${postit ? 'bg-paper-yellow' : 'bg-white'} 
        shadow-sketch hover:rotate-0 hover:shadow-sketchLg ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {decoration === 'tape' && <div className="tape-strip" />}
      {decoration === 'tack' && <div className="thumbtack" />}
      {decoration === 'tack-blue' && <div className="thumbtack thumbtack-blue" />}
      {decoration === 'tape-corner' && <div className="tape-corner" />}
      {children}
    </div>
  );
};
