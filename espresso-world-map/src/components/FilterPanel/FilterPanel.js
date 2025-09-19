const FilterPanel = ({ onFilterClick, activeFilter }) => {
  return (
    <>
      <style jsx>{`
        .mobile-safe-bottom {
          bottom: max(env(safe-area-inset-bottom, 0px) + 1.5rem, 5rem);
        }
        
        @supports not (padding: max(0px)) {
          .mobile-safe-bottom {
            bottom: 5rem;
          }
        }
      `}</style>
      
      <div className="absolute mobile-safe-bottom left-1/2 transform -translate-x-1/2 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 z-40 flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-4">
        
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
    </>
  );
};

export default FilterPanel;