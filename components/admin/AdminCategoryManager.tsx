
import React, { useState } from 'react';
import AdminCategoryDetailModal from './AdminCategoryDetailModal';

interface CategoryData {
  id: string;
  name: string;
  // Fix: Make description and itemCount optional to match initial data and dynamic updates
  description?: string;
  itemCount?: number;
  image: string;
}

interface Props {
  categories: CategoryData[];
  menuItems: any[]; // Full list of items to filter
  onClose: () => void;
  onEdit: (cat: CategoryData) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

export default function AdminCategoryManager({ categories, menuItems, onClose, onEdit, onDelete, onCreate }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryForDetail, setSelectedCategoryForDetail] = useState<CategoryData | null>(null);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getItemsForCategory = (categoryName: string) => {
      // Logic to filter items based on category name
      // Note: In real app, IDs are safer, but mock data uses string names (e.g., 'Fast food')
      return menuItems.filter(item => 
          item.category.toLowerCase() === categoryName.toLowerCase() || 
          (categoryName === 'Fast Food' && item.category === 'Fast food') // Handle small casing diffs in mock data
      );
  };

  return (
    <>
      <div className="absolute inset-0 bg-[#f8fafc] z-50 flex flex-col animate-in slide-in-from-right duration-300">
         
         {/* Header Section - Professional Green Theme */}
         <div className="bg-white border-b border-green-100 flex flex-col shadow-sm relative z-20 shrink-0">
            
            {/* Top Bar */}
            <div className="flex justify-between items-center px-6 py-5">
               <div className="flex items-center gap-4">
                 <button 
                   onClick={onClose} 
                   className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 group"
                 >
                    <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Categories</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">Manage your menu sections</p>
                 </div>
               </div>
               
               <button 
                 onClick={onCreate}
                 className="bg-[#4338ca] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
               >
                  <div className="bg-white/20 p-1 rounded-md">
                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <span className="hidden sm:inline">Add Category</span>
                  <span className="sm:hidden">Add</span>
               </button>
            </div>

            {/* Search Bar Container */}
            <div className="px-6 pb-6 w-full max-w-3xl">
               <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 focus-within:bg-white transition-all group">
                  <svg className="w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search categories..." 
                    className="w-full outline-none text-sm font-bold text-gray-800 placeholder-gray-400 bg-transparent"
                  />
               </div>
            </div>
         </div>

         {/* List Content */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc] no-scrollbar relative z-10">
            <div className="space-y-4 max-w-5xl mx-auto pb-20">
              {filteredCategories.length === 0 ? (
                 <div className="text-center py-20 opacity-50 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4 grayscale">📂</div>
                    <p className="text-xl font-bold text-gray-400">No categories found.</p>
                    <p className="text-sm text-gray-300 font-medium">Try searching for something else or add a new one.</p>
                 </div>
              ) : (
                 filteredCategories.map((cat) => (
                    <div 
                      key={cat.id} 
                      className="bg-white rounded-[24px] p-3 sm:p-4 shadow-sm border border-red-100 flex flex-col sm:flex-row gap-3 sm:gap-5 hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer"
                      onClick={() => setSelectedCategoryForDetail(cat)}
                    >
                       
                       {/* Mobile: Top Row / Desktop: Left Side */}
                       <div className="flex items-start gap-4 flex-1">
                          {/* Image */}
                          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[18px] overflow-hidden border border-gray-100 shadow-sm shrink-0 relative bg-gray-50">
                             <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          
                          {/* Text Content */}
                          <div className="flex-1 min-w-0 pt-1">
                             <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-gray-900 font-black text-base sm:text-lg leading-tight">{cat.name}</h3>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 whitespace-nowrap">
                                   {/* Fix: provide fallback for optional itemCount */}
                                   {cat.itemCount || 0} items
                                </span>
                             </div>
                             <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">
                                {/* Fix: provide fallback for optional description */}
                                {cat.description || ''}
                             </p>
                          </div>
                       </div>

                       {/* Actions Row (Mobile: Bottom Full Width / Desktop: Right Side) */}
                       <div className="flex items-center gap-2 mt-1 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 sm:border-none" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               onEdit(cat);
                            }}
                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 sm:py-2.5 rounded-xl text-xs font-black shadow-lg shadow-green-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                          >
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             <span>Edit</span>
                          </button>

                          <button 
                            onClick={(e) => {
                               e.stopPropagation();
                               if(window.confirm('Are you sure you want to delete this category?')) {
                                  onDelete(cat.id);
                               }
                            }}
                            className="w-10 sm:w-10 h-10 sm:h-auto bg-red-50 hover:bg-red-100 text-red-500 rounded-xl flex items-center justify-center transition-all active:scale-95 border border-red-100 flex-shrink-0"
                            title="Delete Category"
                          >
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </div>
                 ))
              )}
            </div>
         </div>
      </div>

      {/* Detail Modal Overlay */}
      {selectedCategoryForDetail && (
         <AdminCategoryDetailModal 
            category={selectedCategoryForDetail}
            items={getItemsForCategory(selectedCategoryForDetail.name)}
            allCategories={categories}
            onClose={() => setSelectedCategoryForDetail(null)}
            onDeleteItem={(itemId) => {
                // In a real app, we would update state here.
                console.log('Delete item', itemId);
            }}
         />
      )}
    </>
  );
}
