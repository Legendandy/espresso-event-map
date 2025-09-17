'use client';

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { eventData } from '../../data/events';

const FlatView = forwardRef(({ onCityClick, selectedCity }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapboxgl, setMapboxgl] = useState(null);
  const [error, setError] = useState(null);

  // Default flat map settings
  const defaultSettings = {
    center: [0, 20],
    zoom: 2,
    projection: 'mercator'
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

  // Initialize map
  useEffect(() => {
    if (!mapboxgl || !mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: defaultSettings.center,
        zoom: defaultSettings.zoom,
        projection: defaultSettings.projection
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsLoaded(true);
        // Add markers immediately after map loads and state is updated
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
    console.log('=== ADDING MARKERS ===');
    
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

      // Add past events markers
      if (eventData.pastEvents) {
        console.log('Adding past event markers...');
        Object.entries(eventData.pastEvents).forEach(([cityName, cityData]) => {
          console.log(`Adding past event marker for: ${cityName}`, cityData);
          
          if (!cityData.coordinates || !Array.isArray(cityData.coordinates)) {
            console.error(`Invalid coordinates for ${cityName}:`, cityData.coordinates);
            return;
          }

          // Create popup (but don't attach it to marker yet)
          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: false,
            closeOnClick: false
          })
            .setHTML(`
              <div style="font-family: sans-serif; padding: 8px;">
                <strong style="color: #270903;">${cityName}</strong><br/>
                <span style="color: #666;">${cityData.country}</span><br/>
                <span style="color: #270903; font-size: 12px;">Past Events</span>
              </div>
            `);

          const marker = new mapboxgl.Marker({
            color: '#270903',
            scale: 1.0
          })
            .setLngLat(cityData.coordinates)
            .addTo(map.current);

          // Get marker element for hover events
          const markerElement = marker.getElement();
          
          // Add hover events
          markerElement.addEventListener('mouseenter', () => {
            popup.setLngLat(cityData.coordinates).addTo(map.current);
          });
          
          markerElement.addEventListener('mouseleave', () => {
            popup.remove();
          });

          // Click event (no popup, just navigation)
          markerElement.addEventListener('click', () => {
            console.log(`Clicked past event: ${cityName}`);
            onCityClick && onCityClick(cityName, 'past');
            map.current.flyTo({
              center: cityData.coordinates,
              zoom: 10,
              duration: 2000
            });
          });
          
          markerCount++;
        });
      } else {
        console.log('No past events data found');
      }

      // Add upcoming events markers
      if (eventData.upcomingEvents) {
        console.log('Adding upcoming event markers...');
        Object.entries(eventData.upcomingEvents).forEach(([cityName, cityData]) => {
          console.log(`Adding upcoming event marker for: ${cityName}`, cityData);
          
          if (!cityData.coordinates || !Array.isArray(cityData.coordinates)) {
            console.error(`Invalid coordinates for ${cityName}:`, cityData.coordinates);
            return;
          }

          // Create popup (but don't attach it to marker yet)
          const popup = new mapboxgl.Popup({ 
            offset: 25,
            closeButton: false,
            closeOnClick: false
          })
            .setHTML(`
              <div style="font-family: sans-serif; padding: 8px;">
                <strong style="color: #DE9E67;">${cityName}</strong><br/>
                <span style="color: #666;">${cityData.country}</span><br/>
                <span style="color: #DE9E67; font-size: 12px;">Upcoming Events</span>
              </div>
            `);

          const marker = new mapboxgl.Marker({
            color: '#DE9E67',
            scale: 1.0
          })
            .setLngLat(cityData.coordinates)
            .addTo(map.current);

          // Get marker element for hover events
          const markerElement = marker.getElement();
          
          // Add hover events
          markerElement.addEventListener('mouseenter', () => {
            popup.setLngLat(cityData.coordinates).addTo(map.current);
          });
          
          markerElement.addEventListener('mouseleave', () => {
            popup.remove();
          });

          // Click event (no popup, just navigation)
          markerElement.addEventListener('click', () => {
            console.log(`Clicked upcoming event: ${cityName}`);
            onCityClick && onCityClick(cityName, 'upcoming');
            map.current.flyTo({
              center: cityData.coordinates,
              zoom: 10,
              duration: 2000
            });
          });
          
          markerCount++;
        });
      } else {
        console.log('No upcoming events data found');
      }

      console.log(`✅ SUCCESS: ${markerCount} markers added to map!`);
      
      if (markerCount === 0) {
        console.warn('❌ WARNING: No markers were added! Check your event data structure.');
      }

    } catch (error) {
      console.error('❌ ERROR adding markers:', error);
    }
  };

  // Handle external city selection
  useEffect(() => {
    if (selectedCity && map.current && isLoaded) {
      const allCities = { ...eventData.pastEvents, ...eventData.upcomingEvents };
      const cityData = allCities[selectedCity];
      
      if (cityData) {
        map.current.flyTo({
          center: cityData.coordinates,
          zoom: 10,
          duration: 2000
        });
      }
    }
  }, [selectedCity, isLoaded]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Map Loading Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <div className="text-sm text-gray-600 text-left">
            <p className="mb-2">Troubleshooting steps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your .env.local file exists</li>
              <li>Verify token starts with 'pk.'</li>
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
          <p className="text-gray-600">Loading Mapbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing map...</p>
          </div>
        </div>
      )}
    </div>
  );
});

FlatView.displayName = 'FlatView';

export default FlatView;