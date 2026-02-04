
import React from 'react';

interface Props {
  pendingCount: number;
  cookingCount: number;
  avgTime: string;
  onOpenStock: () => void;
}

export default function KitchenStats({ pendingCount, cookingCount, avgTime, onOpenStock }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="flex gap-4 flex-1 w-full sm:w-auto">
            <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex flex-col items-center min-w-[90px]">
               <span className="text-xl font-black text-blue-600 leading-none">{pendingCount}</span>
               <span className="text-[10px] font-bold text-blue-400 uppercase">Pending</span>
            </div>
            <div className="bg-orange-50 border border-orange-100 px-4 py-2 rounded-xl flex flex-col items-center min-w-[90px]">
               <span className="text-xl font-black text-orange-600 leading-none">{cookingCount}</span>
               <span className="text-[10px] font-bold text-orange-400 uppercase">Cooking</span>
            </div>
            <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex flex-col items-center min-w-[90px]">
               <span className="text-xl font-black text-green-600 leading-none">{avgTime}</span>
               <span className="text-[10px] font-bold text-green-400 uppercase">Avg Time</span>
            </div>
        </div>

        <button 
          onClick={onOpenStock}
          className="w-full sm:w-auto bg-white border-2 border-red-50 text-red-500 hover:bg-red-50 hover:border-red-100 px-5 py-3 rounded-xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
        >
           <span className="text-lg">🚫</span>
           <span>86 Item</span>
        </button>
    </div>
  );
}
