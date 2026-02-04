
import React, { useState, useEffect, useMemo } from 'react';
import { TableSession, User, OrderHistoryItem, TableGroup, OrderStatus } from './types';
// Import hook
import { useMenu } from './hooks/useMenu';
import { useVat, VatConfig } from './hooks/useVat';
import AdminCategoryModal from './components/admin/AdminCategoryModal';
import AdminCategoryManager from './components/admin/AdminCategoryManager';
import AdminProductModal from './components/admin/AdminProductModal';
import AdminActionMenu from './components/admin/AdminActionMenu';
import AdminCustomerManager from './components/admin/AdminCustomerManager';
import AdminCustomerDetailModal from './components/admin/AdminCustomerDetailModal';
import AdminRewardManager from './components/admin/AdminRewardManager';
import AdminTableManager from './components/admin/tables/AdminTableManager'; 
import AdminComplainsManager from './components/admin/complaints/AdminComplainsManager';
import AdminSettingsManager from './components/admin/settings/AdminSettingsManager';
import AdminStaffManager from './components/admin/staff/AdminStaffManager'; 
import AdminPaymentManager from './components/admin/payment/AdminPaymentManager';
import AdminBillModal from './components/admin/tables/AdminBillModal'; // Import Bill Modal
import ToastContainer, { ToastMessage, ToastType } from './components/Toast';

// Base Configuration for Tables (Physical Layout)
const BASE_TABLES: TableSession[] = Array.from({ length: 12 }, (_, i) => ({
    id: `tbl-${i + 1}`,
    tableNumber: `T${i + 1}`,
    status: 'free',
    capacity: 4,
    guests: 0,
    startTime: undefined,
    totalAmount: 0,
    location: i < 4 ? 'Rooftop' : (i < 8 ? 'Ground Floor' : 'Garden'),
    activeOrders: [],
    groups: []
}));

const INITIAL_INGREDIENTS = [
    { id: 'ing1', name: 'Onion', image: 'https://picsum.photos/seed/onion/100/100' },
    { id: 'ing2', name: 'Garlic', image: 'https://picsum.photos/seed/garlic/100/100' },
    { id: 'ing3', name: 'Tomato', image: 'https://picsum.photos/seed/tomato/100/100' },
    { id: 'ing4', name: 'Cilantro', image: 'https://picsum.photos/seed/cilantro/100/100' },
    { id: 'ing5', name: 'Cheese', image: 'https://picsum.photos/seed/cheese/100/100' },
    { id: 'ing6', name: 'Butter', image: 'https://picsum.photos/seed/butter/100/100' },
    { id: 'ing7', name: 'Chilli', image: 'https://picsum.photos/seed/chilli/100/100' }
];

const GENERATE_MOCK_CUSTOMERS = (): User[] => [
  { name: 'Himesh Nath', mobile: '9800000000', points: 40, usedPoints: 24, joinedDate: '2/5/2025', isRegistered: true, isActive: true },
  { name: 'Santosh Bist', mobile: '9800000001', points: 55, usedPoints: 55, joinedDate: '4/12/2025', isRegistered: true, isActive: true },
];

type AdminView = 'dashboard' | 'tables' | 'kitchen' | 'menu' | 'payment' | 'rewards' | 'users' | 'customers' | 'complains' | 'support' | 'settings';

interface Props {
  onHome: () => void;
  onNavigate: (path: string) => void;
}

// --- CORE CALCULATION LOGIC ---
// If Paid: Return frozen total.
// If Unpaid: Recalculate using current settings (Live).
const calculateLiveOrderTotal = (order: OrderHistoryItem, vatConfig: VatConfig): number => {
    // 1. If cancelled, it's 0.
    if (order.status === 'cancelled') return 0;

    // 2. If PAID, return the snapshot total. Do not recalculate.
    if (order.paymentStatus === 'paid') {
        return order.total;
    }
    
    // 3. If UNPAID, calculate dynamically based on current VAT Config
    const subtotal = order.items.reduce((acc, item) => {
        if (item.status === 'cancelled') return acc;
        return acc + (item.price * item.quantity);
    }, 0);

    const discount = order.discountAmount || 0;
    const taxable = Math.max(0, subtotal - discount);
    
    // Use LIVE config
    const vatRate = vatConfig.enabled ? (vatConfig.rate / 100) : 0;
    const vat = Math.round(taxable * vatRate);
    
    return taxable + vat;
};

const Sidebar = ({ active, onChange, onLogout, isOpen, onClose }: { active: AdminView, onChange: (v: AdminView) => void, onLogout: () => void, isOpen: boolean, onClose: () => void }) => {
  const menuItems: { id: AdminView, label: string, icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>) },
    { id: 'tables', label: 'Tables', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>) },
    { id: 'kitchen', label: 'Kitchen (KOT)', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>) },
    { id: 'menu', label: 'Menu', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>) },
    { id: 'payment', label: 'Payment', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>) },
    { id: 'rewards', label: 'Customize Reward', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>) },
    { id: 'users', label: 'Inside users', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>) },
    { id: 'customers', label: 'Customer', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>) },
    { id: 'complains', label: 'Complains', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>) },
    { id: 'settings', label: 'Settings', icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>) }
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#f0fdf4] text-green-900 shadow-xl lg:shadow-none transform transition-transform duration-300 lg:transform-none flex flex-col h-full border-r border-green-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        <div className="p-6 pb-6">
           <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-gray-900 leading-none">
                Nep<span className="text-green-600">Nola</span>.
              </h1>
              <p className="text-[10px] font-bold text-gray-400 tracking-[0.25em] uppercase">Admin Panel</p>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4 no-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onChange(item.id); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[18px] font-bold transition-all group
                ${active === item.id 
                  ? 'bg-transparent text-green-700' 
                  : 'text-gray-600 hover:bg-green-50/50 hover:text-green-700'
                }
              `}
            >
              <div className={`
                 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm
                 ${active === item.id 
                   ? 'bg-green-600 text-white shadow-green-200' 
                   : 'bg-green-600 text-white group-hover:shadow-green-100'
                 }
              `}>
                 {item.icon}
              </div>
              <span className={`text-sm ${active === item.id ? 'font-black' : 'font-bold'}`}>{item.label}</span>
            </button>
          ))}
          
          <div className="h-px bg-green-100 mx-2 my-2" />
          
          <button 
             onClick={onLogout}
             className="w-full flex items-center gap-4 px-4 py-3 rounded-[18px] font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
           >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-600 text-white shadow-sm transition-all group-hover:bg-red-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </div>
              <span className="text-sm">Log Out</span>
           </button>
        </div>
      </div>
    </>
  );
};

const DashboardCard = ({ title, value, sub, icon, bgClass, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-[20px] p-3 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
  >
      <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${bgClass}`}>
              {icon}
          </div>
          <div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{title}</p>
             <div className="flex items-baseline gap-1.5">
               <h3 className="text-2xl font-black text-gray-800 leading-none">{value}</h3>
               {sub && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">{sub}</span>}
             </div>
          </div>
      </div>
      <button className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-50 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
  </div>
);

interface OrderRowProps { 
    order: OrderHistoryItem; 
    vatConfig: VatConfig;
    onNotify: (target: string, orderId: string) => void;
    onViewBill: (order: OrderHistoryItem) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, vatConfig, onNotify, onViewBill }) => {
    // Determine Payment Badge
    let paymentBadge = null;
    if (order.paymentStatus === 'paid') {
        paymentBadge = <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm">PAID</span>;
    } else if (order.paymentStatus === 'pending_verification') {
        paymentBadge = <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm animate-pulse">VERIFY</span>;
    } else {
        paymentBadge = <span className="bg-gray-200 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase">UNPAID</span>;
    }

    // --- ACCURATE STATUS LOGIC ---
    // ... (Existing status logic remains same) ...
    const kitchenItems = order.items.filter(i => i.requiresPreparation !== false);
    const barItems = order.items.filter(i => i.requiresPreparation === false);
    
    const hasKitchen = kitchenItems.length > 0;
    const hasBar = barItems.length > 0;

    const getGroupStatus = (items: any[]): 'pending' | 'queue' | 'cooking' | 'ready' | 'done' | 'cancelled' => {
        if (items.length === 0) return 'done';
        if (items.every(i => i.status === 'cancelled')) return 'cancelled';
        if (items.every(i => ['served', 'completed', 'cancelled'].includes(i.status || ''))) return 'done';
        if (items.every(i => ['ready', 'served', 'completed', 'cancelled'].includes(i.status || ''))) return 'ready';
        if (items.some(i => ['cooking', 'preparing'].includes(i.status || ''))) return 'cooking';
        if (items.some(i => i.status === 'queue')) return 'queue';
        return 'pending';
    };

    const kitchenStatus = getGroupStatus(kitchenItems);
    const barStatus = getGroupStatus(barItems);

    const renderStatusBadge = (label: string, status: string, type: 'Kitchen' | 'Bar') => {
        let colors = "bg-gray-100 text-gray-500";
        let icon = "";
        switch(status) {
            case 'pending': colors = "bg-red-100 text-red-600"; icon = "⏳"; break;
            case 'queue': colors = "bg-yellow-100 text-yellow-600"; icon = "⏱️"; break;
            case 'cooking': colors = "bg-orange-100 text-orange-600"; icon = type === 'Kitchen' ? "👨‍🍳" : "🍹"; break;
            case 'ready': colors = "bg-emerald-100 text-emerald-600"; icon = "✅"; break;
            case 'done': colors = "bg-gray-100 text-gray-400 line-through"; icon = "✔"; break;
            case 'cancelled': colors = "bg-red-100 text-red-500 line-through decoration-red-500"; icon = "🚫"; break;
        }
        return (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-transparent ${colors} flex items-center gap-1`}>
                <span>{icon}</span> {type}: {status === 'done' ? 'Served' : (status === 'cooking' ? 'Prep' : status)}
            </span>
        );
    };

    const isKitchenDone = !hasKitchen || kitchenStatus === 'done' || kitchenStatus === 'cancelled';
    const isBarDone = !hasBar || barStatus === 'done' || barStatus === 'cancelled';
    const isFullyDelivered = isKitchenDone && isBarDone;
    
    const showKitchenBtn = hasKitchen && (kitchenStatus === 'pending' || kitchenStatus === 'queue' || kitchenStatus === 'cooking');
    const showBarBtn = hasBar && (barStatus === 'pending' || barStatus === 'queue' || barStatus === 'cooking');
    const showWaiterBtn = true; 

    const validItemsCount = order.items.filter(i => i.status !== 'cancelled').length;
    const itemsSummary = validItemsCount + (validItemsCount === 1 ? ' item' : ' items');
    const timeDisplay = order.date; 
    
    // Live Total Calculation
    const liveTotal = calculateLiveOrderTotal(order, vatConfig);

    return (
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-green-600 flex items-center justify-center shadow-md shrink-0 text-white">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-gray-800 text-sm leading-tight">{order.id}</h4>
                      {paymentBadge}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                      {order.status === 'cancelled' ? (
                          <span className="bg-red-100 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase line-through">Cancelled</span>
                      ) : isFullyDelivered ? (
                          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">Delivered</span>
                      ) : (
                          <>
                              {hasKitchen && renderStatusBadge('Kitchen', kitchenStatus, 'Kitchen')}
                              {hasBar && renderStatusBadge('Bar', barStatus, 'Bar')}
                          </>
                      )}
                  </div>

                  <p className="text-xs font-medium text-gray-600 mt-1">
                      <span className="font-bold text-gray-800">Table {order.tableNumber}</span> • {itemsSummary}
                  </p>
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                 <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => onViewBill(order)}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shrink-0"
                        title="View Bill"
                    >
                        <span className="text-xs">🧾</span>
                        <span className="text-[10px] font-bold uppercase">Bill</span>
                    </button>

                    {showKitchenBtn && (
                        <button 
                            onClick={() => onNotify('Kitchen', order.id)}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shrink-0"
                            title="Notify Kitchen"
                        >
                            <span className="text-xs">👨‍🍳</span>
                            <span className="text-[10px] font-bold uppercase">Kitchen</span>
                        </button>
                    )}
                    {showBarBtn && (
                        <button 
                            onClick={() => onNotify('Bar', order.id)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shrink-0"
                            title="Notify Bar"
                        >
                            <span className="text-xs">🍸</span>
                            <span className="text-[10px] font-bold uppercase">Bar</span>
                        </button>
                    )}
                    {showWaiterBtn && (
                        <button 
                            onClick={() => onNotify('Waiter', order.id)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shrink-0"
                            title="Notify Waiter"
                        >
                            <span className="text-xs">🤵</span>
                            <span className="text-[10px] font-bold uppercase">Waiter</span>
                        </button>
                    )}
                 </div>

                 <div className="text-right ml-auto sm:ml-0">
                     <p className="text-sm font-black text-green-700">Rs.{liveTotal}</p>
                     <p className="text-[10px] font-bold text-gray-400">{timeDisplay}</p>
                 </div>
            </div>
        </div>
    );
};

const MenuCard: React.FC<{ item: any; onClick: () => void }> = ({ item, onClick }) => {
  const isAvailable = item.isAvailable !== false;
  const isBestRated = item.rating >= 4.8;
  const hasDiscount = !!item.discount || !!item.oldPrice;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[24px] p-3 shadow-sm border flex flex-col gap-3 group relative cursor-pointer hover:shadow-xl transition-all active:scale-95 ${isAvailable ? 'border-gray-100 hover:border-green-200' : 'border-red-100 bg-red-50/30'}`}
    >
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10">
            {hasDiscount && <span className="bg-pink-100 text-pink-600 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">Offer</span>}
            {isBestRated && <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">Best</span>}
        </div>

        <div className="w-full aspect-square rounded-[18px] bg-gray-100 overflow-hidden relative">
            <img 
              src={item.image} 
              alt={item.name} 
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!isAvailable ? 'grayscale' : ''}`} 
            />
            {!isAvailable && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-wider bg-red-600 px-2 py-1 rounded">Out of Stock</span>
                </div>
            )}
        </div>

        <div>
            <div className="flex justify-between items-start mb-1">
                <h4 className={`font-black text-sm leading-tight line-clamp-1 ${!isAvailable ? 'text-gray-400' : 'text-gray-800'}`}>{item.name}</h4>
                <div className="flex items-center gap-0.5">
                    <span className="text-[10px]">⭐</span>
                    <span className="text-[10px] font-bold text-gray-500">{item.rating}</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <p className={`text-xs font-bold ${!isAvailable ? 'text-gray-400' : 'text-green-600'}`}>Rs. {item.price}</p>
                <p className="text-[9px] font-medium text-gray-400">{Array.isArray(item.category) ? item.category[0] : item.category}</p>
            </div>
        </div>
    </div>
  );
};

export default function AdminApp({ onHome, onNavigate }: Props) {
  const { items: menuItems, categories, addItem, updateItem, deleteItem, saveCategories } = useMenu();
  const { config: vatConfig } = useVat();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [view, setView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuFilter, setMenuFilter] = useState('All');
  
  const [tableFilter, setTableFilter] = useState<'All' | 'Occupied' | 'Free'>('All');
  const [menuSearch, setMenuSearch] = useState('');

  const [liveOrders, setLiveOrders] = useState<OrderHistoryItem[]>([]);
  const [tables, setTables] = useState<TableSession[]>(BASE_TABLES);

  // ... (Modal states) ...
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null); 
  const [actionItem, setActionItem] = useState<any>(null);
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [selectedTableForBill, setSelectedTableForBill] = useState<TableSession | null>(null);
  const [isViewingHistoryBill, setIsViewingHistoryBill] = useState(false); 
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // NEW: State to track which group is being viewed/billed in the modal
  const [billViewSessionId, setBillViewSessionId] = useState<string | null>(null);

  // ... (Toast helpers) ...
  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleNotifyStaff = (target: string, orderId: string) => {
      addToast('info', `Notification Sent`, `${target} alerted for Order #${orderId}`);
  };

  useEffect(() => {
     if (localStorage.getItem('nepnola_admin_auth') === 'true') {
         setIsAuthenticated(true);
     }
  }, []);

  // Poll Active Orders & Update Tables
  useEffect(() => {
      const poll = () => {
          try {
              // 1. Get Manual Table Sessions (Bookings)
              const liveTablesStr = localStorage.getItem('nepnola_live_tables');
              const liveTablesMap = liveTablesStr ? JSON.parse(liveTablesStr) : {};

              // 2. Get Active Orders
              const activeStr = localStorage.getItem('active_orders');
              const parsedOrders: OrderHistoryItem[] = activeStr ? JSON.parse(activeStr) : [];
              setLiveOrders(parsedOrders);

              const updatedTables = BASE_TABLES.map(table => {
                  // A. Check for manual booking data (guests, groups)
                  const manualData = liveTablesMap[table.id];
                  
                  // B. Find orders relevant to this table
                  const tableOrders = parsedOrders.filter(o => 
                      o.tableNumber === table.tableNumber.replace('T', '') || 
                      o.tableNumber === table.tableNumber 
                  );
                  
                  // Determine overall active status: Manual Occupancy OR Active Orders
                  // Note: An order is "active" for table status if it's not cancelled and not fully paid/cleared? 
                  // Actually, paid orders can still be on table until cleared.
                  const hasOrders = tableOrders.length > 0;
                  const isManuallyOccupied = manualData && manualData.status === 'occupied';
                  
                  // Consolidate Groups Logic
                  // We prioritize manual groups if they exist (allows empty booking).
                  // If no manual groups but orders exist (legacy/direct order), we infer a default group.
                  
                  let groups: TableGroup[] = [];
                  
                  if (manualData && manualData.groups && manualData.groups.length > 0) {
                      // Map orders to these specific groups based on SessionID
                      groups = manualData.groups.map((grp: any) => {
                          const grpOrders = tableOrders.filter(o => {
                              if (o.sessionId === grp.id) return true;
                              // Fallback for orders without session ID if single group
                              if (!o.sessionId && manualData.groups.length === 1) return true;
                              return false;
                          });
                          
                          const grpTotal = grpOrders
                              .filter(o => o.status !== 'cancelled' && o.paymentStatus !== 'paid')
                              .reduce((acc, o) => acc + calculateLiveOrderTotal(o, vatConfig), 0);

                          return {
                              ...grp,
                              activeOrders: grpOrders,
                              totalAmount: grpTotal
                          };
                      });
                  } else if (hasOrders) {
                      // Fallback: Orders exist but no manual session (direct order scenario)
                      // Group by Session ID found in orders
                      const sessionMap = new Map<string, OrderHistoryItem[]>();
                      tableOrders.forEach(o => {
                          const sid = o.sessionId || `legacy_${table.id}`;
                          if (!sessionMap.has(sid)) sessionMap.set(sid, []);
                          sessionMap.get(sid)!.push(o);
                      });
                      
                      sessionMap.forEach((orders, sid) => {
                          const groupTotal = orders
                              .filter(o => o.status !== 'cancelled' && o.paymentStatus !== 'paid')
                              .reduce((acc, o) => acc + calculateLiveOrderTotal(o, vatConfig), 0);
                              
                          groups.push({
                              id: sid,
                              name: 'Main Group',
                              guests: 4, // Default estimate
                              startTime: orders[0]?.date || 'Now',
                              activeOrders: orders,
                              totalAmount: groupTotal,
                              status: 'active'
                          });
                      });
                  }

                  const totalBill = groups.reduce((acc, g) => acc + (g.totalAmount || 0), 0);
                  const totalGuests = groups.reduce((acc, g) => acc + (g.guests || 0), 0);

                  return {
                      ...table,
                      status: (isManuallyOccupied || hasOrders) ? 'occupied' : 'free',
                      guests: totalGuests, 
                      totalAmount: totalBill,
                      activeOrders: tableOrders, // Flattened for simple view
                      groups: groups
                  } as TableSession;
              });
              
              setTables(updatedTables);
          } catch(e) {}
      };
      poll();
      const interval = setInterval(poll, 2000);
      return () => clearInterval(interval);
  }, [vatConfig]);

  const handleDashboardMarkPaid = () => {
      if (!activeBillTable || isViewingHistoryBill) return;

      try {
          const storedOrdersStr = localStorage.getItem('active_orders');
          if (storedOrdersStr) {
              const orders: OrderHistoryItem[] = JSON.parse(storedOrdersStr);
              
              const updatedOrders = orders.map(o => {
                  let shouldUpdate = false;
                  if (o.paymentStatus === 'paid') return o;

                  // Update: Check if this order is part of the CURRENT filtered bill view
                  // This handles split bills correctly - we only pay for orders visible in the modal
                  // The activeBillTable logic ensures activeOrders here ONLY contains the group orders if split.
                  if (activeBillTable.activeOrders?.some(ao => ao.id === o.id)) {
                      shouldUpdate = true;
                  }

                  if (shouldUpdate) {
                      const currentVatRate = vatConfig.enabled ? vatConfig.rate : 0;
                      const subtotal = o.items.reduce((acc, item) => {
                          if (item.status === 'cancelled') return acc;
                          return acc + (item.price * item.quantity);
                      }, 0);
                      const discount = o.discountAmount || 0;
                      const taxable = Math.max(0, subtotal - discount);
                      const taxAmount = Math.round(taxable * (currentVatRate / 100));
                      const total = taxable + taxAmount;

                      return { 
                          ...o, 
                          paymentStatus: 'paid' as const,
                          taxRate: currentVatRate,
                          taxAmount: taxAmount,
                          total: total 
                      };
                  }
                  return o;
              });
              
              localStorage.setItem('active_orders', JSON.stringify(updatedOrders));
              setLiveOrders(updatedOrders);
              
              // Determine if we need to refresh the "Bill Table" view to show it's paid
              // or if we should close it. Usually keeping it open but showing "Paid" is better feedback.
              if (activeBillTable.status !== 'occupied' || true) {
                  const updatedActiveOrders = activeBillTable.activeOrders?.map(o => {
                      if (o.paymentStatus === 'paid') return o; 
                      return {...o, paymentStatus: 'paid' as const};
                  }) || [];
                  
                  setSelectedTableForBill({
                      ...activeBillTable,
                      activeOrders: updatedActiveOrders
                  });
              }

              addToast('success', 'Payment Recorded', 'Selected orders paid. Tax rates frozen.');
          }
      } catch (e) {
          console.error("Error updating payment", e);
          addToast('error', 'Error', 'Failed to update payment status.');
      }
  };

  // ... (Rest of AdminApp methods) ...
  const handleLogin = () => {
     if (username === 'admin' && password === 'admin123') {
         setIsAuthenticated(true);
         localStorage.setItem('nepnola_admin_auth', 'true');
         setError('');
     } else {
         setError('Invalid credentials');
     }
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('nepnola_admin_auth');
      onHome(); 
  };

  // ... (Menu filter logic) ...
  const filteredMenu = menuItems.filter(item => {
      const matchesCategory = menuFilter === 'All' 
          ? true 
          : (Array.isArray(item.category) ? item.category.includes(menuFilter) : item.category === menuFilter);
      const query = menuSearch.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(query) || 
                            (Array.isArray(item.category) 
                               ? item.category.some(c => c.toLowerCase().includes(query)) 
                               : item.category.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
  });

  const handleCreateCategoryClick = () => setShowCategoryOptions(!showCategoryOptions);
  
  const openCategoryModal = (mode: 'create' | 'edit', cat?: any) => {
      setCategoryModalMode(mode);
      setSelectedCategory(cat || null);
      setShowCategoryModal(true);
      setShowCategoryOptions(false);
  };

  const handleSaveCategory = (data: any) => {
      if (data.id) {
          saveCategories(categories.map(c => c.id === data.id ? { ...c, ...data } : c));
          addToast('success', 'Category Updated', `${data.name} details updated successfully.`);
      } else {
          const newCat = { ...data, id: Date.now().toString() };
          saveCategories([...categories, newCat]);
          addToast('success', 'Category Created', `${data.name} added to menu sections.`);
      }
      setShowCategoryModal(false);
  };

  const handleDeleteCategory = (id: string) => {
      saveCategories(categories.filter(c => c.id !== id));
      addToast('success', 'Category Deleted', 'The category has been removed.');
  };

  const handleEditProduct = (product: any) => {
      setActionItem(null);
      setEditingProduct(product);
      setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: string) => {
      if(window.confirm('Are you sure you want to delete this item?')) {
          deleteItem(productId);
          setActionItem(null);
          addToast('success', 'Item Deleted', 'Menu item has been permanently deleted.');
      }
  };

  const handleQuickUpdate = (updatedProduct: any) => {
      updateItem(updatedProduct);
      setActionItem(updatedProduct); 
      addToast('success', 'Quick Update', 'Item status updated.');
  };

  const handleSaveProduct = (product: any) => {
      const cleanProduct = {
          ...product,
          ...(product.requiresPreparation === false ? {
              dietaryType: undefined,
              portionType: undefined,
              hasSpiceLevel: false,
              ingredients: []
          } : {
              servingUnit: undefined 
          })
      };

      if (menuItems.find(p => p.id === cleanProduct.id)) {
          updateItem(cleanProduct);
          addToast('success', 'Item Updated', `${cleanProduct.name} details saved.`);
      } else {
          addItem(cleanProduct);
          addToast('success', 'Item Created', `${cleanProduct.name} added to the menu.`);
      }
      
      setShowProductModal(false);
      setEditingProduct(null); 
  };
  
  const handleDeleteUser = (mobile: string) => {
      if(window.confirm(`Are you sure you want to remove user with mobile ${mobile}?`)) {
          setCustomers(prev => prev.filter(u => u.mobile !== mobile));
      }
  };

  const handleUpdateUserStatus = (mobile: string, isActive: boolean) => {
      setCustomers(prev => prev.map(u => 
          u.mobile === mobile ? { ...u, isActive } : u
      ));
      if (selectedCustomer && selectedCustomer.mobile === mobile) {
          setSelectedCustomer(prev => prev ? { ...prev, isActive } : null);
      }
  };

  const handleViewBill = (order: OrderHistoryItem, forceSnapshot = false) => {
      setIsViewingHistoryBill(forceSnapshot);
      setBillViewSessionId(null); // Reset session filter

      if (!forceSnapshot) {
          const table = tables.find(t => 
              t.tableNumber === order.tableNumber || 
              t.tableNumber === `T${order.tableNumber}` || 
              t.tableNumber.replace('T', '') === order.tableNumber
          );

          if (table && table.status === 'occupied') {
              // --- SPLIT BILL LOGIC ---
              // If the order has a specific Session ID, and the table has multiple groups...
              // We strictly enter "Group View" mode by setting billViewSessionId
              if (order.sessionId && table.groups && table.groups.length > 1) {
                  const specificGroup = table.groups.find(g => g.id === order.sessionId);
                  
                  if (specificGroup) {
                      setBillViewSessionId(order.sessionId);
                      // Set selected table to ID so memo can re-fetch and filter
                      setSelectedTableForBill(table);
                      return;
                  }
              }

              // Default: Show full table if single group or no session ID match
              setSelectedTableForBill(table);
              return;
          }
      }

      const tempTable: TableSession = {
          id: `hist-${order.id}`,
          tableNumber: order.tableNumber || '?',
          status: 'free', 
          capacity: 0,
          guests: 0,
          activeOrders: [order], 
          groups: [],
          location: 'History'
      };
      setSelectedTableForBill(tempTable);
  };

  const activeBillTable = useMemo(() => {
      if (!selectedTableForBill) return null;
      if (isViewingHistoryBill) return selectedTableForBill;
      
      // Fetch latest data for this table to handle live updates
      const liveTable = tables.find(t => t.id === selectedTableForBill.id);

      if (liveTable && liveTable.status === 'occupied') {
          // If we are in specific group view (Split Bill Mode)
          if (billViewSessionId) {
              const groupOrders = liveTable.activeOrders?.filter(o => o.sessionId === billViewSessionId) || [];
              const group = liveTable.groups?.find(g => g.id === billViewSessionId);
              
              // Return a Virtual Table containing ONLY this group's orders
              return {
                  ...liveTable,
                  activeOrders: groupOrders,
                  // Visual indicator in header
                  tableNumber: `${liveTable.tableNumber} (${group?.name || 'Group'})`,
                  guests: group?.guests || liveTable.guests,
                  totalAmount: group?.totalAmount || 0 
              };
          }
          // Default: Return full table
          return liveTable;
      }
      
      // Fallback if table became free or not found
      return selectedTableForBill;
  }, [selectedTableForBill, tables, isViewingHistoryBill, billViewSessionId]);

  const handleDashboardClearTable = () => {
      if (!activeBillTable) return;
      if (activeBillTable.status === 'occupied' && !isViewingHistoryBill) {
           try {
              const activeStr = localStorage.getItem('active_orders');
              const activeOrders: OrderHistoryItem[] = activeStr ? JSON.parse(activeStr) : [];
              
              // Identify orders currently in the bill modal (could be a subset/group)
              // Since activeBillTable is correctly filtered by the memo above, this only grabs the group's order IDs
              const billOrderIds = new Set(activeBillTable.activeOrders?.map(o => o.id));
              
              const ordersToArchive = activeOrders.filter(o => billOrderIds.has(o.id));
              const ordersToKeep = activeOrders.filter(o => !billOrderIds.has(o.id));
              
              const historyStr = localStorage.getItem('order_history');
              const historyOrders: OrderHistoryItem[] = historyStr ? JSON.parse(historyStr) : [];
              
              const archivedOrders = ordersToArchive.map(o => ({
                  ...o,
                  status: 'completed' as const,
                  paymentStatus: 'paid' as const
              }));
              
              // Update Persistent Stores
              localStorage.setItem('order_history', JSON.stringify([...historyOrders, ...archivedOrders]));
              localStorage.setItem('active_orders', JSON.stringify(ordersToKeep));
              
              // Handle Table Group Session cleanup if needed
              const liveTablesStr = localStorage.getItem('nepnola_live_tables');
              if (liveTablesStr) {
                  const liveTablesMap = JSON.parse(liveTablesStr);
                  const tableKey = activeBillTable.id;
                  
                  // Check if we are clearing a specific group based on the orders
                  // Get unique session IDs from the orders being archived
                  const sessionIdsCleared = new Set(ordersToArchive.map(o => o.sessionId).filter(Boolean));
                  
                  if (liveTablesMap[tableKey] && sessionIdsCleared.size > 0) {
                      const currentGroups = liveTablesMap[tableKey].groups || [];
                      const remainingGroups = currentGroups.filter((g: any) => !sessionIdsCleared.has(g.id));
                      
                      liveTablesMap[tableKey].groups = remainingGroups;
                      
                      // If no groups left, clear table status
                      if (remainingGroups.length === 0) {
                          delete liveTablesMap[tableKey];
                      }
                      
                      localStorage.setItem('nepnola_live_tables', JSON.stringify(liveTablesMap));
                  } else if (liveTablesMap[tableKey] && ordersToKeep.length === 0) {
                      // Fallback: If no orders left at all for this table, clear it entirely
                      delete liveTablesMap[tableKey];
                      localStorage.setItem('nepnola_live_tables', JSON.stringify(liveTablesMap));
                  }
              }

              setLiveOrders(ordersToKeep);
              setSelectedTableForBill(null);
              addToast('success', 'Bill Cleared', 'Orders archived successfully.');
           } catch(e) { 
               console.error(e); 
               addToast('error', 'Error', 'Failed to clear table.');
           }
      } else {
          setSelectedTableForBill(null);
      }
  };

  // ... (Render Block) ...
  if (!isAuthenticated) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-50">
               <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 p-8 pt-12 animate-in slide-in-from-bottom-8 duration-500 border border-green-50">
                    <div className="text-center mb-10">
                         <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none mb-2">Nep<span className="text-green-600">Nola</span>.</h1>
                         <p className="text-xs font-bold text-gray-400 tracking-[0.3em] uppercase">Admin Access</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide block mb-1">Username</label>
                             <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-transparent outline-none font-bold text-gray-800" placeholder="Enter username" />
                        </div>
                        <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-wide block mb-1">Password</label>
                             <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent outline-none font-bold text-gray-800" placeholder="••••••••" />
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center mt-4 bg-red-50 py-2 rounded-lg">{error}</p>}
                    <button onClick={handleLogin} className="w-full bg-green-600 text-white rounded-2xl py-4 mt-8 font-black shadow-xl shadow-green-200 active:scale-95 transition-transform flex items-center justify-center gap-2">Access Dashboard</button>
               </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-['Plus_Jakarta_Sans']">
       <ToastContainer toasts={toasts} removeToast={removeToast} />
       <Sidebar 
          active={view} 
          onChange={(newView) => {
              if (newView === 'tables') setTableFilter('All');
              setView(newView);
          }} 
          onLogout={handleLogout} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
       />
       
       <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Bar */}
          <div className="hidden lg:flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100">
             <div><h2 className="text-2xl font-black text-gray-900 capitalize">{view}</h2></div>
             <div className="flex items-center gap-4">
                 <div className="text-right"><p className="text-sm font-black text-gray-800">NepNola Admin</p></div>
                 <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-black shadow-lg shadow-green-200">NP</div>
             </div>
          </div>
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center lg:hidden">
              <button onClick={() => setIsSidebarOpen(true)}><svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
              <h2 className="text-xl font-black text-gray-800">Dashboard</h2>
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">A</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 no-scrollbar bg-[#f8fafc] relative">
              {view === 'dashboard' && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                      <DashboardCard title="Occupied" value={tables.filter(t => t.status === 'occupied').length.toString()} sub={`${Math.round((tables.filter(t => t.status === 'occupied').length / tables.length) * 100)}%`} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} bgClass="bg-green-600 shadow-green-200" onClick={() => { setTableFilter('Occupied'); setView('tables'); }} />
                      <DashboardCard title="Free" value={tables.filter(t => t.status === 'free').length.toString()} sub={`${Math.round((tables.filter(t => t.status === 'free').length / tables.length) * 100)}%`} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} bgClass="bg-blue-500 shadow-blue-200" onClick={() => { setTableFilter('Free'); setView('tables'); }} />
                      <DashboardCard title="Active" value={liveOrders.length.toString()} sub="Orders" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} bgClass="bg-orange-500 shadow-orange-200" />
                      <DashboardCard title="Customers" value={customers.length.toString()} sub="Total" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} bgClass="bg-purple-500 shadow-purple-200" onClick={() => setView('customers')} />
                  </div>
                  
                  <div className="bg-white border border-green-500 rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black text-green-700">Recent Orders (Today)</h3>
                          <button className="text-green-700 text-sm font-bold hover:underline flex items-center gap-1">
                              View all <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                          </button>
                      </div>
                      <div className="space-y-4">
                          {liveOrders.filter(o => o.date === new Date().toLocaleDateString() || o.date.includes('AM') || o.date.includes('PM')).length === 0 ? (
                              <div className="text-center py-8 text-gray-400 font-bold">No recent orders found for today</div>
                          ) : (
                              liveOrders
                                .filter(o => o.date === new Date().toLocaleDateString() || o.date.includes('AM') || o.date.includes('PM'))
                                .slice(0, 6)
                                .map(order => (
                                  <OrderRow 
                                    key={order.id} 
                                    order={order} 
                                    vatConfig={vatConfig} 
                                    onNotify={handleNotifyStaff}
                                    onViewBill={(o) => handleViewBill(o, false)}
                                  />
                              ))
                          )}
                      </div>
                  </div>
                </>
              )}

               {view === 'tables' && (
                  <AdminTableManager 
                    tables={tables} 
                    onNavigate={onNavigate} 
                    initialFilter={tableFilter} 
                  />
               )}

               {/* ... Other Views ... */}
               {view === 'customers' && (
                 <AdminCustomerManager 
                   users={customers}
                   onDeleteUser={handleDeleteUser}
                   onUpdateStatus={handleUpdateUserStatus}
                   onSelectUser={setSelectedCustomer}
                 />
               )}

               {view === 'users' && <AdminStaffManager />}
               {view === 'rewards' && <AdminRewardManager onNavigateToCustomers={() => setView('customers')} menuItems={menuItems} onUpdateItem={handleQuickUpdate} />}
               {view === 'payment' && <AdminPaymentManager onViewBill={(order, isHistory) => handleViewBill(order, isHistory)} />}
               {view === 'complains' && <AdminComplainsManager />}
               {view === 'settings' && <AdminSettingsManager />}

               {view === 'menu' && (
                  <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                         <h3 className="text-xl font-black text-green-600">Recently added items</h3>
                         <div className="relative flex gap-2">
                             <button onClick={handleCreateCategoryClick} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                 <span>Create a new category</span>
                                 <svg className={`w-4 h-4 transition-transform duration-300 ${showCategoryOptions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                             </button>
                             <button onClick={() => { setEditingProduct(null); setShowProductModal(true); }} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-red-200 hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg><span>Add Item</span>
                             </button>
                             {showCategoryOptions && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                                   <button onClick={() => openCategoryModal('create')} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2"><span className="bg-indigo-100 text-indigo-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">⚡</span>Instant Add</button>
                                   <div className="h-px bg-gray-100" />
                                   <button onClick={() => { setShowCategoryManager(true); setShowCategoryOptions(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-2"><span className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">👁️</span>View Categories</button>
                                </div>
                             )}
                         </div>
                      </div>
                      <div className="bg-green-600 p-2.5 rounded-2xl flex items-center shadow-lg shadow-green-200/50">
                         <div className="flex-1 px-3"><input type="text" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} placeholder="Search by name or category" className="w-full bg-transparent outline-none text-white placeholder-green-200 font-bold text-sm"/></div>
                         <button className="bg-white/20 p-2 rounded-xl text-white hover:bg-white/30 transition-colors"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
                      </div>
                      
                      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                         <button onClick={() => setMenuFilter('All')} className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${menuFilter === 'All' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-green-200'}`}>All</button>
                         {categories.filter(c => c.name !== 'All').map(cat => (
                             <button key={cat.id} onClick={() => setMenuFilter(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${menuFilter === cat.name ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-green-200'}`}>{cat.name}</button>
                         ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {filteredMenu.map(item => (<MenuCard key={item.id} item={item} onClick={() => setActionItem(item)} />))}
                          {filteredMenu.length === 0 && (
                              <div className="col-span-full py-12 text-center opacity-50">
                                  <p className="font-bold text-gray-400">No items found</p>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {!['dashboard', 'tables', 'menu', 'customers', 'rewards', 'complains', 'settings', 'users', 'payment', 'kitchen'].includes(view) && (
                 <div className="flex flex-col items-center justify-center h-50vh text-gray-400">
                     <svg className="w-20 h-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                     <p className="font-bold text-lg">Module Under Development</p>
                     <p className="text-xs">The {view} section is coming soon.</p>
                 </div>
              )}
          </div>

          {showCategoryManager && (
             <AdminCategoryManager 
                categories={categories}
                menuItems={menuItems}
                onClose={() => setShowCategoryManager(false)}
                onCreate={() => openCategoryModal('create')}
                onEdit={(cat) => openCategoryModal('edit', cat)}
                onDelete={handleDeleteCategory}
             />
          )}
       </div>

       {/* --- MODALS --- */}
       {selectedCustomer && (
          <AdminCustomerDetailModal 
             user={selectedCustomer}
             onClose={() => setSelectedCustomer(null)}
             onDelete={(mobile) => { handleDeleteUser(mobile); setSelectedCustomer(null); }}
             onToggleStatus={(mobile) => { const isActive = selectedCustomer.isActive !== false; handleUpdateUserStatus(mobile, !isActive); }}
             onViewHistory={() => {}}
          />
       )}
       
       {showCategoryModal && (
           <AdminCategoryModal 
               mode={categoryModalMode} 
               initialData={selectedCategory} 
               allCategories={categories}
               onClose={() => setShowCategoryModal(false)} 
               onSave={handleSaveCategory}
           />
       )}
       
       {actionItem && <AdminActionMenu item={actionItem} onClose={() => setActionItem(null)} onEdit={() => handleEditProduct(actionItem)} onDelete={() => handleDeleteProduct(actionItem.id)} onUpdate={handleQuickUpdate} />}
       
       {showProductModal && (
           <AdminProductModal 
              categories={categories}
              initialData={editingProduct} 
              onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
              onSave={handleSaveProduct}
              onAddCategoryClick={() => openCategoryModal('create')}
              allIngredients={ingredients}
              onUpdateIngredients={(newIng) => {
                  if (newIng.deleteId) setIngredients(prev => prev.filter(i => i.id !== newIng.deleteId));
                  else if (newIng.add) setIngredients(prev => [...prev, { id: Date.now().toString(), name: newIng.add.name, image: newIng.add.image }]);
                  else if (newIng.edit) setIngredients(prev => prev.map(i => i.id === newIng.edit!.id ? { ...i, name: newIng.edit!.name, image: newIng.edit!.image } : i));
              }}
           />
       )}

       {/* BILL MODAL FOR DASHBOARD / HISTORY */}
       {selectedTableForBill && (
           <AdminBillModal 
                table={
                    // Ensure the modal always receives fresh live data from 'tables' if occupied, 
                    // otherwise fall back to the snapshot (temp/history order)
                    (selectedTableForBill.status === 'occupied' && !isViewingHistoryBill
                        ? (activeBillTable || selectedTableForBill) // Use the filtered version if available from memo
                        : selectedTableForBill)
                }
                onClose={() => setSelectedTableForBill(null)}
                onClearTable={handleDashboardClearTable}
                onMarkPaid={handleDashboardMarkPaid}
                isReadOnly={isViewingHistoryBill} // NEW PROP
           />
       )}
    </div>
  );
}
