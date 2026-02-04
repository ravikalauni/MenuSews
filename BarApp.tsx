
import React, { useState, useEffect, useMemo } from 'react';
import { OrderHistoryItem, OrderStatus, CartItem } from './types';
import BarSidebar from './components/bar/BarSidebar';
import BarTicketCard from './components/bar/BarTicketCard';
import BarHistory from './components/bar/BarHistory';

export default function BarApp({ onHome }: { onHome: () => void }) {
  const [activeView, setActiveView] = useState('current');
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // --- SYNC WITH LOCALSTORAGE ---
  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem('active_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (JSON.stringify(parsed) !== JSON.stringify(orders)) {
             setOrders(parsed);
          }
        }
      } catch (e) {}
    };
    sync();
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const updateOrder = (updatedOrders: OrderHistoryItem[]) => {
      setOrders(updatedOrders);
      localStorage.setItem('active_orders', JSON.stringify(updatedOrders));
      setLastUpdate(Date.now());
  };

  const handleUpdateItemStatus = (orderId: string, itemIndex: number, newStatus: OrderStatus) => {
      const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
              const newItems = [...o.items];
              const item = newItems[itemIndex];
              
              newItems[itemIndex] = { ...item, status: newStatus };
              
              return { ...o, items: newItems };
          }
          return o;
      });
      updateOrder(updatedOrders);
  };

  // NEW: Batch update for all bar items in an order
  const handleBatchUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
      const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
              const newItems = o.items.map(item => {
                  // 1. Skip Kitchen Items (requiresPreparation === true)
                  if (item.requiresPreparation) return item;

                  // 2. Skip already finalized items (Served/Completed)
                  if (['served', 'completed'].includes(item.status || '')) return item;

                  // 3. Logic for transitions
                  // Cancel: Can cancel anything not served
                  if (newStatus === 'cancelled') {
                      return { ...item, status: 'cancelled' as OrderStatus };
                  }

                  // Queue: Only Pending -> Queue
                  if (newStatus === 'queue' && item.status === 'pending') {
                      return { ...item, status: 'queue' as OrderStatus };
                  }

                  // Ready: Pending/Queue/Cooking -> Ready
                  if (newStatus === 'ready' && ['pending', 'queue', 'cooking'].includes(item.status || '')) {
                      return { ...item, status: 'ready' as OrderStatus };
                  }

                  return item;
              });

              return { ...o, items: newItems };
          }
          return o;
      });
      updateOrder(updatedOrders);
  };

  // Clears Bar items (marks them served OR archived)
  const handleClearBarItems = (orderId: string) => {
      const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
              // Only mark BAR items. Leave Kitchen items alone.
              const newItems = o.items.map(item => {
                  if (!item.requiresPreparation) {
                      // Case 1: Ready -> Served & Archived
                      if (item.status === 'ready') {
                          return { ...item, status: 'served' as OrderStatus, isBarArchived: true };
                      }
                      // Case 2: Cancelled -> Keep Status but Archive (hide from active)
                      if (item.status === 'cancelled') {
                          return { ...item, isBarArchived: true };
                      }
                      // Case 3: Already served/completed -> Ensure archived flag
                      if (['served', 'completed'].includes(item.status || '')) {
                          return { ...item, isBarArchived: true };
                      }
                  }
                  return item;
              });
              
              // Check if ALL items (including kitchen) are truly DONE.
              // A kitchen item is done if 'served', 'completed', or 'cancelled'.
              // If a kitchen item is 'ready', it is NOT done yet (needs to be served by kitchen).
              const allItemsDone = newItems.every(i => 
                  ['served', 'completed', 'cancelled'].includes(i.status || '')
              );
              
              // Only complete order if everything is truly done.
              const status = allItemsDone ? 'completed' : o.status;

              return { 
                  ...o, 
                  items: newItems,
                  status
              };
          }
          return o;
      });
      updateOrder(updatedOrders);
  };

  // --- FILTER LOGIC ---
  const activeBarOrders = useMemo(() => {
      return orders.map(order => {
          // If the Order itself is completed/cancelled/served, remove from Active View
          if (['completed', 'cancelled', 'served'].includes(order.status)) return null;

          // Get ACTIVE Bar items. 
          // We include cancelled ONLY if they haven't been archived yet (so staff can undo)
          const barItems = order.items.filter(i => 
              !i.requiresPreparation && 
              !i.isBarArchived && // Hide if explicitly archived/cleared
              i.status !== 'served' && 
              i.status !== 'completed'
          );
          
          if (barItems.length === 0) return null;

          return {
              ...order,
              items: barItems // Override items with filtered list for display
          };
      }).filter(Boolean) as OrderHistoryItem[];
  }, [orders]);

  const pendingCount = activeBarOrders.reduce((acc, o) => acc + o.items.filter(i => i.status === 'pending').length, 0);

  return (
    <div className="flex h-screen bg-[#e2e8f0] font-['Plus_Jakarta_Sans'] overflow-hidden text-gray-800">
        
        <BarSidebar 
           activeView={activeView}
           onViewChange={setActiveView}
           onLogout={onHome}
           isOpen={sidebarOpen}
           onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* Mobile Header */}
            <div className="bg-white border-b border-gray-200 p-4 lg:hidden shrink-0 flex justify-between items-center">
               <div className="flex items-center gap-3">
                   <button onClick={() => setSidebarOpen(true)} className="text-gray-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                   </button>
                   <h1 className="text-lg font-black text-gray-800">Bar Display</h1>
               </div>
               <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                   {pendingCount} Pending
               </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex px-8 py-6 justify-between items-center border-b border-gray-200 bg-[#e2e8f0]">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">{activeView === 'current' ? 'Incoming Orders' : 'Bar History'}</h2>
                    <p className="text-gray-500 text-sm font-bold mt-1">{activeView === 'current' ? 'Real-time drinks feed' : 'Past sales & performance'}</p>
                </div>
                {activeView === 'current' && (
                    <div className="flex gap-4">
                        <div className="bg-white border border-gray-200 px-6 py-3 rounded-2xl flex flex-col items-center shadow-sm">
                            <span className="text-2xl font-black text-orange-500 leading-none">{pendingCount}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Queued</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar">
                
                {activeView === 'current' && (
                    activeBarOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-30 text-gray-600">
                            <span className="text-8xl mb-6 grayscale">🍸</span>
                            <h3 className="text-3xl font-black text-gray-400">All Caught Up</h3>
                            <p className="text-gray-400 mt-2 font-bold">Waiting for new orders...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeBarOrders.map(order => (
                                <div key={order.id} className="h-full">
                                    <BarTicketCard 
                                        order={orders.find(o => o.id === order.id)!} // Pass full original order for ID reference
                                        items={order.items} // Pass filtered active items
                                        onUpdateItemStatus={handleUpdateItemStatus}
                                        onBatchUpdateStatus={handleBatchUpdateStatus}
                                        onClearOrder={handleClearBarItems}
                                    />
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeView === 'completed' && (
                    <div className="max-w-4xl mx-auto">
                        <BarHistory orders={orders} />
                    </div>
                )}

            </div>
        </div>
    </div>
  );
}
