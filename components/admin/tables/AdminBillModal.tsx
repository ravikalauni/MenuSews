
import React, { useState } from 'react';
import { TableSession, OrderHistoryItem } from '../../../types';
import { useVat } from '../../../hooks/useVat';

interface Props {
  table: TableSession;
  onClose: () => void;
  onClearTable: () => void; // Clears the table (Checkout) - Now can close specific groups
  onMarkPaid: () => void; // Updates status to paid
  isReadOnly?: boolean; // NEW: To lock actions for history viewing
}

export default function AdminBillModal({ table, onClose, onClearTable, onMarkPaid, isReadOnly = false }: Props) {
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [mobileTab, setMobileTab] = useState<'bill' | 'payment'>('bill');
  
  // VAT Hook
  const { config: vatConfig } = useVat();

  // Consolidate all items with parent order status
  const allItems = table.activeOrders?.flatMap(order => 
      order.items.map(item => ({ ...item, _parentPaid: order.paymentStatus === 'paid' }))
  ).filter(i => isReadOnly ? true : i.status !== 'cancelled') || [];
  
  // Calculate Totals
  const rawSubtotal = allItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Aggregate discounts from orders
  const totalDiscount = table.activeOrders?.reduce((acc, order) => acc + (order.discountAmount || 0), 0) || 0;
  
  const taxableAmount = Math.max(0, rawSubtotal - totalDiscount);

  // --- ROBUST TAX CALCULATION LOGIC ---
  // If orders have stored tax snapshots AND are PAID, use them.
  // Otherwise (Unpaid), use global config to reflect changes immediately.
  
  let finalTaxAmount = 0;
  let taxLabel = 'Tax';
  let isTaxStored = false;

  // Determine if we should use stored values or calculate live
  if (table.activeOrders && table.activeOrders.length > 0) {
      table.activeOrders.forEach(order => {
          // If Unpaid, calculate using live rate
          if (order.paymentStatus !== 'paid') {
              const orderSubtotal = order.items.reduce((acc, i) => {
                  if (i.status === 'cancelled') return acc;
                  return acc + (i.price * i.quantity);
              }, 0);
              const orderDiscount = order.discountAmount || 0;
              const orderTaxable = Math.max(0, orderSubtotal - orderDiscount);
              const rate = vatConfig.enabled ? (vatConfig.rate / 100) : 0;
              finalTaxAmount += Math.round(orderTaxable * rate);
          } 
          // If Paid, use stored amount
          else {
              finalTaxAmount += (order.taxAmount || 0);
              isTaxStored = true;
          }
      });

      // Label Logic
      if (table.activeOrders.some(o => o.paymentStatus !== 'paid')) {
          // If any unpaid, show current config label
          taxLabel = vatConfig.enabled ? `VAT (${vatConfig.rate}%)` : 'Tax (0%)';
      } else {
          // All paid, check stored rates
          const rates = new Set(table.activeOrders.map(o => o.taxRate));
          if (rates.size === 1) {
              const rate = Array.from(rates)[0];
              taxLabel = rate ? `VAT (${rate}%)` : 'Tax (0%)';
          } else {
              taxLabel = 'Tax / VAT';
          }
      }
  }

  const grandTotal = Math.round(taxableAmount + finalTaxAmount);

  // Determine Payment Status across orders
  const hasPendingVerification = table.activeOrders?.some(o => o.paymentStatus === 'pending_verification');
  
  // Logic: All valid (non-cancelled) orders must be paid. If no orders, it's considered "fully paid" (or clearable)
  const validOrders = table.activeOrders?.filter(o => o.status !== 'cancelled') || [];
  const isFullyPaid = validOrders.length > 0 && validOrders.every(o => o.paymentStatus === 'paid');
  const isEmpty = validOrders.length === 0; // Just seated case
  
  // Can clear if Paid OR Empty
  const canClear = isFullyPaid || isEmpty;

  const paymentProof = table.activeOrders?.find(o => o.paymentProofUrl)?.paymentProofUrl;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      {/* Main Container */}
      <div className="bg-[#f8fafc] w-full max-w-5xl h-full md:h-[90vh] md:rounded-[30px] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 print:shadow-none print:w-full print:h-auto print:absolute print:inset-0 print:bg-white print:rounded-none">
        
        {/* --- MOBILE HEADER & TABS --- */}
        <div className="md:hidden bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center px-4 py-3 gap-3">
                <button 
                  onClick={onClose} 
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
                >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex-1">
                    <h3 className="font-black text-gray-800 text-lg leading-none">
                        {isReadOnly ? 'Past Bill' : `Table ${table.tableNumber}`}
                    </h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">
                        {isReadOnly ? 'View Only' : 'Billing & Actions'}
                    </p>
                </div>
                {/* Mobile Print Button */}
                <button 
                    onClick={handlePrint}
                    className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center active:scale-95"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </button>
            </div>
            
            {!isReadOnly && (
                <div className="px-4 pb-3">
                    <div className="bg-gray-100 p-1 rounded-xl flex relative">
                        <button 
                        onClick={() => setMobileTab('bill')}
                        className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${mobileTab === 'bill' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                        <span>Receipt View</span>
                        </button>
                        <button 
                        onClick={() => setMobileTab('payment')}
                        className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2 ${mobileTab === 'payment' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
                        >
                        <span>Actions</span>
                        {(hasPendingVerification || isFullyPaid) && (
                            <span className={`w-2 h-2 rounded-full ${isFullyPaid ? 'bg-green-50' : 'bg-orange-500 animate-pulse'}`} />
                        )}
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* --- LEFT: RECEIPT PREVIEW --- */}
        <div className={`
            flex-col bg-white border-r border-gray-200 relative print:border-none print:w-full overflow-hidden transition-all
            ${mobileTab === 'bill' || isReadOnly ? 'flex flex-1 w-full' : 'hidden md:flex md:flex-1'}
        `}>
            
            {/* Receipt Header */}
            <div className="p-6 md:p-8 pb-4 text-center border-b border-dashed border-gray-300 shrink-0">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-900 mb-1">
                  Nep<span className="text-green-600">Nola</span>.
                </h1>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Fine Dining Experience</p>
                <div className="mt-3 md:mt-4 text-[10px] md:text-xs font-medium text-gray-500 space-y-0.5 md:space-y-1">
                    <p>Panipokhari, Kathmandu</p>
                    <p>VAT No: 600123456</p>
                    <p>+977-9800000000</p>
                </div>
            </div>

            {/* Receipt Meta */}
            <div className="px-6 md:px-8 py-4 flex justify-between items-center text-xs font-bold text-gray-600 border-b border-gray-100 shrink-0">
                <div className="text-left">
                    <p>Bill No: <span className="text-black">#{table.id.split('-')[1]?.slice(0,6) || 'HIST'}</span></p>
                    <p className="mt-1">Date: <span className="text-black">{table.activeOrders?.[0]?.date || new Date().toLocaleDateString()}</span></p>
                </div>
                <div className="text-right">
                    <p>Table: <span className="text-black text-sm">{table.tableNumber}</span></p>
                    <p className="mt-1">Pax: <span className="text-black">{table.guests}</span></p>
                </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 py-4 no-scrollbar">
                <table className="w-full text-left">
                    <thead className="text-[10px] font-black uppercase text-gray-400 border-b border-gray-200">
                        <tr>
                            <th className="pb-2 w-8 md:w-10">Qty</th>
                            <th className="pb-2">Item</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-gray-800">
                        {allItems.map((item, idx) => (
                            <tr key={`${item.id}-${idx}`} className={`border-b border-gray-50 last:border-0 ${item.status === 'cancelled' ? 'line-through text-red-300' : ''}`}>
                                <td className="py-3 align-top">{item.quantity}</td>
                                <td className="py-3 pr-2">
                                    <div>{item.name}</div>
                                    {item.customization && (
                                        <div className="text-[9px] text-gray-400 font-medium mt-0.5">
                                            {item.customization.portion} • {item.customization.spiceLevel}% Spice
                                        </div>
                                    )}
                                    {/* Item Paid Badge (Visual Debug / Clarity) */}
                                    {/* Only show if item is part of a paid order */}
                                    {(item as any)._parentPaid && <span className="inline-block text-[8px] text-green-600 bg-green-50 px-1 rounded mt-0.5 print:hidden">Paid</span>}
                                </td>
                                <td className="py-3 text-right text-gray-500">{item.price}</td>
                                <td className="py-3 text-right">{item.price * item.quantity}</td>
                            </tr>
                        ))}
                        {allItems.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-400 italic">No items ordered yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Financials Footer */}
            <div className="bg-gray-50 p-6 md:p-8 pt-6 border-t border-gray-200 shrink-0">
                <div className="space-y-2 text-xs font-bold text-gray-600">
                    <div className="flex justify-between">
                        <span>Sub Total</span>
                        <span className="text-gray-900">Rs. {rawSubtotal}</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="flex justify-between text-orange-600">
                            <span>Discount</span>
                            <span>- Rs. {totalDiscount}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Taxable Amount</span>
                        <span className="text-gray-900">Rs. {taxableAmount}</span>
                    </div>
                    {/* Tax Line */}
                    {(finalTaxAmount > 0 || isTaxStored || vatConfig.enabled) && (
                        <div className="flex justify-between">
                            <span>{taxLabel}</span>
                            <span className="text-gray-900">Rs. {finalTaxAmount}</span>
                        </div>
                    )}
                </div>
                
                <div className="border-t-2 border-dashed border-gray-300 my-4" />
                
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Grand Total</p>
                        <p className="text-[10px] font-medium text-gray-400 mt-1">Includes all taxes</p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-gray-900 leading-none">Rs. {grandTotal}</span>
                    </div>
                </div>
            </div>
            
            {/* Print Watermark */}
            <div className="hidden print:block text-center mt-8 text-xs font-medium text-gray-400">
                Thank you for visiting NepNola! • Please visit again.
            </div>
        </div>

        {/* --- RIGHT: ACTIONS & VERIFICATION (Hidden on Print & ReadOnly) --- */}
        {!isReadOnly && (
            <div className={`
                flex-col bg-[#f8fafc] print:hidden border-l border-gray-100 overflow-y-auto
                ${mobileTab === 'payment' ? 'flex flex-1 w-full p-4' : 'hidden md:flex md:w-[400px] p-6'}
            `}>
                
                {/* Close Button Desktop */}
                <div className="hidden md:flex justify-end mb-4">
                    <button onClick={onClose} className="p-2 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-6 hidden md:block">Payment & Actions</h3>

                {/* 1. Payment Status Card */}
                <div className={`rounded-2xl p-5 mb-6 border shadow-sm flex flex-col items-center text-center
                    ${isFullyPaid 
                        ? 'bg-green-50 border-green-200' 
                        : (hasPendingVerification ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200')}
                `}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm
                        ${isFullyPaid ? 'bg-green-500 text-white' : (hasPendingVerification ? 'bg-orange-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400')}
                    `}>
                        {isFullyPaid ? '✓' : (hasPendingVerification ? '!' : '$')}
                    </div>
                    <h4 className={`text-lg font-black ${isFullyPaid ? 'text-green-700' : 'text-gray-800'}`}>
                        {isFullyPaid ? 'Payment Complete' : (hasPendingVerification ? 'Verify Payment' : 'Payment Pending')}
                    </h4>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                        {isFullyPaid 
                            ? 'This group is ready to be cleared.' 
                            : (hasPendingVerification ? 'Customer has uploaded a screenshot.' : 'Waiting for customer payment.')}
                    </p>
                </div>

                {/* 2. Verification Module (If Pending) */}
                {hasPendingVerification && paymentProof && (
                    <div className="bg-white rounded-2xl p-4 border border-orange-200 shadow-sm mb-6 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-black text-orange-600 uppercase tracking-wide">Screenshot Proof</span>
                            <button onClick={() => setShowScreenshot(!showScreenshot)} className="text-xs font-bold text-blue-500 hover:underline">
                                {showScreenshot ? 'Hide' : 'View'}
                            </button>
                        </div>
                        
                        {showScreenshot && (
                            <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[9/16] relative cursor-zoom-in" onClick={() => window.open(paymentProof, '_blank')}>
                                <img src={paymentProof} alt="Proof" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/10">
                                    <span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur">Tap to expand</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={onMarkPaid}
                                className="py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xs shadow-md shadow-green-100 active:scale-95 transition-all"
                            >
                                Approve
                            </button>
                            <button 
                                onClick={() => alert("Reject logic would go here - notifies user to retry.")}
                                className="py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl font-black text-xs active:scale-95 transition-all"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. Action Buttons */}
                <div className="mt-auto space-y-3">
                    
                    {/* Manual Mark Paid */}
                    {!isFullyPaid && !hasPendingVerification && (
                        <button 
                            onClick={onMarkPaid}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-black"
                        >
                            <span>Mark as Paid (Cash)</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </button>
                    )}

                    {/* Print Bill */}
                    <button 
                        onClick={handlePrint}
                        className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Bill
                    </button>

                    {/* Clear Table (Only if paid or empty) */}
                    <button 
                        onClick={onClearTable}
                        disabled={!canClear}
                        className={`w-full py-4 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2
                            ${canClear 
                                ? 'bg-red-600 text-white shadow-red-200 hover:bg-red-700 border border-red-700' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200'}
                        `}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        {isFullyPaid ? 'Clear & Finish' : 'Pay to Clear'}
                    </button>
                </div>

                {/* Desktop Close Button (Bottom Right) */}
                <div className="hidden md:flex justify-center mt-6">
                    <button onClick={onClose} className="text-gray-400 font-bold text-xs hover:text-gray-600">Close Window</button>
                </div>
            </div>
        )}

        {/* Read Only Actions */}
        {isReadOnly && (
            <div className="hidden md:flex flex-col absolute top-6 right-6 gap-3">
                <button onClick={onClose} className="p-3 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors shadow-sm">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <button 
                    onClick={handlePrint}
                    className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
                    title="Print Bill"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
