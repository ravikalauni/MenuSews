
import React, { useState, useEffect } from 'react';
import { OrderHistoryItem, OrderStatus } from '../../types';

interface Props {
  order: OrderHistoryItem;
  onClick: () => void;
  onUpdateStatus?: (id: string, status: OrderStatus) => void;
  onItemCancel?: (orderId: string, itemIndex: number) => void;
  onItemToggle?: (orderId: string, itemIndex: number) => void;
  onArchive?: (orderId: string) => void; // New prop for manual archive
}

const Timer = ({ startTime, isDarkBg }: { startTime: number, isDarkBg: boolean }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 60000)); // Minutes
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Alert colors based on wait time
  let colorClass = isDarkBg ? "text-white" : "text-gray-600";
  
  if (elapsed > 15) colorClass = isDarkBg ? "text-yellow-300 font-black animate-pulse" : "text-orange-500 font-black animate-pulse";
  else if (elapsed > 30) colorClass = isDarkBg ? "text-red-200 font-black animate-pulse" : "text-red-600 font-black animate-pulse";

  return (
    <span className={`text-xs font-mono font-bold ${colorClass}`}>{elapsed}m ago</span>
  );
};

const TicketCard: React.FC<Props> = ({ order, onClick, onUpdateStatus, onItemCancel, onItemToggle, onArchive }) => {
  const [notified, setNotified] = useState(false);

  // Visual Config based on Status
  let headerColor = "bg-gray-100 border-gray-200";
  let textColor = "text-gray-600";
  let isDarkBg = false;
  
  switch (order.status) {
    case 'pending':
      headerColor = "bg-green-600 border-green-600";
      textColor = "text-white";
      isDarkBg = true;
      break;
    case 'queue':
      headerColor = "bg-amber-500 border-amber-500";
      textColor = "text-white";
      isDarkBg = true;
      break;
    case 'cooking':
      headerColor = "bg-orange-600 border-orange-600";
      textColor = "text-white";
      isDarkBg = true;
      break;
    case 'ready':
      headerColor = "bg-emerald-600 border-emerald-600";
      textColor = "text-white";
      isDarkBg = true;
      break;
    case 'served':
      headerColor = "bg-purple-600 border-purple-600";
      textColor = "text-white";
      isDarkBg = true;
      break;
    case 'cancelled':
      headerColor = "bg-red-600 border-red-600";
      textColor = "text-white";
      isDarkBg = true;
      break;
  }

  const handleAction = (e: React.MouseEvent, status: OrderStatus) => {
      e.stopPropagation();
      if (onUpdateStatus) onUpdateStatus(order.id, status);
  };

  const handleNotify = (e: React.MouseEvent) => {
      e.stopPropagation();
      setNotified(true);
      setTimeout(() => setNotified(false), 3000);
  };

  const handleArchive = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onArchive) onArchive(order.id);
  };

  // Progress Calculation
  const validItems = order.items.filter(i => i.status !== 'cancelled');
  const totalItems = validItems.length;
  const readyItems = validItems.filter(i => ['ready', 'served', 'completed'].includes(i.status)).length;
  const progress = totalItems > 0 ? (readyItems / totalItems) * 100 : 0;

  return (
    <div 
      onClick={onClick}
      className="flex flex-col w-full bg-white rounded-[24px] shadow-md border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
    >
      
      {/* HEADER */}
      <div className={`p-3 px-4 flex justify-between items-center ${headerColor} relative z-10`}>
         <div className="flex flex-col">
             <h2 className={`text-2xl font-black leading-none tracking-tight ${textColor}`}>
                 T{order.tableNumber}
             </h2>
             <span className={`text-[10px] font-bold uppercase tracking-widest opacity-90 ${textColor}`}>
                 {order.id.slice(-4)} • {order.status}
             </span>
         </div>
         <div className={`px-3 py-1 rounded-lg ${isDarkBg ? 'bg-white/20 backdrop-blur-md' : 'bg-gray-200'}`}>
             <span className={`text-xs font-bold`}>
                <Timer startTime={order.items[0]?.startTime || Date.now()} isDarkBg={isDarkBg} />
             </span>
         </div>
      </div>

      {/* PROGRESS BAR */}
      {order.status !== 'cancelled' && totalItems > 0 && (
        <div className="h-1.5 w-full bg-gray-100 relative">
            <div 
                className={`h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-green-500'}`} 
                style={{ width: `${progress}%` }} 
            />
        </div>
      )}

      {/* BODY: Items List */}
      <div className="flex-1 p-3 space-y-3 bg-white">
         {order.items.slice(0, 5).map((item, idx) => {
             const cust = item.customization;
             const isVeg = cust ? cust.isVeg : true;
             const isDone = item.status === 'ready' || item.status === 'completed' || item.status === 'served';
             const isCancelled = item.status === 'cancelled';
             const canReject = onItemCancel && ['pending', 'queue', 'cooking'].includes(order.status) && !isCancelled && !isDone;
             const canToggle = onItemToggle && ['pending', 'queue', 'cooking', 'ready'].includes(order.status) && !isCancelled;

             return (
                 <div key={idx} className={`flex items-start gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0 ${isCancelled ? 'opacity-50' : ''}`}>
                     {/* Quantity Box */}
                     <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 shadow-sm border
                        ${isVeg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                     `}>
                         {item.quantity}
                     </div>

                     <div className="flex flex-col min-w-0 flex-1">
                         <span className={`text-sm font-bold leading-tight ${isDone ? 'text-gray-400 line-through' : (isCancelled ? 'text-red-400 line-through' : 'text-gray-800')}`}>
                            {item.name}
                         </span>
                         
                         {/* Full Customization Details */}
                         {cust && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {/* Portion */}
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    {cust.portion}
                                </span>
                                
                                {/* Spice */}
                                {cust.spiceLevel > 0 && (
                                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                        Spice: {cust.spiceLevel}%
                                    </span>
                                )}
                                
                                {/* Exclusions - Highlighted */}
                                {cust.excludedIngredients.map((ing, i) => (
                                    <span key={i} className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                                        NO {ing}
                                    </span>
                                ))}
                            </div>
                         )}
                         {isCancelled && <span className="text-[10px] font-black text-red-500 mt-1 uppercase">Item Cancelled</span>}
                     </div>

                     {/* Actions Wrapper: Reject and Toggle Buttons */}
                     <div className="flex items-center gap-2 shrink-0">
                         {/* Reject Button */}
                         {canReject && (
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(onItemCancel) onItemCancel(order.id, idx);
                                }}
                                className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors border border-red-100"
                                title="Reject Item"
                             >
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                             </button>
                         )}

                         {/* Toggle/Status Button */}
                         {canToggle && !isCancelled && (
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(onItemToggle) onItemToggle(order.id, idx);
                                }}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isDone 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'bg-white border-gray-200 text-gray-300 hover:border-gray-300'
                                }`}
                             >
                                 {isDone && (
                                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                     </svg>
                                 )}
                             </button>
                         )}
                     </div>
                 </div>
             );
         })}
         {order.items.length > 5 && (
             <div className="text-center py-2 bg-gray-50 rounded-lg">
                 <span className="text-xs font-bold text-gray-500">+{order.items.length - 5} more items...</span>
             </div>
         )}
      </div>

      {/* FOOTER: Actions */}
      {order.status === 'pending' && (
          <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-1 gap-2">
              <button 
                onClick={(e) => handleAction(e, 'cooking')}
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-black text-sm shadow-md active:scale-95 transition-all"
              >
                Accept Order
              </button>
              <div className="flex gap-2">
                  <button 
                    onClick={(e) => handleAction(e, 'queue')}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-bold text-xs shadow-sm active:scale-95 transition-all"
                  >
                    Queue
                  </button>
                  <button 
                    onClick={(e) => handleAction(e, 'cancelled')}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 rounded-xl py-3 font-bold text-xs shadow-sm active:scale-95 transition-all"
                  >
                    Reject
                  </button>
              </div>
          </div>
      )}

      {order.status === 'queue' && (
          <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={(e) => handleAction(e, 'cooking')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl py-3 font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🔥</span> Start Cooking
              </button>
          </div>
      )}

      {order.status === 'cooking' && (
          <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={(e) => handleAction(e, 'ready')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>🔔</span> Mark Ready
              </button>
          </div>
      )}

      {order.status === 'ready' && (
          <div className="p-3 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-2">
              <button 
                onClick={handleNotify}
                className={`
                    w-full rounded-xl py-3 font-bold text-xs shadow-sm active:scale-95 transition-all border
                    ${notified ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}
                `}
              >
                {notified ? 'Notified!' : 'Notify Waiter'}
              </button>
              <button 
                onClick={(e) => handleAction(e, 'completed')}
                className="w-full bg-gray-800 hover:bg-black text-white rounded-xl py-3 font-black text-xs shadow-md active:scale-95 transition-all"
              >
                Clear Ticket
              </button>
          </div>
      )}

      {/* Recover / Archive Buttons for Cancelled State */}
      {order.status === 'cancelled' && (
          <div className="p-3 bg-red-50 border-t border-red-100 grid grid-cols-2 gap-2">
              <button 
                onClick={(e) => handleAction(e, 'pending')}
                className="w-full bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-50 rounded-xl py-3 font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>↩️</span> Recover
              </button>
              <button 
                onClick={handleArchive}
                className="w-full bg-red-600 text-white hover:bg-red-700 rounded-xl py-3 font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>📦</span> Archive
              </button>
          </div>
      )}
    </div>
  );
};

export default TicketCard;
