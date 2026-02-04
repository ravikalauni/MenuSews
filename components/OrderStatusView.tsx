
import React, { useEffect, useState } from 'react';
import { OrderHistoryItem, OrderStatus, CartItem } from '../types';

interface Props {
  order: OrderHistoryItem;
  onCancel: () => void;
  onComplete: () => void; // User acknowledges completion
}

const STEPS: { id: OrderStatus; label: string; icon: string; message: string; subtext: string }[] = [
  { 
    id: 'pending', 
    label: 'Placed', 
    icon: '📨', 
    message: 'Order Sent', 
    subtext: 'Waiting for kitchen confirmation...' 
  },
  { 
    id: 'queue', 
    label: 'In Queue', 
    icon: '⏱️', 
    message: 'In Queue', 
    subtext: 'Kitchen is busy. Est wait: ~10m' 
  },
  { 
    id: 'accepted', 
    label: 'Accepted', 
    icon: '👨‍🍳', 
    message: 'Accepted', 
    subtext: 'Prep started. Est time: 25m' 
  },
  { 
    id: 'cooking', 
    label: 'Cooking', 
    icon: '🔥', 
    message: 'Cooking Now', 
    subtext: 'Sit back & relax! Food is heating up.' 
  },
  { 
    id: 'ready', 
    label: 'Ready', 
    icon: '🔔', 
    message: 'Order Ready!', 
    subtext: 'Please collect at the counter.' 
  }
];

const OrderStatusView: React.FC<Props> = ({ order, onCancel, onComplete }) => {
  // Find current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === order.status);
  const currentStep = STEPS[currentStepIndex];
  
  // Progress calculation (0 to 100)
  const progress = Math.max(0, ((currentStepIndex) / (STEPS.length - 1)) * 100);

  // Status Badge Logic for individual items
  const getItemStatusBadge = () => {
    switch (order.status) {
      case 'pending': return <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">Waiting...</span>;
      case 'queue': return <span className="text-[10px] bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded border border-yellow-200">Queued</span>;
      case 'accepted': return <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">Prep Started</span>;
      case 'cooking': return <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded border border-orange-200 animate-pulse">🔥 Cooking</span>;
      case 'ready': return <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-200">✅ Ready</span>;
      default: return null;
    }
  };

  if (order.status === 'cancelled') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-red-50 h-full animate-in zoom-in-95">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
          ❌
        </div>
        <h2 className="text-2xl font-black text-red-600 mb-2">Order Cancelled</h2>
        <p className="text-center text-gray-500 font-medium mb-8">
          The kitchen could not accept your order at this time. Any payment made will be refunded.
        </p>
        <button 
          onClick={onComplete}
          className="w-full bg-white text-gray-800 py-4 rounded-2xl font-black shadow-md border border-gray-100"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-green-600 px-6 pt-8 pb-10 rounded-b-[40px] shadow-lg relative z-10">
        <div className="flex justify-between items-start text-white">
          <div>
            <h1 className="text-2xl font-black">Order #{order.id}</h1>
            <p className="text-green-100 text-sm font-medium opacity-90">{order.date}</p>
          </div>
          {order.status === 'pending' || order.status === 'queue' ? (
             <button 
               onClick={onCancel}
               className="bg-red-500/90 hover:bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
             >
               CANCEL
             </button>
          ) : (
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
              <span className="text-xs font-bold">On Time</span>
            </div>
          )}
        </div>
        
        {/* Animated Main Status */}
        <div className="mt-8 flex flex-col items-center">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-xl animate-bounce mb-3">
             {currentStep?.icon || '✅'}
           </div>
           <h2 className="text-2xl font-black text-white tracking-tight">{currentStep?.message || 'Completed'}</h2>
           <p className="text-green-100 font-medium text-sm mt-1">{currentStep?.subtext || 'Enjoy your meal!'}</p>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-8 pb-32 -mt-4 z-0">
        
        {/* Timeline Stepper */}
        <div className="bg-gray-50 rounded-[30px] p-6 border border-gray-100 mb-6">
           <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-[19px] top-2 bottom-2 w-1 bg-gray-200 rounded-full" />
              <div 
                className="absolute left-[19px] top-2 w-1 bg-green-500 rounded-full transition-all duration-1000" 
                style={{ height: `${progress}%` }}
              />

              <div className="space-y-6 relative">
                {STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm border-4 z-10 transition-all duration-500
                        ${isCompleted ? 'bg-green-500 border-green-200 text-white' : 'bg-white border-gray-200 text-gray-300'}
                        ${isCurrent ? 'scale-110 ring-4 ring-green-100' : ''}
                      `}>
                         {isCompleted ? '✓' : (index + 1)}
                      </div>
                      <div className={`${isCompleted ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
                        <p className={`text-sm font-black ${isCurrent ? 'text-green-700' : 'text-gray-800'}`}>{step.label}</p>
                        {isCurrent && (
                          <p className="text-[10px] text-green-600 font-bold animate-pulse">In Progress...</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-black text-gray-800 text-lg px-2">Order Items</h3>
          {order.items.map((item) => (
             <div key={item.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                   <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                     {getItemStatusBadge()}
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
             </div>
          ))}
        </div>

        {/* Action Button for Ready State */}
        {order.status === 'ready' && (
           <button 
             onClick={onComplete}
             className="w-full mt-6 bg-green-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-green-200 animate-in slide-in-from-bottom duration-500"
           >
             I've Collected My Order
           </button>
        )}
      </div>
    </div>
  );
};

export default OrderStatusView;
