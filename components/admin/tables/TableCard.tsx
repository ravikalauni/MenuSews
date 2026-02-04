
import React from 'react';
import { TableSession } from '../../../types';

interface Props {
  table: TableSession;
  onClick: () => void;
}

const TableCard: React.FC<Props> = ({ table, onClick }) => {
  // Check if occupied by looking at overall status or groups
  const isOccupied = table.status === 'occupied';
  
  // Consolidate Groups Logic
  const groups = table.groups && table.groups.length > 0 ? table.groups : (isOccupied ? [{ id: 'def', name: 'Main', guests: table.guests || 0, totalAmount: table.totalAmount || 0 }] : []);
  const groupsCount = groups.length;
  const isMultiGroup = groupsCount > 1;

  // Render Single Group View (Original Style)
  const renderSingleView = () => (
    <div className={`relative p-3 md:p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-full min-h-[180px] overflow-hidden
        ${isOccupied 
          ? 'bg-white border-red-100 hover:border-red-300 shadow-sm shadow-red-100/50' 
          : 'bg-white border-green-100 hover:border-green-300 shadow-sm shadow-green-100/50'
        }
    `}>
       {/* Top Row: Number & Status Indicator */}
       <div className="flex justify-between items-start mb-2 relative z-10">
          <div className="flex flex-col">
             <div className="flex items-center gap-1 mb-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isOccupied ? 'text-red-400' : 'text-green-400'}`}>
                    {table.location || 'Hall'}
                </span>
                {table.isSpecial && <span className="text-[8px] bg-orange-100 text-orange-600 px-1 rounded font-bold">⭐</span>}
             </div>
             <span className={`text-3xl font-black leading-none ${isOccupied ? 'text-gray-800' : 'text-gray-700'}`}>
                {table.tableNumber.replace('T', '')}
             </span>
          </div>
          
          <div className={`
             px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide shadow-sm flex items-center gap-1.5
             ${isOccupied ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}
          `}>
             <span className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
             <span className="hidden md:inline">{table.status}</span>
             <span className="md:hidden">{isOccupied ? 'Busy' : 'Free'}</span>
          </div>
       </div>
       
       {/* Middle: Guests Info */}
       <div className="flex flex-col gap-2 mb-3 mt-auto relative z-10">
          <div className="flex items-center gap-2">
              <div className={`
                 w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm transition-colors shrink-0
                 ${isOccupied ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}
              `}>
                 👥
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] text-gray-400 font-bold uppercase">Guests</span>
                 <div className="flex items-baseline gap-0.5">
                    <span className={`text-base font-black ${isOccupied ? 'text-gray-800' : 'text-gray-600'}`}>
                       {table.guests}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">/ {table.capacity}</span>
                 </div>
              </div>
          </div>
       </div>

       {/* Footer: Timer or Action */}
       <div className={`
          rounded-xl p-2 flex justify-between items-center transition-colors relative z-10
          ${isOccupied ? 'bg-red-50' : 'bg-gray-50'}
       `}>
          {isOccupied ? (
             <div className="w-full flex items-center justify-between gap-1">
               <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-bold text-red-400 uppercase truncate">Bill</span>
                  <span className="text-xs font-black text-red-700 truncate">Rs.{table.totalAmount}</span>
               </div>
               {table.startTime && (
                  <div className="bg-white px-1.5 py-0.5 rounded-md shadow-sm text-[9px] font-bold text-red-500 flex items-center gap-1 whitespace-nowrap">
                     <span>⏰</span>
                     <span>{table.startTime.split(' ').map(s => s.replace('h','h').replace('m','m')).join(' ')}</span>
                  </div>
               )}
             </div>
          ) : (
             <div className="w-full flex justify-between items-center text-green-600">
                <span className="text-[10px] font-bold">Ready to seat</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
             </div>
          )}
       </div>
    </div>
  );

  // Render Split View for Multi-Group
  const renderMultiView = () => (
    <div className="relative rounded-[24px] border-2 border-orange-200 bg-white cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full min-h-[180px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 pb-2 border-b border-gray-100">
            <span className="text-xl font-black text-gray-800">{table.tableNumber.replace('T', '')}</span>
            <div className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide">
                Shared • {groupsCount} Grps
            </div>
        </div>

        {/* Groups List */}
        <div className="flex-1 flex flex-col">
            {groups.map((grp: any, index: number) => {
                const colors = index % 2 === 0 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-orange-50 text-orange-700 border-orange-100';
                
                return (
                    <div key={grp.id || index} className={`flex-1 p-2 border-b last:border-0 border-gray-100 flex items-center justify-between ${index % 2 === 0 ? 'bg-blue-50/30' : 'bg-orange-50/30'}`}>
                        <div className="flex flex-col min-w-0 pr-2">
                            <span className="text-xs font-black text-gray-800 truncate">{grp.name || `Group ${index + 1}`}</span>
                            <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold">
                                <span>👥 {grp.guests}</span>
                                <span>⏰ {grp.startTime || 'Now'}</span>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-xs font-black ${colors}`}>
                            Rs.{grp.totalAmount || 0}
                        </div>
                    </div>
                );
            })}
        </div>
        
        <div className="p-2 bg-gray-50 text-center text-[9px] text-gray-400 font-bold border-t border-gray-100">
            Tap to manage separated bills
        </div>
    </div>
  );

  return (
    <div onClick={onClick} className="h-full">
        {isMultiGroup ? renderMultiView() : renderSingleView()}
    </div>
  );
};

export default TableCard;
