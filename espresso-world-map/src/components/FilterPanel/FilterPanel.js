const FilterPanel = ({ onFilterClick, activeFilter }) => {
  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:translate-x-0 z-40 flex flex-row sm:flex-col space-x-4 sm:space-x-0 sm:space-y-4">
      
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
  );
};

export default FilterPanel;