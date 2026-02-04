
import React, { useState, useEffect, useMemo } from 'react';
import { PaymentMethodConfig } from './PaymentMethodFormModal';
import DatePickerModal from './DatePickerModal';
import PaymentTransactionHistory from './PaymentTransactionHistory';
import { OrderHistoryItem } from '../../../types';

interface Props {
  methods: PaymentMethodConfig[];
  onCustomizeClick: () => void;
  // Updated prop definition
  onViewBill?: (order: OrderHistoryItem, isHistory?: boolean) => void;
}

type TimeFrame = 'Today' | 'This week' | 'This month' | 'Custom';
type Metric = 'Revenue' | 'Customers';

interface GraphPoint {
  date: Date;
  label: string;
  value: number;
  customers: number;
}

export default function PaymentDashboard({ methods, onCustomizeClick, onViewBill }: Props) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('Today');
  const [metric, setMetric] = useState<Metric>('Revenue');
  
  // Date State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Data State
  const [graphData, setGraphData] = useState<GraphPoint[]>([]);
  
  // Transaction History State
  const [allHistory, setAllHistory] = useState<OrderHistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
      const loadHistory = () => {
          try {
              const historyStr = localStorage.getItem('order_history');
              const activeStr = localStorage.getItem('active_orders');
              
              const history = historyStr ? JSON.parse(historyStr) : [];
              const active = activeStr ? JSON.parse(activeStr) : [];
              
              // Combine active (completed/paid ones maybe?) + history for a full view
              // For statement, we usually want everything that is 'paid' or 'completed'
              const combined = [...history, ...active].filter((o: OrderHistoryItem) => 
                  o.status === 'completed' || o.paymentStatus === 'paid' || o.status === 'cancelled'
              );
              
              // Remove duplicates based on ID just in case
              const uniqueOrders = Array.from(new Map(combined.map((item: any) => [item.id, item])).values()) as OrderHistoryItem[];
              
              setAllHistory(uniqueOrders);
          } catch(e) {
              console.error("Failed to load history", e);
          }
      };
      
      loadHistory();
      // Poll for updates if needed, or rely on parent re-renders if lifting state
      const interval = setInterval(loadHistory, 5000);
      return () => clearInterval(interval);
  }, []);

  // 1. Data Generator Helper
  const generateData = (start: Date, end: Date) => {
    const data: GraphPoint[] = [];
    const curr = new Date(start);
    // Reset time to start of day for accurate comparison
    curr.setHours(0,0,0,0);
    const endMidnight = new Date(end);
    endMidnight.setHours(0,0,0,0);

    const dayDiff = Math.ceil((endMidnight.getTime() - curr.getTime()) / (1000 * 3600 * 24));
    
    // Safety break for loop
    const safeEnd = new Date(endMidnight);
    if (dayDiff < 0) safeEnd.setTime(curr.getTime()); // Handle single day case

    while (curr <= safeEnd) {
      const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
      // Simulate data: Weekends higher
      const baseRev = isWeekend ? 5000 : 2500;
      const randomRev = baseRev + Math.floor(Math.random() * 3000);
      const randomCust = Math.floor(randomRev / 120) + Math.floor(Math.random() * 10);

      // Label Logic
      let label = '';
      if (dayDiff <= 7) {
         // Show Day Name (Mon, Tue) for short ranges
         label = curr.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
         // Show Date (12, 13) for long ranges
         label = curr.getDate().toString();
      }

      data.push({
        date: new Date(curr),
        label,
        value: randomRev,
        customers: randomCust
      });
      curr.setDate(curr.getDate() + 1);
    }
    return data;
  };

  // 2. Effect to Handle TimeFrame Presets
  useEffect(() => {
    if (timeFrame === 'Custom') return; // Handled by modal callback

    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (timeFrame === 'Today') {
       start = now;
       end = now;
    } else if (timeFrame === 'This week') {
       const day = now.getDay();
       const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
       start = new Date(now.setDate(diff));
       end = new Date(now.setDate(start.getDate() + 6));
    } else if (timeFrame === 'This month') {
       start = new Date(now.getFullYear(), now.getMonth(), 1);
       end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setStartDate(new Date(start));
    setEndDate(timeFrame === 'Today' ? null : new Date(end));
    
    // Generate Data
    setGraphData(generateData(start, end));
  }, [timeFrame]);

  // 3. Totals Calculation based on GRAPH data (so it matches visual)
  const displayedTotalRevenue = useMemo(() => graphData.reduce((acc, curr) => acc + curr.value, 0), [graphData]);
  const displayedTotalCustomers = useMemo(() => graphData.reduce((acc, curr) => acc + curr.customers, 0), [graphData]);
  
  const maxGraphValue = Math.max(...graphData.map(d => metric === 'Revenue' ? d.value : d.customers), 100); // Avoid div by 0

  const handleDateSelect = (start: Date, end: Date | null) => {
      setTimeFrame('Custom');
      setStartDate(start);
      setEndDate(end);
      // If end is null, treat as single day
      setGraphData(generateData(start, end || start));
  };

  const formatDateDisplay = () => {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      if (endDate && endDate.getTime() !== startDate.getTime()) {
          return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
      }
      return startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Logic for responsive bar sizing
  const getBarWidthClass = (count: number) => {
      if (count > 20) return 'w-[3%] max-w-[16px] min-w-[8px]'; // Very thin for month view
      if (count > 10) return 'w-[6%] max-w-[24px] min-w-[12px]'; // Medium for ~2 weeks
      return 'w-[10%] max-w-[40px] min-w-[20px]'; // Wide for week/days
  };

  return (
    <div className="flex flex-col h-full bg-[#f0fdf4] overflow-hidden">
        
        {/* Header / Filter Bar */}
        <div className="px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0 relative z-10">
            <div>
               <h2 className="text-2xl font-black text-gray-900 leading-none">Payment</h2>
               <p className="text-xs font-bold text-green-600 mt-1">Financial Overview & Statements</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="flex bg-white p-1.5 rounded-[18px] shadow-sm border border-green-100 flex-1 md:flex-none overflow-x-auto no-scrollbar">
                  {(['Today', 'This week', 'This month'] as TimeFrame[]).map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeFrame(tf)}
                        className={`
                            flex-1 md:flex-none px-4 py-3 rounded-xl text-[10px] md:text-xs font-black uppercase whitespace-nowrap transition-all 
                            ${timeFrame === tf 
                                ? 'bg-green-600 text-white shadow-md shadow-green-200' 
                                : 'text-gray-600 hover:bg-green-50'
                            }
                        `}
                      >
                         {tf}
                      </button>
                  ))}
               </div>
               
               <button 
                 onClick={onCustomizeClick}
                 className="bg-[#dcfce7] text-green-800 p-3.5 rounded-[18px] hover:bg-green-200 transition-colors shadow-sm shrink-0"
                 title="Customize Methods"
               >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               </button>
            </div>
        </div>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-0 space-y-8 pb-20">
            
            {/* PC: Expanded Grid Layout (1:3 Ratio) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* 1. Stats Card (Left on PC) - Compact Height */}
                <div className="lg:col-span-1 bg-white rounded-[24px] md:rounded-[30px] p-5 shadow-sm border border-green-100 relative overflow-hidden flex flex-col justify-between h-fit min-h-[160px]">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{timeFrame === 'Custom' ? 'Custom' : timeFrame.toUpperCase()}</span>
                           </div>
                           <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                              <span className="text-[10px] font-black">+12.5%</span>
                           </div>
                        </div>
                        
                        <div className="flex flex-col gap-1 mb-6">
                           <span className="text-xs font-bold text-gray-400">Total Revenue</span>
                           <h3 className="text-3xl lg:text-4xl font-black text-gray-800 leading-none tracking-tight">
                              <span className="text-lg text-green-600 align-top mr-1">Rs.</span>
                              {displayedTotalRevenue.toLocaleString()}
                           </h3>
                        </div>

                        <div className="flex flex-col gap-1">
                           <span className="text-xs font-bold text-gray-400">Total Customers</span>
                           <h3 className="text-xl font-black text-gray-700 leading-none">
                              {displayedTotalCustomers.toLocaleString()}
                           </h3>
                        </div>
                    </div>
                    
                    {/* Decorative BG */}
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-green-50 rounded-full blur-2xl -z-0" />
                </div>

                {/* 2. Graph Section (Right on PC) - Expanded */}
                <div className="lg:col-span-3 relative h-full min-h-[350px] flex flex-col">
                    {/* Floating Metric Switcher */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-4 lg:translate-x-0 z-10 shadow-sm rounded-full">
                       <div className="bg-white border border-green-100 rounded-full p-1 flex">
                          <button onClick={() => setMetric('Revenue')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${metric === 'Revenue' ? 'bg-[#dcfce7] text-green-800' : 'text-gray-400'}`}>Revenue</button>
                          <button onClick={() => setMetric('Customers')} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${metric === 'Customers' ? 'bg-[#dcfce7] text-green-800' : 'text-gray-400'}`}>Customers</button>
                       </div>
                    </div>

                    <div className="bg-gradient-to-b from-[#e6fce6] to-[#f0fdf4] rounded-[30px] p-5 pt-14 lg:pt-6 border border-green-200 relative flex-1 flex flex-col">
                       {/* Date Navigator */}
                       <div className="flex justify-center mb-4 lg:mb-8 lg:justify-start lg:ml-4">
                          <button 
                            onClick={() => setShowDatePicker(true)}
                            className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl px-4 py-2 flex items-center gap-4 text-green-800 font-bold text-xs shadow-sm hover:bg-white active:scale-95 transition-all"
                          >
                             <span className="text-lg leading-none text-green-600">📅</span>
                             <span>{formatDateDisplay()}</span>
                             <span className="text-xs opacity-50 font-medium ml-1">▼</span>
                          </button>
                       </div>

                       {/* Bar Chart Container */}
                       <div className="flex-1 flex items-end justify-around gap-1 px-2 w-full overflow-x-auto no-scrollbar pb-2">
                          {graphData.map((data, idx) => {
                              const val = metric === 'Revenue' ? data.value : data.customers;
                              // Dynamic min height to ensure even small values are visible
                              const heightPct = Math.max(5, (val / maxGraphValue) * 100);
                              const barWidthClass = getBarWidthClass(graphData.length);
                              
                              return (
                                 <div key={idx} className={`flex flex-col items-center group cursor-pointer h-full justify-end ${barWidthClass} shrink-0`}>
                                    <div className="w-full relative flex items-end justify-center h-full">
                                       <div 
                                         className="w-full bg-green-600 rounded-t-sm md:rounded-t-lg transition-all duration-500 ease-out group-hover:bg-green-500 relative"
                                         style={{ height: `${heightPct}%` }}
                                       >
                                          {/* Tooltip */}
                                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl">
                                             {metric === 'Revenue' ? `Rs.${val}` : val}
                                          </div>
                                       </div>
                                       {/* Track */}
                                       <div className="absolute bottom-0 w-full h-full bg-green-200/30 rounded-t-sm md:rounded-t-lg -z-10" />
                                    </div>
                                    <span className="text-[8px] md:text-[9px] font-bold text-gray-500 mt-2 uppercase truncate w-full text-center">
                                        {data.label}
                                    </span>
                                 </div>
                              );
                          })}
                          
                          {graphData.length === 0 && (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                                  No data for this range
                              </div>
                          )}
                       </div>
                    </div>
                </div>
            </div>

            {/* --- NEW TRANSACTION HISTORY SECTION --- */}
            <div>
               <PaymentTransactionHistory 
                  orders={allHistory} 
                  onViewBill={onViewBill || (() => {})}
               />
            </div>

            {/* Payment Methods Grid */}
            <div>
               <h3 className="text-lg font-black text-green-900 mb-4 px-2">Active Gateways</h3>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {methods.filter(m => m.isActive).map(method => (
                      <div key={method.id} className="bg-white border border-green-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center p-2 mb-2 md:mb-3">
                            {method.logo ? (
                                <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-xl font-black text-gray-400">{method.name[0]}</span>
                            )}
                        </div>
                        <h4 className="text-[10px] md:text-xs font-black text-gray-800 uppercase tracking-wide mb-1">{method.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mb-2">{method.identifier}</p>
                        <div className="mt-auto bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs md:text-sm font-black w-full">
                            {/* Simulate proportion of total revenue */}
                            Rs. {(Math.floor(displayedTotalRevenue * (Math.random() * 0.4 + 0.1))).toLocaleString()}
                        </div>
                      </div>
                  ))}
               </div>
            </div>

            {/* Compare Button */}
            <button className="w-full bg-[#0f4c81] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all hover:bg-[#0d4270]">
               Export Full Report
            </button>

        </div>

        {/* Date Picker Overlay */}
        {showDatePicker && (
            <DatePickerModal 
               initialDate={startDate}
               onSelect={handleDateSelect}
               onClose={() => setShowDatePicker(false)}
            />
        )}
    </div>
  );
}
