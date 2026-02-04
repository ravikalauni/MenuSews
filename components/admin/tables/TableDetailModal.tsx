
import React, { useState, useEffect, useMemo } from 'react';
import { TableSession, TableGroup } from '../../../types';
import AdminBillModal from './AdminBillModal';
import { useVat } from '../../../hooks/useVat';

interface Props {
  table: TableSession;
  onClose: () => void;
  onEdit: (table: TableSession) => void;
  onDelete: (tableId: string) => void;
  onClear: (groupId?: string) => void; 
  onBook: (guests: number, groupName: string) => void;
  onOpenMenu: (path: string) => void; 
  onMarkPaid?: (groupId?: string) => void;
}

export default function TableDetailModal({ table, onClose, onEdit, onDelete, onClear, onBook, onOpenMenu, onMarkPaid }: Props) {
  const [showBill, setShowBill] = useState(false);
  
  // Default to 1 or higher, ensuring logic doesn't start at 0
  const [guestCount, setGuestCount] = useState(2); 
  const [groupName, setGroupName] = useState('');
  
  // VAT Hook
  const { config: vatConfig } = useVat();

  // Logic for Multi-Group Tabs
  const groups = table.groups && table.groups.length > 0 ? table.groups : [];
  
  const [activeGroupId, setActiveGroupId] = useState(groups.length > 0 ? groups[0].id : 'default');

  // Ensure activeGroupId is valid when table props update
  useEffect(() => {
      // If active group ID no longer exists in updated groups list, reset to first available or default
      if (groups.length > 0) {
          const exists = groups.find(g => g.id === activeGroupId);
          if (!exists) {
              setActiveGroupId(groups[0].id);
          }
      } else {
          setActiveGroupId('default');
      }
  }, [groups, activeGroupId]);

  const activeGroup = groups.find(g => g.id === activeGroupId) || (groups.length > 0 ? groups[0] : null);
  // Fallback to table activeOrders if no specific group logic found (Legacy)
  const activeOrders = activeGroup ? activeGroup.activeOrders : (table.activeOrders || []);

  const isOccupied = table.status === 'occupied';
  const availableSeats = Math.max(0, table.capacity - table.guests);

  const handleEditClick = () => {
      if (isOccupied) {
          if (!window.confirm(`⚠️ Table ${table.tableNumber} is currently OCCUPIED.\n\nChanging details might confuse active customers. Force edit?`)) {
              return;
          }
      }
      onEdit(table);
  };

  const handleDeleteClick = () => {
      if (isOccupied) {
          if (!window.confirm(`⚠️ DANGER: Table ${table.tableNumber} is OCCUPIED!\n\nDeleting it will orphan active orders. Force delete?`)) {
              return;
          }
      } else {
          if (!window.confirm(`Are you sure you want to delete Table ${table.tableNumber}?`)) {
              return;
          }
      }
      onDelete(table.id);
  };

  // --- Payment Validation & Clearing Logic ---
  const validActiveOrders = activeOrders.filter(o => o.status !== 'cancelled');
  const isAllPaid = validActiveOrders.length === 0 || validActiveOrders.every(o => o.paymentStatus === 'paid');
  
  const canClear = isAllPaid;

  const handleClearTable = (skipConfirm = false) => {
      if (!canClear && !skipConfirm) {
          alert("Cannot clear: There are unpaid orders.");
          return;
      }
      
      const message = groups.length > 1 
        ? `Clear ${activeGroup?.name || 'Group'}? This will archive its orders.` 
        : 'Confirm clear table? This will archive the session and free the table.';
        
      if(skipConfirm || window.confirm(message)) {
          onClear(activeGroup?.id);
          setShowBill(false);
      }
  };

  const handleBookTable = () => {
      // Validate inputs
      if (guestCount < 1) {
          alert("Guest count must be at least 1.");
          return;
      }
      onBook(guestCount, groupName);
      setGroupName(''); 
      setGuestCount(2); 
  };

  const openDigitalMenu = () => {
      let targetSession = activeGroupId;
      // If table is free or no active group, generate a new session ID for the menu start
      if (!isOccupied || activeGroupId === 'default' || !activeGroup) {
          targetSession = `sess_${table.tableNumber}_${Date.now()}`;
      }
      // Pass absolute path for routing, but parent handles actual navigation
      onOpenMenu(`/user?table=${table.tableNumber}&location=${encodeURIComponent(table.location || '')}&source=admin&session=${targetSession}`);
  };

  return (
    <>
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="bg-white w-full max-w-lg rounded-[30px] p-6 relative z-10 animate-in zoom-in-95 shadow-2xl flex flex-col max-h-[90vh]">
         
         {/* Header */}
         <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${table.status === 'occupied' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {table.tableNumber.replace('T', '')}
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-800 leading-none">{table.tableNumber}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">
                       {table.location || 'General Area'} • {table.isSpecial ? '⭐ VIP' : 'Standard'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button onClick={handleEditClick} className="w-10 h-10 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center transition-colors active:scale-95">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={handleDeleteClick} className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-colors active:scale-95">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button onClick={onClose} className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors ml-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
         </div>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
            
            {/* Status & Capacity Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className={`p-4 rounded-2xl border-2 ${table.status === 'occupied' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <p className={`text-[10px] uppercase font-black mb-1 ${table.status === 'occupied' ? 'text-red-400' : 'text-green-400'}`}>Current Status</p>
                  <p className={`text-xl font-black capitalize ${table.status === 'occupied' ? 'text-red-600' : 'text-green-600'}`}>{table.status}</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Capacity</p>
                  <div className="flex items-baseline gap-1">
                      <p className="text-xl font-black text-gray-800">{isOccupied ? table.guests : table.capacity}</p>
                      <p className="text-sm font-bold text-gray-400">/ {table.capacity} Pax</p>
                  </div>
               </div>
            </div>
            
            {/* QR Code Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(table.qrCode || table.tableNumber)}`} 
                        alt="QR" 
                        className="w-16 h-16 object-contain"
                    />
                </div>
                <div className="flex-1">
                    <h4 className="font-black text-blue-900 text-sm">Table QR Code</h4>
                    <p className="text-[10px] text-blue-600 font-bold leading-tight mt-1 mb-2">
                        Scan to auto-select {table.tableNumber}
                    </p>
                    <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-700 transition-colors shadow-md active:scale-95">
                        Print QR
                    </button>
                </div>
            </div>

            {/* --- GROUP TABS (If Multi-Group) --- */}
            {groups.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {groups.map((grp, idx) => (
                        <button
                            key={grp.id}
                            onClick={() => setActiveGroupId(grp.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                                activeGroupId === grp.id 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {grp.name || `Group ${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}

            {/* Active Orders / Booking Section */}
            {isOccupied && activeGroup ? (
               activeOrders.length > 0 ? (
                   <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                          <h4 className="font-black text-gray-700 text-sm uppercase tracking-wide">Orders ({activeGroup.name || 'Main'})</h4>
                          <span className="text-xs font-bold text-gray-400">{activeOrders.length} orders</span>
                      </div>
                      <div className="space-y-2">
                         {activeOrders.map(order => {
                            const validItems = order.items.filter(i => i.status !== 'cancelled');
                            const validItemCount = validItems.length;
                            
                            // IF PAID, USE STORED TOTAL
                            if (order.paymentStatus === 'paid') {
                                return (
                                    <div key={order.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm relative overflow-hidden">
                                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500" />
                                       <div className="pl-2">
                                          <p className="font-bold text-sm text-gray-800">Order #{order.id}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                              <span className="text-[10px] font-bold text-gray-500">{validItemCount} items</span>
                                              <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                              <span className="text-[10px] font-bold text-orange-500 uppercase">{order.status}</span>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                            <p className="font-black text-green-600 text-sm">Rs. {order.total}</p>
                                            <span className="text-[8px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Paid</span>
                                       </div>
                                    </div>
                                );
                            }

                            // IF UNPAID, CALCULATE LIVE
                            const currentSubtotal = validItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                            const effectiveSubtotal = Math.max(0, currentSubtotal - (order.discountAmount || 0));
                            
                            const vatRate = vatConfig.enabled ? (vatConfig.rate / 100) : 0;
                            const currentVat = Math.round(effectiveSubtotal * vatRate);
                            const currentTotal = effectiveSubtotal + currentVat;

                            return (
                                <div key={order.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm relative overflow-hidden">
                                   {order.paymentStatus === 'pending_verification' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 animate-pulse" />}
                                   <div className="pl-2">
                                      <p className="font-bold text-sm text-gray-800">Order #{order.id}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] font-bold text-gray-500">{validItemCount} items</span>
                                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                          <span className="text-[10px] font-bold text-orange-500 uppercase">{order.status}</span>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                        <p className="font-black text-green-600 text-sm">Rs. {currentTotal}</p>
                                        {order.paymentStatus === 'pending_verification' && <span className="text-[8px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded">Verify Pay</span>}
                                   </div>
                                </div>
                            );
                         })}
                      </div>
                   </div>
                ) : (
                    <div className="py-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-sm font-bold text-gray-400">Occupied ({activeGroup.guests} guests) but no orders.</p>
                        <button 
                            onClick={openDigitalMenu}
                            className="text-green-600 text-xs font-bold mt-2 hover:underline"
                        >
                            Take Order for this Group
                        </button>
                    </div>
                )
            ) : null}

            {/* Book Additional Seats (Shared Table Logic) */}
            {(!isOccupied || (isOccupied && availableSeats > 0)) && (
                <div className="bg-[#f0fdf4] rounded-2xl p-5 border border-green-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-black text-green-800 text-sm">
                            {isOccupied ? `Add Another Group (${availableSeats} seats left)` : 'Book for Customer'}
                        </h4>
                    </div>
                    
                    {/* New Group Name Input */}
                    <input 
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder={isOccupied ? "e.g. Couple B (Optional)" : "e.g. Sushil (Host) (Optional)"}
                        className="w-full px-4 py-3 rounded-xl border border-green-200 bg-white text-sm font-bold outline-none focus:border-green-500 transition-all placeholder:font-medium placeholder:text-gray-400"
                    />

                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-green-600 uppercase mb-1 block">Guests</label>
                            <div className="flex items-center gap-3 bg-white border border-green-200 rounded-xl px-3 py-2">
                                <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-6 h-6 bg-green-50 text-green-700 rounded-lg font-black">-</button>
                                <span className="flex-1 text-center font-black text-gray-800">{guestCount}</span>
                                <button onClick={() => setGuestCount(Math.min(isOccupied ? availableSeats : table.capacity, guestCount + 1))} className="w-6 h-6 bg-green-50 text-green-700 rounded-lg font-black">+</button>
                            </div>
                        </div>
                        <button 
                            onClick={handleBookTable}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-green-200 active:scale-95 transition-all hover:bg-green-700 h-[42px] flex items-center"
                        >
                            {isOccupied ? 'Add Group' : 'Book & Order'}
                        </button>
                    </div>
                </div>
            )}
         </div>
            
         {/* Footer Actions */}
         <div className="flex gap-3 pt-6 shrink-0 border-t border-gray-50 mt-2">
            {isOccupied ? (
                <>
                    <button 
                        onClick={() => handleClearTable(false)}
                        disabled={!canClear}
                        className={`flex-1 py-4 font-black text-sm rounded-2xl transition-colors
                            ${canClear 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'}
                        `}
                    >
                        {groups.length > 1 ? `Clear ${activeGroup?.name || 'Group'}` : 'Clear Table'}
                    </button>
                    
                    <button 
                        onClick={() => setShowBill(true)}
                        className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-600 font-black text-sm rounded-2xl hover:bg-gray-50 transition-colors"
                    >
                        Bill
                    </button>

                    <button 
                        onClick={openDigitalMenu}
                        className="flex-[1.5] py-4 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Menu
                    </button>
                </>
            ) : (
                <button 
                    onClick={openDigitalMenu}
                    className="w-full py-4 bg-green-600 text-white font-black text-sm rounded-2xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Start Order (Menu)
                </button>
            )}
         </div>

      </div>
    </div>

    {/* Bill Modal */}
    {showBill && (
        <AdminBillModal 
            table={{
                ...table,
                activeOrders: activeOrders 
            }} 
            onClose={() => setShowBill(false)} 
            onClearTable={() => handleClearTable(true)} 
            // FIXED: Pass activeGroupId to handleMarkTablePaid
            onMarkPaid={() => onMarkPaid && onMarkPaid(activeGroup?.id)} 
        />
    )}
    </>
  );
}
