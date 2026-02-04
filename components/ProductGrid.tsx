
import React from 'react';
import { MenuItem, CartItem } from '../types';

interface Props {
  items: MenuItem[];
  onAdd: (item: MenuItem, e: React.MouseEvent) => void; // Quick Add
  onItemClick: (item: MenuItem) => void; // Open Modal
  cart: CartItem[];
}

const ProductGrid: React.FC<Props> = ({ items, onAdd, onItemClick, cart }) => {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 pb-24">
      {items.map((item) => {
        const cartCount = cart.find(ci => ci.id === item.id)?.quantity || 0;
        
        return (
          <div 
            key={item.id} 
            onClick={() => onItemClick(item)}
            className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 relative flex flex-col transition-all duration-300 hover:shadow-lg group cursor-pointer active:scale-[0.98]"
          >
            
            {/* Heart Icon - Top Right */}
            <button className="absolute top-4 right-4 z-20 w-7 h-7 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>

            {/* Image Section - Rectangular with Border Radius */}
            <div className="w-full aspect-[4/3.5] rounded-xl overflow-hidden mb-3 relative bg-gray-50">
               <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
            </div>
            
            <div className="flex-1 flex flex-col">
              {/* Title & Rating Row */}
              <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-gray-800 text-[15px] leading-tight flex-1 pr-2 truncate">{item.name}</h3>
                 <div className="flex items-center gap-0.5 shrink-0">
                    <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xs font-bold text-gray-800">{item.rating}</span>
                 </div>
              </div>

              {/* Time - Centered with Symbol */}
              <div className="flex justify-center mb-3">
                <div className="inline-flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <span className="text-[10px] font-bold text-gray-500 tracking-wide">
                      {item.time || '20 min'}
                   </span>
                </div>
              </div>
              
              {/* Price & Add Button */}
              <div className="mt-auto flex justify-between items-center">
                 <p className="text-gray-900 font-black text-lg">
                  <span className="text-xs align-top text-green-600 mr-0.5">Rs.</span>{item.price}
                 </p>
                 
                 {/* Add Button */}
                 <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening modal
                        onAdd(item, e);
                      }}
                      className="w-9 h-9 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 active:scale-95 active:bg-green-700 transition-all hover:scale-110"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12m6-6H6" />
                      </svg>
                    </button>
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {cartCount}
                      </span>
                    )}
                 </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
