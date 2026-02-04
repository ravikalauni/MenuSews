
import React, { useState } from 'react';
import { TableGroup } from '../../types';

interface Props {
  tableNumber: string;
  totalCapacity: number;
  occupiedSeats: number;
  existingGroups: TableGroup[];
  onConfirmNewGroup: (guests: number) => void;
  onJoinGroup: (groupId: string) => void;
}

export default function SeatSelectionView({ 
  tableNumber, 
  totalCapacity, 
  occupiedSeats, 
  existingGroups, 
  onConfirmNewGroup, 
  onJoinGroup 
}: Props) {
  // If no existing groups, go straight to creating new group screen
  const [viewState, setViewState] = useState<'lobby' | 'new_group'>(existingGroups.length === 0 ? 'new_group' : 'lobby');
  const [guests, setGuests] = useState(1);
  
  const availableSeats = Math.max(0, totalCapacity - occupiedSeats);
  const isFullyOccupied = availableSeats === 0;

  // Handle back navigation if we started in new_group but there are actually groups (edge case or back button)
  const handleBack = () => {
      if (existingGroups.length === 0) {
          // If no groups, we can't go back to lobby, maybe do nothing or show toast
          return; 
      }
      setViewState('lobby');
  };

  const handleStartOrder = () => {
      onConfirmNewGroup(guests);
  };

  // --- VIEW: SELECT GUESTS (New Group) ---
  if (viewState === 'new_group') {
      return (
        <div className="flex flex-col h-full bg-[#f0fdf4] relative">
           {/* Background Decoration */}
           <div className="absolute top-0 left-0 w-full h-[60%] bg-green-600 rounded-b-[50px] z-0" />

           <div className="flex-1 z-10 flex flex-col items-center justify-center p-6 pb-20">
               
               <div className="bg-white rounded-[40px] shadow-2xl p-8 w-full max-w-sm text-center relative overflow-hidden animate-in zoom-in-95 duration-500">
                   
                   {/* Only show back button if there are existing groups to go back to */}
                   {existingGroups.length > 0 && (
                       <button onClick={handleBack} className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600">
                           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                       </button>
                   )}

                   <div className="w-20 h-20 bg-green-50 rounded-full mx-auto mt-2 mb-6 flex items-center justify-center text-3xl shadow-inner border-4 border-green-100">
                       🍽️
                   </div>

                   <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">
                       {existingGroups.length > 0 ? 'Separate Bill' : 'Welcome'}
                   </h2>
                   <p className="text-gray-400 font-bold text-xs mb-8">
                       {existingGroups.length > 0 ? 'Starting a new order for your group' : `Table ${tableNumber} • Start your order`}
                   </p>

                   {/* Seat Counter */}
                   <div className="space-y-4 mb-8">
                       <p className="text-xs font-black text-gray-400 uppercase tracking-wide">How many guests?</p>
                       <div className="flex items-center justify-center gap-6">
                           <button 
                             onClick={() => setGuests(Math.max(1, guests - 1))}
                             className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
                           >
                               -
                           </button>
                           <span className="text-5xl font-black text-green-600 w-16 tracking-tighter">{guests}</span>
                           <button 
                             onClick={() => setGuests(Math.min(availableSeats || 10, guests + 1))} // Fallback 10 if calculation fails
                             className="w-14 h-14 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-2xl flex items-center justify-center transition-all active:scale-95 shadow-sm"
                           >
                               +
                           </button>
                       </div>
                       <p className="text-[10px] font-bold text-gray-400 bg-gray-50 py-1 px-3 rounded-full inline-block">
                           {availableSeats} seats remaining
                       </p>
                   </div>

                   <button 
                     onClick={handleStartOrder}
                     className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-200 active:scale-95 transition-all hover:bg-green-700 flex items-center justify-center gap-2"
                   >
                     <span>Start Menu</span>
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                   </button>

               </div>
           </div>
        </div>
      );
  }

  // --- VIEW 1: LOBBY (Occupied Table Selection) ---
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
       {/* Top Design */}
       <div className="bg-gray-900 h-[40%] rounded-b-[50px] relative shrink-0">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
           <div className="flex flex-col items-center justify-center h-full text-white pb-10 px-6 text-center">
               <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner border border-white/20">
                   👥
               </div>
               <h1 className="text-2xl font-black tracking-tight">Table {tableNumber} is Busy</h1>
               <p className="text-gray-400 font-bold text-sm mt-2 opacity-90 max-w-xs">
                   There are people already seated here. Are you joining them?
               </p>
           </div>
       </div>

       <div className="flex-1 -mt-16 px-6 pb-8 overflow-y-auto no-scrollbar z-10">
           <div className="flex flex-col gap-4">
               
               {/* OPTION 1: JOIN EXISTING */}
               <div className="bg-white rounded-[30px] shadow-xl p-6 border border-blue-50">
                   <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                       </div>
                       <div>
                           <h3 className="font-black text-gray-800 text-base">Join Friends</h3>
                           <p className="text-[10px] font-bold text-gray-400">Add to existing bill</p>
                       </div>
                   </div>

                   <div className="space-y-3">
                       {existingGroups.map((grp) => (
                           <button
                             key={grp.id}
                             onClick={() => onJoinGroup(grp.id)}
                             className="w-full bg-[#f0f9ff] hover:bg-blue-50 border border-blue-100 p-3 rounded-2xl flex justify-between items-center transition-all active:scale-95 group"
                           >
                               <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                                       {grp.hostName ? grp.hostName.charAt(0) : 'G'}
                                   </div>
                                   <div className="text-left">
                                       <h4 className="font-black text-gray-800 text-sm">{grp.name || `Group ${grp.id.slice(-4)}`}</h4>
                                       <p className="text-[10px] text-gray-500 font-bold">{grp.guests} Guests • {grp.startTime}</p>
                                   </div>
                               </div>
                               <div className="w-8 h-8 rounded-full bg-white text-blue-500 flex items-center justify-center shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                               </div>
                           </button>
                       ))}
                   </div>
               </div>

               {/* OPTION 2: NEW GROUP */}
               <div className="bg-white rounded-[30px] shadow-xl p-6 border border-green-50 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full -mr-4 -mt-4 z-0" />
                   
                   <div className="flex items-center gap-3 mb-4 relative z-10">
                       <div className="p-2 bg-green-100 rounded-full text-green-600">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       </div>
                       <div>
                           <h3 className="font-black text-gray-800 text-base">Separate Bill</h3>
                           <p className="text-[10px] font-bold text-gray-400">Sharing table? Start new.</p>
                       </div>
                   </div>

                   <button
                     onClick={() => setViewState('new_group')}
                     disabled={isFullyOccupied}
                     className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all relative z-10
                        ${isFullyOccupied 
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                            : 'border-green-300 bg-[#f0fdf4] text-green-700 hover:bg-green-50 active:scale-95'}
                     `}
                   >
                       {isFullyOccupied ? (
                           <span className="font-black text-xs">No Seats Available</span>
                       ) : (
                           <>
                               <span className="font-black text-sm">Start New Order</span>
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                           </>
                       )}
                   </button>
               </div>

           </div>
           
           <p className="text-center text-[10px] text-gray-400 font-bold mt-8 uppercase tracking-widest">
               NepNola • Table Sharing
           </p>
       </div>
    </div>
  );
}
