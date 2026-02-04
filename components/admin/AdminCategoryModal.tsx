
import React, { useState, useRef } from 'react';

interface Props {
  mode: 'create' | 'edit';
  initialData?: any;
  allCategories?: any[]; // Passed to select parent
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AdminCategoryModal({ mode, initialData, allCategories = [], onClose, onSave }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  
  // New Fields
  const [type, setType] = useState<'cooked' | 'instant'>(initialData?.type || 'cooked');
  const [parentId, setParentId] = useState<string>(initialData?.parentId || '');
  
  // Custom Dropdown State
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
      onSave({
          id: initialData?.id,
          name,
          description,
          image: imagePreview,
          type,
          parentId: parentId || null
      });
  };

  // Filter potential parents: Must be same type, cannot be self
  const potentialParents = allCategories.filter(c => 
      c.type === type && 
      c.id !== initialData?.id && 
      !c.parentId // Only allow 2 levels (Parent -> Child), so parent cannot be a child itself
  );

  const selectedParent = potentialParents.find(p => p.id === parentId);

  return (
    <div className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full sm:max-w-lg rounded-t-[35px] sm:rounded-[35px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
        
        {/* Mobile Drag Handle Indicator (Visual Only) */}
        <div className="sm:hidden absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-white/20 rounded-full z-30" />

        {/* Header - Dynamic Color based on Type */}
        <div className={`p-6 pb-8 text-white text-center relative overflow-hidden shrink-0 transition-colors duration-300 ${type === 'cooked' ? 'bg-[#4338ca]' : 'bg-orange-600'}`}>
           {/* Decorative circles */}
           <div className="absolute top-[-20px] left-[-20px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
           <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-white/10 rounded-full blur-xl" />

           <h2 className="text-2xl font-black relative z-10 mt-2 sm:mt-0">
             {mode === 'create' ? 'New Category' : 'Edit Category'}
           </h2>
           <p className="text-white/80 text-xs font-bold relative z-10 mt-1">
               {type === 'cooked' ? 'Kitchen Section' : 'Bar / Counter Section'}
           </p>

           <button 
             onClick={onClose} 
             className="absolute top-5 right-5 text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all z-20"
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 pt-6 flex-1 overflow-y-auto no-scrollbar bg-white">
           
           <div className="flex flex-col gap-6">
              
              {/* 1. Type Selector (Cooked vs Instant) */}
              <div className="bg-gray-50 p-1.5 rounded-xl flex relative border border-gray-200">
                  <div 
                      className="absolute inset-y-1.5 w-[48%] bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 ease-out"
                      style={{ left: type === 'cooked' ? '0.5%' : '51.5%' }}
                  />
                  <button 
                      onClick={() => { setType('cooked'); setParentId(''); }}
                      className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-black transition-colors ${type === 'cooked' ? 'text-indigo-700' : 'text-gray-400'}`}
                  >
                      <span>🍳</span> Kitchen (Cooked)
                  </button>
                  <button 
                      onClick={() => { setType('instant'); setParentId(''); }}
                      className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 text-xs font-black transition-colors ${type === 'instant' ? 'text-orange-600' : 'text-gray-400'}`}
                  >
                      <span>⚡</span> Bar (Instant)
                  </button>
              </div>

              {/* Image Upload */}
              <div className="flex justify-center">
                 <div 
                   onClick={handleImageClick}
                   className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer transition-all bg-gray-50 shadow-inner
                     ${type === 'cooked' ? 'border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50' : 'border-orange-200 hover:border-orange-500 hover:bg-orange-50'}
                   `}
                 >
                    {imagePreview ? (
                        <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <svg className={`w-8 h-8 mb-1 transition-colors ${type === 'cooked' ? 'text-indigo-300 group-hover:text-indigo-500' : 'text-orange-300 group-hover:text-orange-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            <span className="text-[9px] font-bold text-gray-400 text-center px-4 transition-colors">Upload Icon</span>
                        </>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                 </div>
              </div>

              {/* Inputs */}
              <div className="w-full space-y-5">
                 
                 {/* Parent Category Custom Dropdown */}
                 <div className="relative z-20">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Hierarchy (Optional)</label>
                    
                    {/* Backdrop for closing dropdown */}
                    {isParentDropdownOpen && (
                        <div className="fixed inset-0 z-10" onClick={() => setIsParentDropdownOpen(false)} />
                    )}

                    <div className="relative z-20">
                        <button
                            onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                            className={`w-full h-14 bg-white border rounded-2xl px-4 flex items-center justify-between text-sm font-bold transition-all outline-none group
                                ${isParentDropdownOpen 
                                    ? (type === 'cooked' ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-orange-500 ring-4 ring-orange-50') 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${!parentId ? 'bg-gray-100' : 'bg-gray-100'}`}>
                                    {parentId && selectedParent ? (
                                        <img src={selectedParent.image} className="w-full h-full object-cover rounded-lg" alt="" />
                                    ) : (
                                        <span className="text-gray-400">⚡</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className={`text-[10px] uppercase font-black tracking-wide ${parentId ? 'text-gray-400' : 'text-gray-400'}`}>Parent Category</span>
                                    <span className={`leading-none ${parentId ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {parentId && selectedParent ? selectedParent.name : "No Parent (Top Level)"}
                                    </span>
                                </div>
                            </div>
                            <svg 
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isParentDropdownOpen ? 'rotate-180' : ''}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isParentDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-56 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                {/* Option: No Parent */}
                                <button
                                    onClick={() => {
                                        setParentId('');
                                        setIsParentDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-gray-50 flex items-center gap-3 hover:bg-gray-50
                                        ${!parentId ? 'bg-gray-50' : ''}
                                    `}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">🚫</div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-800">No Parent (Top Level)</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Create a main category</span>
                                    </div>
                                    {!parentId && <span className="ml-auto text-green-500 font-black">✓</span>}
                                </button>
                                
                                {potentialParents.length > 0 ? (
                                    potentialParents.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setParentId(p.id);
                                                setIsParentDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 flex items-center gap-3 hover:bg-gray-50
                                                ${parentId === p.id ? 'bg-gray-50' : ''}
                                            `}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                <img src={p.image} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-gray-800 truncate">{p.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium">{p.itemCount} items inside</span>
                                            </div>
                                            {parentId === p.id && <span className="ml-auto text-green-500 font-black">✓</span>}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-6 text-center">
                                        <p className="text-xs text-gray-400 font-bold mb-1">No potential parents found.</p>
                                        <p className="text-[10px] text-gray-300">Create more top-level categories first.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 ml-1 mt-2 leading-tight font-medium">
                        {parentId 
                            ? `This item will be nested inside ${selectedParent?.name}.`
                            : "This will be a main category. You can add sub-categories to it later."}
                    </p>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Category Name</label>
                    <div className={`border rounded-2xl px-4 py-3.5 focus-within:ring-4 transition-all bg-white shadow-sm ${type === 'cooked' ? 'border-gray-200 focus-within:ring-indigo-100 focus-within:border-indigo-500' : 'border-gray-200 focus-within:ring-orange-100 focus-within:border-orange-500'}`}>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={parentId ? "e.g. Beer, Wine" : "e.g. Alcoholic Drinks"}
                          className="w-full text-sm font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent"
                        />
                    </div>
                 </div>
                 
                 <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Description</label>
                    <div className={`border rounded-2xl px-4 py-3.5 focus-within:ring-4 transition-all bg-white h-24 sm:h-24 shadow-sm ${type === 'cooked' ? 'border-gray-200 focus-within:ring-indigo-100 focus-within:border-indigo-500' : 'border-gray-200 focus-within:ring-orange-100 focus-within:border-orange-500'}`}>
                        <textarea 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Short description for the menu..." 
                          className="w-full h-full text-sm font-medium text-gray-800 placeholder-gray-300 outline-none resize-none bg-transparent"
                        />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer Button */}
        <div className="p-6 pt-4 bg-white border-t border-gray-50 shrink-0 pb-8 sm:pb-6">
           <button 
             onClick={handleSubmit} 
             className={`w-full text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2
                ${type === 'cooked' ? 'bg-[#4338ca] shadow-indigo-200 hover:bg-indigo-700' : 'bg-orange-600 shadow-orange-200 hover:bg-orange-700'}
             `}
           >
              {mode === 'create' ? 'Create Category' : 'Save Changes'}
           </button>
        </div>
      </div>
    </div>
  );
}
