
import React, { useState, useMemo } from 'react';
import { User, OrderHistoryItem } from '../../types';

interface Props {
  user: User;
  orders: OrderHistoryItem[];
  onClose: () => void;
  onDeleteOrder: (orderId: string) => void;
  onDeleteBulk: (type: 'all' | 'older_30') => void;
}

type TimeFilter = 'All Time' | '30 Days' | '6 Months' | '1 Year';

// Sub-component for individual order card to manage toggle state
const HistoryOrderCard: React.FC<{ order: OrderHistoryItem; onDelete: (id: string) => void }> = ({ order, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-[24px] p-4 md:p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md group">
      
      {/* --- Card Header --- */}
      <div className="flex justify-between items-start gap-4">
         
         {/* Left: Icon & Info */}
         <div className="flex gap-3 md:gap-5 items-center flex-1 min-w-0">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shrink-0 
                ${order.status === 'completed' ? 'bg-green-500 shadow-green-200' : 'bg-orange-500 shadow-orange-200'}`}>
               {order.status === 'completed' ? '✓' : '🕒'}
            </div>
            
            <div className="flex flex-col min-w-0">
               <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h4 className="text-lg md:text-xl font-black text-gray-800 leading-none">Rs. {order.total}</h4>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                      order.status === 'completed' 
                      ? 'bg-green-50 text-green-600 border-green-100' 
                      : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                     {order.status}
                  </span>
               </div>
               <p className="text-xs font-bold text-gray-400 mt-1">{order.date}</p>
            </div>
         </div>

         {/* Right: Actions */}
         <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop: Points Badge */}
            <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    +{order.earnedPoints} pts
                </span>
            </div>

            {/* Toggle Button */}
            <button 
               onClick={() => setIsOpen(!isOpen)}
               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 border
                  ${isOpen 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                  }`}
            >
               <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {/* Delete Button */}
            <button 
               onClick={() => { if(window.confirm('Delete this order permanently?')) onDelete(order.id); }}
               className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100 hover:shadow-lg hover:shadow-red-200"
               title="Delete Order"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
         </div>
      </div>

      {/* --- Dropdown Content (Items List) --- */}
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
         <div className="overflow-hidden">
            <div className="bg-gray-50/80 rounded-2xl p-3 border border-gray-100 space-y-2">
               {/* Items Header */}
               <div className="flex justify-between items-center px-2 pb-1 border-b border-gray-200/50 mb-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Items Ordered</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Price</span>
               </div>

               {/* Items List */}
               {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xs font-black shadow-sm shrink-0 border border-green-200">
                           {item.quantity}
                        </div>
                        <span className="text-sm font-bold text-gray-700 truncate">{item.name}</span>
                     </div>
                     <span className="text-sm font-black text-gray-900 whitespace-nowrap pl-2">Rs. {item.price * item.quantity}</span>
                  </div>
               ))}
               
               {/* Mobile Points Footer (Inside Dropdown) */}
               <div className="md:hidden flex justify-end mt-2 pt-2">
                   <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                      +{order.earnedPoints} Points Earned
                   </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default function AdminCustomerHistoryModal({ user, orders, onClose, onDeleteOrder, onDeleteBulk }: Props) {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('All Time');

  // Filter Logic
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(order => {
      if (activeFilter === 'All Time') return true;
      
      const orderDate = new Date(order.date); 
      const timeDiff = now.getTime() - orderDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);

      if (activeFilter === '30 Days') return daysDiff <= 30;
      if (activeFilter === '6 Months') return daysDiff <= 180;
      if (activeFilter === '1 Year') return daysDiff <= 365;
      return true;
    });
  }, [orders, activeFilter]);

  // Stats Calculation
  const stats = useMemo(() => {
    return filteredOrders.reduce((acc, order) => ({
        totalOrders: acc.totalOrders + 1,
        totalSpent: acc.totalSpent + (order.total || 0),
        earnedPoints: acc.earnedPoints + (order.earnedPoints || 0),
        usedPoints: acc.usedPoints + (order.pointsUsed || 0)
    }), { totalOrders: 0, totalSpent: 0, earnedPoints: 0, usedPoints: 0 });
  }, [filteredOrders]);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Main Container */}
      <div className="bg-[#f8fafc] w-full max-w-4xl h-[90vh] rounded-[35px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header - Green Theme */}
        <div className="bg-[#1ca553] px-6 py-5 shrink-0 flex justify-between items-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex items-center gap-4 relative z-10">
                <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-md transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div>
                    <h2 className="text-xl md:text-2xl font-black leading-none">{user.name}'s History</h2>
                    <p className="text-green-100 text-xs font-bold font-mono mt-1 opacity-80">{user.mobile}</p>
                </div>
            </div>

            <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors relative z-10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Stats Row */}
        <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 shrink-0 bg-white border-b border-gray-100">
            {[
                { label: 'Orders', value: stats.totalOrders, color: 'text-gray-800' },
                { label: 'Total Spent', value: `Rs.${stats.totalSpent.toLocaleString()}`, color: 'text-green-600' },
                { label: 'Pts Earned', value: stats.earnedPoints, color: 'text-blue-600' },
                { label: 'Pts Used', value: stats.usedPoints, color: 'text-orange-600' }
            ].map((stat, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-center flex flex-col justify-center">
                    <span className={`text-xl md:text-2xl font-black ${stat.color}`}>{stat.value}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">{stat.label}</span>
                </div>
            ))}
        </div>

        {/* Filters & Actions Bar */}
        <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 bg-[#f8fafc]">
            {/* Filter Pills */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 overflow-x-auto max-w-full no-scrollbar">
                {(['All Time', '30 Days', '6 Months', '1 Year'] as TimeFilter[]).map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                            activeFilter === filter 
                            ? 'bg-[#1ca553] text-white shadow-md' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2">
                <button 
                    onClick={() => { if(window.confirm('Delete orders older than 30 days?')) onDeleteBulk('older_30'); }}
                    className="px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                    Delete &gt; 30 days
                </button>
                <button 
                    onClick={() => { if(window.confirm('Delete ALL history for this user? This cannot be undone.')) onDeleteBulk('all'); }}
                    className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors"
                >
                    Delete All
                </button>
            </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 pt-0 space-y-3">
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <div className="text-5xl mb-2 grayscale">📜</div>
                    <p className="font-bold text-gray-400">No orders found</p>
                </div>
            ) : (
                filteredOrders.map((order) => (
                    <HistoryOrderCard 
                       key={order.id} 
                       order={order} 
                       onDelete={onDeleteOrder} 
                    />
                ))
            )}
        </div>

      </div>
    </div>
  );
}
