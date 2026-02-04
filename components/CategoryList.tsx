
import React from 'react';
import { Category } from '../types';

interface CategoryData {
  id: string;
  name: string;
  type?: string;
  image?: string;
}

interface Props {
  activeCategory: Category | string;
  onSelect: (cat: Category | string) => void;
  categories: CategoryData[]; // Receive categories as prop
}

const CategoryList: React.FC<Props> = ({ activeCategory, onSelect, categories }) => {
  
  // Ensure "All" exists
  const displayCategories = categories.some(c => c.name === 'All') 
    ? categories 
    : [{ id: 'all', name: 'All', image: '' }, ...categories];

  return (
    <div className="relative pt-2">
      {/* Scroll Indicators (Gradient Fades) */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#f1fcf1] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f1fcf1] to-transparent z-10 pointer-events-none" />

      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto no-scrollbar py-4 px-4 gap-3 snap-x scroll-pl-4">
        {displayCategories.map((cat) => {
          const isActive = activeCategory === cat.name || (activeCategory === 'All' && cat.name === 'All');
          
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.name)}
              className="flex flex-col items-center gap-1.5 group min-w-[52px] snap-start transition-all duration-300"
            >
              <div className={`
                w-[52px] h-[52px] rounded-full flex items-center justify-center text-xl transition-all duration-300 relative overflow-hidden
                ${isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-105 ring-2 ring-green-100'
                  : 'bg-white text-gray-400 shadow-sm border border-gray-100 group-hover:border-green-200 group-hover:scale-105 group-hover:shadow-md'
                }
              `}>
                {/* Subtle shine animation for active state */}
                {isActive && (
                   <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                
                {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                    // Default Icon if no image
                    <span className="relative z-10 drop-shadow-sm filter text-lg">
                        {cat.name === 'All' ? '🍽️' : '🥄'}
                    </span>
                )}
              </div>
              
              <span className={`
                text-[9px] font-bold tracking-wide transition-colors duration-300 uppercase truncate w-14 text-center
                ${isActive ? 'text-green-700' : 'text-gray-400 group-hover:text-green-600'}
              `}>
                {cat.name}
              </span>
            </button>
          );
        })}
        
        {/* Spacer to ensure the last item isn't covered by the gradient */}
        <div className="w-2 shrink-0" />
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default CategoryList;
