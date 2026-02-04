
import React, { useState, useEffect } from 'react';
import { CartItem, MenuItem, OrderHistoryItem, OrderStatus } from '../types';
import RewardsModal from './RewardsModal';
import ComplaintModal from './ComplaintModal';
import { ToastType } from './Toast';
import { useVat } from '../hooks/useVat';

interface Props {
  cart: CartItem[];
  activeOrders: OrderHistoryItem[];
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
  onDelete: (id: string) => void;
  onPlaceOrder: () => void;
  onPayBill: () => void;
  onCancelOrder: (id: string) => void;
  total: number;
  userPoints: number;
  redeemedPoints: number;
  setRedeemedPoints: (points: number) => void;
  onBack: () => void;
  addToast: (type: ToastType, title: string, message: string) => void;
  tableNumber?: string;
}

// Sub-component for individual item countdown
const ItemStatusRow: React.FC<{ item: CartItem; onComplain: (item: CartItem) => void }> = ({ item, onComplain }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!item.targetTime || !item.startTime || item.status === 'ready' || item.status === 'cancelled') {
            setTimeLeft(0);
            setProgress(100);
            return;
        }

        const tick = () => {
            const now = Date.now();
            const remaining = Math.max(0, item.targetTime! - now);
            const totalDuration = item.targetTime! - item.startTime!;
            const elapsed = totalDuration - remaining;
            const pct = Math.min(100, (elapsed / totalDuration) * 100);

            setTimeLeft(remaining);
            setProgress(pct);
        };

        tick(); // Immediate update
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [item.targetTime, item.startTime, item.status]);

    const formatTime = (ms: number) => {
        if (ms <= 0) return '0s';
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        if (mins > 0) return `${mins}m ${secs}s`;
        return `${secs}s`;
    };

    let statusConfig = {
        label: 'Waiting',
        color: 'text-gray-500',
        bg: 'bg-gray-100',
        icon: '⏳'
    };

    if (item.status === 'pending') {
        statusConfig = { label: 'Sending...', color: 'text-gray-500', bg: 'bg-gray-100', icon: '📡' };
    } else if (item.status === 'queue') {
        statusConfig = { label: 'In Queue', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '👨‍🍳' };
    } else if (item.status === 'cooking') {
        statusConfig = { label: 'Cooking', color: 'text-orange-600', bg: 'bg-orange-50', icon: '🔥' };
    } else if (item.status === 'ready') {
        statusConfig = { label: 'Ready', color: 'text-green-600', bg: 'bg-green-50', icon: '✅' };
    } else if (item.status === 'served' || item.status === 'completed') {
        statusConfig = { label: 'Delivered', color: 'text-gray-600', bg: 'bg-gray-200', icon: '🍽️' };
    } else if (item.status === 'cancelled') {
        statusConfig = { label: 'Unavailable', color: 'text-red-600', bg: 'bg-red-50', icon: '🚫' };
    }

    return (
        <div className={`flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 relative overflow-hidden ${item.status === 'cancelled' ? 'opacity-70' : ''}`}>
             {/* Background Progress Bar for Cooking */}
             {item.status === 'cooking' && (
                 <div className="absolute bottom-0 left-0 h-0.5 bg-orange-100 w-full">
                     <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                 </div>
             )}

             <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 relative mt-0.5">
                <img src={item.image} className={`w-full h-full object-cover ${item.status === 'cancelled' ? 'grayscale' : ''}`} />
                {item.quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 font-bold">x{item.quantity}</div>
                )}
             </div>
             
             <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                   <p className={`text-xs font-bold truncate pr-2 leading-snug ${item.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.name}</p>
                   <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ${statusConfig.bg} ${statusConfig.color}`}>
                       <span>{statusConfig.icon}</span>
                       <span>{statusConfig.label}</span>
                   </div>
                </div>
                
                {/* Compact Row for Details & Action */}
                <div className="flex flex-col min-h-[16px]">
                    {item.customization ? (
                       <p className="text-[9px] text-gray-400 truncate max-w-[120px] leading-tight mb-0.5">{item.customization.portion}</p>
                    ) : null}
                    
                    {/* Dynamic Zone: Either Timer OR Report Button */}
                    {item.status !== 'ready' && item.status !== 'cancelled' && item.status !== 'served' && item.status !== 'completed' ? (
                        <p className={`text-[10px] font-mono font-bold mt-0.5 ${item.status === 'cooking' ? 'text-orange-500' : 'text-gray-400'}`}>
                          {item.status === 'queue' ? 'Wait: ' : 'Est: '}
                          {formatTime(timeLeft)}
                        </p>
                    ) : (
                        (item.status === 'ready' || item.status === 'served' || item.status === 'completed') && (
                            <button 
                                onClick={() => onComplain(item)}
                                className="text-[9px] font-bold text-red-500 hover:text-red-600 bg-transparent px-0 py-0 flex items-center gap-1 transition-colors active:scale-95 mt-0.5 self-start"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Report Issue
                            </button>
                        )
                    )}
                    {item.status === 'cancelled' && (
                        <p className="text-[9px] font-bold text-red-400 mt-0.5">Contact staff for details</p>
                    )}
                </div>
             </div>
        </div>
    );
};

const OrderView: React.FC<Props> = ({ 
  cart, activeOrders, onAdd, onRemove, onDelete, onPlaceOrder, onPayBill, onCancelOrder,
  total, userPoints, redeemedPoints, setRedeemedPoints, onBack, addToast, tableNumber
}) => {
  // CRITICAL FIX: Keep showing orders that are completed/served IF they are NOT PAID yet.
  // This allows customers to see their bill/status before payment.
  const displayableOrders = activeOrders.filter(o => {
      if (!o) return false;
      const isFinished = o.status === 'completed' || o.status === 'served';
      const isPaid = o.paymentStatus === 'paid';
      
      // If it's paid AND finished, hide it (archived).
      // Otherwise (unpaid finished, or still active), show it.
      return !(isFinished && isPaid);
  });

  const [activeTab, setActiveTab] = useState<'cart' | 'status'>(cart.length > 0 ? 'cart' : (displayableOrders.length > 0 ? 'status' : 'cart'));
  const [showRewards, setShowRewards] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [complaintItem, setComplaintItem] = useState<CartItem | null>(null);
  
  // Use VAT Hook
  const { config: vatConfig } = useVat();

  const toggleSwipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSwipedId(prev => prev === id ? null : id);
  };

  const handleRedeemItem = (item: MenuItem) => {
    onAdd(item);
  };

  const handleApplyDiscount = (amount: number) => {
    setRedeemedPoints(amount);
  };

  const handleComplaintSubmit = (issue: string, details: string) => {
    if (complaintItem) {
        addToast('success', 'Report Sent to Kitchen', `We will attend to your ${complaintItem.name} immediately.`);
    }
    setComplaintItem(null);
  };

  // --- CALCULATIONS ---
  const cartSubtotal = total;
  const cartDiscount = redeemedPoints;
  
  // Calculate VAT based on Config
  const vatRate = vatConfig.enabled ? (vatConfig.rate / 100) : 0;
  const cartTax = Math.round((Math.max(0, cartSubtotal - cartDiscount)) * vatRate); 
  
  const cartGrandTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax);
  
  const pointsCostInCart = cart.reduce((acc, item) => acc + ((item.pointCost || 0) * item.quantity), 0);
  const availablePoints = Math.max(0, userPoints - pointsCostInCart - redeemedPoints);

  // Recalculate Active Orders Total DYNAMICALLY
  // CRITICAL FIX: Only sum UNPAID orders for the Pay Button
  const activeOrdersSubtotal = displayableOrders.reduce((acc, order) => {
      // If order is paid, do not add to total
      if (order.paymentStatus === 'paid' || order.paymentStatus === 'pending_verification') return acc;

      const orderSum = order.items.reduce((itemAcc, item) => {
          if (item.status === 'cancelled') return itemAcc;
          return itemAcc + (item.price * item.quantity);
      }, 0);
      
      const effectiveOrderSum = Math.max(0, orderSum - (order.discountAmount || 0));
      return acc + effectiveOrderSum;
  }, 0);

  // Calculate VAT and Grand Total for Active Orders
  const activeOrdersVat = Math.round(activeOrdersSubtotal * vatRate);
  const activeOrdersGrandTotal = activeOrdersSubtotal + activeOrdersVat;

  const hasActiveOrders = displayableOrders.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#f1fcf1]" onClick={() => setSwipedId(null)}>
      
      {/* Header */}
      <div className="relative bg-green-700 pb-6 pt-2 rounded-b-[40px] shadow-lg z-20 shrink-0">
        <button 
          onClick={onBack}
          className="absolute top-5 left-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="pt-5 pb-1 flex justify-center">
          <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
            Table #{tableNumber || '4'}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-6 gap-2 px-6">
           <button 
             onClick={(e) => { e.stopPropagation(); setActiveTab('cart'); }}
             className={`flex-1 py-2.5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2
               ${activeTab === 'cart' ? 'bg-white text-green-700 shadow-lg' : 'bg-green-800/50 text-green-100 hover:bg-green-800'}`}
           >
             <span>My Cart</span>
             {cart.length > 0 && <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{cart.reduce((a,b)=>a+b.quantity,0)}</span>}
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); setActiveTab('status'); }}
             className={`flex-1 py-2.5 rounded-full text-xs font-black transition-all flex items-center justify-center gap-2
               ${activeTab === 'status' ? 'bg-white text-green-700 shadow-lg' : 'bg-green-800/50 text-green-100 hover:bg-green-800'}`}
           >
             <span>Kitchen/Bar Status</span>
             {displayableOrders.length > 0 && <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded-full text-[9px]">{displayableOrders.length}</span>}
           </button>
        </div>
      </div>

      {/* --- TAB: MY CART --- */}
      {activeTab === 'cart' && (
        <>
          <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[240px] -mt-4 z-10 pt-8">
             <div className="space-y-4">
               {cart.length === 0 ? (
                 <div className="bg-white rounded-[30px] p-12 text-center border border-green-100 shadow-sm mt-4 opacity-80">
                   <div className="text-5xl mb-6 grayscale opacity-40">🛒</div>
                   <p className="font-black text-green-900 text-lg">Cart Empty</p>
                   <p className="text-xs text-gray-500 mt-2 font-medium">Add items to place a new order.</p>
                 </div>
               ) : (
                 cart.map((item) => {
                   const isReward = (item.pointCost || 0) > 0;
                   const isSwiped = swipedId === item.id;
                   
                   return (
                     <div key={item.id} className="relative h-24 w-full group select-none">
                        <div className="absolute inset-y-0 right-0 w-24 bg-red-50 rounded-r-3xl flex items-center justify-center z-0">
                           <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                              className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                        </div>

                        <div 
                           onClick={(e) => toggleSwipe(item.id, e)}
                           className={`
                             absolute inset-0 bg-white rounded-3xl shadow-sm border z-10 flex overflow-hidden transition-transform duration-300 ease-out cursor-pointer
                             ${isSwiped ? '-translate-x-24' : 'translate-x-0'}
                             ${isReward ? 'border-orange-200 bg-[#fffcf5]' : 'border-gray-100'}
                           `}
                        >
                           <div className="relative w-24 h-24 shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover border-r border-gray-50 pointer-events-none" />
                              {isReward && <div className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg shadow-sm">REWARD</div>}
                           </div>
                           <div className="flex-1 p-3 pl-4 flex justify-between items-center relative">
                              <div className="min-w-0 pr-2 flex-1">
                                 <h4 className="font-black text-sm text-gray-800 leading-tight mb-1 truncate">{item.name}</h4>
                                 <p className="text-xs font-bold text-green-600">Rs. {item.price}</p>
                              </div>
                              <div className={`flex items-center gap-2 rounded-xl p-1 mr-2 ${isReward ? 'bg-orange-100' : 'bg-gray-50'}`}>
                                 <button onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} className={`w-7 h-7 rounded-lg shadow-sm flex items-center justify-center font-black active:scale-90 transition-transform ${isReward ? 'bg-white text-orange-600' : 'bg-white text-gray-600'}`}>-</button>
                                 <span className={`text-xs font-black w-4 text-center ${isReward ? 'text-orange-700' : 'text-gray-800'}`}>{item.quantity}</span>
                                 <button onClick={(e) => { e.stopPropagation(); onAdd(item); }} className={`w-7 h-7 rounded-lg shadow-sm flex items-center justify-center font-black active:scale-90 transition-transform text-white ${isReward ? 'bg-orange-500' : 'bg-green-600'}`}>+</button>
                              </div>
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
             </div>
          </div>

          <div className="absolute bottom-[85px] left-4 right-4 z-40 pointer-events-none">
             {userPoints > 0 && (
                <div className="bg-white rounded-2xl p-3 mb-3 shadow-sm border border-orange-100 flex items-center justify-between pointer-events-auto">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl shadow-inner">🪙</div>
                     <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Balance</p>
                       <div className="flex items-baseline gap-1">
                          <p className="text-sm font-black text-gray-800">{availablePoints} pts</p>
                          {(pointsCostInCart > 0 || redeemedPoints > 0) && (
                            <span className="text-[10px] text-orange-500 font-bold">(-{userPoints - availablePoints} used)</span>
                          )}
                       </div>
                     </div>
                   </div>
                   <button onClick={() => setShowRewards(true)} className={`h-9 px-4 rounded-xl transition-all flex items-center gap-2 font-bold text-xs shadow-md active:scale-95 ${redeemedPoints > 0 || pointsCostInCart > 0 ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-white border border-gray-200 text-gray-600'}`}>
                     {(redeemedPoints > 0 || pointsCostInCart > 0) ? 'Manage Points' : 'Redeem'}
                   </button>
                </div>
             )}

             <div className="bg-green-600 rounded-[24px] p-4 shadow-xl shadow-green-200 pointer-events-auto border border-green-500 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-center text-green-100 text-[10px] font-medium mb-3 px-1">
                   <span>Sub: {cartSubtotal}</span>
                   {redeemedPoints > 0 && <span className="text-orange-200 font-bold">Disc: -{redeemedPoints}</span>}
                   {vatConfig.enabled && <span>VAT({vatConfig.rate}%): {cartTax}</span>}
                </div>

                <div className="flex items-center justify-between gap-4 relative z-10">
                   <div className="flex flex-col pl-1">
                      <span className="text-green-200 text-[9px] font-bold uppercase tracking-wider">Total to Pay</span>
                      <span className="text-white text-2xl font-black tracking-tight leading-none">Rs. {cartGrandTotal}</span>
                   </div>
                   
                   <button 
                     onClick={onPlaceOrder} 
                     disabled={cart.length === 0} 
                     className="flex-1 bg-white text-green-700 py-3 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-green-50"
                   >
                     <span>Place Order</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                   </button>
                </div>
             </div>
          </div>
        </>
      )}

      {/* --- TAB: KITCHEN/BAR STATUS --- */}
      {activeTab === 'status' && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-[200px] -mt-4 z-10 pt-8">
           {displayableOrders.length === 0 ? (
              <div className="text-center mt-10">
                 <div className="text-4xl grayscale opacity-30 mb-4">🍽️</div>
                 <p className="text-gray-500 font-bold">No active orders.</p>
              </div>
           ) : (
             <div className="space-y-6">
               {displayableOrders.map((order, idx) => {
                 if (!order) return null; 
                 
                 const canCancel = order.items.some(i => i.status === 'pending' || i.status === 'queue');
                 const isFullyCancelled = order.status === 'cancelled';
                 const isPaid = order.paymentStatus === 'paid' || order.paymentStatus === 'pending_verification';

                 return (
                   <div key={order.id} className="bg-white rounded-[24px] border border-green-100 shadow-sm overflow-hidden">
                      <div className={`px-4 py-3 border-b border-gray-100 flex justify-between items-center ${isFullyCancelled ? 'bg-red-50' : 'bg-gray-50'}`}>
                         <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Order #{order.id}</p>
                            <div className="mt-0.5 flex items-center gap-2">
                               <span className={`text-xs font-black uppercase ${isFullyCancelled ? 'text-red-500' : 'text-gray-800'}`}>
                                   {isFullyCancelled ? 'Cancelled' : (order.status === 'pending' ? 'Sending...' : (order.status === 'completed' ? 'Delivered' : 'In Progress'))}
                               </span>
                               {order.status === 'completed' && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold">Done</span>}
                               {/* Show Paid status here for reassurance */}
                               {isPaid && <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shadow-sm">Paid</span>}
                            </div>
                         </div>
                         {!isFullyCancelled && canCancel && (
                            <button 
                              onClick={() => onCancelOrder(order.id)}
                              className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                            >
                              Cancel Order
                            </button>
                         )}
                      </div>

                      <div className="p-2">
                        {order.items && order.items.map((item, itemIdx) => (
                           <ItemStatusRow 
                             key={`${item.id}-${itemIdx}`} 
                             item={item} 
                             onComplain={setComplaintItem}
                           />
                        ))}
                      </div>
                   </div>
                 );
               })}
             </div>
           )}

           {/* Total Pay Bill Button for Status Tab - Show ONLY if there is an unpaid amount */}
           {hasActiveOrders && activeOrdersGrandTotal > 0 && (
             <div className="absolute bottom-[85px] left-4 right-4 z-40">
                <div className="bg-gray-900 rounded-[28px] p-2 pr-2 shadow-2xl shadow-gray-900/30 border border-gray-800 flex items-center justify-between pl-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-10 w-24 h-24 bg-green-500/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col relative z-10 py-1 justify-center">
                       <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Outstanding Bill</span>
                       <span className="text-white text-3xl font-black tracking-tight leading-none">Rs. {activeOrdersGrandTotal}</span>
                       
                       {/* Conditional VAT Display */}
                       {vatConfig.enabled && (
                           <div className="flex items-center gap-1 mt-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              <span className="text-[10px] text-gray-400 font-bold">Inc. {vatConfig.rate}% VAT</span>
                           </div>
                       )}
                    </div>

                    <button 
                      onClick={onPayBill}
                      className="bg-white text-gray-900 px-5 py-4 rounded-[22px] font-black text-sm shadow-md active:scale-95 transition-all flex items-center gap-3 hover:bg-gray-50 z-10"
                    >
                      <span>{activeOrdersGrandTotal === 0 ? 'Clear Order' : 'Pay & Clear'}</span>
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white shadow-sm">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </button>
                </div>
             </div>
           )}
        </div>
      )}

      {showRewards && (
        <RewardsModal 
          userPoints={userPoints} 
          currentBillTotal={total}
          onApplyDiscount={handleApplyDiscount}
          onRedeemItem={handleRedeemItem}
          onClose={() => setShowRewards(false)}
          activeDiscount={redeemedPoints}
          pointsUsedInItems={pointsCostInCart}
        />
      )}

      {complaintItem && (
        <ComplaintModal 
           itemName={complaintItem.name}
           onClose={() => setComplaintItem(null)}
           onSubmit={handleComplaintSubmit}
        />
      )}
    </div>
  );
};

export default OrderView;
