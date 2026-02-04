
import React, { useState } from 'react';
import { MenuItem, ItemCustomization, CartItem } from '../types';

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const COMMON_INGREDIENTS = ['Onion', 'Garlic', 'Tomato', 'Cilantro', 'Cheese', 'Butter', 'Chilli'];

const ProductDetailModal: React.FC<Props> = ({ item, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [portion, setPortion] = useState<'Half' | 'Full' | 'Family'>('Full');
  const [spiceLevel, setSpiceLevel] = useState(50);
  const [isVeg, setIsVeg] = useState(true);
  const [showCustomize, setShowCustomize] = useState(false);
  const [excludedIngredients, setExcludedIngredients] = useState<Set<string>>(new Set());

  // Determine if item is cooked or instant/bar
  // Default to true if undefined for legacy compatibility
  const isCooked = item.requiresPreparation !== false;

  // Calculate Price based on Portion (Only for Cooked items)
  const getPrice = () => {
    if (!isCooked) return item.price; // Flat price for instant items
    let base = item.price;
    if (portion === 'Half') base = item.price * 0.6;
    if (portion === 'Family') base = item.price * 1.8;
    return Math.round(base);
  };

  const finalPrice = getPrice() * quantity;

  const toggleIngredient = (ing: string) => {
    const newSet = new Set(excludedIngredients);
    if (newSet.has(ing)) newSet.delete(ing);
    else newSet.add(ing);
    setExcludedIngredients(newSet);
  };

  const handleAdd = () => {
    const customization: ItemCustomization = {
      portion: isCooked ? portion : 'Full', // Default for non-cooked
      spiceLevel: isCooked ? spiceLevel : 0,
      isVeg: isCooked ? isVeg : true,
      excludedIngredients: isCooked ? Array.from(excludedIngredients) : []
    };

    const cartItem: CartItem = {
      ...item,
      price: getPrice(), // Use the unit price based on portion
      quantity,
      customization: isCooked ? customization : undefined, // Only attach customization if relevant
      // Create a unique ID for cart grouping if needed, but keeping simple for now
      id: item.id 
    };
    
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-white w-full max-w-lg rounded-t-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-500">
        
        {/* Header Section with Circular Image */}
        <div className="p-6 pb-2">
            <div className="flex gap-5 items-start">
                {/* Circular Image on Left */}
                <div className="w-28 h-28 rounded-full shadow-xl border-4 border-white shrink-0 relative overflow-hidden bg-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover scale-110" />
                </div>

                {/* Info Right */}
                <div className="flex-1 min-w-0 pt-2">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-black text-gray-800 leading-tight">{item.name}</h2>
                        <button onClick={onClose} className="bg-gray-100 p-1.5 rounded-full text-gray-500 hover:bg-gray-200">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <p className="text-gray-400 text-xs font-medium mt-1 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                            <span className="text-xs">⭐</span>
                            <span className="text-xs font-bold text-yellow-700">{item.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                            <span className="text-xs">{isCooked ? '⏰' : '⚡'}</span>
                            <span className="text-xs font-bold text-gray-600">{item.time || (isCooked ? '20m' : 'Instant')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-6 pb-24">
            
            {/* COOKED ITEM OPTIONS */}
            {isCooked ? (
                <>
                    {/* Veg / Non-Veg Toggle */}
                    <div className="bg-gray-50 p-1.5 rounded-xl flex relative">
                        <div 
                            className={`absolute inset-y-1.5 w-[48%] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out`}
                            style={{ left: isVeg ? '0.5%' : '51.5%' }}
                        />
                        <button 
                            onClick={() => setIsVeg(true)}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-black transition-colors ${isVeg ? 'text-green-700' : 'text-gray-400'}`}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${isVeg ? 'border-green-600' : 'border-gray-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-transparent'}`} />
                            </div>
                            Veg
                        </button>
                        <button 
                            onClick={() => setIsVeg(false)}
                            className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2 text-sm font-black transition-colors ${!isVeg ? 'text-red-600' : 'text-gray-400'}`}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${!isVeg ? 'border-red-600' : 'border-gray-400'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${!isVeg ? 'bg-red-600' : 'bg-transparent'}`} />
                            </div>
                            Non-Veg
                        </button>
                    </div>

                    {/* Spice Level Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black text-gray-800 uppercase tracking-wide">Spice Level</span>
                            <span className="text-xs font-bold text-orange-500">{spiceLevel}%</span>
                        </div>
                        <div className="relative h-6 flex items-center">
                            <div className="absolute w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" 
                                    style={{ width: `${spiceLevel}%` }}
                                />
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                step="10"
                                value={spiceLevel} 
                                onChange={(e) => setSpiceLevel(Number(e.target.value))}
                                className="absolute w-full h-full opacity-0 cursor-pointer"
                            />
                            <div 
                                className="absolute w-6 h-6 bg-white border-2 border-orange-500 rounded-full shadow-md flex items-center justify-center text-[10px] pointer-events-none transition-all"
                                style={{ left: `calc(${spiceLevel}% - 12px)` }}
                            >
                                🌶️
                            </div>
                        </div>
                    </div>

                    {/* Portion Selection */}
                    <div>
                        <span className="text-xs font-black text-gray-800 uppercase tracking-wide mb-3 block">Select Portion</span>
                        <div className="grid grid-cols-3 gap-3">
                            {(['Half', 'Full', 'Family'] as const).map((p) => {
                                const active = portion === p;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPortion(p)}
                                        className={`py-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${active ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        <span className="text-xs font-black">{p}</span>
                                        <span className="text-[10px] font-bold opacity-70">
                                            {p === 'Half' && '1 Person'}
                                            {p === 'Full' && '2 Person'}
                                            {p === 'Family' && '4 Person'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Customization Accordion */}
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                        <button 
                            onClick={() => setShowCustomize(!showCustomize)}
                            className="w-full bg-gray-50 p-4 flex justify-between items-center"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">🛠️</div>
                                <span className="text-sm font-black text-gray-700">Customize Ingredients</span>
                            </div>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${showCustomize ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        
                        {showCustomize && (
                            <div className="p-4 bg-white grid grid-cols-2 gap-2">
                                {COMMON_INGREDIENTS.map(ing => {
                                    const isExcluded = excludedIngredients.has(ing);
                                    return (
                                        <button
                                            key={ing}
                                            onClick={() => toggleIngredient(ing)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-between transition-all ${!isExcluded ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400 decoration-line-through'}`}
                                        >
                                            {ing}
                                            {!isExcluded && <span className="text-green-600 text-[10px]">✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* INSTANT / BAR ITEM VIEW */
                <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 text-center space-y-4">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Serving Unit</p>
                        <p className="text-2xl font-black text-gray-800">{item.servingUnit || 'Standard Unit'}</p>
                    </div>
                    {item.calories && (
                        <div className="inline-block bg-white px-3 py-1 rounded-full border border-orange-100">
                            <span className="text-xs font-bold text-orange-600">🔥 {item.calories}</span>
                        </div>
                    )}
                    <p className="text-sm font-medium text-gray-500 leading-relaxed px-4">
                        This item is served instantly. Please select quantity below.
                    </p>
                </div>
            )}

        </div>

        {/* Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-2.5 rounded-xl">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-gray-600 hover:text-green-600">-</button>
                    <span className="font-black text-gray-800 w-4 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 bg-white rounded-lg shadow-sm flex items-center justify-center font-black text-gray-600 hover:text-green-600">+</button>
                </div>

                {/* Add Button */}
                <button 
                    onClick={handleAdd}
                    className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-green-200 active:scale-95 transition-all flex justify-between px-6 items-center hover:bg-green-700"
                >
                    <span>Add to Cart</span>
                    <span>Rs. {finalPrice}</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;
