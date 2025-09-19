import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';
import Image from 'next/image';

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
  const scrollContainerRef = useRef(null);
  
  if (!isOpen || !cities || cities.length === 0) return null;

  const currentCity = cities[currentCityIndex];
  const currentEvent = currentCity?.events[currentEventIndex];

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleNextCity = () => {
    const nextIndex = (currentCityIndex + 1) % cities.length;
    onCityChange(nextIndex);
    scrollToTop();
  };

  const handlePrevCity = () => {
    const prevIndex = currentCityIndex === 0 ? cities.length - 1 : currentCityIndex - 1;
    onCityChange(prevIndex);
    scrollToTop();
  };

  const handleNextEvent = () => {
    if (currentCity && currentEventIndex < currentCity.events.length - 1) {
      onEventChange(currentEventIndex + 1);
      // Use setTimeout to ensure state update happens first
      setTimeout(() => {
        scrollToTop();
      }, 0);
    }
  };

  const handlePrevEvent = () => {
    if (currentEventIndex > 0) {
      onEventChange(currentEventIndex - 1);
      // Use setTimeout to ensure state update happens first
      setTimeout(() => {
        scrollToTop();
      }, 0);
    }
  };

  const handleRegisterClick = () => {
    if (currentEvent?.registrationLink) {
      window.open(currentEvent.registrationLink, '_blank');
    }
  };

  // Helper function to check if date is valid
  const isValidDate = (dateString) => {
    if (!dateString || dateString === '') return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  };

  const formatDate = (dateString) => {
    if (!isValidDate(dateString)) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateNumber = (dateString) => {
    if (!isValidDate(dateString)) return '?';
    return new Date(dateString).getDate();
  };

  const getMonthAbbr = (dateString) => {
    if (!isValidDate(dateString)) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  };

  const formatTime = (startTime, endTime, timezone) => {
    if (!startTime || !endTime) return '';
    
    const formatSingleTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    };

    const formattedStart = formatSingleTime(startTime);
    const formattedEnd = formatSingleTime(endTime);
    
    return `${formattedStart} - ${formattedEnd} ${timezone || ''}`;
  };

  // Check if we have valid date/time data
  const hasValidDate = isValidDate(currentEvent?.date);
  const hasValidTime = currentEvent?.startTime && currentEvent?.endTime;
  const formattedDate = formatDate(currentEvent?.date);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[420px] bg-panel-bg shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgb(139, 69, 19) rgb(245, 245, 245);
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(245, 245, 245);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(139, 69, 19);
          border-radius: 4px;
          border: 1px solid rgb(245, 245, 245);
        }
      `}</style>
     
      <div className={`w-full py-3 px-4 text-center ${
        eventType === 'past' ? 'bg-espresso-dark' : 'bg-espresso-light'
      }`}>
        <h2 className="text-white font-bold text-lg">
          {eventType === 'past' ? 'Past Events' : 'Upcoming Events'}
        </h2>
      </div>

      {/* Panel Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePrevCity}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={cities.length <= 1}
          >
            <ChevronLeft size={20} className={cities.length <= 1 ? 'text-gray-400' : 'text-gray-600'} />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-lg text-gray-900">{currentCity?.name}</h2>
            <p className="text-sm text-gray-600">{currentCity?.country}</p>
          </div>
          <button
            onClick={handleNextCity}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            disabled={cities.length <= 1}
          >
            <ChevronRight size={20} className={cities.length <= 1 ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200 group"
        >
          <X size={20} className="text-gray-600 group-hover:text-red-500" />
        </button>
      </div>

      {/* Event Content with Custom Scrollbar */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4">
          {currentEvent && (
            <div className="space-y-4">
            

            {/* Event Image */}
            <div className="w-full bg-gray-50 flex items-center justify-center">
  <Image
    key={`${currentCityIndex}-${currentEventIndex}-${currentEvent.image}`}
    src={currentEvent.image}
    alt={currentEvent.title}
    width={279}
    height={279}
    className="object-cover rounded-lg"
    onError={(e) => {
      e.target.src = '/images/placeholder-event.jpg';
    }}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAAxEhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyOiKFhX2XTk" // Small blur placeholder
  />
</div>

            {/* Event Details */}
            <div className="space-y-3">
              <h3 className="font-bold text-xl text-gray-900">{currentEvent.title}</h3>
              
              {/* Date and Time with Calendar Icon - Only show if we have valid date */}
              {(hasValidDate || hasValidTime) && (
                <div className="flex items-center space-x-3">
                  {/* Calendar Icon with Month and Date */}
                  <div className="relative flex-shrink-0 w-12 h-12 bg-gradient-to-br from-espresso-light to-espresso-dark rounded-lg flex flex-col items-center justify-center text-white shadow-sm">
                    <span className="text-xs font-medium leading-none">{getMonthAbbr(currentEvent.date)}</span>
                    <span className="text-lg font-bold leading-none">{getDateNumber(currentEvent.date)}</span>
                  </div>
                  
                  {/* Date and Time Text */}
                  <div className="space-y-1">
                    {hasValidDate && (
                      <p className="text-espresso-light font-medium">{formattedDate}</p>
                    )}
                    {!hasValidDate && hasValidTime && (
                      <p className="text-gray-500 font-medium italic">Date TBD</p>
                    )}
                    {hasValidTime && (
                      <p className="text-espresso-light font-medium">
                        {formatTime(currentEvent.startTime, currentEvent.endTime, currentEvent.timezone)}
                      </p>
                    )}
                    {!hasValidTime && hasValidDate && (
                      <p className="text-gray-500 font-medium italic">Time TBD</p>
                    )}
                  </div>
                </div>
              )}

              {/* Show "Details Coming Soon" if no date/time info */}
              {!hasValidDate && !hasValidTime && (
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <Calendar size={20} className="text-gray-400" />
                  <p className="text-gray-500 font-medium italic">Event details coming soon</p>
                </div>
              )}

              {/* Past Event Notice */}
             {eventType === 'past' && hasValidDate && (
                <div className="pt-3">
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-700 font-medium text-sm">
                      This event ended {(() => {
                        const eventDate = new Date(currentEvent.date);
                        const today = new Date();
                        const diffTime = today - eventDate;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 1 ? '1 day' : `${diffDays} days`;
                      })()} ago.
                    </p>
                  </div>
                </div>
              )}

              {/* Register Now Button */}
              {currentEvent.registrationLink && (
                <div className="pt-3">
                  <button
                    onClick={handleRegisterClick}
                    className="w-full bg-espresso-light hover:bg-espresso-dark text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Register Now
                  </button>
                </div>
              )}
              
              {/* About Event Section */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">About Event</h4>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{currentEvent.description}</div>
              </div>
            </div>

            {/* Event Navigation */}
            {currentCity.events.length > 1 && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <button
                  onClick={handlePrevEvent}
                  disabled={currentEventIndex === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentEventIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:scale-105'
                  }`}
                >
                  Prev Event
                </button>
                <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                  {currentEventIndex + 1} of {currentCity.events.length}
                </span>
                <button
                  onClick={handleNextEvent}
                  disabled={currentEventIndex === currentCity.events.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentEventIndex === currentCity.events.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-espresso-light text-white hover:bg-espresso-dark hover:scale-105 shadow-md hover:shadow-lg'
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
      </div>
  );
};

export default EventPanel;