
import React from 'react';
import { OrderHistoryItem } from '../types';

interface Props {
  orders: OrderHistoryItem[];
  onBack: () => void;
  onReorderClick: (order: OrderHistoryItem) => void;
  totalPoints: number;
}

const HistoryView: React.FC<Props> = ({ orders, onBack, onReorderClick, totalPoints }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-600 border-red-200';
      case 'ready': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'cooking': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'ready': return 'Ready for Pickup';
      case 'cooking': return 'Cooking';
      default: return status;
    }
  };

  const getPaymentBadge = (order: OrderHistoryItem) => {
      if (order.status === 'cancelled') return null; // Don't show payment status for cancelled items
      
      if (order.paymentStatus === 'paid') {
          return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border bg-green-500 text-white border-green-600 shadow-sm">PAID</span>;
      }
      if (order.paymentStatus === 'pending_verification') {
          return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border bg-orange-500 text-white border-orange-600 shadow-sm animate-pulse">Verify</span>;
      }
      return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border bg-red-100 text-red-600 border-red-200">Unpaid</span>;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f1fcf1] overflow-hidden relative">
      {/* 1. Curved Green Header - Matches OrderView */}
      <div className="relative bg-green-700 pb-6 pt-2 rounded-b-[40px] shadow-lg z-20 shrink-0">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-5 left-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="pt-5 pb-1 flex justify-center">
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">History</h1>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-6 px-4 pb-32 -mt-4 z-10">
        
        {/* Points Badge & Section Title Row */}
        <div className="flex justify-between items-end mb-6 px-2">
          <h2 className="text-xl font-black text-green-800 border-b-4 border-green-300 pb-1 leading-none">
            Recent Orders
          </h2>
          
          <div className="bg-green-700 text-white px-4 py-2 rounded-xl shadow-md flex flex-col items-center leading-none">
            <span className="text-[9px] uppercase font-bold text-green-200 mb-0.5">Your points</span>
            <span className="font-black text-lg">{totalPoints}<span className="text-xs">.pts</span></span>
          </div>
        </div>

        {/* 3. Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-[30px] p-10 text-center border border-green-100/50 shadow-sm mt-8 opacity-60">
            <div className="text-5xl mb-4 grayscale">🕰️</div>
            <p className="font-black text-green-900">No History</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              // Extract primary item details for display
              // IMPORTANT: Filter out cancelled items for "primary" display unless all are cancelled
              const activeItems = order.items.filter(i => i.status !== 'cancelled');
              const displayItems = activeItems.length > 0 ? activeItems : order.items;
              
              const primaryItem = displayItems[0] || { name: 'Unknown Order', image: '', price: 0, quantity: 0 };
              const totalQty = activeItems.length > 0 ? activeItems.reduce((acc, i) => acc + i.quantity, 0) : 0;
              
              // If ALL items are cancelled, status is 'cancelled', otherwise 'completed' or whatever the order status is
              const isFullyCancelled = order.items.every(i => i.status === 'cancelled');
              const displayStatus = isFullyCancelled ? 'cancelled' : order.status;

              // Calculate display total (exclude cancelled)
              const displayTotal = order.items.reduce((acc, item) => {
                  if (item.status === 'cancelled') return acc;
                  return acc + (item.price * item.quantity);
              }, 0);
              
              return (
                <div key={order.id} className="bg-[#e6ffe6] border border-green-200 rounded-[24px] p-3 flex items-center shadow-sm relative overflow-hidden group">
                  
                  {/* Image Section */}
                  <div className="w-20 h-20 rounded-full border-2 border-white shadow-md overflow-hidden shrink-0 bg-white mr-4 relative">
                    {primaryItem.image ? (
                       <img src={primaryItem.image} alt={primaryItem.name} className={`w-full h-full object-cover ${isFullyCancelled ? 'grayscale' : ''}`} />
                    ) : (
                       <div className="w-full h-full bg-green-100 flex items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0 mr-2 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${getStatusColor(displayStatus)}`}>
                        {getStatusLabel(displayStatus)}
                      </span>
                      {getPaymentBadge(order)}
                    </div>
                    <h3 className={`font-black text-lg leading-tight truncate ${isFullyCancelled ? 'text-gray-400 line-through' : 'text-green-900'}`}>
                      {primaryItem.name}
                      {displayItems.length > 1 && <span className="text-xs font-normal text-green-700 ml-1">+{displayItems.length - 1} more</span>}
                    </h3>
                    <div className="flex justify-between items-center pr-2">
                      {displayTotal > 0 ? (
                          <p className="text-gray-600 font-bold text-sm">Rs. {displayTotal}</p>
                      ) : (
                          <p className="text-red-400 font-black text-sm uppercase">Void / 0</p>
                      )}
                      <p className="text-[10px] text-gray-400 font-medium">{order.date}</p>
                    </div>
                  </div>

                  {/* Actions Section - Only if not fully cancelled */}
                  {!isFullyCancelled && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <button 
                          onClick={() => onReorderClick(order)}
                          className="bg-orange-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform hover:bg-orange-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <div className="bg-white/50 text-green-800 text-[10px] font-black w-10 h-6 rounded-lg flex items-center justify-center border border-green-100">
                          x{totalQty}
                        </div>
                      </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
