'use client';

import { useState, useEffect, useRef } from 'react';
import GlobeView from '../GlobeView/GlobeView';
import FlatView from '../FlatView/FlatView';
import Header from '../Header/Header';
import FilterPanel from '../FilterPanel/FilterPanel';
import EventPanel from '../EventPanel/EventPanel';
import MapControls from '../MapControls/MapControls';
import { eventData, getAllCities, getCityData } from '../../data/events';

const WorldMap = () => {
  const [viewMode, setViewMode] = useState('flat');
  const [activeFilter, setActiveFilter] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentEventType, setCurrentEventType] = useState('past');
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const globeViewRef = useRef(null);
  const flatViewRef = useRef(null);

  const { pastCities, upcomingCities } = getAllCities();

  const handleMapLoad = () => {
    setIsMapLoaded(true);
  };

  useEffect(() => {
    if (isMapLoaded) {
      const hasVisitedBefore = localStorage.getItem('hasVisitedWorldMap');
      if (!hasVisitedBefore) {
        setTimeout(() => {
          setShowWelcomePopup(true);
        }, 500);
      }
    }
  }, [isMapLoaded]);

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false);
    localStorage.setItem('hasVisitedWorldMap', 'true');
  };

  const handleToggleView = () => {
    setViewMode(viewMode === 'globe' ? 'flat' : 'globe');
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    setCurrentEventType(filterType);
    setCurrentCityIndex(0);
    setCurrentEventIndex(0);
    setIsPanelOpen(true);
    
    const cities = filterType === 'past' ? pastCities : upcomingCities;
    if (cities.length > 0) {
      const cityName = typeof cities[0] === 'string' ? cities[0] : cities[0].name;
      setSelectedCity(cityName);
    }
  };

  const handleCityClick = (cityName, eventType) => {
    const cities = eventType === 'past' ? pastCities : upcomingCities;
    const cityIndex = cities.findIndex(city => {
      const name = typeof city === 'string' ? city : city.name;
      return name === cityName;
    });
    
    if (cityIndex !== -1) {
      setActiveFilter(eventType);
      setCurrentEventType(eventType);
      setCurrentCityIndex(cityIndex);
      setCurrentEventIndex(0);
      setSelectedCity(cityName);
      setIsPanelOpen(true);
    }
  };

  const handleCityChange = (newCityIndex) => {
    setCurrentCityIndex(newCityIndex);
    setCurrentEventIndex(0);
    
    const cities = currentEventType === 'past' ? pastCities : upcomingCities;
    const cityData = cities[newCityIndex];
    const cityName = typeof cityData === 'string' ? cityData : cityData.name;
    setSelectedCity(cityName);
  };

  const handleEventChange = (newEventIndex) => {
    setCurrentEventIndex(newEventIndex);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setActiveFilter(null);
    setSelectedCity(null);
  };

  const getCurrentMapRef = () => {
    return viewMode === 'globe' ? globeViewRef.current : flatViewRef.current;
  };

  const handleZoomIn = () => {
    const mapRef = getCurrentMapRef();
    if (mapRef && mapRef.zoomIn) {
      mapRef.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const mapRef = getCurrentMapRef();
    if (mapRef && mapRef.zoomOut) {
      mapRef.zoomOut();
    }
  };

  const handleResetMap = () => {
    const mapRef = getCurrentMapRef();
    if (mapRef && mapRef.resetMap) {
      mapRef.resetMap();
    }
    
    setActiveFilter(null);
    setIsPanelOpen(false);
    setSelectedCity(null);
    setCurrentCityIndex(0);
    setCurrentEventIndex(0);
  };

  const getCurrentCitiesData = () => {
    const cities = currentEventType === 'past' ? pastCities : upcomingCities;
    const eventSource = currentEventType === 'past' ? eventData.pastEvents : eventData.upcomingEvents;
    
    return cities.map(cityItem => {
      const cityName = typeof cityItem === 'string' ? cityItem : cityItem.name;
      return {
        name: cityName,
        country: eventSource[cityName].country,
        coordinates: eventSource[cityName].coordinates,
        events: eventSource[cityName].events
      };
    });
  };

  useEffect(() => {
    const checkEventDates = () => {
      const today = new Date();
      let hasChanges = false;

      Object.entries(eventData.upcomingEvents).forEach(([cityName, cityData]) => {
        cityData.events.forEach((event, eventIndex) => {
          const eventDate = new Date(event.date);
          if (eventDate < today) {
            if (!eventData.pastEvents[cityName]) {
              eventData.pastEvents[cityName] = {
                ...cityData,
                events: []
              };
            }
            eventData.pastEvents[cityName].events.push(event);
            
            eventData.upcomingEvents[cityName].events.splice(eventIndex, 1);
            
            if (eventData.upcomingEvents[cityName].events.length === 0) {
              delete eventData.upcomingEvents[cityName];
            }
            
            hasChanges = true;
          }
        });
      });

      if (hasChanges) {
        setActiveFilter(prev => prev);
      }
    };

    checkEventDates();
    
    const interval = setInterval(checkEventDates, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {showWelcomePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl max-w-md mx-4 p-6 relative">
            <button
              onClick={handleCloseWelcomePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="pr-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Espresso World Map</h2>
              <p className="text-gray-600 mb-6">
                Explore our events around the world! Click on the markers to see where we've been or discover when we might be coming to your city.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="#DE9E67" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-sm text-gray-700">Orange markers indicate upcoming events</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="#270903" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span className="text-sm text-gray-700">Brown markers indicate past events</span>
                </div>
              </div>

              <button
                onClick={handleCloseWelcomePopup}
                className="w-full bg-espresso-light hover:bg-espresso-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Explore the Map
              </button>
            </div>
          </div>
        </div>
      )}

      <Header viewMode={viewMode} onToggleView={handleToggleView} />
      
      <FilterPanel 
        onFilterClick={handleFilterClick} 
        activeFilter={activeFilter}
      />
      
      <div className="w-full h-full">
        {viewMode === 'globe' ? (
          <GlobeView 
            ref={globeViewRef}
            onCityClick={handleCityClick} 
            selectedCity={selectedCity}
            onMapLoad={handleMapLoad}
          />
        ) : (
          <FlatView 
            ref={flatViewRef}
            onCityClick={handleCityClick} 
            selectedCity={selectedCity}
            onMapLoad={handleMapLoad}
          />
        )}
      </div>
      
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 md:left-0 md:top-auto md:transform-none md:bottom-4">
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetMap={handleResetMap}
        />
      </div>
      
      <EventPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        eventType={currentEventType}
        cities={getCurrentCitiesData()}
        currentCityIndex={currentCityIndex}
        onCityChange={handleCityChange}
        currentEventIndex={currentEventIndex}
        onEventChange={handleEventChange}
      />
    </div>
  );
};

export default WorldMap;