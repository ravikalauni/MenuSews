
import React from 'react';
import { MenuItem, CartItem } from '../types';
import ProductGrid from './ProductGrid';

interface Props {
  title: string;
  items: MenuItem[];
  onClose: () => void;
  onAdd: (item: MenuItem, e: React.MouseEvent) => void;
  onItemClick: (item: MenuItem) => void;
  cart: CartItem[];
}

const SeeAllModal: React.FC<Props> = ({ title, items, onClose, onAdd, onItemClick, cart }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f8fafc] animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center gap-4 shadow-sm shrink-0 relative z-10">
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-black text-gray-900">{title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pt-6">
         <ProductGrid 
            items={items} 
            onAdd={onAdd} 
            onItemClick={onItemClick} 
            cart={cart} 
         />
      </div>
    </div>
  );
};

export default SeeAllModal;
