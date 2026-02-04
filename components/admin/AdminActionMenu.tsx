
import React, { useState } from 'react';

interface Props {
  item: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updatedItem: any) => void;
}

export default function AdminActionMenu({ item, onClose, onEdit, onDelete, onUpdate }: Props) {
  // Determine initial states based on item properties
  // isAvailable defaults to true if undefined
  const isNotAvailable = item.isAvailable === false; 
  const isBestRated = item.rating >= 4.8;
  const initialHasDiscount = !!item.discount || !!item.oldPrice;
  
  // UI States for expanding sections
  const [activeSection, setActiveSection] = useState<'none' | 'offer' | 'points'>('none');
  
  // Form States
  const [offerName, setOfferName] = useState(item.discount?.name || '');
  const [oldPrice, setOldPrice] = useState(item.discount?.oldPrice || item.oldPrice || '');
  const [newPrice, setNewPrice] = useState(item.discount?.newPrice || item.price || '');
  
  // Points State
  const [isRedeemable, setIsRedeemable] = useState(!!item.pointCost); 
  const [pointsCost, setPointsCost] = useState(item.pointCost || '');
  const [pointsEarn, setPointsEarn] = useState(item.earnedPoints || '');

  // Toggle Handlers
  const toggleAvailability = () => {
    const newItem = {
        ...item,
        isAvailable: !item.isAvailable
    };
    onUpdate(newItem);
  };

  const toggleBestRated = () => {
    const newItem = {
        ...item,
        rating: isBestRated ? 4.5 : 5.0, // Toggle between 5.0 (Best Rated) and 4.5 (High but not best)
    };
    onUpdate(newItem);
  };

  const handleSaveOffer = () => {
      const newItem = {
          ...item,
          // Update core price if needed, or just display via discount
          // Usually discount doesn't change base price, but for this simple app we might want to
          discount: {
              name: offerName || 'Special Offer',
              oldPrice: Number(oldPrice),
              newPrice: Number(newPrice)
          }
      };
      onUpdate(newItem);
      setActiveSection('none');
  };

  const handleSavePoints = () => {
      const newItem = {
          ...item,
          isRedeemable: isRedeemable,
          pointCost: isRedeemable ? Number(pointsCost) : 0,
          earnedPoints: Number(pointsEarn)
      };
      onUpdate(newItem);
      setActiveSection('none');
  };

  // Badge Logic for Preview
  let badgeText = 'Standard';
  let badgeColor = 'green';
  if (isNotAvailable) {
      badgeText = 'Not Available';
      badgeColor = 'red';
  } else if (item.discount) {
      badgeText = item.discount.name;
      badgeColor = 'gradient';
  } else if (isBestRated) {
      badgeText = 'Best Rated';
      badgeColor = 'orange';
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full sm:max-w-md rounded-t-[35px] sm:rounded-[35px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-200 rounded-full z-20" />

        {/* 1. Header Item Summary */}
        <div className="pt-8 px-6 pb-2 text-center">
            <h3 className="text-green-700 font-bold text-sm uppercase tracking-wider mb-4">What do you want to do with this item?</h3>
            
            <div className="bg-white border border-green-200 rounded-2xl p-3 shadow-sm flex items-center gap-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-50 text-[9px] font-bold text-green-600 px-2 py-1 rounded-bl-xl">
                    {item.time || '15m'}
                </div>
                <div className="w-20 h-20 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div>
                    <h4 className="font-black text-gray-800 leading-tight text-lg">{item.name}</h4>
                    <div className="flex items-center gap-1 my-0.5">
                        <span className="text-yellow-500 text-xs">⭐</span>
                        <span className="text-xs font-bold text-gray-500">{item.rating}</span>
                    </div>
                    <p className="font-black text-green-700">Rs. {item.discount?.newPrice || item.price}/-</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${badgeColor === 'red' ? 'bg-red-100 text-red-600' : (badgeColor === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700')}`}>
                        {badgeText}
                    </span>
                    <p className="text-[9px] text-red-500 font-bold mt-0.5">{item.orders || '0 Orders'}</p>
                </div>
            </div>
        </div>

        {/* 2. Action Grid */}
        <div className="px-6 py-4 flex-1 overflow-y-auto no-scrollbar space-y-4">
            
            {/* Top Row Buttons */}
            <div className="flex gap-2">
                <button 
                    onClick={toggleAvailability}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase leading-tight shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1
                        ${isNotAvailable ? 'bg-blue-800 text-white shadow-blue-200' : 'bg-[#0f4c81] text-white shadow-blue-200 hover:bg-[#0d4270]'}
                    `}
                >
                    <span>Set to</span>
                    <span>{isNotAvailable ? 'Available' : 'Not Available'}</span>
                </button>

                <button 
                    onClick={toggleBestRated}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase leading-tight shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1
                        ${isBestRated ? 'bg-orange-700 text-white shadow-orange-200' : 'bg-[#d97706] text-white shadow-orange-200 hover:bg-[#b45309]'}
                    `}
                >
                    <span>Set to</span>
                    <span>Best rated</span>
                </button>

                <button 
                    onClick={() => setActiveSection(activeSection === 'offer' ? 'none' : 'offer')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase leading-tight shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1
                        ${activeSection === 'offer' ? 'bg-[#d600a0] text-white' : 'bg-[#ff00bf] text-white shadow-pink-200 hover:bg-[#d600a0]'}
                    `}
                >
                    <span>{initialHasDiscount ? 'Update' : 'Set to'}</span>
                    <span>Special offer</span>
                </button>
            </div>

            {/* Set Points Button (Full Width if not active, hidden if section active to show header instead) */}
            {activeSection !== 'points' && (
                <button 
                    onClick={() => setActiveSection('points')}
                    className="w-full py-3 bg-[#008b99] text-white rounded-xl font-black text-sm shadow-md shadow-cyan-200 active:scale-95 transition-all hover:bg-[#007a87]"
                >
                    Set points
                </button>
            )}

            {/* --- DYNAMIC SECTIONS --- */}

            {/* A. Not Available Info */}
            {isNotAvailable && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] text-blue-800 font-bold italic mb-4 text-center">
                        Setting the item to Not Available will label the item with Not Available.
                        Customers can still see the item but can not order it.
                    </p>
                    <button 
                        onClick={toggleAvailability}
                        className="w-full py-3 bg-[#0f4c81] text-white rounded-lg font-black text-sm shadow-md active:scale-95 transition-all"
                    >
                        Set to Available
                    </button>
                </div>
            )}

            {/* B. Best Rated Info */}
            {isBestRated && !isNotAvailable && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] text-orange-800 font-bold italic mb-4 text-center">
                        Setting the item to Best Rated will label the item with Best Rated.
                        It will be set to 5 star rating.
                    </p>
                    <div className="flex justify-center gap-1 mb-4 text-orange-400">
                        {'★★★★★'.split('').map((s, i) => <span key={i} className="text-xl">{s}</span>)}
                    </div>
                    <button 
                        onClick={toggleBestRated}
                        className="w-full py-3 bg-[#d97706] text-white rounded-lg font-black text-sm shadow-md active:scale-95 transition-all"
                    >
                        Remove Best Rated
                    </button>
                </div>
            )}

            {/* C. Special Offer Form */}
            {activeSection === 'offer' && (
                <div className="bg-[#ffccf9] border border-[#ff00bf] rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] text-[#b30086] font-bold italic mb-4 text-center">
                        Adding the item to Special Offer will label the item with Special Offer.
                        The item must have to be discounted.
                    </p>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Offer name (e.g. Dashain Offer)" 
                            value={offerName}
                            onChange={e => setOfferName(e.target.value)}
                            className="w-full h-10 px-3 rounded border border-[#ff00bf]/30 text-xs font-bold text-[#b30086] outline-none bg-white placeholder-[#ff00bf]/40"
                        />
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="Old Price" 
                                value={oldPrice}
                                onChange={e => setOldPrice(e.target.value)}
                                className="w-1/2 h-10 px-3 rounded border border-[#ff00bf]/30 text-xs font-bold text-[#b30086] outline-none bg-white placeholder-[#ff00bf]/40"
                            />
                            <input 
                                type="number" 
                                placeholder="New Price" 
                                value={newPrice}
                                onChange={e => setNewPrice(e.target.value)}
                                className="w-1/2 h-10 px-3 rounded border border-[#ff00bf]/30 text-xs font-bold text-[#b30086] outline-none bg-white placeholder-[#ff00bf]/40"
                            />
                        </div>
                        <div className="text-center text-[10px] font-bold text-[#b30086]">
                            Rs. {oldPrice && newPrice ? Number(oldPrice) - Number(newPrice) : '00.00'} Discounted
                        </div>
                        <button 
                            onClick={handleSaveOffer}
                            className="w-full py-3 bg-[#ff00bf] text-white rounded-lg font-black text-sm shadow-md active:scale-95 transition-all hover:bg-[#d600a0]"
                        >
                            {initialHasDiscount ? 'Update Offer' : 'Add Special Offer'}
                        </button>
                    </div>
                </div>
            )}

            {/* D. Points Form */}
            {activeSection === 'points' && (
                <div className="bg-[#e0f7fa] border border-[#008b99] rounded-xl p-4 animate-in slide-in-from-top-2 duration-200">
                    <div className="w-full bg-[#008b99] text-white text-center py-2 rounded-lg font-black text-sm mb-4 shadow-sm">
                        Set points
                    </div>
                    
                    <p className="text-[10px] text-[#006064] font-bold italic mb-4">
                        Setting points will get user this item using his points and get points after ordering this item.
                    </p>

                    <div className="space-y-3">
                        {/* Points Needed Row */}
                        <div className="flex items-center justify-between gap-3">
                            <input 
                                type="number"
                                placeholder="Points needed to redeem"
                                value={pointsCost}
                                onChange={e => setPointsCost(e.target.value)}
                                className="flex-1 h-10 px-3 rounded border border-[#008b99]/30 text-xs font-bold text-[#006064] outline-none bg-white placeholder-[#008b99]/40"
                            />
                            <div 
                                onClick={() => setIsRedeemable(!isRedeemable)}
                                className={`w-12 h-6 rounded-full transition-colors relative flex items-center cursor-pointer shrink-0 ${isRedeemable ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute transition-transform ${isRedeemable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </div>
                        </div>

                        {/* Points Earned Row */}
                        <div className="flex items-center justify-between gap-3">
                            <input 
                                type="number"
                                placeholder="Points earned on purchase"
                                value={pointsEarn}
                                onChange={e => setPointsEarn(e.target.value)}
                                className="flex-1 h-10 px-3 rounded border border-[#008b99]/30 text-xs font-bold text-[#006064] outline-none bg-white placeholder-[#008b99]/40"
                            />
                            <div className="w-12 h-6 rounded-full bg-red-400 relative flex items-center shrink-0">
                                <div className="w-5 h-5 rounded-full bg-white shadow-md absolute translate-x-6" />
                            </div>
                        </div>

                        <button 
                            onClick={handleSavePoints}
                            className="w-full py-3 bg-[#008b99] text-white rounded-lg font-black text-sm shadow-md active:scale-95 transition-all hover:bg-[#007a87]"
                        >
                            Update Points
                        </button>
                    </div>
                </div>
            )}

        </div>

        {/* 3. Footer Main Actions */}
        <div className="p-6 pt-2 bg-white border-t border-gray-50 shrink-0 space-y-3 pb-8 sm:pb-6">
            <button 
                onClick={onEdit}
                className="w-full h-12 bg-green-700 hover:bg-green-800 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Edit Item Details
            </button>
            <button 
                onClick={onDelete}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete Item
            </button>
        </div>

      </div>
    </div>
  );
}
