
import React, { useState, useMemo } from 'react';
import { AppView, Category } from '../types';

interface Props {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  cartCount: number;
  onCategorySelect?: (cat: Category) => void;
}

const CATEGORY_ITEMS = [
  { id: Category.PIZZA, icon: '🍕', label: 'Pizza' },
  { id: Category.DRINK, icon: '🥤', label: 'Drinks' },
  { id: Category.SPICY, icon: '🌶️', label: 'Spicy' },
  { id: Category.DESSERT, icon: 'SWEET', label: 'Sweet', emoji: '🧁' },
];

const BottomNav: React.FC<Props> = ({ activeView, onViewChange, cartCount, onCategorySelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define items in the EXACT order requested: Orders, History, Home, Waiter, About
  const navItems = useMemo(() => [
    { 
      id: 'orders' as AppView, 
      label: 'Orders', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> 
    },
    { 
      id: 'history' as AppView, 
      label: 'History', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
    },
    { 
      id: 'home' as AppView, 
      label: 'Home', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> 
    },
    { 
      id: 'support' as AppView, 
      label: 'Waiter', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg> 
    },
    { 
      id: 'about' as AppView, 
      label: 'About', 
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
    },
  ], []);

  // Determine active index safely
  let activeIndex = navItems.findIndex(item => item.id === activeView);
  
  // SAFETY CHECK: If activeIndex is -1 (not found), default to Home (index 2)
  // This prevents crashes if activeView is set to something invalid
  if (activeIndex === -1) {
    activeIndex = 2; 
  }

  const activeItem = navItems[activeIndex];

  const handleItemClick = (view: AppView) => {
    if (view === 'home') {
      if (activeView === 'home') {
        setIsMenuOpen(!isMenuOpen);
      } else {
        onViewChange('home');
        setIsMenuOpen(false);
      }
    } else {
      onViewChange(view);
      setIsMenuOpen(false);
    }
  };

  const handleCategoryClick = (cat: Category) => {
    onCategorySelect?.(cat);
    setIsMenuOpen(false);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-[20px] pb-safe">
      
      {/* 1. Radial Category Menu Overlay */}
      <div 
        className={`fixed inset-0 transition-all duration-300 z-0 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
          onClick={() => setIsMenuOpen(false)} 
        />
        
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-0 h-0 flex items-center justify-center visible">
          {CATEGORY_ITEMS.map((cat, index) => {
            const angle = (index * 45) - 67.5;
            const distance = isMenuOpen ? 100 : 0;
            const x = Math.sin(angle * Math.PI / 180) * distance;
            const y = -Math.cos(angle * Math.PI / 180) * distance;

            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id as Category)}
                className={`
                  absolute w-12 h-12 bg-white rounded-full shadow-lg flex flex-col items-center justify-center transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) border-2 border-green-50
                  ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-0 pointer-events-none'}
                `}
                style={{ 
                  transform: `translate(${x}px, ${y}px)`,
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <span className="text-lg leading-none mb-0.5">{(cat as any).emoji || cat.icon}</span>
                <span className="text-[7px] font-black text-green-800 uppercase leading-none">{(cat as any).label}</span>
              </button>
            );
          })}
        </div>
      </div>


      {/* 2. Main Navigation Bar */}
      <div className="relative w-full h-full flex justify-between items-end px-0 z-10">
        
        {/* The Sliding "Bulge" Indicator */}
        <div 
          className="absolute top-[-25px] h-[70px] w-[20%] transition-all duration-500 ease-in-out flex justify-center items-center z-20 pointer-events-none"
          style={{ left: `${activeIndex * 20}%` }}
        >
          {/* SVG Curve Background */}
          <div className="absolute bottom-[23px] w-full flex justify-center pointer-events-none z-10">
             <svg width="90" height="30" viewBox="0 0 90 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 30H90V30C90 30 78.4 30 72 17.5C65.6 5 57.5 0.5 45 0.5C32.5 0.5 24.4 5 18 17.5C11.6 30 0 30 0 30Z" fill="white"/>
             </svg>
          </div>

          {/* The colored circle */}
          <div className="w-[50px] h-[50px] bg-green-600 rounded-full border-[4px] border-white flex items-center justify-center relative z-20 box-content">
             <div className="text-white transform transition-all duration-300">
               {activeItem && activeItem.id === 'home' && isMenuOpen ? (
                 <svg className="w-6 h-6 animate-in spin-in-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               ) : (
                 activeItem && React.cloneElement(activeItem.icon as React.ReactElement<any>, { className: "w-6 h-6" })
               )}
               {activeItem && activeItem.id === 'orders' && cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
               )}
             </div>
          </div>
        </div>

        {/* Navigation Items */}
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item.id}
              // Add ID specifically for the 'orders' item so we can target it for animation
              id={item.id === 'orders' ? 'nav-item-orders' : undefined}
              onClick={() => handleItemClick(item.id)}
              className="relative w-[20%] h-full flex flex-col items-center justify-center pt-5 pb-2 transition-all active:scale-95 group z-30"
            >
              <div 
                className={`transition-all duration-300 transform absolute top-4 ${isActive ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}
              >
                <div className="text-gray-400">
                   {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                   {item.id === 'orders' && cartCount > 0 && !isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                   )}
                </div>
              </div>

              <span 
                className={`text-[9px] font-bold mt-auto mb-3 transition-all duration-300 transform 
                  ${isActive ? 'translate-y-0 text-green-700 opacity-100 scale-105' : 'translate-y-1 text-gray-400 opacity-100'}
                `}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
