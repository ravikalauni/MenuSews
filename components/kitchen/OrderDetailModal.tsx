
import React, { useState } from 'react';
import { OrderHistoryItem, OrderStatus } from '../../types';

interface Props {
  order: OrderHistoryItem;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onItemToggle: (orderId: string, itemIndex: number) => void;
  onItemCancel: (orderId: string, itemIndex: number) => void;
  onItemRecover?: (orderId: string, itemIndex: number) => void; // New prop
}

export default function OrderDetailModal({ order, onClose, onUpdateStatus, onItemToggle, onItemCancel, onItemRecover }: Props) {
  // Calculate progress
  const totalItems = order.items.length;
  const readyItems = order.items.filter(i => i.status === 'ready').length;
  const isFullyReady = totalItems > 0 && totalItems === readyItems;
  
  const [notifyCount, setNotifyCount] = useState(0);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleNotify = () => {
      setNotifyCount(prev => prev + 1);
  };

  const canToggleItems = ['cooking', 'queue', 'ready'].includes(order.status);
  
  // Dynamic Header Color
  let headerColor = "bg-gray-800";
  if (order.status === 'pending') headerColor = "bg-green-600";
  if (order.status === 'queue') headerColor = "bg-amber-500";
  if (order.status === 'cooking') headerColor = "bg-orange-600";
  if (order.status === 'ready') headerColor = "bg-emerald-600";
  if (order.status === 'served') headerColor = "bg-purple-600";
  if (order.status === 'cancelled') headerColor = "bg-red-600";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#f8fafc] w-full md:max-w-4xl h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 md:zoom-in-95 relative">
        
        {/* Header */}
        <div className={`px-6 py-5 md:py-6 text-white shrink-0 flex justify-between items-center ${headerColor}`}>
            <div>
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight">Table {order.tableNumber}</h2>
                    <span className="bg-black/20 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-xs md:text-sm font-bold uppercase tracking-widest">{order.status}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 opacity-90">
                    <span className="font-mono text-xs md:text-sm">#{order.id}</span>
                    <span>•</span>
                    <span className="text-xs md:text-sm font-medium">{order.date}</span>
                </div>
            </div>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 md:space-y-4">
            
            {/* Items List */}
            {order.items.map((item, idx) => {
                const cust = item.customization;
                const isVeg = cust ? cust.isVeg : true;
                const isDone = item.status === 'ready' || item.status === 'completed' || item.status === 'served';
                const isCancelled = item.status === 'cancelled';
                
                // Logic to show reject button: only if item is not cancelled, not done, and order status allows it (pending/queue/cooking)
                const canReject = ['pending', 'queue', 'cooking'].includes(order.status) && !isCancelled && !isDone;

                return (
                    <div 
                        key={idx}
                        onClick={() => (!isCancelled && canToggleItems) ? onItemToggle(order.id, idx) : null}
                        className={`
                            relative bg-white border-2 rounded-2xl p-3 md:p-4 flex flex-col gap-3 md:gap-4 transition-all
                            ${isDone ? 'border-green-200 bg-green-50/50 opacity-70' : (isCancelled ? 'border-red-200 bg-red-50 opacity-60' : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md cursor-pointer')}
                        `}
                    >
                        <div className="flex items-start justify-between w-full gap-3">
                            {/* Left Group: Image/Qty & Details */}
                            <div className="flex items-start gap-3 md:gap-4 flex-1">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl font-black border-2 shrink-0 ${isVeg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                    {item.quantity}
                                </div>
                                <div>
                                    <h4 className={`text-base md:text-xl font-black leading-tight ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                        {item.name}
                                    </h4>
                                    <p className={`text-[10px] md:text-xs font-bold uppercase mt-1 ${isVeg ? 'text-green-600' : 'text-red-600'}`}>
                                        {isVeg ? 'Veg' : 'Non-Veg'}
                                    </p>
                                </div>
                            </div>

                            {/* Right Group: Actions - Pushed to right using flex layout */}
                            <div className="flex items-center gap-2 shrink-0">
                                
                                {isCancelled ? (
                                    // Undo Action for Cancelled Items
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] md:text-xs font-black text-red-500 bg-red-100 px-2 py-1 rounded">CANCELLED</span>
                                        {onItemRecover && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onItemRecover(order.id, idx);
                                                }}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 border border-yellow-200 flex items-center justify-center transition-colors shadow-sm active:scale-95"
                                                title="Undo Cancel"
                                            >
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Reject Button */}
                                        {canReject && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onItemCancel(order.id, idx);
                                                }}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-90"
                                                title="Reject Item"
                                            >
                                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}

                                        {/* Status Toggle Circle */}
                                        <div className={`
                                            w-8 h-8 md:w-12 md:h-12 rounded-full border-[3px] flex items-center justify-center transition-all 
                                            ${isDone ? 'bg-green-500 border-green-500 scale-110 shadow-lg shadow-green-200' : 'border-gray-200 bg-white'}
                                        `}>
                                            {isDone && (
                                                <svg className="w-4 h-4 md:w-7 md:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Customizations Row */}
                        {cust && (
                            <div className="bg-gray-50 rounded-xl p-2 md:p-3 border border-gray-100 flex flex-col justify-center gap-2 mt-1">
                                <div className="flex flex-wrap gap-2">
                                    {/* Portion */}
                                    <div className="bg-white border border-blue-200 text-blue-700 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-black shadow-sm">
                                        Size: {cust.portion}
                                    </div>
                                    
                                    {/* Spice */}
                                    <div className="bg-white border border-orange-200 text-orange-700 px-2 py-0.5 md:px-3 md:py-1 rounded-lg text-[10px] md:text-xs font-black shadow-sm flex items-center gap-1">
                                        <span>🌶️</span> {cust.spiceLevel}%
                                    </div>
                                </div>

                                {/* Exclusions */}
                                {cust.excludedIngredients.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-wide">Strictly No:</span>
                                        {cust.excludedIngredients.map(ing => (
                                            <span key={ing} className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[10px] md:text-xs font-black decoration-2">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 md:p-6 border-t border-gray-100 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex gap-2 md:gap-4">
                {order.status === 'pending' && (
                    <>
                        <button onClick={() => onUpdateStatus(order.id, 'cooking')} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-black text-xs md:text-lg shadow-lg shadow-green-200 active:scale-95 transition-all">Start Cook</button>
                        <button onClick={() => onUpdateStatus(order.id, 'queue')} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl font-black text-xs md:text-lg shadow-lg shadow-amber-200 active:scale-95 transition-all">Queue</button>
                        <button onClick={() => onUpdateStatus(order.id, 'cancelled')} className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-3.5 rounded-xl font-black text-xs md:text-lg active:scale-95 transition-all">Reject Order</button>
                    </>
                )}
                
                {order.status === 'queue' && (
                    <button onClick={() => onUpdateStatus(order.id, 'cooking')} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-lg shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span>🔥</span> Start Cooking
                    </button>
                )}

                {order.status === 'cooking' && (
                    <button onClick={() => onUpdateStatus(order.id, 'ready')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span>🔔</span> Mark All Ready
                    </button>
                )}

                {order.status === 'ready' && (
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={handleNotify}
                            className={`flex-1 border-2 py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-sm active:scale-95 transition-all
                                ${notifyCount > 0 
                                    ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                    : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}
                            `}
                        >
                            {notifyCount > 0 ? `Notified (${notifyCount})` : 'Notify Waiter'}
                        </button>
                        <button 
                            onClick={() => onUpdateStatus(order.id, 'completed')} 
                            className="flex-[2] bg-gray-800 hover:bg-black text-white py-4 rounded-xl md:rounded-2xl font-black text-sm md:text-xl shadow-lg active:scale-95 transition-all"
                        >
                            Complete & Clear
                        </button>
                    </div>
                )}
                
                {(order.status === 'completed' || order.status === 'cancelled') && (
                    <div className="w-full text-center py-2">
                        <span className="text-gray-400 font-bold uppercase tracking-widest">Order Archived</span>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
