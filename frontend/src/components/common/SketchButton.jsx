import React from 'react';

export const SketchButton = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  type = 'button',
  disabled = false,
  title = ''
}) => {
  const variantStyles = {
    primary: 'bg-white hover:bg-marker-red hover:text-white text-pencil',
    secondary: 'bg-paper-muted hover:bg-marker-blue hover:text-white text-pencil',
    postit: 'bg-paper-yellow hover:bg-pencil hover:text-paper-yellow text-pencil',
    blue: 'bg-white hover:bg-marker-blue hover:text-white text-pencil',
    danger: 'bg-marker-red text-white hover:bg-pencil hover:text-white',
    activeTab: 'bg-pencil text-white shadow-none translate-x-[2px] translate-y-[2px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`relative px-4 py-2 font-hand text-lg md:text-xl font-bold tracking-wide border-[3px] border-pencil
        border-wobbly shadow-sketch transition-all duration-100 ease-in-out
        hover:shadow-sketchHover hover:translate-x-[2px] hover:translate-y-[2px]
        active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
        cursor-pointer select-none inline-flex items-center justify-center gap-2 ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {children}
    </button>
  );
};
