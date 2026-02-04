
import React, { useState, useEffect } from 'react';
import { OrderHistoryItem, OrderStatus, CartItem } from '../../types';

interface Props {
  order: OrderHistoryItem;
  items: CartItem[]; // Only bar items
  onUpdateItemStatus: (orderId: string, itemIndex: number, newStatus: OrderStatus) => void;
  onBatchUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onClearOrder: (orderId: string) => void;
}

const Timer = ({ startTime, isDark }: { startTime: number, isDark: boolean }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 60000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  let colorClass = isDark ? "text-white" : "text-gray-600";
  // Visual alerts for waiting time
  if (elapsed > 10) colorClass = isDark ? "text-yellow-300 font-black animate-pulse" : "text-orange-500 font-black animate-pulse";
  if (elapsed > 20) colorClass = isDark ? "text-red-300 font-black animate-pulse" : "text-red-600 font-black animate-pulse";
  
  return <span className={`text-xs font-mono font-bold ${colorClass}`}>{elapsed}m</span>;
};

export default function BarTicketCard({ order, items, onUpdateItemStatus, onBatchUpdateStatus, onClearOrder }: Props) {
  
  // Calculate aggregate status
  // Only consider items that are NOT cancelled for "Ready" state logic
  const activeItems = items.filter(i => i.status !== 'cancelled');
  const isAllReady = activeItems.length > 0 && activeItems.every(i => i.status === 'ready' || i.status === 'served');
  
  const hasPending = items.some(i => i.status === 'pending');
  const hasQueued = items.some(i => i.status === 'queue');
  const hasCooking = items.some(i => i.status === 'cooking');
  const hasAnyActive = hasPending || hasQueued || hasCooking;

  // Header Style
  const headerColor = isAllReady ? "bg-emerald-600 border-emerald-600" : "bg-green-600 border-green-600";
  const textColor = "text-white";
  
  // Helper to find original index because 'items' prop is a filtered subset
  const getOriginalIndex = (item: CartItem) => {
      return order.items.findIndex(i => i === item);
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px] shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
       
       {/* Header */}
       <div className={`p-3 px-4 flex justify-between items-center ${headerColor} relative z-10 transition-colors duration-300`}>
          <div>
             <h2 className={`text-2xl font-black leading-none tracking-tight ${textColor}`}>T{order.tableNumber}</h2>
             <p className={`text-[10px] font-bold uppercase tracking-widest opacity-90 ${textColor} mt-1`}>Order #{order.id.slice(-4)}</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
             <Timer startTime={items[0]?.startTime || Date.now()} isDark={true} />
          </div>
       </div>

       {/* Items List */}
       <div className="flex-1 p-2 space-y-2 bg-gray-50 overflow-y-auto max-h-[300px] no-scrollbar">
          {items.map((item, idx) => {
             const isReady = item.status === 'ready';
             const isCancelled = item.status === 'cancelled';
             const originalIndex = getOriginalIndex(item);

             return (
                 <div 
                    key={idx} 
                    className={`
                        flex items-center gap-3 p-3 rounded-xl border shadow-sm transition-all duration-300
                        ${isReady 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : (isCancelled ? 'bg-red-50 border-red-100 opacity-70' : 'bg-white border-gray-200')}
                    `}
                 >
                    {/* Quantity Box */}
                    <div className={`
                        w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-colors
                        ${isReady 
                            ? 'bg-emerald-200 text-emerald-800' 
                            : (isCancelled ? 'bg-red-200 text-red-800' : 'bg-orange-100 text-orange-700')}
                    `}>
                        {item.quantity}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className={`text-sm font-bold leading-tight ${isCancelled ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.name}
                        </span>
                        {item.servingUnit && !isCancelled && <span className="text-[10px] text-gray-400 font-bold">{item.servingUnit}</span>}
                        {isCancelled && <span className="text-[10px] text-red-500 font-black uppercase tracking-wide">Cancelled</span>}
                        {isReady && <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wide">Ready to Serve</span>}
                        {item.status === 'queue' && <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wide">In Queue</span>}
                    </div>

                    {/* Actions Area */}
                    <div className="flex items-center gap-2">
                        
                        {/* PENDING STATE ACTIONS */}
                        {!isReady && !isCancelled && (
                            <>
                                <button 
                                    onClick={() => onUpdateItemStatus(order.id, originalIndex, 'cancelled')}
                                    className="w-9 h-9 rounded-full bg-white border border-gray-200 text-red-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                    title="Reject Item"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <button 
                                    onClick={() => onUpdateItemStatus(order.id, originalIndex, 'ready')}
                                    className="w-9 h-9 rounded-full bg-green-500 text-white border border-green-600 flex items-center justify-center transition-all active:scale-95 shadow-md hover:bg-green-600"
                                    title="Mark Ready"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </button>
                            </>
                        )}

                        {/* READY STATE ACTIONS */}
                        {isReady && (
                            <button 
                                onClick={() => onUpdateItemStatus(order.id, originalIndex, 'pending')}
                                className="px-3 py-1.5 rounded-lg bg-white border border-yellow-200 text-yellow-600 hover:bg-yellow-50 text-[10px] font-black uppercase shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                                title="Undo Ready"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                Undo
                            </button>
                        )}

                        {/* CANCELLED STATE ACTIONS */}
                        {isCancelled && (
                            <button 
                                onClick={() => onUpdateItemStatus(order.id, originalIndex, 'pending')}
                                className="w-9 h-9 rounded-full bg-white border border-yellow-200 text-yellow-600 hover:bg-yellow-50 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                                title="Recover Item"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            </button>
                        )}

                    </div>
                 </div>
             );
          })}
       </div>

       {/* Footer Action */}
       {/* 1. Batch Actions for Active Order */}
       {hasAnyActive && onBatchUpdateStatus && (
           <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
               
               {/* Primary Row */}
               <div className="flex gap-2">
                   {/* QUEUE ALL (Only if there are pending items) */}
                   {hasPending && (
                       <button 
                           onClick={() => onBatchUpdateStatus(order.id, 'queue')}
                           className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                       >
                           <span>⏱️</span> Queue All
                       </button>
                   )}
                   
                   {/* MARK ALL READY (For Pending or Queue) */}
                   <button 
                       onClick={() => onBatchUpdateStatus(order.id, 'ready')}
                       className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-1"
                   >
                       <span>✅</span> Ready All
                   </button>
               </div>

               {/* REJECT ALL (Red button below) */}
               <button 
                   onClick={() => onBatchUpdateStatus(order.id, 'cancelled')}
                   className="w-full py-2.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1"
               >
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   Reject All
               </button>
           </div>
       )}

       {/* 2. Serve / Archive Actions (If All Ready or All Cancelled) */}
       {(isAllReady || (items.length > 0 && items.every(i => i.status === 'cancelled'))) && (
           <div className="p-3 bg-white border-t border-gray-100">
               <button 
                 onClick={(e) => { e.stopPropagation(); onClearOrder(order.id); }}
                 className={`
                    w-full py-3.5 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2
                    ${isAllReady 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                 `}
               >
                 <span>{isAllReady ? 'Serve All & Clear' : 'Archive Ticket'}</span>
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
               </button>
           </div>
       )}
    </div>
  );
}
