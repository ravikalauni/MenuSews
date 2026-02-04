
import React, { useState, useRef, useMemo, useEffect } from 'react';
import AdminIngredientManager from './AdminIngredientManager';

interface Props {
  categories: any[];
  initialData?: any; 
  onClose: () => void;
  onSave: (productData: any) => void;
  onAddCategoryClick: () => void;
  allIngredients?: any[];
  onUpdateIngredients?: (action: { 
      add?: {name: string, image: string}, 
      edit?: {id: string, name: string, image: string}, 
      deleteId?: string 
  }) => void;
}

const SERVING_UNITS = ['Glass', 'Bottle', 'Shot', 'Pack', 'Stick', 'Can', 'Pitcher'];

export default function AdminProductModal({ categories, initialData, onClose, onSave, onAddCategoryClick, allIngredients = [], onUpdateIngredients }: Props) {
  
  // --- FORM STATE ---
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [requiresPreparation, setRequiresPreparation] = useState<boolean>(initialData?.requiresPreparation ?? true); // Default to true (Cooked)
  
  // Redeem & Points
  const [isRedeemable, setIsRedeemable] = useState(initialData?.isRedeemable || false);
  const [pointsCost, setPointsCost] = useState(initialData?.pointsNeeded?.toString() || '');
  const [pointsEarn, setPointsEarn] = useState(initialData?.pointsEarned?.toString() ?? '');
  const [rating, setRating] = useState(initialData?.rating?.toString() || '');
  const [time, setTime] = useState(initialData?.time || '');
  
  // Cooked Features State
  const [dietaryType, setDietaryType] = useState<'veg' | 'non-veg' | 'both' | 'none'>(initialData?.dietaryType || 'none');
  const [hasSpiceLevel, setHasSpiceLevel] = useState(initialData?.hasSpiceLevel || false);
  const [portionType, setPortionType] = useState<'half' | 'full' | 'both' | 'none'>(initialData?.portionType || 'none');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialData?.ingredients || []);

  // Instant Features State
  const [servingUnit, setServingUnit] = useState<string>(initialData?.servingUnit || 'Glass');

  // Category State
  // We extract initial categories, but we must validate them against the current mode later
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
      if (initialData?.categories) return initialData.categories;
      if (initialData?.category) return Array.isArray(initialData.category) ? initialData.category : [initialData.category];
      return [];
  });
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  
  // Ingredients Dropdown State
  const [isIngredientOpen, setIsIngredientOpen] = useState(false);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [showIngredientManager, setShowIngredientManager] = useState(false);

  // Discount State
  const hasDiscount = !!initialData?.discount || !!initialData?.oldPrice;
  const [showDiscount, setShowDiscount] = useState(hasDiscount);
  const [offerName, setOfferName] = useState(initialData?.discount?.name || (initialData?.oldPrice ? initialData.badgeText : '') || '');
  const [beforePrice, setBeforePrice] = useState(initialData?.discount?.oldPrice?.toString() || initialData?.oldPrice?.toString() || '');
  const [afterPrice, setAfterPrice] = useState(initialData?.discount?.newPrice?.toString() || (hasDiscount ? initialData?.price?.toString() : '') || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FILTER CATEGORIES BASED ON MODE ---
  const validCategories = useMemo(() => {
      const targetType = requiresPreparation ? 'cooked' : 'instant';
      return categories.filter(c => c.type === targetType);
  }, [categories, requiresPreparation]);

  // If mode switches, clear selected categories if they don't match the new mode
  useEffect(() => {
      const targetType = requiresPreparation ? 'cooked' : 'instant';
      const isValid = selectedCategories.every(catName => {
          const cat = categories.find(c => c.name === catName);
          return cat && cat.type === targetType;
      });
      
      if (!isValid && selectedCategories.length > 0) {
          setSelectedCategories([]); // Reset selection if mode mismatch
      }
  }, [requiresPreparation]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleCategory = (catName: string) => {
    const existsIndex = selectedCategories.findIndex(c => c.toLowerCase() === catName.toLowerCase());
    if (existsIndex > -1) {
        setSelectedCategories(prev => prev.filter((_, i) => i !== existsIndex));
    } else {
        setSelectedCategories(prev => [...prev, catName]);
    }
  };

  const toggleIngredientSelection = (ingName: string) => {
      const exists = selectedIngredients.includes(ingName);
      if (exists) {
          setSelectedIngredients(prev => prev.filter(i => i !== ingName));
      } else {
          setSelectedIngredients(prev => [...prev, ingName]);
      }
  };

  const togglePreparationMode = (prep: boolean) => {
      setRequiresPreparation(prep);
      // Auto-set time hint
      if (!prep) setTime('Instant');
      else if (prep && time === 'Instant') setTime('15 min');
  };

  const handleSubmit = () => {
    const newProduct = {
      id: initialData?.id || Date.now().toString(),
      name,
      price: Number(price),
      categories: selectedCategories, 
      category: selectedCategories[0] || 'Uncategorized',
      rating: Number(rating) || 0,
      image: imagePreview || 'https://via.placeholder.com/400',
      description: initialData?.description || (requiresPreparation ? 'Delicious freshly prepared item.' : 'Premium drink/smoke item.'),
      time,
      isRedeemable,
      pointsNeeded: isRedeemable ? Number(pointsCost) : 0,
      pointsEarned: Number(pointsEarn),
      requiresPreparation, 
      
      // Conditional Fields
      dietaryType: requiresPreparation ? dietaryType : undefined,
      hasSpiceLevel: requiresPreparation ? hasSpiceLevel : false,
      portionType: requiresPreparation ? portionType : undefined,
      ingredients: requiresPreparation ? selectedIngredients : [],
      servingUnit: !requiresPreparation ? servingUnit : undefined,
      
      discount: showDiscount ? {
          name: offerName,
          oldPrice: Number(beforePrice),
          newPrice: Number(afterPrice)
      } : null
    };
    onSave(newProduct);
  };

  // UI Theme based on mode
  const accentColor = requiresPreparation ? 'green' : 'orange';
  const buttonColor = requiresPreparation ? 'bg-[#4338ca]' : 'bg-orange-600';

  return (
    <>
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full sm:max-w-md md:max-w-lg rounded-t-[35px] sm:rounded-[35px] shadow-2xl relative z-10 overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
        
        {/* Header Title */}
        <div className={`bg-gradient-to-b ${requiresPreparation ? 'from-indigo-100' : 'from-orange-100'} to-white px-6 pt-6 pb-2 shrink-0`}>
            <h2 className={`text-center font-bold text-sm uppercase tracking-wider ${requiresPreparation ? 'text-indigo-800' : 'text-orange-800'}`}>
                {initialData ? 'Edit Item Details' : 'Add a new item'}
            </h2>
            
            <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 space-y-5">
            
            {/* Image Upload */}
            <div className="flex justify-center py-2">
                <div 
                    onClick={handleImageClick}
                    className={`w-48 h-48 rounded-full border bg-opacity-30 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group shadow-inner
                        ${requiresPreparation ? 'border-indigo-600 bg-indigo-50' : 'border-orange-500 bg-orange-50'}
                    `}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-4">
                            <span className="text-xs font-bold text-gray-800">Upload image</span>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    {imagePreview && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Edit</span>
                        </div>
                    )}
                </div>
            </div>

            {/* --- PREPARATION MODE TOGGLE --- */}
            <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-wide ml-1 mb-2 block">Item Type</label>
                <div className="bg-gray-100 p-1.5 rounded-xl flex relative border border-gray-200">
                    <div 
                        className={`absolute inset-y-1.5 w-[48%] bg-white rounded-lg shadow-sm border transition-all duration-300 ease-out
                            ${requiresPreparation ? 'border-indigo-100' : 'border-orange-100'}
                        `}
                        style={{ left: requiresPreparation ? '0.5%' : '51.5%' }}
                    />
                    
                    <button 
                        onClick={() => togglePreparationMode(true)}
                        className={`flex-1 relative z-10 flex flex-col items-center justify-center py-2 text-xs font-bold transition-colors ${requiresPreparation ? 'text-indigo-700' : 'text-gray-400'}`}
                    >
                        <span className="text-lg mb-0.5">🍳</span>
                        <span>Cooked (Kitchen)</span>
                    </button>
                    
                    <button 
                        onClick={() => togglePreparationMode(false)}
                        className={`flex-1 relative z-10 flex flex-col items-center justify-center py-2 text-xs font-bold transition-colors ${!requiresPreparation ? 'text-orange-600' : 'text-gray-400'}`}
                    >
                        <span className="text-lg mb-0.5">⚡</span>
                        <span>Instant (Bar)</span>
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                    {requiresPreparation 
                        ? 'Category will filter to Kitchen items. Advanced food options enabled.' 
                        : 'Category will filter to Bar items. Food options hidden.'}
                </p>
            </div>

            {/* Name & Price */}
            <div className="space-y-3">
              <input 
                  type="text" 
                  placeholder={requiresPreparation ? "e.g. Chicken Momo" : "e.g. Tuborg Beer / Hukka"}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={`w-full h-12 px-4 rounded-lg border font-bold text-sm outline-none focus:ring-2 transition-all
                      ${requiresPreparation 
                        ? 'border-indigo-300 bg-indigo-50 focus:ring-indigo-200 text-indigo-900 placeholder-indigo-300' 
                        : 'border-orange-300 bg-orange-50 focus:ring-orange-200 text-orange-900 placeholder-orange-300'
                      }
                  `}
              />
              <div className="flex gap-2">
                  <input 
                      type="number" 
                      placeholder="Price (Rs.)" 
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className={`flex-1 h-12 px-4 rounded-lg border font-bold text-sm outline-none transition-all
                          ${requiresPreparation 
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-900 placeholder-indigo-300' 
                            : 'border-orange-300 bg-orange-50 text-orange-900 placeholder-orange-300'
                          }
                      `}
                  />
                  <input 
                      type="text" 
                      placeholder="Time" 
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className={`w-32 h-12 px-4 rounded-lg border font-bold text-sm outline-none transition-all
                          ${requiresPreparation 
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-900 placeholder-indigo-300' 
                            : 'border-orange-300 bg-orange-50 text-orange-900 placeholder-orange-300'
                          }
                      `}
                  />
              </div>
            </div>

            {/* Category Dropdown (Filtered) */}
            <div className="w-full">
                <label className="text-xs font-black text-gray-400 uppercase tracking-wide ml-1 mb-1 block">Category</label>
                <button 
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="w-full min-h-[48px] h-auto px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold text-sm outline-none flex justify-between items-center"
                >
                    {selectedCategories.length > 0 ? (
                       <div className="flex flex-wrap gap-1.5">
                          {selectedCategories.map(cat => (
                             <span key={cat} className={`text-white px-2 py-0.5 rounded text-[10px] uppercase ${requiresPreparation ? 'bg-indigo-600' : 'bg-orange-500'}`}>{cat}</span>
                          ))}
                       </div>
                    ) : (
                       <span className="opacity-50">Select {requiresPreparation ? 'Cooked' : 'Instant'} Category</span>
                    )}
                    <svg className={`w-5 h-5 transition-transform shrink-0 ml-2 ${isCategoryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </button>

                {isCategoryOpen && (
                    <div className="mt-2 w-full bg-white border border-gray-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl flex flex-col max-h-60">
                        <div className="p-2 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
                            <input 
                                type="text"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 outline-none transition-all placeholder:text-gray-300"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="overflow-y-auto no-scrollbar p-2 flex-1">
                            <div className="grid grid-cols-1 gap-1">
                                {validCategories.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-gray-400 font-bold">
                                        No {requiresPreparation ? 'Kitchen' : 'Bar'} categories found.<br/>Please add one first.
                                    </div>
                                ) : (
                                    validCategories
                                        .filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                        .map(cat => {
                                            const isSelected = selectedCategories.some(sc => sc.toLowerCase() === cat.name.toLowerCase());
                                            return (
                                                <button 
                                                    key={cat.id} 
                                                    onClick={() => toggleCategory(cat.name)}
                                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold transition-all border
                                                        ${isSelected 
                                                            ? (requiresPreparation ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-orange-50 text-orange-800 border-orange-200') 
                                                            : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-md bg-gray-100 overflow-hidden shrink-0"><img src={cat.image} className="w-full h-full object-cover" /></div>
                                                        <div className="flex flex-col items-start">
                                                            <span>{cat.name}</span>
                                                            {cat.parentId && <span className="text-[9px] text-gray-300 font-medium">Child Category</span>}
                                                        </div>
                                                    </div>
                                                    {isSelected && <svg className={`w-4 h-4 ${requiresPreparation ? 'text-indigo-600' : 'text-orange-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                </button>
                                            );
                                        })
                                )}
                            </div>
                        </div>
                        <div className="p-2 bg-gray-50 border-t border-gray-100 sticky bottom-0 z-10">
                             <button onClick={onAddCategoryClick} className={`w-full text-white py-2.5 rounded-lg text-xs font-bold shadow-md transition-colors ${requiresPreparation ? 'bg-[#4338ca] hover:bg-indigo-700' : 'bg-orange-600 hover:bg-orange-700'}`}>Add New Category</button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- ADVANCED OPTIONS (CONDITIONALLY RENDERED) --- */}
            
            {requiresPreparation ? (
                <>
                    {/* 1. Dietary Preference */}
                    <div>
                       <label className="text-xs font-black text-gray-400 uppercase tracking-wide ml-1 mb-2 block">Dietary Type</label>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                              { id: 'veg', label: 'Veg Only', icon: '🥦', color: 'bg-green-50 border-green-200 text-green-700' },
                              { id: 'non-veg', label: 'Non-Veg', icon: '🍖', color: 'bg-red-50 border-red-200 text-red-700' },
                              { id: 'both', label: 'Both', icon: '🌗', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                              { id: 'none', label: 'None', icon: '🚫', color: 'bg-gray-50 border-gray-200 text-gray-500' }
                          ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setDietaryType(opt.id as any)}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${dietaryType === opt.id ? opt.color + ' ring-2 ring-offset-1' : 'bg-white border-gray-100 text-gray-400 opacity-60'}`}
                              >
                                  <span className="text-lg">{opt.icon}</span>
                                  <span className="text-xs font-black">{opt.label}</span>
                                  {dietaryType === opt.id && <div className="ml-auto w-2 h-2 rounded-full bg-current" />}
                              </button>
                          ))}
                       </div>
                    </div>

                    {/* 2. Spice Level Toggle */}
                    <div className="flex items-center justify-between bg-orange-50 p-4 rounded-xl border border-orange-100">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center border border-orange-200">🌶️</div>
                          <div>
                              <p className="text-xs font-black text-orange-800 uppercase">Spice Level</p>
                              <p className="text-[10px] font-bold text-orange-600 opacity-70">Enable spice slider</p>
                          </div>
                       </div>
                       <button 
                          onClick={() => setHasSpiceLevel(!hasSpiceLevel)}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${hasSpiceLevel ? 'bg-orange-500' : 'bg-gray-300'}`}
                       >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute transition-transform ${hasSpiceLevel ? 'translate-x-6' : 'translate-x-0.5'}`} />
                       </button>
                    </div>

                    {/* 3. Portion Selection */}
                    <div>
                       <label className="text-xs font-black text-gray-400 uppercase tracking-wide ml-1 mb-2 block">Portion Options</label>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                              { id: 'half', label: 'Half Only', icon: '½' },
                              { id: 'full', label: 'Full Only', icon: '🌕' },
                              { id: 'both', label: 'Both', icon: '🔄' },
                              { id: 'none', label: 'Single Size', icon: '⛔' }
                          ].map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => setPortionType(opt.id as any)}
                                className={`flex items-center justify-center flex-col p-2 rounded-xl border-2 transition-all ${portionType === opt.id ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' : 'bg-white border-gray-100 text-gray-400'}`}
                              >
                                  <span className="text-sm font-black">{opt.icon}</span>
                                  <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                              </button>
                          ))}
                       </div>
                    </div>

                    {/* 4. Ingredients Manager */}
                    <div className="w-full relative">
                        <button 
                            onClick={() => setIsIngredientOpen(!isIngredientOpen)}
                            className="w-full min-h-[48px] h-auto px-4 py-3 rounded-lg border border-orange-200 bg-[#fff8f2] text-orange-800 font-bold text-sm outline-none flex justify-between items-center"
                        >
                            <div className="flex flex-col items-start w-full overflow-hidden">
                                <span className="text-[10px] uppercase text-orange-400 font-black mb-1">Ingredients</span>
                                {selectedIngredients.length > 0 ? (
                                   <div className="flex flex-wrap gap-1.5 w-full">
                                      {selectedIngredients.map(ing => (
                                         <span key={ing} className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px]">{ing}</span>
                                      ))}
                                   </div>
                                ) : (
                                   <span className="opacity-50">Select Ingredients</span>
                                )}
                            </div>
                            <svg className={`w-5 h-5 transition-transform shrink-0 ml-2 text-orange-400 ${isIngredientOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>

                        {isIngredientOpen && (
                            <div className="mt-2 w-full bg-white border border-orange-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl flex flex-col max-h-60">
                                <div className="p-2 border-b border-orange-100 bg-orange-50/30 sticky top-0 z-10">
                                    <input 
                                        type="text"
                                        value={ingredientSearch}
                                        onChange={(e) => setIngredientSearch(e.target.value)}
                                        placeholder="Search ingredients..."
                                        className="w-full bg-white border border-orange-100 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:border-orange-400"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="overflow-y-auto no-scrollbar p-2 flex-1">
                                    <div className="grid grid-cols-1 gap-1">
                                        {allIngredients
                                            .filter(i => i.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
                                            .map(ing => {
                                                const isSelected = selectedIngredients.includes(ing.name);
                                                return (
                                                    <button 
                                                        key={ing.id} 
                                                        onClick={() => toggleIngredientSelection(ing.name)}
                                                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold transition-all border
                                                            ${isSelected 
                                                                ? 'bg-orange-50 text-orange-800 border-orange-200' 
                                                                : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <img src={ing.image} className="w-6 h-6 rounded bg-gray-100 object-cover" />
                                                            {ing.name}
                                                        </div>
                                                        {isSelected && <span className="text-orange-500">✓</span>}
                                                    </button>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                                <div className="p-2 bg-orange-50 border-t border-orange-100 sticky bottom-0 z-10">
                                     <button onClick={() => setShowIngredientManager(true)} className="w-full bg-orange-500 text-white py-2.5 rounded-lg text-xs font-bold shadow-md hover:bg-orange-600 transition-colors">Manage Ingredients List</button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* INSTANT / BAR SPECIFIC OPTIONS */}
                    <div>
                       <label className="text-xs font-black text-gray-400 uppercase tracking-wide ml-1 mb-2 block">Serving Unit</label>
                       <div className="flex flex-wrap gap-2">
                          {SERVING_UNITS.map(unit => (
                              <button
                                key={unit}
                                onClick={() => setServingUnit(unit)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${servingUnit === unit ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-500 border-gray-200'}`}
                              >
                                  {unit}
                              </button>
                          ))}
                       </div>
                    </div>
                </>
            )}

            {/* Redeem & Points */}
            <div className="flex items-center gap-3 py-1 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <button onClick={() => setIsRedeemable(!isRedeemable)} className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${isRedeemable ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute transition-transform ${isRedeemable ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-gray-600 font-bold text-xs">Availability for redeem</span>
            </div>
            {isRedeemable && (
              <input type="number" placeholder="Points needed" value={pointsCost} onChange={e => setPointsCost(e.target.value)} className="w-full h-12 px-4 rounded-lg border border-green-300 bg-white placeholder-green-400 text-green-800 font-bold text-xs outline-none animate-in slide-in-from-top-2" />
            )}
            <input type="number" placeholder="Points earned by user" value={pointsEarn} onChange={e => setPointsEarn(e.target.value)} className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-[#f8fafc] placeholder-gray-400 text-gray-800 font-bold text-xs outline-none" />

            {/* Discount Section */}
            {!showDiscount ? (
                <button onClick={() => setShowDiscount(true)} className="w-full h-12 rounded-lg bg-[#ff00bf] text-white font-bold text-sm shadow-md hover:bg-[#d600a0] transition-colors">Add discount</button>
            ) : (
                <div className="bg-[#ffccf9] rounded-xl p-4 border border-[#ff00bf]/30 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#b30086]">Discount Details</span>
                        <button onClick={() => setShowDiscount(false)} className="text-[#b30086] text-xs hover:underline">Remove</button>
                    </div>
                    <div className="space-y-3">
                        <input type="text" placeholder="Offer name" value={offerName} onChange={e => setOfferName(e.target.value)} className="w-full h-10 px-3 rounded border border-[#ff00bf]/30 text-xs font-bold text-[#b30086] outline-none bg-white placeholder-[#ff00bf]/40" />
                        <div className="flex gap-2">
                            <input type="number" placeholder="Old Price" value={beforePrice} onChange={e => setBeforePrice(e.target.value)} className="w-1/2 h-10 px-3 rounded border border-[#ff00bf]/30 text-xs font-bold text-[#b30086] outline-none bg-white placeholder-[#ff00bf]/40" />
                            <input type="number" placeholder="New Price" value={afterPrice} onChange={e => setAfterPrice(e.target.value)} className="w-1/2 h-10 px-3 rounded border border-[#ff00bf]/30 text-xs font-bold text-[#b30086] outline-none bg-white placeholder-[#ff00bf]/40" />
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 bg-white border-t border-gray-50 shrink-0">
            <button onClick={handleSubmit} className={`w-full h-14 text-white rounded-lg font-bold text-lg shadow-lg active:scale-95 transition-all ${buttonColor}`}>
                {initialData ? 'Save Changes' : 'Publish Item'}
            </button>
        </div>

      </div>
    </div>

    {/* Ingredients Manager Overlay */}
    {showIngredientManager && onUpdateIngredients && (
        <AdminIngredientManager 
            ingredients={allIngredients}
            onClose={() => setShowIngredientManager(false)}
            onAdd={(name, image) => onUpdateIngredients({ add: { name, image } })}
            onEdit={(id, name, image) => onUpdateIngredients({ edit: { id, name, image } })}
            onDelete={(id) => onUpdateIngredients({ deleteId: id })}
        />
    )}
    </>
  );
}
