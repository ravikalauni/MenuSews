
import React from 'react';
import { User } from '../../types';

interface Props {
  user: User;
  onClose: () => void;
  onToggleStatus: (mobile: string) => void;
  onDelete: (mobile: string) => void;
  onViewHistory: () => void; // Added prop
}

export default function AdminCustomerDetailModal({ user, onClose, onToggleStatus, onDelete, onViewHistory }: Props) {
  const isActive = user.isActive !== false; // Default to true if undefined

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-sm rounded-[30px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors text-gray-500 z-20 cursor-pointer active:scale-95"
        >
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Profile Header Section */}
        <div className="pt-8 pb-4 px-6 flex flex-col items-center">
             
             {/* Avatar */}
             <div className="w-24 h-24 rounded-full border-4 border-[#1ca553] p-1 mb-3 shadow-lg bg-white">
                <div className="w-full h-full rounded-full bg-[#1ca553] flex items-center justify-center text-white text-3xl font-light">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
             </div>

             <h2 className="text-xl font-black text-[#1ca553] text-center leading-tight">{user.name}</h2>
             <p className="text-sm font-bold text-gray-400 mt-0.5">{user.mobile}</p>
             <div className="bg-green-50 px-3 py-1 rounded-md mt-2">
                <p className="text-[10px] font-bold text-[#1ca553]">
                    Joined: {user.joinedDate || '1/20/2026'}
                </p>
             </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 px-6 mb-6">
            <div className="bg-[#f0fdf4] py-3 px-2 rounded-2xl border border-green-100 flex flex-col items-center shadow-sm">
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Points</span>
                 <span className="text-2xl font-black text-[#1ca553]">{user.points}</span>
            </div>
            <div className="bg-white py-3 px-2 rounded-2xl border border-gray-100 flex flex-col items-center shadow-sm">
                 <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Used Points</span>
                 <span className="text-2xl font-black text-gray-800">{user.usedPoints || 0}</span>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-8 space-y-3">
             
             {/* View History Button - PRIMARY ACTION */}
             <button 
                onClick={onViewHistory}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-blue-700"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                View Order History
             </button>

             {/* Deactivate User Button */}
             <button 
                onClick={() => onToggleStatus(user.mobile)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm border shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2
                  ${isActive 
                    ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' 
                    : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'}
                `}
             >
                {isActive ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      Deactivate User
                    </>
                ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Activate User
                    </>
                )}
             </button>

             {/* Remove Member Button */}
             <button 
                onClick={() => onDelete(user.mobile)}
                className="w-full py-3.5 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Remove Member
             </button>
        </div>
      </div>
    </div>
  );
}
