
import React, { useState, useMemo, useEffect } from 'react';
import { Category, MenuItem, CartItem, OrderHistoryItem, User, AppView } from './types';
import { INITIAL_MENU_ITEMS, INITIAL_CATEGORIES_DATA } from './data/initialData';

/**
 * PURE CUSTOMER UI - CONSOLIDATED VERSION
 * Includes: Scan, Seat Selection, Menu, Cart, and Order Status
 */

export default function CustomerApp() {
  // --- STATE ---
  const [viewState, setViewState] = useState<'scan' | 'seats' | 'main'>('scan');
  const [currentTab, setCurrentTab] = useState<AppView>('home');
  const [tableNumber, setTableNumber] = useState('4');
  const [guestCount, setGuestCount] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderHistoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [flyingItems, setFlyingItems] = useState<any[]>([]);

  // --- LOGIC ---
  const filteredItems = useMemo(() => {
    return INITIAL_MENU_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const addToCart = (item: MenuItem, e?: React.MouseEvent) => {
    // Animation logic
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const flyId = Date.now();
      setFlyingItems(prev => [...prev, { id: flyId, src: item.image, x: rect.left, y: rect.top }]);
      setTimeout(() => setFlyingItems(prev => prev.filter(f => f.id !== flyId)), 800);
    }

    setCart(prev => {
      const existing = prev.find(ci => ci.id === item.id);
      if (existing) return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const newOrder: OrderHistoryItem = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toLocaleTimeString(),
      total: cart.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      items: cart.map(i => ({ ...i, status: 'pending' })),
      earnedPoints: 10,
      pointsUsed: 0,
      discountAmount: 0,
      status: 'pending',
      tableNumber: tableNumber,
      paymentStatus: 'unpaid'
    };
    setActiveOrders([newOrder, ...activeOrders]);
    setCart([]);
    setCurrentTab('orders');
  };

  // --- SUB-VIEWS ---

  // 1. SCAN SCREEN
  if (viewState === 'scan') {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-green-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse">
           <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Scan Table QR</h1>
        <p className="text-gray-500 mb-10 text-sm">Point your camera at the QR code on your table</p>
        <button 
          onClick={() => setViewState('seats')}
          className="w-full max-w-xs bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
        >
          Simulate Scan (Table 4)
        </button>
      </div>
    );
  }

  // 2. SEAT SELECTION
  if (viewState === 'seats') {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-[#f1fcf1] animate-in slide-in-from-bottom duration-500">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-sm border border-green-100">
          <span className="text-5xl mb-6 block">🍽️</span>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Welcome to Table {tableNumber}</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-8">How many guests?</p>
          
          <div className="flex items-center justify-center gap-6 mb-10">
            <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-14 h-14 bg-gray-100 rounded-2xl font-black text-xl active:scale-90">-</button>
            <span className="text-5xl font-black text-green-600">{guestCount}</span>
            <button onClick={() => setGuestCount(guestCount + 1)} className="w-14 h-14 bg-gray-100 rounded-2xl font-black text-xl active:scale-90">+</button>
          </div>

          <button 
            onClick={() => setViewState('main')}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
          >
            Start Ordering
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN INTERFACE (Home, Orders, History)
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col relative overflow-hidden bg-[#f1fcf1] shadow-2xl">
      
      {/* Flying animation overlay */}
      {flyingItems.map(f => (
        <img key={f.id} src={f.src} className="fixed w-10 h-10 rounded-full z-[100] border-2 border-white shadow-xl pointer-events-none" style={{ left: f.x, top: f.y, animation: 'flyToCart 0.8s forwards', '--target-x': '300px', '--target-y': '800px' } as any} />
      ))}

      {/* --- HEADER --- */}
      <header className="p-6 pt-8 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">Nep<span className="text-green-600">Nola</span>.</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Table {tableNumber}</p>
        </div>
        <button className="bg-white p-2 rounded-2xl shadow-sm border border-green-50 flex items-center gap-2 pr-4">
           <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-white font-black text-xs">S</div>
           <div className="text-left"><p className="text-[8px] font-bold text-gray-400 uppercase">Points</p><p className="text-xs font-black text-green-700">120</p></div>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {currentTab === 'home' && (
          <div className="px-5 space-y-6 animate-in fade-in duration-500">
            {/* Search */}
            <div className="relative">
              <input 
                type="text" placeholder="Search delicious food..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-green-100 rounded-2xl py-4 px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              {['All', 'Momo', 'Pizza', 'Burger', 'Drinks'].map(cat => (
                <button 
                  key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full whitespace-nowrap text-xs font-black transition-all ${activeCategory === cat ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all group active:scale-95">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-50">
                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h3 className="font-black text-gray-800 text-sm truncate">{item.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <p className="font-black text-green-600 text-sm">Rs.{item.price}</p>
                    <button 
                      onClick={(e) => addToCart(item, e)}
                      className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'orders' && (
          <div className="px-5 space-y-6 animate-in slide-in-from-right duration-500">
            {/* Cart Section */}
            {cart.length > 0 && (
              <div className="bg-white rounded-[32px] p-6 shadow-sm border border-green-50">
                <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">🛒 My Cart <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{cart.length}</span></h3>
                <div className="space-y-4">
                   {cart.map(item => (
                     <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                           <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                           <div><p className="font-bold text-sm text-gray-800">{item.name}</p><p className="text-xs text-gray-400 font-bold">Rs. {item.price}</p></div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl font-black text-xs">
                           <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(0, i.quantity - 1)} : i).filter(i => i.quantity > 0))}>-</button>
                           <span>{item.quantity}</span>
                           <button onClick={() => addToCart(item)}>+</button>
                        </div>
                     </div>
                   ))}
                </div>
                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-100">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400 font-bold text-sm">Total Amount</span>
                      <span className="text-xl font-black text-green-700">Rs. {cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</span>
                   </div>
                   <button onClick={handlePlaceOrder} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100">Confirm & Place Order</button>
                </div>
              </div>
            )}

            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-gray-800 px-2 flex items-center gap-2">👨‍🍳 Kitchen Status <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping" /></h3>
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-gray-900 rounded-[32px] p-5 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-5xl">🔥</span></div>
                    <div className="flex justify-between items-center mb-4">
                      <div><p className="text-[10px] font-bold text-gray-500 uppercase">Order #{order.id}</p><p className="text-sm font-black text-green-400 uppercase tracking-widest">Cooking</p></div>
                      <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">Est: 15m</div>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4"><div className="h-full bg-green-500 w-[45%] animate-pulse transition-all duration-1000" /></div>
                    <p className="text-[10px] text-gray-400">Items: {order.items.map(i => i.name).join(', ')}</p>
                  </div>
                ))}
              </div>
            )}

            {cart.length === 0 && activeOrders.length === 0 && (
               <div className="py-20 text-center opacity-40 grayscale flex flex-col items-center">
                  <span className="text-7xl mb-4">🥡</span>
                  <p className="font-black text-lg">No Orders Yet</p>
                  <p className="text-xs font-bold">Your tasty treats will appear here</p>
               </div>
            )}
          </div>
        )}

        {currentTab === 'history' && (
          <div className="px-5 py-10 text-center opacity-30 animate-in fade-in duration-500">
             <span className="text-7xl mb-4 block">🕒</span>
             <p className="font-black text-xl">Order History</p>
             <p className="text-xs font-bold mt-2">Past orders are coming soon...</p>
          </div>
        )}
      </main>

      {/* --- BOTTOM NAVIGATION --- */}
      <nav className="absolute bottom-6 left-6 right-6 h-20 bg-white shadow-2xl rounded-[30px] border border-green-50 flex items-center justify-around px-4 z-50">
        {[
          { id: 'home', label: 'Menu', icon: '🍽️' },
          { id: 'orders', label: 'Orders', icon: '🔥', count: cart.length || activeOrders.length },
          { id: 'history', label: 'History', icon: '🕒' }
        ].map(btn => (
          <button 
            key={btn.id} onClick={() => setCurrentTab(btn.id as AppView)}
            className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${currentTab === btn.id ? 'scale-110 text-green-600' : 'text-gray-300'}`}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{btn.label}</span>
            {btn.count ? (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{btn.count}</span>
            ) : null}
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes flyToCart {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: translate(var(--target-x), var(--target-y)) scale(0.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
