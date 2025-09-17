export const eventData = {
  pastEvents: {
    'Denver': {
      country: 'USA',
      coordinates: [-104.9903, 39.7392],
      events: [
        {
          id: 1,
          title: 'Espresso Summit Denver 2023',
          date: '2023-06-15',
          description: 'Coffee innovation meets Rocky Mountain inspiration',
          image: '/images/placeholder-event.jpg',
          location: 'Denver Convention Center'
        },
        {
          id: 2,
          title: 'Barista Championship Denver',
          date: '2023-08-20',
          description: 'Local baristas compete for the ultimate title',
          image: '/images/placeholder-event.jpg',
          location: 'Union Station'
        }
      ]
    },
    'San Francisco': {
      country: 'USA',
      coordinates: [-122.4194, 37.7749],
      events: [
        {
          id: 3,
          title: 'Tech & Coffee SF 2023',
          date: '2023-05-10',
          description: 'Where Silicon Valley meets coffee culture',
          image: '/images/placeholder-event.jpg',
          location: 'Moscone Center'
        }
      ]
    },
    'New York': {
      country: 'USA',
      coordinates: [-74.0060, 40.7128],
      events: [
        {
          id: 4,
          title: 'NYC Coffee Week 2023',
          date: '2023-09-05',
          description: 'The Big Apple\'s biggest coffee celebration',
          image: '/images/placeholder-event.jpg',
          location: 'Javits Center'
        }
      ]
    },
    'Cannes': {
      country: 'France',
      coordinates: [7.0167, 43.5528],
      events: [
        {
          id: 5,
          title: 'European Coffee Festival',
          date: '2023-07-12',
          description: 'French Riviera meets coffee excellence',
          image: '/images/placeholder-event.jpg',
          location: 'Palais des Festivals'
        }
      ]
    },
    'Bangkok': {
      country: 'Thailand',
      coordinates: [100.5018, 13.7563],
      events: [
        {
          id: 6,
          title: 'Asian Coffee Expo Bangkok',
          date: '2023-11-18',
          description: 'Exploring Asian coffee traditions',
          image: '/images/placeholder-event.jpg',
          location: 'Queen Sirikit Convention Center'
        }
      ]
    },
    'Brussels': {
      country: 'Belgium',
      coordinates: [4.3517, 50.8503],
      events: [
        {
          id: 7,
          title: 'European Coffee Capital Summit',
          date: '2023-10-22',
          description: 'Heart of Europe, soul of coffee',
          image: '/images/placeholder-event.jpg',
          location: 'Brussels Expo'
        }
      ]
    },
    'Berlin': {
      country: 'Germany',
      coordinates: [13.4050, 52.5200],
      events: [
        {
          id: 8,
          title: 'Berlin Coffee Innovation Lab',
          date: '2023-12-01',
          description: 'German precision meets coffee passion',
          image: '/images/placeholder-event.jpg',
          location: 'Station Berlin'
        }
      ]
    }
  },
  upcomingEvents: {
    'Seoul': {
      country: 'Korea',
      coordinates: [126.9780, 37.5665],
      events: [
        {
          id: 9,
          title: 'K-Coffee Festival Seoul 2025',
          date: '2025-12-15',
          description: 'Korean coffee culture meets global innovation',
          image: '/images/placeholder-event.jpg',
          location: 'COEX Convention Center'
        }
      ]
    },
    'Buenos Aires': {
      country: 'Argentina',
      coordinates: [-58.3816, -34.6037],
      events: [
        {
          id: 10,
          title: 'South American Coffee Congress',
          date: '2025-11-20',
          description: 'Celebrating Latin American coffee heritage',
          image: '/images/placeholder-event.jpg',
          location: 'La Rural Convention Center'
        }
      ]
    }
  }
};

export const getAllCities = () => {
  const pastCities = Object.keys(eventData.pastEvents);
  const upcomingCities = Object.keys(eventData.upcomingEvents);
  return { pastCities, upcomingCities };
};

export const getCityData = (cityName, eventType) => {
  const data = eventType === 'past' ? eventData.pastEvents : eventData.upcomingEvents;
  return data[cityName];
};