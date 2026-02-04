
import React, { useMemo } from 'react';
import { MenuItem } from '../types';

interface Props {
  items: MenuItem[]; // Receive dynamic items from parent
  onAdd: (item: MenuItem, e: React.MouseEvent) => void;
  onItemClick: (item: MenuItem) => void;
  onSeeAll: (type: 'special' | 'rated') => void;
}

const HorizontalCard: React.FC<{ item: MenuItem; onAdd: (e: React.MouseEvent) => void; onClick: () => void }> = ({ item, onAdd, onClick }) => {
  // Determine display price (use discounted newPrice if available)
  const displayPrice = item.discount?.newPrice || item.price;
  const oldPrice = item.discount?.oldPrice || item.oldPrice;

  return (
    <div 
        onClick={onClick}
        className="flex-shrink-0 snap-center bg-white rounded-[24px] p-3 shadow-sm border border-gray-50 flex items-center gap-4 w-[310px] transition-transform duration-200 group cursor-pointer active:scale-[0.98]"
    >
        {/* Image Section */}
        <div className="relative w-28 h-28 shrink-0">
        <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover rounded-[20px]" 
        />
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 hover:text-red-500 hover:fill-current transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </button>
        {item.discount && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 backdrop-blur-sm text-white text-[9px] font-black text-center py-1 rounded-b-[20px]">
                {item.discount.name}
            </div>
        )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between h-28">
        <div>
            <h4 className="font-bold text-gray-800 text-lg leading-tight truncate mb-1">{item.name}</h4>
            <p className="text-xs text-gray-400 truncate font-medium">{item.description}</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span className="text-xs font-bold text-gray-800">{item.rating}</span>
            </div>
            <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-bold text-gray-500">{item.time || 'Instant'}</span>
            </div>
        </div>

        <div className="mt-1 flex items-center gap-2">
            <button 
                onClick={(e) => {
                e.stopPropagation(); // Stop propagation for quick add
                onAdd(e);
                }}
                className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-black shadow-md shadow-green-200 active:scale-95 transition-transform hover:bg-green-700"
            >
                Rs. {displayPrice}
            </button>
            {oldPrice && (
                <span className="text-xs font-bold text-gray-400 line-through decoration-red-400 decoration-2">
                    Rs. {oldPrice}
                </span>
            )}
        </div>
        </div>
    </div>
  );
};

const SpecialOfferSection: React.FC<Props> = ({ items, onAdd, onItemClick, onSeeAll }) => {
  // Filter for Special Offers (Items with a discount object or oldPrice set)
  const specialOffers = useMemo(() => {
      return items.filter(i => (i.discount && i.discount.newPrice < (i.discount.oldPrice || i.price)) || (i.oldPrice && i.oldPrice > i.price));
  }, [items]);

  // Filter for Best Rated (Rating >= 4.8)
  const bestRated = useMemo(() => {
      return items.filter(i => i.rating >= 4.8).sort((a,b) => b.rating - a.rating);
  }, [items]);

  // If no items match either, return null
  if (specialOffers.length === 0 && bestRated.length === 0) return null;

  return (
    <div className="space-y-6 pt-2">
      {/* Section 1: Special Offers */}
      {specialOffers.length > 0 && (
          <div>
            <div className="flex justify-between items-center px-2 mb-3">
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Special Offer 🔥</h3>
            <button onClick={() => onSeeAll('special')} className="text-xs font-bold text-green-600 cursor-pointer hover:underline">See all</button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4 -mx-4 snap-x scroll-pl-4">
            {specialOffers.map(item => (
                <HorizontalCard 
                key={item.id} 
                item={item} 
                onAdd={(e) => onAdd(item, e)} 
                onClick={() => onItemClick(item)}
                />
            ))}
            </div>
          </div>
      )}

      {/* Section 2: Best Rated */}
      {bestRated.length > 0 && (
          <div>
            <div className="flex justify-between items-center px-2 mb-3">
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Best Rated ⭐</h3>
            <button onClick={() => onSeeAll('rated')} className="text-xs font-bold text-green-600 cursor-pointer hover:underline">See all</button>
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-4 px-4 pb-4 -mx-4 snap-x scroll-pl-4">
            {bestRated.slice(0, 5).map(item => (
                <HorizontalCard 
                    key={item.id} 
                    item={item} 
                    onAdd={(e) => onAdd(item, e)} 
                    onClick={() => onItemClick(item)}
                />
            ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default SpecialOfferSection;
