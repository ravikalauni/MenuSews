
import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../types';
import { MENU_ITEMS } from '../../constants';

interface Props {
  onClose: () => void;
}

export default function StockManagerModal({ onClose }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const storedAvailability = localStorage.getItem('nepnola_stock_status');
    const stockMap = storedAvailability ? JSON.parse(storedAvailability) : {};
    
    const mappedItems = MENU_ITEMS.map(item => ({
      ...item,
      isAvailable: stockMap[item.id] !== false 
    }));
    setItems(mappedItems);
  }, []);

  const toggleAvailability = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i);
    setItems(updated);
    
    const stockMap: Record<string, boolean> = {};
    updated.forEach(i => stockMap[i.id] = i.isAvailable !== false);
    localStorage.setItem('nepnola_stock_status', JSON.stringify(stockMap));
    window.dispatchEvent(new Event('storage'));
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="bg-white w-full md:max-w-2xl h-[85vh] md:h-[80vh] rounded-t-[30px] md:rounded-[30px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300 md:animate-in md:zoom-in-95">
        
        {/* Mobile Drag Handle */}
        <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-red-200 rounded-full z-20" />

        <div className="bg-red-50 px-6 pt-8 pb-6 md:py-6 border-b border-red-100 flex justify-between items-center relative">
           <div>
              <h2 className="text-xl font-black text-red-700">86 Menu Item</h2>
              <p className="text-xs text-red-400 font-bold mt-1">Mark items as Out of Stock</p>
           </div>
           <button onClick={onClose} className="w-9 h-9 bg-white rounded-full text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <div className="p-4 border-b border-gray-100 bg-white">
            <div className="relative">
                <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                   type="text" 
                   placeholder="Search menu..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar pb-10">
           {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => toggleAvailability(item.id)}
                className={`flex items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    item.isAvailable 
                    ? 'bg-white border-gray-100 hover:border-gray-200' 
                    : 'bg-red-50 border-red-100'
                }`}
              >
                 <img src={item.image} className={`w-12 h-12 rounded-xl object-cover ${!item.isAvailable && 'grayscale opacity-50'}`} />
                 <div className="flex-1 px-4">
                    <h4 className={`font-black text-sm ${item.isAvailable ? 'text-gray-800' : 'text-red-700 line-through'}`}>{item.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</p>
                 </div>
                 <div className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${item.isAvailable ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
