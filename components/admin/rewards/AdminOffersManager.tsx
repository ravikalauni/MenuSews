
import React, { useState, useMemo } from 'react';

interface Props {
  menuItems: any[];
  onUpdateItem: (item: any) => void;
  onClose: () => void;
}

export default function AdminOffersManager({ menuItems, onUpdateItem, onClose }: Props) {
  // View State: 'list' (desktop: placeholder) | 'edit' | 'create'
  const [activeMode, setActiveMode] = useState<'list' | 'edit' | 'create'>('list');
  
  // Data State
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // For Edit Mode
  const [newItemCandidate, setNewItemCandidate] = useState<any | null>(null); // For Create Mode
  const [pointsInput, setPointsInput] = useState('');
  
  // Selector State
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived Data
  const existingOffers = useMemo(() => 
    menuItems.filter(item => item.pointCost && item.pointCost > 0),
  [menuItems]);

  const allItems = useMemo(() => 
    menuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
  [menuItems, searchQuery]);

  // --- Handlers ---

  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setPointsInput(item.pointCost.toString());
    setActiveMode('edit');
    setShowItemSelector(false);
  };

  const handleCreateClick = () => {
    setNewItemCandidate(null);
    setPointsInput('');
    setActiveMode('create');
    setShowItemSelector(false);
  };

  const handleCloseSheet = () => {
    setActiveMode('list');
    setSelectedItem(null);
    setNewItemCandidate(null);
    setShowItemSelector(false);
  };

  const handleSave = () => {
    const targetItem = activeMode === 'edit' ? selectedItem : newItemCandidate;
    
    if (!targetItem || !pointsInput) return;

    const points = parseInt(pointsInput);
    if (isNaN(points)) return;

    // Create updated item object
    const updatedItem = {
      ...targetItem,
      isRedeemable: true,
      pointCost: points
    };

    onUpdateItem(updatedItem);
    
    // Reset view
    handleCloseSheet();
  };

  const handleSelectItem = (item: any) => {
    setNewItemCandidate(item);
    // If item already has points, prefill them, else empty
    setPointsInput(item.pointCost ? item.pointCost.toString() : '');
    setShowItemSelector(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Main Modal Container - Responsive Split View on Desktop */}
      <div className="bg-[#f0fdf4] w-full md:max-w-5xl h-[90vh] md:h-[700px] rounded-t-[35px] md:rounded-[35px] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* --- LEFT SIDE (List) --- */}
        <div className="flex flex-col h-full md:w-5/12 md:border-r md:border-green-100 bg-[#f0fdf4]">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex justify-between items-center bg-[#f0fdf4] shrink-0">
               <div className="flex items-center gap-3">
                  <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-green-100 transition-colors">
                     <svg className="w-6 h-6 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div>
                     <h2 className="text-xl font-black text-green-900 leading-none">Offers</h2>
                     <p className="text-[10px] font-bold text-green-600 mt-0.5">Customize offers</p>
                  </div>
               </div>
               
               {/* Mobile Create Button */}
               <div className="md:hidden">
                   {activeMode === 'list' && (
                       <button 
                         onClick={handleCreateClick}
                         className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-orange-200 active:scale-95 transition-all"
                       >
                         Create
                       </button>
                   )}
               </div>
            </div>

            {/* Desktop Create Button Area */}
            <div className="hidden md:block px-6 mb-4">
                <button 
                    onClick={handleCreateClick}
                    className={`w-full py-3 rounded-2xl font-black text-sm shadow-sm border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 ${activeMode === 'create' ? 'bg-orange-100 ring-2 ring-orange-200' : ''}`}
                >
                    <span>+ Create New Offer</span>
                </button>
            </div>

            {/* Existing Offers List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-40 md:pb-6 relative">
               <h3 className="text-sm font-black text-orange-500 mb-3 uppercase tracking-wide">Existing offers</h3>
               <div className="space-y-3">
                  {existingOffers.length === 0 ? (
                      <div className="text-center py-10 opacity-50">
                          <div className="text-4xl mb-2">🏷️</div>
                          <p className="text-sm font-bold text-gray-500">No active offers</p>
                      </div>
                  ) : (
                      existingOffers.map(item => {
                          const isActive = activeMode === 'edit' && selectedItem?.id === item.id;
                          return (
                              <div 
                                key={item.id}
                                onClick={() => handleEditClick(item)}
                                className={`
                                    rounded-2xl p-2 flex items-center gap-3 shadow-sm cursor-pointer border transition-all
                                    ${isActive 
                                        ? 'bg-white border-green-500 ring-2 ring-green-100' 
                                        : 'bg-white border-orange-100 hover:border-orange-300'
                                    }
                                `}
                              >
                                 <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold">Rs. {item.price}</p>
                                 </div>
                                 <div className="px-3">
                                    <span className="text-sm font-black text-orange-400">{item.pointCost} Pts</span>
                                 </div>
                              </div>
                          );
                      })
                  )}
               </div>
            </div>
        </div>

        {/* --- RIGHT SIDE (Desktop Form / Mobile Sheet) --- */}
        
        {/* Mobile Backdrop for Sheet (Click to close panel) */}
        <div 
            className={`md:hidden absolute inset-0 bg-black/20 backdrop-blur-[1px] z-10 transition-opacity duration-300 ${activeMode !== 'list' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={handleCloseSheet}
        />

        {/* The Panel Itself */}
        <div 
            className={`
                absolute md:static bottom-0 left-0 right-0 md:w-7/12 bg-white md:bg-gray-50 rounded-t-[35px] md:rounded-none shadow-[0_-5px_30px_rgba(0,0,0,0.15)] md:shadow-none 
                transition-transform duration-300 ease-out z-20 flex flex-col h-[80%] md:h-full
                ${activeMode === 'list' ? 'translate-y-full md:translate-y-0' : 'translate-y-0'}
            `}
        >
            {/* Mobile Drag Handle */}
            <div className="md:hidden w-12 h-1.5 bg-orange-200 rounded-full mx-auto mt-3 mb-2 shrink-0 cursor-pointer" onClick={handleCloseSheet} />

            {/* Desktop Placeholder State */}
            <div className={`hidden md:flex flex-col items-center justify-center h-full text-center p-8 transition-opacity duration-300 ${activeMode === 'list' ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-6xl mb-6 shadow-inner animate-pulse">
                    ✨
                </div>
                <h3 className="text-2xl font-black text-gray-800">Manage Offers</h3>
                <p className="text-gray-500 font-medium mt-2 max-w-xs">Select an offer from the left to edit, or create a new one to reward your customers.</p>
            </div>

            {/* Form Content (Visible when Edit/Create active on desktop, or always in sheet on mobile if active) */}
            <div className={`flex-1 flex flex-col relative ${activeMode === 'list' ? 'md:hidden' : 'flex'}`}>
                <div className="px-6 pb-8 pt-2 md:pt-10 flex-1 overflow-y-auto no-scrollbar relative">
                    
                    {/* Mode Title */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg md:text-2xl font-black text-orange-500">
                            {activeMode === 'edit' ? 'Edit Offer' : 'Create New Offer'}
                        </h3>
                        {/* Desktop Close/Cancel Button */}
                        <button onClick={handleCloseSheet} className="hidden md:block text-gray-400 hover:text-gray-600 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                            Cancel
                        </button>
                    </div>

                    {/* --- ITEM SELECTOR / DISPLAY --- */}
                    <div className="mb-6">
                        {(activeMode === 'edit' && selectedItem) || (activeMode === 'create' && newItemCandidate) ? (
                            // Selected Item View
                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-200 bg-white md:bg-white p-6 rounded-3xl md:shadow-sm md:border md:border-gray-100">
                                <div className="relative mb-3">
                                    <img 
                                        src={activeMode === 'edit' ? selectedItem.image : newItemCandidate.image} 
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover shadow-lg" 
                                        alt="" 
                                    />
                                    {activeMode === 'create' && (
                                        <button 
                                            onClick={() => setShowItemSelector(true)}
                                            className="absolute -bottom-2 -right-2 bg-gray-100 hover:bg-gray-200 rounded-full p-2 shadow-sm border-2 border-white text-gray-600 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        </button>
                                    )}
                                </div>
                                <span className="font-black text-gray-800 text-lg">
                                    {activeMode === 'edit' ? selectedItem.name : newItemCandidate.name}
                                </span>
                                <span className="text-xs font-bold text-gray-400 mt-1">
                                    Rs. {activeMode === 'edit' ? selectedItem.price : newItemCandidate.price}
                                </span>
                            </div>
                        ) : (
                            // Empty State (Create Mode)
                            <div className="flex flex-col items-center justify-center py-8 md:py-16 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-200">
                                <p className="text-sm font-bold text-orange-400 mb-4">No item selected</p>
                                <button 
                                    onClick={() => setShowItemSelector(true)}
                                    className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-200 active:scale-95 transition-all"
                                >
                                    Select Menu Item
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- POINTS INPUT --- */}
                    {((activeMode === 'edit') || (activeMode === 'create' && newItemCandidate)) && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 max-w-sm mx-auto w-full">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase ml-1">Points Needed to Redeem</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={pointsInput}
                                        onChange={(e) => setPointsInput(e.target.value)}
                                        placeholder="0"
                                        className="w-full h-16 pl-6 pr-16 bg-white border-2 border-orange-100 rounded-2xl text-orange-800 font-black text-2xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all placeholder-orange-200"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-400 uppercase">
                                        Pts
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl transition-all active:scale-95 hover:shadow-2xl 
                                    ${activeMode === 'edit' 
                                        ? 'bg-gradient-to-r from-[#a16207] to-[#d97706] shadow-amber-200' 
                                        : 'bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-200'
                                    }
                                `}
                            >
                                {activeMode === 'edit' ? 'Update Offer' : 'Create Offer'}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- SELECT ITEM OVERLAY (Inside Right Panel) --- */}
                {showItemSelector && (
                    <div className="absolute inset-0 bg-white z-30 flex flex-col rounded-t-[35px] md:rounded-none animate-in fade-in slide-in-from-bottom-10 md:slide-in-from-right-10 duration-300">
                        <div className="p-4 border-b border-orange-100 flex items-center gap-3 bg-[#fff8ed] rounded-t-[35px] md:rounded-none">
                            <button onClick={() => setShowItemSelector(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <svg className="w-5 h-5 text-orange-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="flex-1">
                                <p className="text-xs font-black text-orange-400 mb-1">Select Item</p>
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search menu..." 
                                    className="w-full bg-white border border-orange-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-orange-400"
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar p-2 bg-gray-50/50">
                            <div className="space-y-2">
                                {allItems.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => handleSelectItem(item)}
                                        className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-orange-50 cursor-pointer border border-transparent hover:border-orange-100 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-orange-600">Rs. {item.price}/-</p>
                                            {item.pointCost > 0 && <p className="text-[10px] font-bold text-green-600">{item.pointCost} pts</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
