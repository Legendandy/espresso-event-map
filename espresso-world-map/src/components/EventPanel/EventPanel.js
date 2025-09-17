import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const EventPanel = ({ 
  isOpen, 
  onClose, 
  eventType, 
  cities, 
  currentCityIndex, 
  onCityChange, 
  onEventChange,
  currentEventIndex 
}) => {
  if (!isOpen || !cities || cities.length === 0) return null;

  const currentCity = cities[currentCityIndex];
  const currentEvent = currentCity?.events[currentEventIndex];

  const handleNextCity = () => {
    const nextIndex = (currentCityIndex + 1) % cities.length;
    onCityChange(nextIndex);
  };

  const handlePrevCity = () => {
    const prevIndex = currentCityIndex === 0 ? cities.length - 1 : currentCityIndex - 1;
    onCityChange(prevIndex);
  };

  const handleNextEvent = () => {
    if (currentCity && currentEventIndex < currentCity.events.length - 1) {
      onEventChange(currentEventIndex + 1);
    }
  };

  const handlePrevEvent = () => {
    if (currentEventIndex > 0) {
      onEventChange(currentEventIndex - 1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-panel-bg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
     
      <div className={`w-full py-3 px-4 text-center ${
        eventType === 'past' ? 'bg-espresso-dark' : 'bg-espresso-light'
      }`}>
        <h2 className="text-white font-bold text-lg">
          {eventType === 'past' ? 'Past Events' : 'Upcoming Events'}
        </h2>
      </div>

      {/* Panel Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevCity}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={cities.length <= 1}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-lg">{currentCity?.name}</h2>
            <p className="text-sm text-gray-600">{currentCity?.country}</p>
          </div>
          <button
            onClick={handleNextCity}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={cities.length <= 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Event Content */}
      <div className="p-6 flex-1 overflow-y-auto">
        {currentEvent && (
          <div className="space-y-4">
            

            {/* Event Image */}
            <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/images/placeholder-event.jpg';
                }}
              />
            </div>

            {/* Event Details */}
            <div className="space-y-2">
              <h3 className="font-bold text-xl text-gray-900">{currentEvent.title}</h3>
              <p className="text-espresso-light font-medium">{formatDate(currentEvent.date)}</p>
              <p className="text-gray-600">{currentEvent.location}</p>
              <p className="text-gray-700 leading-relaxed">{currentEvent.description}</p>
            </div>

            {/* Event Navigation */}
            {currentCity.events.length > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={handlePrevEvent}
                  disabled={currentEventIndex === 0}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentEventIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Prev Event
                </button>
                <span className="text-sm text-gray-600">
                  {currentEventIndex + 1} of {currentCity.events.length}
                </span>
                <button
                  onClick={handleNextEvent}
                  disabled={currentEventIndex === currentCity.events.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    currentEventIndex === currentCity.events.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-espresso-light text-white hover:bg-opacity-90'
                  }`}
                >
                  Next Event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPanel;