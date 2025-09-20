'use client';

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { eventData } from '../../data/events';

const MapboxGlobeView = forwardRef(({ onCityClick, selectedCity }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapboxgl, setMapboxgl] = useState(null);
  const [error, setError] = useState(null);

  // Default globe settings
  const defaultSettings = {
    center: [0, 20],
    zoom: 1.5,
    projection: 'globe'
  };

  // Expose map control methods to parent component
  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (map.current) {
        const currentZoom = map.current.getZoom();
        map.current.zoomTo(currentZoom + 1, { duration: 500 });
      }
    },
    zoomOut: () => {
      if (map.current) {
        const currentZoom = map.current.getZoom();
        map.current.zoomTo(currentZoom - 1, { duration: 500 });
      }
    },
    resetMap: () => {
      if (map.current) {
        map.current.flyTo({
          center: defaultSettings.center,
          zoom: defaultSettings.zoom,
          duration: 2000,
          essential: true
        });
      }
    }
  }));

  // Load Mapbox GL JS and CSS dynamically
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        // Import Mapbox CSS
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        document.head.appendChild(css);

        // Dynamic import of mapbox-gl
        const mapboxModule = await import('mapbox-gl');
        const mapboxGl = mapboxModule.default;
        
        // Check if token exists
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        console.log('Token check:', token ? 'Token found' : 'No token');
        
        if (!token) {
          setError('Mapbox token not found. Check your .env.local file.');
          return;
        }

        mapboxGl.accessToken = token;
        setMapboxgl(mapboxGl);
        
      } catch (error) {
        console.error('Error loading Mapbox:', error);
        setError('Failed to load Mapbox: ' + error.message);
      }
    };

    loadMapbox();
  }, []);

  // Initialize map with globe projection
  useEffect(() => {
    if (!mapboxgl || !mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12', // Nice satellite view for globe
        center: defaultSettings.center,
        zoom: defaultSettings.zoom,
        projection: defaultSettings.projection
      });

      // Override background and add atmosphere effect
      map.current.on('style.load', () => {
        // Set white background instead of space
        map.current.setFog({
          'color': 'rgb(255, 255, 255)', // White atmosphere
          'high-color': 'rgb(255, 255, 255)', // White high altitude
          'horizon-blend': 0.02,
          'space-color': 'rgb(255, 255, 255)', // White space background
          'star-intensity': 0 // Remove stars
        });
      });

      map.current.on('load', () => {
        console.log('Globe map loaded successfully');
        setIsLoaded(true);
        // Add markers immediately after map loads
        setTimeout(() => addCityMarkers(), 100);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Map failed to load. Check your token permissions.');
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setError('Failed to initialize map: ' + error.message);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxgl]);

  const addCityMarkers = () => {
    console.log('=== ADDING MARKERS TO GLOBE ===');
    
    if (!map.current || !mapboxgl) {
      console.log('Cannot add markers: missing map or mapboxgl');
      return;
    }

    if (!eventData) {
      console.error('eventData is undefined!');
      return;
    }

    try {
      let markerCount = 0;

      // Get all unique cities and determine their event types
      const allCities = {};
      
      // Track cities with past events
      if (eventData.pastEvents) {
        Object.entries(eventData.pastEvents).forEach(([cityName, cityData]) => {
          if (!cityData.coordinates || !Array.isArray(cityData.coordinates)) return;
          allCities[cityName] = {
            ...cityData,
            hasPast: true,
            hasUpcoming: false
          };
        });
      }

      // Track cities with upcoming events (and update if they also have past events)
      if (eventData.upcomingEvents) {
        Object.entries(eventData.upcomingEvents).forEach(([cityName, cityData]) => {
          if (!cityData.coordinates || !Array.isArray(cityData.coordinates)) return;
          
          if (allCities[cityName]) {
            // City already exists with past events, mark it as having both
            allCities[cityName].hasUpcoming = true;
          } else {
            // New city with only upcoming events
            allCities[cityName] = {
              ...cityData,
              hasPast: false,
              hasUpcoming: true
            };
          }
        });
      }

      // Create markers for all cities
      Object.entries(allCities).forEach(([cityName, cityData]) => {
        const hasBoth = cityData.hasPast && cityData.hasUpcoming;
        const hasOnlyPast = cityData.hasPast && !cityData.hasUpcoming;
        const hasOnlyUpcoming = !cityData.hasPast && cityData.hasUpcoming;

        let markerColor, popupText, eventType;

        if (hasBoth) {
          markerColor = '#DE9E67'; // Use upcoming color as base for mixed markers
          popupText = 'Past & Upcoming Events';
          eventType = 'mixed';
        } else if (hasOnlyPast) {
          markerColor = '#270903';
          popupText = 'Past Events';
          eventType = 'past';
        } else {
          markerColor = '#DE9E67';
          popupText = 'Upcoming Events';
          eventType = 'upcoming';
        }

        const popup = new mapboxgl.Popup({ 
          offset: 25,
          closeButton: false,
          closeOnClick: false
        })
          .setHTML(`
            <div style="font-family: sans-serif; padding: 8px;">
              <strong style="color: ${hasBoth ? '#DE9E67' : (hasOnlyPast ? '#270903' : '#DE9E67')};">${cityName}</strong><br/>
              <span style="color: #666;">${cityData.country}</span><br/>
              <span style="color: ${hasBoth ? '#DE9E67' : (hasOnlyPast ? '#270903' : '#DE9E67')}; font-size: 12px;">${popupText}</span>
            </div>
          `);

        const marker = new mapboxgl.Marker({
          color: markerColor,
          scale: 1.2 // Slightly larger for globe view
        })
          .setLngLat(cityData.coordinates)
          .addTo(map.current);

        const markerElement = marker.getElement();
        markerElement._marker = marker;
        
        // Apply mixed marker styling if the city has both event types
        if (hasBoth) {
          markerElement.classList.add('mixed-marker');
          
          // Wait for the SVG to be rendered, then modify it
          setTimeout(() => {
            const svg = markerElement.querySelector('svg');
            if (svg) {
              // Create the gradient definition
              const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
              const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
              gradient.setAttribute('id', `mixedGradient-${cityName.replace(/\s+/g, '')}`);
              gradient.setAttribute('x1', '0%');
              gradient.setAttribute('y1', '0%');
              gradient.setAttribute('x2', '100%');
              gradient.setAttribute('y2', '0%');
              
              const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
              stop1.setAttribute('offset', '50%');
              stop1.setAttribute('stop-color', '#270903');
              
              const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
              stop2.setAttribute('offset', '50%');
              stop2.setAttribute('stop-color', '#DE9E67');
              
              gradient.appendChild(stop1);
              gradient.appendChild(stop2);
              defs.appendChild(gradient);
              svg.insertBefore(defs, svg.firstChild);
              
              // Apply the gradient to the path
              const path = svg.querySelector('path');
              if (path) {
                path.setAttribute('fill', `url(#mixedGradient-${cityName.replace(/\s+/g, '')})`);
              }
            }
          }, 100);
        }
        
        // Add hover events
        markerElement.addEventListener('mouseenter', () => {
          popup.setLngLat(cityData.coordinates).addTo(map.current);
        });
        
        markerElement.addEventListener('mouseleave', () => {
          popup.remove();
        });

        // Click event
        markerElement.addEventListener('click', () => {
          console.log(`Clicked ${eventType} event: ${cityName}`);
          onCityClick && onCityClick(cityName, eventType);
          // Fly to location with nice animation
          map.current.flyTo({
            center: cityData.coordinates,
            zoom: 8,
            duration: 3000,
            essential: true
          });
        });
        
        markerCount++;
      });

      console.log(`✅ SUCCESS: ${markerCount} markers added to globe!`);

    } catch (error) {
      console.error('❌ ERROR adding markers to globe:', error);
    }
  };

  // Handle external city selection with more robust city matching
  useEffect(() => {
    console.log('🔍 selectedCity changed:', selectedCity);
    console.log('🗺️ Map loaded:', !!map.current, 'Is loaded:', isLoaded);
    
    if (selectedCity && map.current && isLoaded && eventData) {
      const allCities = { ...eventData.pastEvents, ...eventData.upcomingEvents };
      console.log('📍 All available cities:', Object.keys(allCities));
      
      // Try exact match first
      let cityData = allCities[selectedCity];
      
      // If no exact match, try case-insensitive search
      if (!cityData) {
        const cityKey = Object.keys(allCities).find(key => 
          key.toLowerCase() === selectedCity.toLowerCase()
        );
        if (cityKey) {
          cityData = allCities[cityKey];
          console.log('✅ Found city with case-insensitive match:', cityKey);
        }
      }
      
      // If still no match, try partial match
      if (!cityData) {
        const cityKey = Object.keys(allCities).find(key => 
          key.toLowerCase().includes(selectedCity.toLowerCase()) ||
          selectedCity.toLowerCase().includes(key.toLowerCase())
        );
        if (cityKey) {
          cityData = allCities[cityKey];
          console.log('✅ Found city with partial match:', cityKey);
        }
      }
      
      console.log('🎯 Final city data found:', !!cityData, cityData);
      
      if (cityData && cityData.coordinates) {
        console.log('🚀 Flying to city:', selectedCity, cityData.coordinates);
        map.current.flyTo({
          center: cityData.coordinates,
          zoom: 8,
          duration: 3000,
          essential: true
        });
      } else {
        console.warn('❌ City data not found for:', selectedCity);
        console.warn('Available cities:', Object.keys(allCities));
      }
    } else {
      console.log('⏸️ Conditions not met:', {
        hasSelectedCity: !!selectedCity,
        hasMap: !!map.current,
        isLoaded,
        hasEventData: !!eventData
      });
    }
  }, [selectedCity, isLoaded]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Globe Loading Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="text-sm text-gray-600 text-left">
            <p className="mb-2">Troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your .env.local file exists</li>
              <li>Verify token starts with pk.</li>
              <li>Restart your dev server</li>
              <li>Check token permissions on Mapbox</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxgl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Mapbox Globe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '100vh', backgroundColor: 'white' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing globe...</p>
          </div>
        </div>
      )}
    </div>
  );
});

MapboxGlobeView.displayName = 'MapboxGlobeView';

export default MapboxGlobeView;