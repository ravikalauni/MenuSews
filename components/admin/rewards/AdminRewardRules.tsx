
import React from 'react';
import { RewardRulesData } from './AdminOffersModal';

interface Props {
  rules: RewardRulesData;
  onEditClick: () => void;
}

export default function AdminRewardRules({ rules, onEditClick }: Props) {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-green-100 h-full flex flex-col relative overflow-hidden">
       {/* Top Decoration */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-[100px] -z-0 pointer-events-none" />
       
       {/* Header */}
       <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
             <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm text-green-700">
                📜
             </div>
             <h3 className="text-xl font-black text-gray-800 leading-none">Reward Rules</h3>
             <p className="text-xs text-gray-400 font-bold mt-1">Conversion & Bonuses</p>
          </div>
          
          <button 
            onClick={onEditClick}
            className="group flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95"
          >
             <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             <span>Edit</span>
          </button>
       </div>

       {/* Rules Content */}
       <div className="space-y-4 flex-1 relative z-10">
          
          {/* Main Rule Card */}
          <div className="bg-[#f0fdf4] border border-green-200 rounded-2xl p-4 flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Earning Rule</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                   <span className="text-lg font-black text-green-800">Rs. {rules.spendAmount}</span>
                   <span className="text-xs font-bold text-gray-400">spend</span>
                </div>
             </div>
             <div className="text-green-400">➜</div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Gets</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                   <span className="text-lg font-black text-green-800">{rules.earnPoints}</span>
                   <span className="text-xs font-bold text-gray-400">pts</span>
                </div>
             </div>
          </div>

          <div className="h-px bg-gray-100 my-2" />

          {/* Bonus List */}
          <div className="space-y-3">
             <p className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">Active Bonuses</p>
             
             {rules.bonuses.map((bonus) => (
                <div key={bonus.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-sm shadow-sm border border-orange-100">
                         🎁
                      </div>
                      <span className="text-sm font-bold text-gray-700">{bonus.name}</span>
                   </div>
                   <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                      <span className="text-sm font-black text-green-600">{bonus.points} Pts</span>
                   </div>
                </div>
             ))}
          </div>

       </div>
    </div>
  );
}
