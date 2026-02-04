
import React from 'react';

interface Props {
  activeView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function KitchenSidebar({ activeView, onViewChange, onLogout, isOpen, onClose }: Props) {
  const menuItems = [
    { id: 'current', label: 'Current Orders', icon: '🔥' },
    { id: 'similar', label: 'Similar Orders', icon: '🔢' },
    { id: 'history', label: 'History', icon: '📜' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose} 
      />
      
      {/* Sidebar Container */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 transform lg:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
           <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-orange-200">
             👨‍🍳
           </div>
           <div>
              <h1 className="text-xl font-black text-gray-800 leading-none">Kitchen</h1>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Display System</p>
           </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
           <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">Workstation</p>
           {menuItems.map(item => (
             <button
               key={item.id}
               onClick={() => { onViewChange(item.id); onClose(); }}
               className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold transition-all
                 ${activeView === item.id 
                   ? 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100' 
                   : 'text-gray-600 hover:bg-gray-50'
                 }
               `}
             >
               <span className="text-lg">{item.icon}</span>
               <span className="text-sm">{item.label}</span>
               {activeView === item.id && (
                 <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
               )}
             </button>
           ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             <span>Exit KDS</span>
           </button>
        </div>
      </div>
    </>
  );
}
