import { useState, useEffect } from 'react';

const UniversalFilterPanel = ({ onFilterClick, activeFilter }) => {
  return (
    <>
      <style jsx>{`
        .universal-positioning {
          /* Mobile-first: bottom center */
          position: absolute;
          bottom: max(env(safe-area-inset-bottom, 0px) + 2rem, 3rem);
          left: 50%;
          transform: translateX(-50%);
          z-index: 40;
          
          /* Use viewport units for true universality */
          width: calc(100vw - 4rem);
          max-width: 20rem;
          display: flex;
          flex-direction: row;
          gap: 1rem;
        }
        
        /* Desktop positioning */
        @media (min-width: 640px) {
          .universal-positioning {
            bottom: auto;
            left: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            width: auto;
            max-width: none;
            flex-direction: column;
          }
        }
        
        /* Dynamic height detection for better mobile support */
        @media (max-height: 600px) {
          .universal-positioning {
            bottom: max(env(safe-area-inset-bottom, 0px) + 1rem, 2rem);
          }
        }
        
        /* Landscape mobile optimization */
        @media (max-width: 640px) and (orientation: landscape) {
          .universal-positioning {
            bottom: max(env(safe-area-inset-bottom, 0px) + 1rem, 1.5rem);
          }
        }
        
        /* Universal button styling */
        .universal-button {
          width: 10rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          
          /* Ensure visibility on all backgrounds */
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        /* Hover effects that work universally */
        .universal-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* Active states */
        .universal-button:active {
          transform: translateY(0);
        }
        
        /* Responsive text sizing */
        @media (max-width: 640px) {
          .universal-button {
            font-size: 0.875rem;
            padding: 0.625rem 0.875rem;
          }
        }
      `}</style>
      
      <div className="universal-positioning">
        <button
          onClick={() => onFilterClick('past')}
          className={`universal-button ${
            activeFilter === 'past'
              ? 'text-white'
              : 'text-white hover:opacity-90'
          }`}
          style={{
            backgroundColor: activeFilter === 'past' ? '#8B4513' : '#A0522D'
          }}
        >
          Past Events
        </button>
        
        <button
          onClick={() => onFilterClick('upcoming')}
          className={`universal-button ${
            activeFilter === 'upcoming'
              ? 'text-white'
              : 'text-white hover:opacity-90'
          }`}
          style={{
            backgroundColor: activeFilter === 'upcoming' ? '#D2691E' : '#CD853F'
          }}
        >
          Upcoming Events
        </button>
      </div>
    </>
  );
};

export default FilterPanel;