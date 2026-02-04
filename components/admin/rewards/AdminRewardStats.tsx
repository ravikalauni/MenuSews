
import React from 'react';

interface Props {
  onNavigateToCustomers?: () => void;
}

export default function AdminRewardStats({ onNavigateToCustomers }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
      {/* Total Points */}
      <div className="bg-[#f0fdf4] border border-green-100 rounded-xl md:rounded-2xl p-2.5 md:p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
         <div className="hidden md:block absolute right-0 top-0 w-24 h-24 bg-green-200/20 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
         <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-orange-100 flex items-center justify-center text-[8px] md:text-[10px] shrink-0">✅</div>
            <span className="text-[9px] md:text-xs font-bold text-gray-600 leading-tight">Total Points</span>
         </div>
         <span className="text-lg md:text-3xl font-black text-gray-900 tracking-tight leading-none truncate">12,430</span>
      </div>

      {/* Active Users - Clickable */}
      <div 
        onClick={onNavigateToCustomers}
        className="bg-[#dcfce7] border border-green-200 rounded-xl md:rounded-2xl p-2.5 md:p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
      >
         <div className="hidden md:block absolute right-0 top-0 w-24 h-24 bg-green-300/20 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
         <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px] md:text-[10px] shrink-0">👤</div>
            <span className="text-[9px] md:text-xs font-bold text-gray-700 leading-tight">Active Users</span>
         </div>
         <span className="text-lg md:text-3xl font-black text-gray-900 tracking-tight leading-none truncate">40</span>
         <div className="hidden md:block absolute bottom-4 right-4 bg-white/40 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
         </div>
      </div>

      {/* Reward Redeemed */}
      <div className="bg-[#bbf7d0] border border-green-300 rounded-xl md:rounded-2xl p-2.5 md:p-5 shadow-sm flex flex-col justify-center relative overflow-hidden group">
         <div className="hidden md:block absolute right-0 top-0 w-24 h-24 bg-green-400/20 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-0.5 md:mb-1 gap-1">
            <span className="text-[9px] md:text-xs font-bold text-green-900 leading-tight">Redeemed</span>
         </div>
         <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2">
            <span className="text-lg md:text-3xl font-black text-gray-900 tracking-tight leading-none truncate">128</span>
            <span className="text-[8px] md:text-[10px] font-bold text-green-800 leading-none">This week</span>
         </div>
      </div>
    </div>
  );
}
