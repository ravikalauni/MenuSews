
import React, { useState } from 'react';
import AdminProductCardModal from './AdminProductCardModal';
import AdminMoveCategoryModal from './AdminMoveCategoryModal';

interface Props {
  category: any;
  items: any[];
  allCategories: any[];
  onClose: () => void;
  onDeleteItem: (itemId: string) => void; 
}

export default function AdminCategoryDetailModal({ category, items, allCategories, onClose, onDeleteItem }: Props) {
  // Local state for immediate UI updates
  const [localItems, setLocalItems] = useState(items);
  
  // Sub-modals state
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [moveItem, setMoveItem] = useState<any | null>(null);
  
  // Success Feedback
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Remove this item from category?')) {
        setLocalItems(prev => prev.filter(i => i.id !== id));
        onDeleteItem(id); // Notify parent if needed
    }
  };

  const handleMoveSuccess = (targetCategoryName: string) => {
    if (moveItem) {
        const itemName = moveItem.name;
        // Remove from local list
        setLocalItems(prev => prev.filter(i => i.id !== moveItem.id));
        setMoveItem(null);
        
        // Show Success Popup
        setShowSuccess(`${itemName} moved to ${targetCategoryName}`);
        setTimeout(() => setShowSuccess(null), 2500);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6 p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
        
        {/* Main Modal Container - Responsive Layout */}
        <div className="bg-white w-full max-w-lg md:max-w-6xl h-[85vh] md:h-[750px] rounded-[35px] shadow-2xl relative z-10 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
           
           {/* LEFT SIDE (Desktop Sidebar / Mobile Header) */}
           <div className="relative h-40 md:h-full md:w-80 shrink-0 bg-green-900 overflow-hidden group">
              <img src={category.image} className="w-full h-full object-cover opacity-80 md:opacity-60 transition-transform duration-700 group-hover:scale-110" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent md:bg-gradient-to-b md:from-transparent md:to-black/90" />
              
              {/* Close Button */}
              <button 
                onClick={onClose} 
                className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all z-20"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>

              {/* Category Info Content */}
              <div className="absolute bottom-5 left-6 right-6 text-white z-10">
                 <h2 className="text-3xl md:text-4xl font-black leading-none mb-2 shadow-black drop-shadow-md">{category.name}</h2>
                 
                 <div className="flex flex-wrap gap-2 items-center">
                    <p className="text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg inline-block border border-white/10 shadow-sm">
                       {localItems.length} items
                    </p>
                    <p className="text-[10px] font-bold bg-green-500 text-white px-2 py-1 rounded-lg uppercase tracking-wide shadow-sm">
                       Active
                    </p>
                 </div>

                 {/* Desktop Only Description */}
                 <p className="hidden md:block text-sm text-gray-300 mt-4 leading-relaxed font-medium">
                    {category.description || 'Manage all items in this category. You can add, edit, move or delete items here.'}
                 </p>
              </div>
           </div>

           {/* RIGHT SIDE (Content Area) */}
           <div className="flex-1 flex flex-col bg-[#f8fafc] h-full min-h-0 relative">
              
              {/* Desktop Header (Hidden on Mobile) */}
              <div className="hidden md:flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100 shrink-0">
                  <div>
                      <h3 className="text-xl font-black text-gray-800">Category Items</h3>
                      <p className="text-xs text-gray-400 font-bold mt-0.5">Manage products in this section</p>
                  </div>
                  <div className="flex gap-2">
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 border border-gray-100">
                         Sort by: Newest
                      </div>
                  </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
                 {localItems.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl grayscale opacity-50">🍽️</div>
                        <div className="text-center">
                            <p className="font-bold text-lg text-gray-500">No items found</p>
                            <p className="text-sm">This category is currently empty.</p>
                        </div>
                     </div>
                  ) : (
                    // Grid Layout for Desktop (2 cols md, 3 cols lg), List for Mobile
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                        {localItems.map((item) => (
                          <div 
                             key={item.id} 
                             className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm border border-green-50 flex flex-col gap-3 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                          >
                             
                             {/* Item Content Wrapper: Mobile=Row, Desktop=Col */}
                             <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-4">
                                {/* Image */}
                                <div className="w-14 h-14 md:w-full md:h-44 bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden shrink-0 relative group-hover:shadow-inner">
                                   <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                   
                                   {/* Desktop Hover Action: Delete Button overlay */}
                                   <div className="hidden md:flex absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button 
                                          onClick={(e) => handleDelete(item.id, e)}
                                          className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                                          title="Delete Item"
                                       >
                                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                       </button>
                                   </div>
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0 w-full">
                                   <div className="flex justify-between items-start">
                                      <h4 className="font-black text-gray-800 text-sm md:text-lg leading-tight truncate md:whitespace-normal mb-0.5">{item.name}</h4>
                                      
                                      {/* Mobile Delete Button (Visible only on mobile) */}
                                      <button 
                                        onClick={(e) => handleDelete(item.id, e)}
                                        className="md:hidden w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shrink-0 ml-2"
                                      >
                                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                   </div>
                                   
                                   <p className="text-xs md:text-sm font-bold text-gray-500 mt-0.5 md:mt-1">Rs. {item.price}</p>
                                   
                                   <div className="flex items-center gap-1.5 mt-1 md:mt-2">
                                       <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">In Stock</span>
                                       <span className="text-[10px] text-gray-400 font-bold">• {item.orders || '0'} Sales</span>
                                   </div>
                                </div>
                             </div>

                             {/* Actions Row */}
                             <div className="flex gap-2 mt-auto pt-1 md:pt-2 w-full">
                                <button 
                                   onClick={() => setDetailItem(item)}
                                   className="flex-1 bg-green-600 text-white py-2 md:py-2.5 rounded-xl text-xs font-black shadow-green-100 shadow-md active:scale-95 transition-all hover:bg-green-700"
                                >
                                   View Details
                                </button>
                                <button 
                                   onClick={() => setMoveItem(item)}
                                   className="flex-1 bg-[#ff5722] text-white py-2 md:py-2.5 rounded-xl text-xs font-black shadow-orange-100 shadow-md active:scale-95 transition-all hover:bg-[#f4511e]"
                                >
                                   Move
                                </button>
                             </div>
                          </div>
                        ))}
                    </div>
                  )}
              </div>

              {/* Mobile Footer (Hidden on Desktop) */}
              <div className="md:hidden p-4 border-t border-gray-100 bg-white shrink-0">
                  <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-sm hover:bg-gray-200 transition-colors">
                    Close
                  </button>
              </div>
           </div>
        </div>
      </div>

      {/* --- Sub Modals --- */}
      
      {/* Product Card Modal */}
      {detailItem && (
         <AdminProductCardModal 
           item={detailItem}
           onClose={() => setDetailItem(null)}
         />
      )}

      {/* Move Category Modal (Bottom Sheet) */}
      {moveItem && (
         <AdminMoveCategoryModal 
           currentCategoryName={category.name}
           allCategories={allCategories}
           onMove={handleMoveSuccess}
           onClose={() => setMoveItem(null)}
         />
      )}

      {/* Success Popup */}
      {showSuccess && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
            <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-3xl animate-bounce">
                  ✅
               </div>
               <h3 className="text-xl font-black text-gray-800 mb-1">Success!</h3>
               <p className="text-sm font-bold text-gray-500">{showSuccess}</p>
            </div>
         </div>
      )}
    </>
  );
}
