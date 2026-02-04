
import React, { useMemo } from 'react';
import { OrderHistoryItem } from '../../types';

interface Props {
  orders: OrderHistoryItem[];
}

export default function BarHistory({ orders }: Props) {
  
  // Logic: Filter orders that have served OR cancelled BAR items (completed workflow)
  const barHistoryOrders = useMemo(() => {
      return orders.map(order => {
          // 1. Get only Bar Items (Served OR Cancelled OR Completed)
          // We want to see everything that passed through the bar, even if rejected.
          const barItems = order.items.filter(i => 
              i.requiresPreparation === false && 
              (i.status === 'served' || i.status === 'completed' || i.status === 'cancelled' || order.status === 'completed' || order.status === 'cancelled')
          );

          if (barItems.length === 0) return null;

          // 2. Calculate Bar Total (EXCLUDING Cancelled items)
          const barTotal = barItems.reduce((acc, item) => {
              if (item.status === 'cancelled') return acc;
              return acc + (item.price * item.quantity);
          }, 0);

          return {
              ...order,
              barItems,
              barTotal
          };
      })
      .filter(Boolean)
      .sort((a, b) => {
          // Sort logic
          return -1; 
      }) as (OrderHistoryItem & { barItems: any[], barTotal: number })[];
  }, [orders]);

  if (barHistoryOrders.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full opacity-40 py-20">
              <span className="text-6xl mb-4 grayscale">📜</span>
              <h3 className="text-xl font-black text-gray-500">No History Yet</h3>
              <p className="text-sm text-gray-400 font-bold">Served drinks will appear here.</p>
          </div>
      );
  }

  return (
    <div className="space-y-4 pb-20">
       <h3 className="text-lg font-black text-gray-700 px-2">Transaction History</h3>
       
       {barHistoryOrders.map((order) => {
           const isPaid = order.paymentStatus === 'paid';
           const isFullyCancelled = order.barItems.every((i: any) => i.status === 'cancelled');
           
           return (
               <div key={order.id} className={`rounded-[24px] shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isFullyCancelled ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-200'}`}>
                   
                   {/* Header Row */}
                   <div className={`px-5 py-3 border-b flex justify-between items-center ${isFullyCancelled ? 'bg-red-50 border-red-100' : 'bg-gray-50/80 border-gray-100'}`}>
                       <div className="flex items-center gap-3">
                           {/* Table Badge */}
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${isFullyCancelled ? 'bg-red-200 text-red-700' : 'bg-gray-800 text-white'}`}>
                               T{order.tableNumber}
                           </div>
                           
                           <div className="flex flex-col">
                               <div className="flex items-center gap-2">
                                   <span className={`font-mono text-xs font-bold ${isFullyCancelled ? 'text-red-400 line-through' : 'text-gray-500'}`}>#{order.id.slice(-6).toUpperCase()}</span>
                                   {!isFullyCancelled && (
                                       isPaid ? (
                                           <span className="bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-green-200">Paid</span>
                                       ) : (
                                           <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-orange-200">Unpaid</span>
                                       )
                                   )}
                                   {isFullyCancelled && <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase border border-red-200">Cancelled</span>}
                               </div>
                               <span className="text-[10px] font-bold text-gray-400 mt-0.5">{order.date}</span>
                           </div>
                       </div>

                       <div className="text-right">
                           <p className="text-sm font-bold text-gray-400 uppercase text-[9px]">Bar Total</p>
                           {isFullyCancelled || order.barTotal === 0 ? (
                               <p className="text-lg font-black text-red-300 leading-none">Void</p>
                           ) : (
                               <p className="text-lg font-black text-gray-800 leading-none">Rs. {order.barTotal}</p>
                           )}
                       </div>
                   </div>

                   {/* Items Content */}
                   <div className="p-4">
                       <div className="flex flex-wrap gap-2">
                           {order.barItems.map((item: any, idx: number) => {
                               const isItemCancelled = item.status === 'cancelled';
                               return (
                                   <div 
                                     key={`${item.id}-${idx}`} 
                                     className={`flex items-center gap-2 rounded-lg pr-3 pl-1 py-1 shadow-sm border
                                        ${isItemCancelled 
                                            ? 'bg-red-50 border-red-100 opacity-70 grayscale-[0.5]' 
                                            : 'bg-white border-gray-100'
                                        }
                                     `}
                                   >
                                       <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black 
                                            ${isItemCancelled ? 'bg-red-200 text-red-700' : 'bg-orange-50 text-orange-600'}
                                       `}>
                                           {item.quantity}
                                       </div>
                                       <div className="flex flex-col">
                                           <span className={`text-xs font-bold leading-tight ${isItemCancelled ? 'text-red-800 line-through' : 'text-gray-700'}`}>
                                               {item.name}
                                           </span>
                                           {!isItemCancelled && item.servingUnit && <span className="text-[9px] text-gray-400 font-medium">{item.servingUnit}</span>}
                                           {isItemCancelled && <span className="text-[8px] text-red-500 font-black uppercase">Rejected</span>}
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                   </div>

               </div>
           );
       })}
    </div>
  );
}
