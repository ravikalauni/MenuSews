
import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="px-2">
      <div className="relative flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md border border-green-100 group focus-within:ring-2 focus-within:ring-green-400 transition-all">
        <input 
          type="text"
          placeholder="खोज्नुहोस्..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-5 py-2.5 text-sm outline-none placeholder:text-gray-400 font-medium text-gray-800"
        />
        <button className="bg-green-600 text-white p-2.5 rounded-full shadow-md active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
