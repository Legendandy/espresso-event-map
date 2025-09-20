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
    // Refresh city lists to get latest data after any event movements
    const { pastCities: refreshedPastCities, upcomingCities: refreshedUpcomingCities } = getAllCities();
    
    // Check if this city has both event types
    const hasPastEvents = eventData.pastEvents[cityName] && eventData.pastEvents[cityName].events.length > 0;
    const hasUpcomingEvents = eventData.upcomingEvents[cityName] && eventData.upcomingEvents[cityName].events.length > 0;
    const isMixedCity = hasPastEvents && hasUpcomingEvents;
    
    if (isMixedCity) {
      // For mixed cities, always show the mixed view regardless of eventType parameter
      setActiveFilter('mixed');
      setCurrentEventType('upcoming'); // Start with upcoming events
      setCurrentCityIndex(0);
      setCurrentEventIndex(0);
      setSelectedCity(cityName);
      setIsPanelOpen(true);
      return;
    }
    
    // For cities with only one event type, use the actual event type they have
    const actualEventType = hasUpcomingEvents ? 'upcoming' : 'past';
    const cities = actualEventType === 'past' ? refreshedPastCities : refreshedUpcomingCities;
    
    // Find city in the appropriate list
    const cityIndex = cities.findIndex(city => {
      const name = typeof city === 'string' ? city : city.name;
      return name === cityName;
    });
    
    if (cityIndex !== -1) {
      setActiveFilter(actualEventType);
      setCurrentEventType(actualEventType);
      setCurrentCityIndex(cityIndex);
      setCurrentEventIndex(0);
      setSelectedCity(cityName);
      setIsPanelOpen(true);
    } else {
      // If city not found in either list but has events, something went wrong
      // Try to recover by checking both event data sources directly
      console.log(`City ${cityName} not found in city lists. Past events:`, hasPastEvents, 'Upcoming events:', hasUpcomingEvents);
      
      if (hasPastEvents || hasUpcomingEvents) {
        // Force open the panel even if we can't find the city index
        setActiveFilter(actualEventType);
        setCurrentEventType(actualEventType);
        setCurrentCityIndex(0); // Default to first city
        setCurrentEventIndex(0);
        setSelectedCity(cityName);
        setIsPanelOpen(true);
      }
    }
  };

  const handleCityChange = (newCityIndex) => {
    // For mixed cities, navigate to next/prev city based on the current event type being viewed
    if (activeFilter === 'mixed') {
      // Get the appropriate city list based on current event type being viewed
      const cities = currentEventType === 'past' ? pastCities : upcomingCities;
      
      // Navigate to the next/prev city in that specific event type list
      const targetCity = cities[newCityIndex];
      const targetCityName = typeof targetCity === 'string' ? targetCity : targetCity.name;
      
      // Check if target city is mixed (has both event types)
      const hasPastEvents = eventData.pastEvents[targetCityName] && eventData.pastEvents[targetCityName].events.length > 0;
      const hasUpcomingEvents = eventData.upcomingEvents[targetCityName] && eventData.upcomingEvents[targetCityName].events.length > 0;
      const isTargetMixed = hasPastEvents && hasUpcomingEvents;
      
      if (isTargetMixed) {
        // Target city is also mixed - stay in mixed mode, keep current event type
        setSelectedCity(targetCityName);
        setCurrentCityIndex(newCityIndex);
        setCurrentEventIndex(0);
      } else {
        // Target city only has one event type - switch to appropriate single filter
        setActiveFilter(currentEventType);
        setCurrentCityIndex(newCityIndex);
        setCurrentEventIndex(0);
        setSelectedCity(targetCityName);
      }
      return;
    }
    
    // Normal single-type city handling
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

  const handleEventTypeChange = (newEventType) => {
    // For mixed cities, don't reset anything - just update the current event type
    if (activeFilter === 'mixed') {
      setCurrentEventType(newEventType);
      // Don't reset currentEventIndex - let the EventPanel handle the navigation
      return;
    }
    
    // Switch between upcoming and past for non-mixed cities
    setCurrentEventType(newEventType);
    setCurrentEventIndex(0);
    
    // Update active filter to match current view
    setActiveFilter(newEventType);
    
    // Update city list to match new event type
    const cities = newEventType === 'past' ? pastCities : upcomingCities;
    const currentCityName = selectedCity;
    
    // Find the city in the new list
    const newCityIndex = cities.findIndex(city => {
      const name = typeof city === 'string' ? city : city.name;
      return name === currentCityName;
    });
    
    if (newCityIndex !== -1) {
      setCurrentCityIndex(newCityIndex);
    } else {
      // If city not found in new list, reset
      setCurrentCityIndex(0);
      if (cities.length > 0) {
        const cityName = typeof cities[0] === 'string' ? cities[0] : cities[0].name;
        setSelectedCity(cityName);
      }
    }
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
    // Handle mixed cities differently
    if (activeFilter === 'mixed') {
      const upcomingEvents = eventData.upcomingEvents[selectedCity]?.events || [];
      const pastEvents = eventData.pastEvents[selectedCity]?.events || [];
      
      // Sort upcoming events by date (earliest first)
      const sortedUpcomingEvents = [...upcomingEvents].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(a.date) - new Date(b.date);
      });
      
      // Sort past events by date (most recent first)
      const sortedPastEvents = [...pastEvents].sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return new Date(b.date) - new Date(a.date);
      });
      
      return [{
        name: selectedCity,
        country: eventData.upcomingEvents[selectedCity]?.country || eventData.pastEvents[selectedCity]?.country,
        coordinates: eventData.upcomingEvents[selectedCity]?.coordinates || eventData.pastEvents[selectedCity]?.coordinates,
        // Show upcoming events first, then past events
        events: [...sortedUpcomingEvents, ...sortedPastEvents],
        eventTypes: [
          ...sortedUpcomingEvents.map(() => 'upcoming'),
          ...sortedPastEvents.map(() => 'past')
        ],
        hasBoth: true,
        upcomingEvents: sortedUpcomingEvents,
        pastEvents: sortedPastEvents
      }];
    }
    
    // Normal single-type city handling
    const cities = currentEventType === 'past' ? pastCities : upcomingCities;
    const eventSource = currentEventType === 'past' ? eventData.pastEvents : eventData.upcomingEvents;
    
    return cities.map(cityItem => {
      const cityName = typeof cityItem === 'string' ? cityItem : cityItem.name;
      const cityData = eventSource[cityName];
      
      // Check if this city has both event types
      const hasPastEvents = eventData.pastEvents[cityName] && eventData.pastEvents[cityName].events.length > 0;
      const hasUpcomingEvents = eventData.upcomingEvents[cityName] && eventData.upcomingEvents[cityName].events.length > 0;
      const hasBoth = hasPastEvents && hasUpcomingEvents;
      
      return {
        name: cityName,
        country: cityData?.country || '',
        coordinates: cityData?.coordinates || [0, 0],
        events: cityData?.events || [],
        hasBoth: hasBoth,
        upcomingEvents: hasUpcomingEvents ? eventData.upcomingEvents[cityName].events : null,
        pastEvents: hasPastEvents ? eventData.pastEvents[cityName].events : null
      };
    });
  };

  // Helper function to determine city marker type
  const getCityMarkerType = (cityName) => {
    const hasPastEvents = eventData.pastEvents[cityName] && eventData.pastEvents[cityName].events.length > 0;
    const hasUpcomingEvents = eventData.upcomingEvents[cityName] && eventData.upcomingEvents[cityName].events.length > 0;
    
    if (hasPastEvents && hasUpcomingEvents) {
      return 'mixed'; // City has both past and upcoming events - split color marker
    } else if (hasUpcomingEvents) {
      return 'upcoming'; // Espresso light color
    } else if (hasPastEvents) {
      return 'past'; // Espresso dark color
    }
    return 'none';
  };

  useEffect(() => {
    const checkEventDates = () => {
      const now = new Date();
      let hasChanges = false;

      Object.entries(eventData.upcomingEvents).forEach(([cityName, cityData]) => {
        // Need to iterate backwards to safely remove items
        for (let eventIndex = cityData.events.length - 1; eventIndex >= 0; eventIndex--) {
          const event = cityData.events[eventIndex];
          
          // Skip events without valid dates
          if (!event.date || event.date === 'NIL' || event.date === '') {
            continue;
          }

          let eventEndTime;
          
          // If we have start/end time and timezone, use precise timing
          if (event.endTime && event.timezone) {
            // Create a date string with the event date and end time
            const eventDateStr = `${event.date}T${event.endTime}:00`;
            eventEndTime = new Date(eventDateStr);
            
            // Convert timezone offset to minutes (basic timezone handling)
            const timezoneOffset = getTimezoneOffsetMinutes(event.timezone);
            eventEndTime.setMinutes(eventEndTime.getMinutes() - timezoneOffset);
          } else {
            // Fall back to end of day in event's local time if no time specified
            eventEndTime = new Date(event.date);
            eventEndTime.setHours(23, 59, 59, 999);
          }
          
          // Check if event has ended
          if (eventEndTime < now) {
            // Move event from upcoming to past
            if (!eventData.pastEvents[cityName]) {
              eventData.pastEvents[cityName] = {
                ...cityData,
                events: []
              };
            }
            eventData.pastEvents[cityName].events.push(event);
            
            // Remove from upcoming
            eventData.upcomingEvents[cityName].events.splice(eventIndex, 1);
            
            hasChanges = true;
          }
        }
        
        // Clean up empty city entries
        if (eventData.upcomingEvents[cityName].events.length === 0) {
          delete eventData.upcomingEvents[cityName];
        }
      });

      if (hasChanges) {
        setActiveFilter(prev => prev);
      }
    };

    // Helper function to convert timezone strings to offset minutes
    const getTimezoneOffsetMinutes = (timezone) => {
      const timezoneMap = {
        'MST': 420,    // Mountain Standard Time (UTC-7)
        'MDT': 360,    // Mountain Daylight Time (UTC-6)
        'PDT': 420,    // Pacific Daylight Time (UTC-7)
        'PST': 480,    // Pacific Standard Time (UTC-8)
        'EDT': 240,    // Eastern Daylight Time (UTC-4)
        'EST': 300,    // Eastern Standard Time (UTC-5)
        'GMT+2': -120, // Central European Summer Time (UTC+2)
        'GMT+7': -420, // Thailand Time (UTC+7)
        'GMT+9': -540, // Korea Standard Time (UTC+9)
        // Add more as needed
      };
      
      return timezoneMap[timezone] || 0; // Default to UTC if timezone not found
    };

    checkEventDates();
    
    // Check more frequently (every hour) for better precision
    const interval = setInterval(checkEventDates, 60 * 60 * 1000);

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
                Explore our events around the world! Click on the markers to see where we&apos;ve been or discover when we might be coming to your city.
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
                <div className="flex items-center">
                  <div className="w-6 h-6 mr-3 flex-shrink-0 relative">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <defs>
                        <clipPath id="leftHalf">
                          <rect x="0" y="0" width="12" height="24" />
                        </clipPath>
                        <clipPath id="rightHalf">
                          <rect x="12" y="0" width="12" height="24" />
                        </clipPath>
                      </defs>
                      <path fill="#270903" clipPath="url(#leftHalf)" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      <path fill="#DE9E67" clipPath="url(#rightHalf)" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Split markers indicate cities with both past and upcoming events</span>
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
            getCityMarkerType={getCityMarkerType}
          />
        ) : (
          <FlatView 
            ref={flatViewRef}
            onCityClick={handleCityClick} 
            selectedCity={selectedCity}
            onMapLoad={handleMapLoad}
            getCityMarkerType={getCityMarkerType}
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
        eventType={activeFilter}
        cities={getCurrentCitiesData()}
        currentCityIndex={currentCityIndex}
        onCityChange={handleCityChange}
        currentEventIndex={currentEventIndex}
        onEventChange={handleEventChange}
        currentEventType={currentEventType}
        onEventTypeChange={handleEventTypeChange}
      />
    </div>
  );
};

export default WorldMap;