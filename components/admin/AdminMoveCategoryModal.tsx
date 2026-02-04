
import React, { useState } from 'react';

interface Props {
  currentCategoryName: string;
  allCategories: any[];
  onMove: (targetCategoryName: string) => void;
  onClose: () => void;
}

export default function AdminMoveCategoryModal({ currentCategoryName, allCategories, onMove, onClose }: Props) {
  const [movingTo, setMovingTo] = useState<string | null>(null);

  const handleMove = (targetName: string) => {
    setMovingTo(targetName);
    // Simulate network delay for better UX feel
    setTimeout(() => {
        onMove(targetName);
    }, 600);
  };

  const availableCategories = allCategories.filter(c => c.name !== currentCategoryName);

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-green-600 w-full md:w-auto md:min-w-[700px] md:max-w-4xl rounded-t-[35px] md:rounded-[35px] shadow-2xl relative z-10 flex flex-col max-h-[85vh] md:max-h-[700px] animate-in slide-in-from-bottom duration-300 md:duration-200 md:zoom-in-95">
         
         {/* Mobile Drag Handle */}
         <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-20" />

         {/* Desktop Close Button */}
         <button 
            onClick={onClose}
            className="hidden md:flex absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full items-center justify-center text-white transition-colors z-20"
         >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>

         {/* Header */}
         <div className="p-8 pb-6 text-white text-center md:text-left md:flex md:items-center md:justify-between md:pr-20">
            <div>
                <h3 className="text-2xl font-black mb-1">Move this item</h3>
                <p className="text-green-100 text-sm font-medium">Select a new category destination</p>
            </div>
         </div>

         {/* List Container */}
         <div className="bg-[#f0fdf4] flex-1 rounded-t-[35px] md:rounded-b-[35px] md:rounded-t-none overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:content-start">
               {availableCategories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="bg-white p-3 md:p-4 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4 group hover:shadow-md transition-all hover:border-green-300 cursor-pointer"
                    onClick={() => handleMove(cat.name)} // Allow clicking whole card on desktop for ease
                  >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0 overflow-hidden relative">
                         <img src={cat.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <h4 className="font-black text-gray-800 leading-tight group-hover:text-green-700 transition-colors">{cat.name}</h4>
                         <p className="text-xs text-green-600 font-bold mt-0.5">{cat.itemCount} items</p>
                      </div>

                      <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleMove(cat.name);
                        }}
                        disabled={movingTo !== null}
                        className={`
                          px-4 py-2 rounded-xl text-xs font-black text-white shadow-md transition-all active:scale-95 shrink-0
                          ${movingTo === cat.name ? 'bg-green-700 w-24' : 'bg-[#ff5722] hover:bg-[#f4511e] w-24'}
                        `}
                      >
                         {movingTo === cat.name ? (
                            <span className="flex items-center justify-center gap-1">
                               <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               Moving
                            </span>
                         ) : 'Move here'}
                      </button>
                  </div>
               ))}
            </div>
            
            {/* Cancel Button - Hidden on Desktop since we have X and Click Outside */}
            <div className="p-4 bg-white border-t border-green-50 text-center md:hidden">
               <button onClick={onClose} className="text-gray-400 font-bold text-sm hover:text-gray-600">Cancel</button>
            </div>
         </div>
      </div>
    </div>
  );
}
