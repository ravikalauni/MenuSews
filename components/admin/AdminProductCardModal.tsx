
import React from 'react';

interface Props {
  item: any;
  onClose: () => void;
}

export default function AdminProductCardModal({ item, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors z-20 backdrop-blur-md"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Product Image Area */}
        <div className="relative h-64 bg-gray-100">
           <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
           <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Product Content */}
        <div className="px-8 pb-8 pt-2 relative">
           <div className="text-center -mt-12 mb-4">
              <div className="bg-white rounded-2xl shadow-lg p-2 inline-block">
                 <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt="Thumb" />
              </div>
           </div>

           <div className="text-center space-y-1 mb-6">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{item.name}</h2>
              
              <div className="flex items-center justify-center gap-2 mt-2">
                 <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                    <span className="text-xs">⭐</span>
                    <span className="text-sm font-black text-yellow-600">{item.rating || '4.5'}</span>
                 </div>
                 <div className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    Best Rated
                 </div>
              </div>

              <div className="mt-4">
                 <span className="text-3xl font-black text-green-600">Rs. {item.price}/-</span>
              </div>
           </div>

           <div className="w-full bg-green-50 rounded-xl p-3 text-center border border-green-100 mb-2">
              <span className="text-xs font-bold text-green-800">No discount added</span>
           </div>
           
           <p className="text-center text-xs font-bold text-gray-400">Category: <span className="text-gray-600">{item.category}</span></p>
        </div>
      </div>
    </div>
  );
}
