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

  // Refs to access map methods
  const globeViewRef = useRef(null);
  const flatViewRef = useRef(null);

  const { pastCities, upcomingCities } = getAllCities();

  const handleToggleView = () => {
    setViewMode(viewMode === 'globe' ? 'flat' : 'globe');
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);
    setCurrentEventType(filterType);
    setCurrentCityIndex(0);
    setCurrentEventIndex(0);
    setIsPanelOpen(true);
    
    // Set selected city for map focus - get city name string
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
    
    // Update selected city for map focus - ensure we pass city name string
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

  // Get current map ref based on view mode
  const getCurrentMapRef = () => {
    return viewMode === 'globe' ? globeViewRef.current : flatViewRef.current;
  };

  // Map control handlers
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
    // Reset map view using the current map's reset method
    const mapRef = getCurrentMapRef();
    if (mapRef && mapRef.resetMap) {
      mapRef.resetMap();
    }
    
    // Reset all UI state
    setActiveFilter(null);
    setIsPanelOpen(false);
    setSelectedCity(null);
    setCurrentCityIndex(0);
    setCurrentEventIndex(0);
  };

  // Prepare cities data for the panel
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

  // Auto-transition logic for upcoming events that have passed
  useEffect(() => {
    const checkEventDates = () => {
      const today = new Date();
      let hasChanges = false;

      // Check upcoming events
      Object.entries(eventData.upcomingEvents).forEach(([cityName, cityData]) => {
        cityData.events.forEach((event, eventIndex) => {
          const eventDate = new Date(event.date);
          if (eventDate < today) {
            // Move event to past events
            if (!eventData.pastEvents[cityName]) {
              eventData.pastEvents[cityName] = {
                ...cityData,
                events: []
              };
            }
            eventData.pastEvents[cityName].events.push(event);
            
            // Remove from upcoming events
            eventData.upcomingEvents[cityName].events.splice(eventIndex, 1);
            
            // If no more events in city, remove city from upcoming
            if (eventData.upcomingEvents[cityName].events.length === 0) {
              delete eventData.upcomingEvents[cityName];
            }
            
            hasChanges = true;
          }
        });
      });

      if (hasChanges) {
        // Force re-render by updating state
        setActiveFilter(prev => prev);
      }
    };

    // Check on component mount
    checkEventDates();
    
    // Set up interval to check daily
    const interval = setInterval(checkEventDates, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Header */}
      <Header viewMode={viewMode} onToggleView={handleToggleView} />
      
      {/* Filter Panel */}
      <FilterPanel 
        onFilterClick={handleFilterClick} 
        activeFilter={activeFilter}
      />
      
      {/* Map View */}
      <div className="w-full h-full">
        {viewMode === 'globe' ? (
          <GlobeView 
            ref={globeViewRef}
            onCityClick={handleCityClick} 
            selectedCity={selectedCity}
          />
        ) : (
          <FlatView 
            ref={flatViewRef}
            onCityClick={handleCityClick} 
            selectedCity={selectedCity}
          />
        )}
      </div>
      
      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetMap={handleResetMap}
      />
      
      {/* Event Panel */}
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