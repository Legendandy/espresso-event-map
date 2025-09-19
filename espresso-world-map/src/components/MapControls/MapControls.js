import React, { useState, useEffect } from 'react';

const MapControls = ({ onZoomIn, onZoomOut, onResetMap }) => {
  const [isResetHovered, setIsResetHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-3 z-20">
      <div className="flex flex-col bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors duration-200 rounded-t-lg border-b border-gray-200"
          style={{ color: '#270903' }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 flex items-center justify-center text-lg font-bold hover:bg-gray-100 transition-colors duration-200 rounded-b-lg"
          style={{ color: '#DE9E67' }}
          title="Zoom Out"
        >
          −
        </button>
      </div>
      
      <button
        onClick={onResetMap}
        onMouseEnter={() => !isMobile && setIsResetHovered(true)}
        onMouseLeave={() => !isMobile && setIsResetHovered(false)}
        className="relative w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 transition-colors duration-200 overflow-visible"
        title="Reset Map"
      >
        {!isMobile && isResetHovered ? (
          <span 
            className="absolute left-0 text-sm font-medium whitespace-nowrap bg-white/90 backdrop-blur-sm hover:bg-gray-100 rounded-lg shadow-lg border border-gray-200 px-3 py-2 transition-all duration-300 ease-in-out"
            style={{ color: '#270903' }}
          >
            Reset Map
          </span>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-700"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default MapControls;