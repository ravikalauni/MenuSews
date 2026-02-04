
import React, { useState, useMemo } from 'react';
import { OrderHistoryItem } from '../../../types';
import DatePickerModal from './DatePickerModal';
import { useVat } from '../../../hooks/useVat'; // Import hook

interface Props {
  orders: OrderHistoryItem[];
  onViewBill: (order: OrderHistoryItem, isHistory?: boolean) => void;
}

type SortType = 'date_desc' | 'date_asc' | 'amount_high' | 'amount_low';

export default function PaymentTransactionHistory({ orders, onViewBill }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Get live VAT config for unpaid calculations
  const { config: vatConfig } = useVat();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<SortType>('date_desc');
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Helper to calculate display amount
  const getDisplayAmount = (order: OrderHistoryItem) => {
      // If paid, respect the frozen total
      if (order.paymentStatus === 'paid') return order.total;
      
      // If unpaid, calculate live
      const subtotal = order.items.reduce((acc, item) => {
          if (item.status === 'cancelled') return acc;
          return acc + (item.price * item.quantity);
      }, 0);
      const discount = order.discountAmount || 0;
      const taxable = Math.max(0, subtotal - discount);
      const rate = vatConfig.enabled ? (vatConfig.rate / 100) : 0;
      return taxable + Math.round(taxable * rate);
  };

  // --- FILTERING LOGIC ---
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Search (ID, Table, Name, Mobile)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.tableNumber?.toLowerCase().includes(q) ||
        o.userMobile?.includes(q) ||
        (o.userMobile && o.userMobile.includes(q))
      );
    }

    // 2. Date Range
    if (dateRange.start) {
        const start = new Date(dateRange.start);
        start.setHours(0,0,0,0);
        
        const end = dateRange.end ? new Date(dateRange.end) : new Date(start);
        end.setHours(23,59,59,999);

        result = result.filter(o => {
            const oDate = new Date(o.date); 
            return oDate >= start && oDate <= end;
        });
    }

    // 3. Sorting
    result.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        // Note: For sorting by amount, we ideally should use the dynamic amount for unpaid, 
        // but for performance in sort, we might use the stored total. 
        // For strict accuracy, we'd need to map amounts first.
        const amountA = getDisplayAmount(a);
        const amountB = getDisplayAmount(b);
        
        switch (sortType) {
            case 'date_asc': return dateA - dateB;
            case 'date_desc': return dateB - dateA;
            case 'amount_high': return amountB - amountA;
            case 'amount_low': return amountA - amountB;
            default: return 0;
        }
    });

    return result;
  }, [orders, searchQuery, sortType, dateRange, vatConfig]); // Re-sort/filter if vatConfig changes

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentData = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDateSelect = (start: Date, end: Date | null) => {
      setDateRange({ start, end });
      setShowDatePicker(false);
      setCurrentPage(1);
  };

  const clearFilters = () => {
      setSearchQuery('');
      setDateRange({ start: null, end: null });
      setSortType('date_desc');
      setCurrentPage(1);
  };

  // Helper to render payment status badge
  const renderPaymentStatus = (order: OrderHistoryItem) => {
      if (order.paymentStatus === 'paid') {
          return (
              <span className={`text-[10px] font-bold px-2 py-1 rounded capitalize border ${
                  order.paymentMethod === 'cash' 
                  ? 'bg-orange-50 text-orange-600 border-orange-100' 
                  : 'bg-purple-50 text-purple-600 border-purple-100'
              }`}>
                  {order.paymentMethod || 'Paid'}
              </span>
          );
      } else if (order.paymentStatus === 'pending_verification') {
          return <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100">Verifying</span>;
      } else {
          return <span className="text-[10px] font-bold px-2 py-1 rounded bg-red-50 text-red-600 border border-red-100">Unpaid</span>;
      }
  };

  return (
    <div className="bg-white rounded-[30px] border border-green-100 shadow-sm overflow-hidden flex flex-col">
       
       {/* Header & Toolbar */}
       <div className="p-6 pb-4 border-b border-gray-100 bg-white relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
             <div>
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                   <span>📜</span> Sales Statement
                </h3>
                <p className="text-xs text-gray-400 font-bold mt-1">Transaction history & past bills</p>
             </div>
             
             <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
                 <span className="text-[10px] font-black text-gray-400 px-3 uppercase">Total Records:</span>
                 <span className="bg-white px-3 py-1 rounded-lg text-xs font-black text-gray-800 shadow-sm border border-gray-100">{filteredOrders.length}</span>
             </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3">
             {/* Search */}
             <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center focus-within:ring-2 focus-within:ring-green-100 transition-all">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                   type="text" 
                   placeholder="Search Order ID, Table, Mobile..." 
                   value={searchQuery}
                   onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                   className="bg-transparent w-full text-xs font-bold text-gray-700 outline-none placeholder-gray-400"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">✕</button>
                )}
             </div>

             {/* Date Filter */}
             <button 
                onClick={() => setShowDatePicker(true)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all
                    ${dateRange.start ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
             >
                <span>📅</span>
                <span>{dateRange.start ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end ? dateRange.end.toLocaleDateString() : 'Single Day'}` : 'Date Range'}</span>
                {dateRange.start && <span onClick={(e) => { e.stopPropagation(); setDateRange({start:null, end:null}); }} className="ml-1 hover:text-red-500">✕</span>}
             </button>

             {/* Sort */}
             <div className="relative group">
                 <select 
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as SortType)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 px-4 py-2.5 pr-8 rounded-xl text-xs font-bold outline-none cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-green-100 w-full md:w-auto"
                 >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="amount_high">Highest Amount</option>
                    <option value="amount_low">Lowest Amount</option>
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                 </div>
             </div>
          </div>
       </div>

       {/* --- TABLE CONTENT --- */}
       <div className="flex-1 overflow-auto no-scrollbar min-h-[400px] bg-[#f8fafc]">
          {currentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 opacity-50">
                  <div className="text-5xl mb-4 grayscale">🧾</div>
                  <p className="font-bold text-gray-500">No transactions found</p>
                  <button onClick={clearFilters} className="text-green-600 text-xs font-bold mt-2 hover:underline">Clear Filters</button>
              </div>
          ) : (
              <div className="w-full">
                  {/* Desktop Header */}
                  <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-black uppercase text-gray-500 tracking-wider sticky top-0 z-0">
                      <div className="col-span-1">Date</div>
                      <div className="col-span-1">Order ID</div>
                      <div className="col-span-1">Table</div>
                      <div className="col-span-1">Customer</div>
                      <div className="col-span-1">Status/Method</div>
                      <div className="col-span-1 text-right">Amount</div>
                      <div className="col-span-1 text-center">Action</div>
                  </div>

                  <div className="divide-y divide-gray-100">
                      {currentData.map((order) => (
                          <div key={order.id} className="group bg-white hover:bg-green-50/30 transition-colors">
                              
                              {/* Desktop Row */}
                              <div className="hidden md:grid grid-cols-7 gap-4 px-6 py-4 items-center">
                                  <div className="text-xs font-bold text-gray-500">{order.date}</div>
                                  <div className="text-xs font-mono font-bold text-gray-400">#{order.id.slice(-6).toUpperCase()}</div>
                                  <div>
                                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                                          {order.tableNumber || 'N/A'}
                                      </span>
                                  </div>
                                  <div className="text-xs font-bold text-gray-800 truncate">
                                      {order.userMobile ? (
                                          <div className="flex flex-col">
                                              <span>{order.userMobile}</span>
                                              <span className="text-[9px] text-gray-400">Registered</span>
                                          </div>
                                      ) : (
                                          <span className="text-gray-400 italic">Guest</span>
                                      )}
                                  </div>
                                  <div>
                                      {renderPaymentStatus(order)}
                                  </div>
                                  <div className="text-right text-sm font-black text-gray-900">
                                      Rs. {getDisplayAmount(order).toLocaleString()}
                                  </div>
                                  <div className="text-center">
                                      <button 
                                        onClick={() => onViewBill(order, true)} // Pass true for isHistory
                                        className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors"
                                        title="View Receipt"
                                      >
                                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                      </button>
                                  </div>
                              </div>

                              {/* Mobile Card */}
                              <div className="md:hidden p-4 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${order.paymentMethod === 'cash' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                                          {order.paymentMethod === 'cash' ? '💵' : '💳'}
                                      </div>
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <h4 className="text-sm font-black text-gray-800">Rs. {getDisplayAmount(order)}</h4>
                                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">T-{order.tableNumber}</span>
                                          </div>
                                          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                              {order.date} • {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                          </p>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => onViewBill(order, true)}
                                    className="bg-green-50 text-green-600 px-3 py-2 rounded-lg text-xs font-bold border border-green-100"
                                  >
                                      View Bill
                                  </button>
                              </div>

                          </div>
                      ))}
                  </div>
              </div>
          )}
       </div>

       {/* Pagination Footer */}
       {totalPages > 1 && (
           <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center shrink-0">
               <button 
                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                 disabled={currentPage === 1}
                 className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold disabled:opacity-50 hover:bg-gray-100"
               >
                   Previous
               </button>
               <span className="text-xs font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
               <button 
                 onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                 disabled={currentPage === totalPages}
                 className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold disabled:opacity-50 hover:bg-gray-100"
               >
                   Next
               </button>
           </div>
       )}

       {showDatePicker && (
           <DatePickerModal 
              initialDate={dateRange.start || new Date()}
              onSelect={handleDateSelect}
              onClose={() => setShowDatePicker(false)}
           />
       )}
    </div>
  );
}
