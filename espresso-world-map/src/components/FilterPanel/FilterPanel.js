const FilterPanel = ({ onFilterClick, activeFilter }) => {
  return (
    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-40 space-y-4">
      
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