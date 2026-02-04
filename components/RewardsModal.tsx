
import React, { useState } from 'react';
import { MenuItem } from '../types';
import { REWARDS_MENU } from '../constants';

interface Props {
  userPoints: number;
  currentBillTotal: number;
  onApplyDiscount: (amount: number) => void;
  onRedeemItem: (item: MenuItem) => void;
  onClose: () => void;
  activeDiscount: number;
  pointsUsedInItems: number; // Points locked in cart items
}

const RewardsModal: React.FC<Props> = ({ 
  userPoints, 
  currentBillTotal, 
  onApplyDiscount, 
  onRedeemItem, 
  onClose,
  activeDiscount,
  pointsUsedInItems
}) => {
  const [activeTab, setActiveTab] = useState<'discount' | 'items'>('items');

  // Strict Calculation: Total User Points - Points tied up in Cart Items - Points tied up in Discount
  // If we are adjusting discount, we ignore the *current* active discount in the calc to avoid double subtraction visually in the slider
  // But for ITEM redemption, we must subtract both.
  
  const pointsAvailableForItems = Math.max(0, userPoints - pointsUsedInItems - activeDiscount);
  
  // For discount slider, we want to know what's available *excluding* the current active discount (because we are setting a new one)
  const pointsAvailableForDiscount = Math.max(0, userPoints - pointsUsedInItems); 
  const maxDiscountPossible = Math.min(pointsAvailableForDiscount, currentBillTotal);
  
  const [discountValue, setDiscountValue] = useState(Math.min(activeDiscount, maxDiscountPossible));

  const handleApplyDiscount = () => {
    onApplyDiscount(discountValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-[#fffbf0] w-full rounded-t-[40px] pointer-events-auto animate-in slide-in-from-bottom duration-500 max-h-[85vh] flex flex-col shadow-2xl relative z-10 overflow-hidden">
        
        {/* Decorative Header Background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 z-0" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 z-0" />
        
        {/* Header Content */}
        <div className="relative z-10 px-8 pt-8 pb-6 flex flex-col items-center text-white">
          <div className="w-16 h-1.5 bg-white/30 rounded-full mb-6" />
          <p className="text-orange-100 font-bold tracking-widest uppercase text-xs mb-1">Total Balance</p>
          <div className="flex items-baseline gap-1">
             <span className="text-5xl font-black drop-shadow-md">{userPoints}</span>
             <span className="text-lg font-bold opacity-80">pts</span>
          </div>
          <div className="flex gap-4 mt-2 text-[10px] font-bold text-orange-100 uppercase tracking-wide opacity-80 bg-black/20 px-3 py-1 rounded-full">
            <span>In Cart: {pointsUsedInItems} pts</span>
            <span> | </span>
            <span>Discount: {activeDiscount} pts</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative z-10 px-6 -mt-6">
          <div className="bg-white p-1.5 rounded-2xl shadow-lg flex gap-2">
            <button 
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'items' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-orange-50'}`}
            >
              Free Items 🎁
            </button>
            <button 
              onClick={() => setActiveTab('discount')}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'discount' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-orange-50'}`}
            >
              Bill Discount 💰
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 min-h-[300px]">
          
          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Redeem points for food</p>
                <p className="text-green-600 text-xs font-bold">Available: {pointsAvailableForItems} pts</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {REWARDS_MENU.map(item => {
                  const cost = item.pointCost || 0;
                  const canAfford = pointsAvailableForItems >= cost;

                  return (
                    <div key={item.id} className={`flex items-center p-3 rounded-[24px] border border-orange-100 bg-white shadow-sm transition-all ${!canAfford ? 'opacity-50 grayscale' : ''}`}>
                      <div className="relative w-20 h-20 shrink-0 mr-4">
                         <img src={item.image} className="w-full h-full object-cover rounded-[18px]" alt={item.name} />
                         <div className="absolute -top-2 -left-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                           FREE
                         </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-800 text-sm">{item.name}</h4>
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-xs mt-1">
                          <span>🪙</span>
                          <span>{cost} pts</span>
                        </div>
                      </div>

                      <button 
                        disabled={!canAfford}
                        onClick={() => {
                          onRedeemItem(item);
                          onClose();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-transform active:scale-95 ${canAfford ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400'}`}
                      >
                        Redeem
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'discount' && (
            <div className="flex flex-col items-center justify-center h-full space-y-8 py-4">
               <div className="text-center space-y-2">
                 <p className="text-gray-400 font-bold text-sm">Convert points to currency</p>
                 <h3 className="text-3xl font-black text-gray-800">Save Rs. {discountValue}</h3>
                 <p className="text-orange-500 font-bold text-xs">Cost: {discountValue} pts</p>
               </div>

               <div className="w-full px-4">
                 <input 
                    type="range" 
                    min="0" 
                    max={maxDiscountPossible} 
                    value={discountValue} 
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                 />
                 <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase">
                   <span>0</span>
                   <span>Max: {maxDiscountPossible} pts</span>
                 </div>
               </div>

               <div className="bg-orange-50 p-4 rounded-2xl text-center w-full">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Points available for discount</p>
                  <p className="text-lg font-black text-gray-800">{pointsAvailableForDiscount} pts</p>
                  <p className="text-[9px] text-gray-400">(Includes currently applied discount)</p>
               </div>

               <button 
                 onClick={handleApplyDiscount}
                 className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-200 active:scale-95 transition-all"
               >
                 {discountValue === 0 ? 'Remove Discount' : 'Apply Discount'}
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RewardsModal;
