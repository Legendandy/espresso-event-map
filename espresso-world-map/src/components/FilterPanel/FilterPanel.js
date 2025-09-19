import { useState, useEffect } from 'react';

const FilterPanel = ({ onFilterClick, activeFilter }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    bottomSpacing: 'bottom-20' // default fallback
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isChrome = /Chrome/.test(userAgent);
      
      let bottomSpacing = 'bottom-20'; // default
      
      // iPhone specific positioning
      if (isIOS) {
        if (isSafari) {
          // iPhone Safari needs more space due to toolbar + home indicator
          bottomSpacing = 'bottom-40';
        } else if (isChrome) {
          // iPhone Chrome
          bottomSpacing = 'bottom-36';
        } else {
          // Other iOS browsers
          bottomSpacing = 'bottom-36';
        }
      }
      // Android specific positioning
      else if (isAndroid) {
        if (isChrome) {
          // Android Chrome
          bottomSpacing = 'bottom-24';
        } else {
          // Other Android browsers
          bottomSpacing = 'bottom-28';
        }
      }
      
      setDeviceInfo({
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        bottomSpacing
      });
    };

    detectDevice();
  }, []);

  return (
    <div className={`absolute ${deviceInfo.bottomSpacing} left-1/2 transform -translate-x-1/2 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 z-40 flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-4`}>
      
      <button
        onClick={() => onFilterClick('past')}
        className={`block w-40 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          activeFilter === 'past'
            ? 'bg-espresso-dark text-white shadow-lg'
            : 'bg-espresso-dark text-white hover:shadow-md'
        }`}
      >
        Past Events
      </button>
      
     
      <button
        onClick={() => onFilterClick('upcoming')}
        className={`block w-40 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          activeFilter === 'upcoming'
            ? 'bg-espresso-light text-white shadow-lg'
            : 'bg-espresso-light text-white hover:shadow-md'
        }`}
      >
        Upcoming Events
      </button>
    </div>
  );
};

export default FilterPanel;