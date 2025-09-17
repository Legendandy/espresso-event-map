import Image from 'next/image';
import Link from 'next/link';

const Header = ({ viewMode, onToggleView }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-6">
      {/* Espresso Logo */}
      <div className="flex items-center">
        <Link 
          href="https://www.espressosys.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:opacity-80 transition-opacity duration-200"
        >
          <Image
            src="/espresso.png"
            alt="Espresso"
            width={150}
            height={60}
            className="w-auto cursor-pointer"
            style={{ height: '60px' }}
          />
        </Link>
      </div>
      
      {/* View Toggle Button */}
      <button
        onClick={onToggleView}
        className="bg-white text-espresso-light px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-all duration-200"
      >
        {viewMode === 'globe' ? 'Flat View' : 'Globe View'}
      </button>
    </header>
  );
};

export default Header;