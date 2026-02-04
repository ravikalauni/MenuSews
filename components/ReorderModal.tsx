
import React, { useState, useEffect } from 'react';
import { OrderHistoryItem, CartItem } from '../types';

interface Props {
  order: OrderHistoryItem;
  onClose: () => void;
  onConfirm: (items: CartItem[]) => void;
}

const ReorderModal: React.FC<Props> = ({ order, onClose, onConfirm }) => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Initialize selection when order changes
  useEffect(() => {
    setSelectedItemIds(new Set(order.items.map(i => i.id)));
  }, [order]);

  const toggleItemSelection = (id: string) => {
    const newSet = new Set(selectedItemIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItemIds(newSet);
  };

  const handleConfirm = () => {
    const itemsToOrder = order.items.filter(i => selectedItemIds.has(i.id));
    if (itemsToOrder.length > 0) {
      onConfirm(itemsToOrder);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItemIds.size === order.items.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(order.items.map(i => i.id)));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="bg-white w-full rounded-t-[40px] p-6 pb-8 pointer-events-auto animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col shadow-2xl relative z-10">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
        
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="text-2xl font-black text-gray-800">Select Items</h3>
          <button 
            onClick={toggleSelectAll}
            className="text-sm font-bold text-green-600 px-3 py-1 bg-green-50 rounded-full active:scale-95 transition-transform"
          >
            {selectedItemIds.size === order.items.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-6 min-h-0">
          {order.items.map((item) => {
            const isSelected = selectedItemIds.has(item.id);
            return (
              <div 
                key={item.id} 
                onClick={() => toggleItemSelection(item.id)}
                className={`flex items-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-green-500 bg-green-50/50' : 'border-gray-100 bg-white'}`}
              >
                <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover mr-3 shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>

                <p className="font-black text-gray-800 text-sm">Rs. {item.price * item.quantity}</p>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={selectedItemIds.size === 0}
            className="flex-[2] py-4 rounded-2xl font-black text-white bg-green-600 shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 hover:bg-green-700"
          >
            Add {selectedItemIds.size} Item{selectedItemIds.size !== 1 ? 's' : ''} to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReorderModal;
