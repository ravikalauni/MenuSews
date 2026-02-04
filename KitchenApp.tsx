
import React, { useState, useEffect, useMemo } from 'react';
import { OrderHistoryItem, OrderStatus, MenuItem, ItemCustomization, CartItem } from './types';
import { MENU_ITEMS } from './constants';
import KitchenSidebar from './components/kitchen/KitchenSidebar';
import TicketCard from './components/kitchen/TicketCard';
import StockManagerModal from './components/kitchen/StockManagerModal';
import KitchenStats from './components/kitchen/KitchenStats';
import KitchenHistory from './components/kitchen/KitchenHistory';
import OrderDetailModal from './components/kitchen/OrderDetailModal';
import AggregatedItemCard from './components/kitchen/AggregatedItemCard';

// --- TYPES & MOCKS ---
type ViewMode = 'current' | 'similar' | 'history';
type StatusFilter = 'All' | 'Pending' | 'Queue' | 'Cooking' | 'Ready' | 'Served' | 'Cancelled';

const generateDemoOrders = (): OrderHistoryItem[] => [
  {
    id: 'DEMO-101',
    date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    total: 1200,
    earnedPoints: 10,
    pointsUsed: 0,
    discountAmount: 0,
    status: 'pending',
    tableNumber: '12',
    items: [
      { ...MENU_ITEMS[0], quantity: 1, status: 'pending', startTime: Date.now() }, // Veg Momo
      { ...MENU_ITEMS[0], quantity: 2, status: 'pending', startTime: Date.now() }, // Veg Momo
      { ...MENU_ITEMS[0], quantity: 1, status: 'pending', startTime: Date.now(), customization: { portion: 'Full', spiceLevel: 50, isVeg: true, excludedIngredients: [] } }, 
      { ...MENU_ITEMS[6], quantity: 2, status: 'pending', startTime: Date.now() }, // Alcohol (Bar Item)
    ]
  },
  {
    id: 'DEMO-102',
    date: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
    total: 850,
    earnedPoints: 5,
    pointsUsed: 0,
    discountAmount: 0,
    status: 'cooking',
    tableNumber: '5',
    items: [
      { ...MENU_ITEMS[1], quantity: 1, status: 'ready', startTime: Date.now() - 1000 * 60 * 12 },
      { ...MENU_ITEMS[7], quantity: 1, status: 'cooking', startTime: Date.now() - 1000 * 60 * 12 },
    ]
  },
  {
    id: 'DEMO-103',
    date: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
    total: 400,
    earnedPoints: 2,
    pointsUsed: 0,
    discountAmount: 0,
    status: 'queue',
    tableNumber: '8',
    items: [
      { ...MENU_ITEMS[0], quantity: 3, status: 'queue', startTime: Date.now() - 1000 * 60 * 5 }, // Veg Momo
    ]
  }
];

export default function KitchenApp({ onHome }: { onHome: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // --- DATA SYNC ---
  useEffect(() => {
    const sync = () => {
      try {
        const stored = localStorage.getItem('active_orders');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.length === 0 && orders.length === 0) {
             const demos = generateDemoOrders();
             localStorage.setItem('active_orders', JSON.stringify(demos));
             setOrders(demos);
          } else {
             setOrders(parsed);
          }
        } else {
           const demos = generateDemoOrders();
           localStorage.setItem('active_orders', JSON.stringify(demos));
           setOrders(demos);
        }
      } catch (e) {}
    };

    sync();
    const interval = setInterval(sync, 2000);
    return () => clearInterval(interval);
  }, [lastUpdate]); 

  // Helper to filter kitchen items for display
  const filterKitchenItems = (order: OrderHistoryItem) => {
      const kItems = order.items.filter(i => i.requiresPreparation !== false);
      return { ...order, items: kItems };
  };

  // Helper to map a Filtered Display Index (what user clicks) to Raw Data Index
  const getRawIndex = (orderId: string, filteredIndex: number): number => {
      const order = orders.find(o => o.id === orderId);
      if (!order) return -1;
      
      // Re-create the filtered view the user is looking at
      const kitchenItems = order.items.filter(i => i.requiresPreparation !== false);
      const targetItem = kitchenItems[filteredIndex];
      
      if (!targetItem) return -1;
      
      // Find the index of this exact object reference in the main list
      return order.items.indexOf(targetItem);
  };

  const saveOrders = (newOrders: OrderHistoryItem[]) => {
      setOrders(newOrders);
      if (selectedOrder) {
          const updatedSelected = newOrders.find(o => o.id === selectedOrder.id);
          if (updatedSelected) {
              // Ensure we only show kitchen items in the modal, even after update
              setSelectedOrder(filterKitchenItems(updatedSelected));
          }
          else setSelectedOrder(null);
      }
      try {
        localStorage.setItem('active_orders', JSON.stringify(newOrders));
        setLastUpdate(Date.now());
    } catch(e) {}
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    // If completing (Served/Clear), we close the modal immediately
    if (newStatus === 'completed') {
        setSelectedOrder(null);
    }

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        
        // 1. Update ONLY kitchen items
        let targetItemStatus = newStatus;
        if (newStatus === 'completed') {
            targetItemStatus = 'served'; // Mark kitchen items as served/done internally
        } else if (newStatus === 'pending' && o.status === 'cancelled') {
            targetItemStatus = 'pending'; // Recover
        }

        const updatedItems: CartItem[] = o.items.map(i => {
            if (i.requiresPreparation !== false) {
               // If item is already cancelled, DO NOT change it unless we are recovering the whole order
               if (i.status === 'cancelled' && newStatus !== 'pending') return i;

               return {
                   ...i, 
                   status: targetItemStatus,
                   startTime: (newStatus === 'cooking' && !i.startTime) ? Date.now() : i.startTime
               };
            }
            return i;
        });
        
        // 2. Logic for GLOBAL Order Status and Archiving
        let finalOrderStatus = o.status;
        let isKitchenArchived = o.isKitchenArchived;

        // If Kitchen clicks "Clear Ticket" (completed)
        if (newStatus === 'completed') {
            // ALWAYS Archive for Kitchen view
            isKitchenArchived = true;

            // Check if Bar is also done. Only then mark global order as 'completed'
            const barItems = updatedItems.filter(i => i.requiresPreparation === false);
            const barDone = barItems.length === 0 || barItems.every(i => ['served', 'completed', 'cancelled'].includes(i.status || ''));
            const kitchenDone = updatedItems.filter(i => i.requiresPreparation !== false).every(i => ['served', 'completed', 'cancelled'].includes(i.status || ''));

            if (barDone && kitchenDone) {
                finalOrderStatus = 'completed';
            } else {
                // If Bar is not done, we DO NOT complete the order globally. 
                // We keep it as 'ready' (or current) so Bar App still sees it.
                // Kitchen App will hide it because of `isKitchenArchived = true`
                finalOrderStatus = o.status === 'ready' ? 'ready' : o.status;
            }
        } 
        else if (newStatus === 'cancelled') {
             // If cancelling whole order
             finalOrderStatus = 'cancelled';
        }
        else {
             // For pending, cooking, ready, etc.
             finalOrderStatus = newStatus;
        }

        const updatedOrder: OrderHistoryItem = { 
            ...o, 
            status: finalOrderStatus, 
            items: updatedItems,
            startTime: (newStatus === 'cooking' && !o.items[0]?.startTime) ? Date.now() : (o.items[0]?.startTime || Date.now()),
            isKitchenArchived: isKitchenArchived
        };
        return updatedOrder;
      }
      return o;
    });

    saveOrders(updatedOrders);
  };

  const handleArchiveOrder = (orderId: string) => {
      const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
              return { ...o, isKitchenArchived: true };
          }
          return o;
      });
      saveOrders(updatedOrders);
  };

  const handleBatchItemToggle = (actions: { orderId: string, itemIndex: number }[]) => {
      const updatedOrders = [...orders];
      
      actions.forEach(({ orderId, itemIndex }) => {
          const orderIdx = updatedOrders.findIndex(o => o.id === orderId);
          if (orderIdx > -1) {
              const order = { ...updatedOrders[orderIdx] };
              const items = [...order.items];
              
              if (items[itemIndex]) {
                  const currentItem = items[itemIndex];
                  // Toggle Logic: Pending/Queue -> Cooking -> Ready -> Cooking (Loop or specific flow)
                  
                  let newStatus: OrderStatus = 'cooking';
                  if (currentItem.status === 'cooking') newStatus = 'ready';
                  else if (currentItem.status === 'ready') newStatus = 'cooking';
                  else if (currentItem.status === 'pending' || currentItem.status === 'queue') newStatus = 'cooking';

                  items[itemIndex] = { ...currentItem, status: newStatus };
                  
                  // Update Order Status based on KITCHEN items only
                  const kitchenItems = items.filter(i => i.requiresPreparation !== false);
                  
                  const allReady = kitchenItems.every(i => i.status === 'ready' || i.status === 'served' || i.status === 'completed' || i.status === 'cancelled');
                  const anyCooking = kitchenItems.some(i => i.status === 'cooking');
                  
                  let orderStatus = order.status;
                  if (allReady && orderStatus !== 'completed') orderStatus = 'ready';
                  else if (anyCooking) orderStatus = 'cooking';

                  order.items = items;
                  order.status = orderStatus;
                  updatedOrders[orderIdx] = order;
              }
          }
      });
      
      saveOrders(updatedOrders);
  };

  // Wrapper for Single Item Toggle coming from UI (Filtered Index)
  const handleSingleItemToggle = (orderId: string, filteredIndex: number) => {
      const rawIndex = getRawIndex(orderId, filteredIndex);
      if (rawIndex !== -1) {
          handleBatchItemToggle([{ orderId, itemIndex: rawIndex }]);
      }
  };

  // Wrapper for Single Item Cancel coming from UI (Filtered Index)
  const handleSingleItemCancel = (orderId: string, filteredIndex: number) => {
      const rawIndex = getRawIndex(orderId, filteredIndex);
      if (rawIndex === -1) return;

      const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
              const newItems = [...o.items];
              const item = newItems[rawIndex];
              newItems[rawIndex] = { ...item, status: 'cancelled' };
              
              // Check if all kitchen items are now cancelled
              const kitchenItems = newItems.filter(i => i.requiresPreparation !== false);
              const allKitchenCancelled = kitchenItems.every(i => i.status === 'cancelled');
              
              // If all kitchen items cancelled, update global status to cancelled so "Recover" option appears
              let newStatus = o.status;
              if (allKitchenCancelled) {
                  // Only set global cancelled if no active bar items interfering (simplified: force cancel for kitchen logic)
                  newStatus = 'cancelled';
              }

              return { 
                  ...o, 
                  items: newItems,
                  status: newStatus
              };
          }
          return o;
      });
      saveOrders(updatedOrders);
  };

  // Wrapper for Single Item Recover coming from UI (Filtered Index)
  const handleSingleItemRecover = (orderId: string, filteredIndex: number) => {
      const rawIndex = getRawIndex(orderId, filteredIndex);
      if (rawIndex === -1) return;

      const updatedOrders = orders.map(o => {
          if (o.id === orderId) {
              const newItems = [...o.items];
              const item = newItems[rawIndex];
              newItems[rawIndex] = { ...item, status: 'pending' };
              
              const activeKitchenItems = newItems.filter(i => i.requiresPreparation !== false && i.status !== 'cancelled');
              
              let newOrderStatus: OrderStatus = 'pending';
              
              if (activeKitchenItems.length === 0) {
                  newOrderStatus = 'cancelled';
              } else {
                  const allDone = activeKitchenItems.every(i => ['ready', 'served', 'completed'].includes(i.status));
                  if (allDone) {
                      newOrderStatus = 'ready';
                  } else {
                      const workStarted = activeKitchenItems.some(i => ['cooking', 'ready'].includes(i.status));
                      newOrderStatus = workStarted ? 'cooking' : 'pending'; 
                  }
              }

              return { ...o, items: newItems, status: newOrderStatus };
          }
          return o;
      });
      saveOrders(updatedOrders);
  };

  // --- FILTERED VIEWS ---
  // FILTER KITCHEN ITEMS ONLY: requiresPreparation !== false (default true)
  const kitchenOrders = useMemo(() => {
      return orders.map(order => {
          // Filter items
          const kItems = order.items.filter(i => i.requiresPreparation !== false); // Default items are kitchen
          if (kItems.length === 0) return null; // Skip order if no kitchen items
          return { ...order, items: kItems };
      }).filter(Boolean) as OrderHistoryItem[];
  }, [orders]);

  const activeOrders = useMemo(() => {
      // Filter out orders that are explicitly archived by the kitchen staff.
      // We show 'completed' (served) and 'cancelled' orders until they are archived.
      return kitchenOrders.filter(o => {
          if (o.isKitchenArchived) return false;
          
          if (o.status === 'completed') return false; // Auto-hide served orders (simplifies flow for completed)

          // Show everything else (including cancelled) so staff can see it and archive manually
          return true;
      });
  }, [kitchenOrders]);

  const filteredActiveOrders = useMemo(() => {
      if (statusFilter === 'All') return activeOrders; // Show cancelled here too
      if (statusFilter === 'Cancelled') return activeOrders.filter(o => o.status === 'cancelled');
      return activeOrders.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
  }, [activeOrders, statusFilter]);

  const historyOrders = useMemo(() => {
      // Show orders where ALL kitchen items are final (Served/Completed/Cancelled)
      return orders.filter(o => {
          const kitchenItems = o.items.filter(i => i.requiresPreparation !== false);
          if (kitchenItems.length === 0) return false;

          const allKitchenDone = kitchenItems.every(i => 
              ['served', 'completed', 'cancelled'].includes(i.status || '')
          );
          
          return allKitchenDone;
      }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders]);

  // --- SMART AGGREGATION LOGIC (Kitchen Only) ---
  const smartAggregatedItems = useMemo(() => {
        const groupsByName: Record<string, { 
            name: string, 
            totalQuantity: number, 
            variants: Record<string, {
                customization?: ItemCustomization,
                quantity: number,
                tickets: Record<string, { 
                    orderId: string, 
                    table: string, 
                    status: string, 
                    totalQty: number,
                    startTime: number,
                    itemIndices: number[] 
                }>
            }> 
        }> = {};
        
        // Iterate RAW ORDERS to get correct indices
        orders.forEach(order => {
            if (['pending', 'queue', 'cooking', 'ready', 'accepted'].includes(order.status)) {
                order.items.forEach((item, rawIdx) => {
                    // Only process KITCHEN Items
                    if (item.requiresPreparation === false) return;

                    if (item.status !== 'cancelled' && item.status !== 'completed' && item.status !== 'served') {
                        
                        // Level 1: Item Name
                        if (!groupsByName[item.name]) {
                            groupsByName[item.name] = { 
                                name: item.name, 
                                totalQuantity: 0, 
                                variants: {} 
                            };
                        }
                        groupsByName[item.name].totalQuantity += item.quantity;

                        // Level 2: Customization Variant
                        const custKey = item.customization ? JSON.stringify(item.customization) : 'standard';
                        
                        if (!groupsByName[item.name].variants[custKey]) {
                            groupsByName[item.name].variants[custKey] = {
                                customization: item.customization,
                                quantity: 0,
                                tickets: {}
                            };
                        }
                        const variant = groupsByName[item.name].variants[custKey];
                        variant.quantity += item.quantity;

                        // Level 3: Merge Tickets
                        const ticketKey = `${order.id}-${item.status || 'pending'}`;
                        
                        if (!variant.tickets[ticketKey]) {
                            variant.tickets[ticketKey] = {
                                orderId: order.id,
                                table: order.tableNumber || '?',
                                status: item.status || 'pending',
                                totalQty: 0,
                                startTime: item.startTime || Date.now(),
                                itemIndices: []
                            };
                        }
                        
                        variant.tickets[ticketKey].totalQty += item.quantity;
                        variant.tickets[ticketKey].itemIndices.push(rawIdx); // Use RAW Index
                        if (item.startTime && item.startTime < variant.tickets[ticketKey].startTime) {
                            variant.tickets[ticketKey].startTime = item.startTime;
                        }
                    }
                });
            }
        });

        // Convert Maps to Arrays
        return Object.values(groupsByName)
            .map(group => ({
                name: group.name,
                totalQuantity: group.totalQuantity,
                variants: Object.values(group.variants).map(v => ({
                    customization: v.customization,
                    quantity: v.quantity,
                    tickets: Object.values(v.tickets).sort((a, b) => a.startTime - b.startTime)
                }))
            }))
            .filter(group => {
                if (group.variants.length > 1) return true;
                if (group.variants.length === 1) {
                    const variant = group.variants[0];
                    if (variant.tickets.length > 1) return true;
                }
                return false;
            });
  }, [orders]); // Depend on RAW orders

  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const cookingCount = activeOrders.filter(o => o.status === 'cooking').length;

  return (
    <div className="flex h-screen bg-[#e2e8f0] font-['Plus_Jakarta_Sans'] overflow-hidden">
        
        <KitchenSidebar 
           activeView={viewMode}
           onViewChange={setViewMode}
           onLogout={onHome}
           isOpen={sidebarOpen}
           onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* Mobile Header: Enhanced with Stats */}
            <div className="bg-white border-b border-gray-200 p-3 lg:hidden shrink-0 flex items-center gap-3 overflow-x-auto no-scrollbar">
               <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-1 text-gray-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
               </button>
               
               {/* Quick Stats Pills */}
               <div className="flex gap-2 flex-1 items-center">
                   <div className="bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px] shrink-0">
                       <span className="text-lg font-black text-blue-600 leading-none">{pendingCount}</span>
                       <span className="text-[9px] font-bold text-blue-400 uppercase">Pending</span>
                   </div>
                   <div className="bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px] shrink-0">
                       <span className="text-lg font-black text-orange-600 leading-none">{cookingCount}</span>
                       <span className="text-[9px] font-bold text-orange-400 uppercase">Cooking</span>
                   </div>
                   <div className="bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px] shrink-0">
                       <span className="text-lg font-black text-green-600 leading-none">14m</span>
                       <span className="text-[9px] font-bold text-green-400 uppercase">Avg Time</span>
                   </div>
                   <button onClick={() => setShowStockModal(true)} className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg flex flex-col items-center min-w-[70px] shrink-0 active:scale-95 transition-all">
                        <span className="text-lg leading-none">🚫</span>
                        <span className="text-[9px] font-bold text-red-400 uppercase">86 Item</span>
                   </button>
               </div>
            </div>

            {/* Sub-Navigation (Tabs) */}
            {viewMode === 'current' && (
                <div className="px-4 md:px-6 pt-4 md:pt-6 pb-2 shrink-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            {(['All', 'Pending', 'Queue', 'Cooking', 'Ready', 'Served', 'Cancelled'] as StatusFilter[]).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`
                                        px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap shadow-sm
                                        ${statusFilter === filter 
                                            ? 'bg-gray-800 text-white shadow-gray-400' 
                                            : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}
                                    `}
                                >
                                    {filter}
                                    <span className={`ml-2 text-xs py-0.5 px-1.5 rounded-md ${statusFilter === filter ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {filter === 'All' 
                                            ? activeOrders.length // Include cancelled
                                            : activeOrders.filter(o => o.status.toLowerCase() === filter.toLowerCase()).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        <div className="hidden lg:flex gap-3">
                             <KitchenStats 
                                pendingCount={pendingCount}
                                cookingCount={cookingCount}
                                avgTime="14m"
                                onOpenStock={() => setShowStockModal(true)}
                             />
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 pb-20">
               
               {/* VIEW: CURRENT ORDERS */}
               {viewMode === 'current' && (
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                       {filteredActiveOrders.length === 0 ? (
                           <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-40">
                               <span className="text-7xl mb-4 grayscale">🍽️</span>
                               <h3 className="text-2xl font-black text-gray-400">No {statusFilter !== 'All' ? statusFilter : 'active'} orders</h3>
                               <p className="text-sm text-gray-400 font-medium">Time to prep!</p>
                           </div>
                       ) : (
                           filteredActiveOrders.map(order => (
                               <div key={order.id} className="w-full">
                                   <TicketCard 
                                      order={order} 
                                      onClick={() => setSelectedOrder(order)} 
                                      onUpdateStatus={handleUpdateStatus}
                                      onItemCancel={handleSingleItemCancel}
                                      onItemToggle={handleSingleItemToggle}
                                      onArchive={() => handleArchiveOrder(order.id)}
                                   />
                               </div>
                           ))
                       )}
                   </div>
               )}

               {/* VIEW: SIMILAR (AGGREGATED) */}
               {viewMode === 'similar' && (
                   <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {smartAggregatedItems.map((group, i) => (
                           <AggregatedItemCard 
                               key={i}
                               group={group}
                               onBatchAction={handleBatchItemToggle}
                           />
                        ))}
                        {smartAggregatedItems.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-40">
                                <span className="text-6xl mb-4 grayscale">⚡</span>
                                <h3 className="text-2xl font-black text-gray-400">No similarities found</h3>
                                <p className="text-sm text-gray-400 font-medium">Single orders appear in "Current Orders".</p>
                           </div>
                        )}
                   </div>
               )}

               {viewMode === 'history' && (
                   <div className="max-w-4xl mx-auto">
                       <KitchenHistory orders={historyOrders} />
                   </div>
               )}

            </div>
        </div>

        {selectedOrder && (
            <OrderDetailModal 
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={handleUpdateStatus}
                onItemToggle={handleSingleItemToggle}
                onItemCancel={handleSingleItemCancel}
                onItemRecover={handleSingleItemRecover}
            />
        )}

        {showStockModal && <StockManagerModal onClose={() => setShowStockModal(false)} />}
    </div>
  );
}
