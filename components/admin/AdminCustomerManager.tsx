
import React, { useState, useMemo, useEffect } from 'react';
import { User, OrderHistoryItem } from '../../types';
import AdminCustomerDetailModal from './AdminCustomerDetailModal';
import AdminCustomerHistoryModal from './AdminCustomerHistoryModal';

interface Props {
  users: User[];
  onDeleteUser: (mobile: string) => void;
  onUpdateStatus: (mobile: string, isActive: boolean) => void;
  onSelectUser: (user: User) => void;
}

type SortOption = 'recent' | 'points' | 'used';

// --- MOCK DATA GENERATOR FOR HISTORY (If real data is missing) ---
const generateMockHistory = (user: User): OrderHistoryItem[] => {
    return Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, i) => ({
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
        total: Math.floor(Math.random() * 2000) + 500,
        items: [
            { id: 'm1', name: 'Veg-Momo', price: 500, quantity: Math.floor(Math.random() * 2) + 1, category: 'Momo' as any, rating: 5, image: 'https://picsum.photos/seed/momo/100/100', description: '' },
            { id: 'd1', name: 'Red Bull', price: 350, quantity: 1, category: 'Drink' as any, rating: 5, image: 'https://picsum.photos/seed/rb/100/100', description: '' }
        ],
        earnedPoints: Math.floor(Math.random() * 100),
        pointsUsed: 0,
        discountAmount: 0,
        status: 'completed',
        userMobile: user.mobile
    }));
};

export default function AdminCustomerManager({ users, onDeleteUser, onUpdateStatus, onSelectUser }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // History Modal State
  const [showHistory, setShowHistory] = useState(false);
  const [allOrders, setAllOrders] = useState<OrderHistoryItem[]>([]);

  // Load orders from localStorage on mount
  useEffect(() => {
      try {
          const stored = localStorage.getItem('order_history');
          if (stored) {
              setAllOrders(JSON.parse(stored));
          } else {
              // If empty, we can generate some mock data for the demo so the Admin UI isn't empty
              let mocks: OrderHistoryItem[] = [];
              users.forEach(u => {
                  if (Math.random() > 0.3) {
                      mocks = [...mocks, ...generateMockHistory(u)];
                  }
              });
              setAllOrders(mocks);
          }
      } catch (e) {
          console.error("Failed to load orders", e);
      }
  }, [users]); // Re-run if users loaded (initial mock generation)

  // Filter and Sort users
  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.mobile.includes(searchTerm)
    );

    return result.sort((a, b) => {
        if (sortBy === 'points') {
            return b.points - a.points;
        }
        if (sortBy === 'used') {
            return (b.usedPoints || 0) - (a.usedPoints || 0);
        }
        // Default: Recent
        const dateA = a.joinedDate ? new Date(a.joinedDate).getTime() : 0;
        const dateB = b.joinedDate ? new Date(b.joinedDate).getTime() : 0;
        return dateB - dateA;
    });
  }, [users, searchTerm, sortBy]);

  const totalPoints = users.reduce((acc, u) => acc + u.points, 0);

  // Get orders for selected user
  const selectedUserOrders = useMemo(() => {
      if (!selectedUser) return [];
      return allOrders.filter(o => o.userMobile === selectedUser.mobile).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allOrders, selectedUser]);

  // History Actions
  const handleDeleteOrder = (orderId: string) => {
      const newOrders = allOrders.filter(o => o.id !== orderId);
      setAllOrders(newOrders);
      // In a real app, update localStorage or API
      localStorage.setItem('order_history', JSON.stringify(newOrders));
  };

  const handleDeleteBulk = (type: 'all' | 'older_30') => {
      if (!selectedUser) return;
      
      let newOrders = [...allOrders];
      if (type === 'all') {
          newOrders = newOrders.filter(o => o.userMobile !== selectedUser.mobile);
      } else if (type === 'older_30') {
          const now = new Date();
          newOrders = newOrders.filter(o => {
              if (o.userMobile !== selectedUser.mobile) return true; // Keep other users' orders
              const orderDate = new Date(o.date);
              const daysDiff = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
              return daysDiff <= 30; // Keep if recent
          });
      }
      setAllOrders(newOrders);
      localStorage.setItem('order_history', JSON.stringify(newOrders));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in slide-in-from-right duration-300">
        
        {/* Header Title */}
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 bg-white">
           <h2 className="text-2xl font-black text-gray-900 leading-none">Customers</h2>
           <p className="text-xs text-gray-400 font-bold mt-1">Manage subscribed members</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* 1. Stats Cards */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-[20px] p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden group">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-green-600 flex items-center justify-center text-white text-lg md:text-2xl shadow-lg shadow-green-200 z-10 shrink-0">
                           👥
                        </div>
                        <div className="z-10 min-w-0">
                           <h3 className="text-xl md:text-3xl font-black text-green-900 leading-none truncate">{users.length.toString().padStart(2, '0')}</h3>
                           <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5 md:mt-1 truncate">Subscribers</p>
                        </div>
                        {/* Decorative Blob */}
                        <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-20 md:h-20 bg-green-200/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-[20px] p-4 md:p-5 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden group">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-green-600 flex items-center justify-center text-white text-lg md:text-2xl shadow-lg shadow-green-200 z-10 shrink-0">
                           ⭐
                        </div>
                        <div className="z-10 min-w-0">
                           <h3 className="text-xl md:text-3xl font-black text-green-900 leading-none truncate">{totalPoints}</h3>
                           <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wide mt-0.5 md:mt-1 truncate">Unused Points</p>
                        </div>
                         {/* Decorative Blob */}
                         <div className="absolute -right-4 -bottom-4 w-16 h-16 md:w-20 md:h-20 bg-green-200/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                    </div>
                </div>

                {/* 2. Subscribers Detail Section */}
                <div className="bg-[#bbf7d0] bg-opacity-30 rounded-[30px] p-4 md:p-6 border border-green-200">
                    <h3 className="text-lg font-black text-gray-700 mb-4 px-2">Subscribers detail</h3>

                    {/* Search Bar */}
                    <div className="flex gap-2 mb-4 bg-transparent">
                       <div className="flex-1 flex items-center bg-[#86efac] bg-opacity-40 border border-green-300 rounded-xl px-4 h-12 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-green-400">
                          <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search using name or phone number" 
                            className="w-full bg-transparent outline-none text-sm font-bold text-green-900 placeholder-green-700/50"
                          />
                       </div>
                       <button className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 active:scale-95 transition-transform">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                       </button>
                    </div>

                    {/* Filter Pills - Active Functionality */}
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                        {[
                            { label: 'Most recent', id: 'recent' },
                            { label: 'Highest points', id: 'points' },
                            { label: 'Most used points', id: 'used' }
                        ].map((filter) => (
                           <button 
                             key={filter.id} 
                             onClick={() => setSortBy(filter.id as SortOption)}
                             className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border
                               ${sortBy === filter.id 
                                 ? 'bg-[#86efac] text-green-900 border-green-400 shadow-sm' 
                                 : 'bg-[#86efac] bg-opacity-40 text-green-800 border-transparent hover:bg-opacity-60'}
                             `}
                           >
                              {filter.label}
                           </button>
                        ))}
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-[20px] overflow-hidden border border-green-100 shadow-sm">
                        <div className="overflow-x-auto no-scrollbar">
                           <table className="w-full min-w-[600px] border-collapse">
                              <thead>
                                 <tr className="bg-[#e2e8f0] text-gray-700 text-[10px] font-black uppercase tracking-wider text-left">
                                    <th className="py-4 px-4 w-12 rounded-tl-[20px]">S.N.</th>
                                    <th className="py-4 px-4">Names</th>
                                    <th className="py-4 px-4">Contacts</th>
                                    <th className="py-4 px-4 w-20">Current<br/>points</th>
                                    <th className="py-4 px-4 w-16">Used</th>
                                    <th className="py-4 px-4 rounded-tr-[20px]">Member<br/>Since</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {filteredAndSortedUsers.length === 0 ? (
                                    <tr>
                                       <td colSpan={6} className="py-10 text-center text-gray-400 font-bold text-sm">
                                          No subscribers found matching "{searchTerm}"
                                       </td>
                                    </tr>
                                 ) : (
                                    filteredAndSortedUsers.map((user, index) => (
                                       <tr 
                                         key={user.mobile} 
                                         onClick={() => setSelectedUser(user)}
                                         className={`
                                            border-b border-gray-100 last:border-0 hover:bg-green-50 cursor-pointer transition-colors group
                                            ${!user.isActive && user.isActive !== undefined ? 'opacity-50 grayscale' : ''}
                                         `}
                                       >
                                          <td className="py-3 px-4 text-xs font-bold text-gray-500">{index + 1}</td>
                                          <td className="py-3 px-4">
                                             <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-800 group-hover:text-green-700">{user.name}</span>
                                                {user.isActive === false && <span className="bg-red-100 text-red-500 text-[9px] px-1.5 rounded font-bold">Inactive</span>}
                                             </div>
                                          </td>
                                          <td className="py-3 px-4">
                                             <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-mono font-bold">{user.mobile}</span>
                                          </td>
                                          <td className="py-3 px-4 text-sm font-black text-gray-800">{user.points}</td>
                                          <td className="py-3 px-4 text-xs font-bold text-gray-500">{user.usedPoints || 0}</td>
                                          <td className="py-3 px-4 text-xs font-bold text-gray-500">{user.joinedDate || '2/5/2025'}</td>
                                       </tr>
                                    ))
                                 )}
                              </tbody>
                           </table>
                        </div>
                        <div className="bg-[#86efac] px-4 py-3 flex justify-between items-center text-xs font-bold text-green-900 border-t border-green-200">
                           <span>Total</span>
                           <div className="flex gap-8 mr-12">
                              <span>{totalPoints}</span>
                              <span className="mr-8">{users.reduce((acc, u) => acc + (u.usedPoints || 0), 0)}</span>
                           </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        {/* Modals */}
        {selectedUser && !showHistory && (
            <AdminCustomerDetailModal 
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onDelete={(mobile) => { onDeleteUser(mobile); setSelectedUser(null); }}
                onToggleStatus={(mobile) => { 
                    const isActive = selectedUser.isActive !== false; 
                    onUpdateStatus(mobile, !isActive);
                    // Update local selected user state to reflect change immediately
                    setSelectedUser({...selectedUser, isActive: !isActive});
                }}
                onViewHistory={() => setShowHistory(true)}
            />
        )}

        {selectedUser && showHistory && (
            <AdminCustomerHistoryModal 
                user={selectedUser}
                orders={selectedUserOrders}
                onClose={() => setShowHistory(false)}
                onDeleteOrder={handleDeleteOrder}
                onDeleteBulk={handleDeleteBulk}
            />
        )}
    </div>
  );
}
