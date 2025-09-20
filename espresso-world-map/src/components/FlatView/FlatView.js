'use client';

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { eventData } from '../../data/events';

const FlatView = forwardRef(({ onCityClick, selectedCity, onMapLoad }, ref) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapboxgl, setMapboxgl] = useState(null);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const defaultSettings = {
    center: [0, 20],
    zoom: 2,
    projection: 'mercator'
  };

  const connectionSequence = [
    { name: 'San Francisco', coordinates: [-122.4194, 37.7749] },
    { name: 'Denver', coordinates: [-104.9903, 39.7392] },
    { name: 'New York', coordinates: [-74.0059, 40.7128] },
    { name: 'Buenos Aires', coordinates: [-58.3816, -34.6037] },
    { name: 'Cannes', coordinates: [7.0167, 43.5528] },
    { name: 'Brussels', coordinates: [4.3517, 50.8503] },
    { name: 'Berlin', coordinates: [13.4050, 52.5200] },
    { name: 'Seoul', coordinates: [126.9780, 37.5665] },
    { name: 'Bangkok', coordinates: [100.5018, 13.7563] }
  ];

  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth <= 768 || 
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsDesktop(!isMobile);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (!document.getElementById('marker-pulse-styles')) {
      const style = document.createElement('style');
      style.id = 'marker-pulse-styles';
      style.textContent = `
        @keyframes pulsate {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.4);
          }
        }
        
        .marker-pulsate svg {
          animation: pulsate 0.6s ease-in-out 3;
          transform-origin: center center;
        }

        @keyframes connectionPulse {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          100% {
            opacity: 0.7;
            transform: scale(1);
          }
        }

        .connection-marker {
          animation: connectionPulse 1s ease-in-out;
        }

        /* Mixed marker styles */
        .mixed-marker svg {
          fill: url(#mixedGradient) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const createAnimatedLine = (start, end, connectionIndex) => {
    if (!map.current || !mapboxgl) return Promise.resolve(null);

    return new Promise((resolve) => {
      const lineSourceId = `connection-line-${connectionIndex}`;
      const lineLayerId = `connection-layer-${connectionIndex}`;
      
      const animationDuration = 800;
      const startTime = performance.now();
      
      if (!map.current.getSource(lineSourceId)) {
        map.current.addSource(lineSourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [start]
            }
          }
        });

        map.current.addLayer({
          id: lineLayerId,
          type: 'line',
          source: lineSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6B35',
            'line-width': 4,
            'line-opacity': 0.9
          }
        });
      }

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentLng = start[0] + (end[0] - start[0]) * easedProgress;
        const currentLat = start[1] + (end[1] - start[1]) * easedProgress;
        
        if (map.current.getSource(lineSourceId)) {
          map.current.getSource(lineSourceId).setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [start, [currentLng, currentLat]]
            }
          });
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve({ lineSourceId, lineLayerId });
        }
      };
      
      requestAnimationFrame(animate);
    });
  };

  const pulseSpecificCity = (coordinates) => {
    if (!map.current) return;

    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach(markerEl => {
      const marker = markerEl._marker;
      if (marker) {
        const markerCoords = marker.getLngLat();
        const distance = Math.sqrt(
          Math.pow(markerCoords.lng - coordinates[0], 2) + 
          Math.pow(markerCoords.lat - coordinates[1], 2)
        );
        
        if (distance < 1) {
          addPulseAnimation(markerEl);
        }
      }
    });
  };

  const cleanupConnectionLines = () => {
    if (!map.current) return;
    
    for (let i = 0; i < connectionSequence.length - 1; i++) {
      const lineLayerId = `connection-layer-${i}`;
      const lineSourceId = `connection-line-${i}`;
      
      if (map.current.getLayer(lineLayerId)) {
        map.current.removeLayer(lineLayerId);
      }
      if (map.current.getSource(lineSourceId)) {
        map.current.removeSource(lineSourceId);
      }
    }
  };

  const startConnectionAnimation = async () => {
    if (!isDesktop || !map.current || !isLoaded) return;
    
    for (let i = 0; i < connectionSequence.length - 1; i++) {
      const startCity = connectionSequence[i];
      const endCity = connectionSequence[i + 1];
      
      pulseSpecificCity(startCity.coordinates);
      
      await createAnimatedLine(startCity.coordinates, endCity.coordinates, i);
      
      pulseSpecificCity(endCity.coordinates);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setTimeout(() => {
      cleanupConnectionLines();
    }, 2000);
  };

  const addPulseAnimation = (markerElement) => {
    markerElement.classList.remove('marker-pulsate');
    markerElement.offsetHeight;
    markerElement.classList.add('marker-pulsate');
    
    setTimeout(() => {
      markerElement.classList.remove('marker-pulsate');
    }, 1800);
  };

  const startContinuousPulsing = (markerElement) => {
    addPulseAnimation(markerElement);
    
    const intervalId = setInterval(() => {
      addPulseAnimation(markerElement);
    }, 60000);
    
    markerElement._pulseInterval = intervalId;
  };

  useEffect(() => {
    if (!isDesktop || !isLoaded) return;

    let connectionInterval;
    let animationRunning = false;

    const runAnimation = async () => {
      if (animationRunning) return;
      animationRunning = true;
      await startConnectionAnimation();
      animationRunning = false;
    };

    const initialTimeout = setTimeout(() => {
      runAnimation();
    }, 5000);

    connectionInterval = setInterval(() => {
      runAnimation();
    }, 120000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(connectionInterval);
    };
  }, [isDesktop, isLoaded]);

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

  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
        document.head.appendChild(css);

        const mapboxModule = await import('mapbox-gl');
        const mapboxGl = mapboxModule.default;
        
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        
        if (!token) {
          setError('Mapbox token not found. Check your .env.local file.');
          return;
        }

        mapboxGl.accessToken = token;
        setMapboxgl(mapboxGl);
        
      } catch (error) {
        setError('Failed to load Mapbox: ' + error.message);
      }
    };

    loadMapbox();
  }, []);

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
        setIsLoaded(true);
        setTimeout(() => addCityMarkers(), 100);
        
        if (onMapLoad) {
          onMapLoad();
        }
      });

      map.current.on('error', (e) => {
        setError('Map failed to load. Check your token permissions.');
      });

    } catch (error) {
      setError('Failed to initialize map: ' + error.message);
    }

    return () => {
      if (map.current) {
        const markers = document.querySelectorAll('.mapboxgl-marker');
        markers.forEach(markerEl => {
          if (markerEl._pulseInterval) {
            clearInterval(markerEl._pulseInterval);
          }
        });
        
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxgl]);

  const addCityMarkers = () => {
    if (!map.current || !mapboxgl || !eventData) return;

    try {
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
          scale: 1.0
        })
          .setLngLat(cityData.coordinates)
          .addTo(map.current);

        const markerElement = marker.getElement();
        markerElement._marker = marker;
        
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
        
        setTimeout(() => {
          startContinuousPulsing(markerElement);
        }, 100);
        
        markerElement.addEventListener('mouseenter', () => {
          popup.setLngLat(cityData.coordinates).addTo(map.current);
          addPulseAnimation(markerElement);
        });
        
        markerElement.addEventListener('mouseleave', () => {
          popup.remove();
        });

        markerElement.addEventListener('click', () => {
          addPulseAnimation(markerElement);
          onCityClick && onCityClick(cityName, eventType);
          map.current.flyTo({
            center: cityData.coordinates,
            zoom: 10,
            duration: 2000
          });
        });
      });

    } catch (error) {
      // Silent error handling
    }
  };

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
        
        setTimeout(() => {
          const markers = document.querySelectorAll('.mapboxgl-marker');
          markers.forEach(markerEl => {
            addPulseAnimation(markerEl);
          });
        }, 500);
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
          <p className="text-gray-600">Loading...</p>
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
            <p className="text-sm text-gray-600">Initializing Espresso map...</p>
          </div>
        </div>
      )}
    </div>
  );
});

FlatView.displayName = 'FlatView';

export default FlatView;