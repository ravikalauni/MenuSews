
import React from 'react';
import { User } from '../types';

interface Props {
  user: User | null;
  onOpenLoyalty: () => void;
  onOpenProfile: () => void;
}

const Header: React.FC<Props> = ({ user, onOpenLoyalty, onOpenProfile }) => {
  return (
    <header className="flex justify-between items-center px-6 py-6 pt-8 shrink-0 bg-[#f1fcf1]">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
          Nep<span className="text-green-600">Nola</span>
          <span className="text-yellow-500 text-4xl leading-none">.</span>
        </h1>
        <p className="text-[11px] font-bold text-gray-400 tracking-[0.25em] uppercase pl-0.5">Fine Dining</p>
      </div>

      <button 
        onClick={user ? onOpenProfile : onOpenLoyalty}
        className={`h-11 rounded-2xl backdrop-blur-md flex items-center justify-center border shadow-sm transition-all active:scale-95 
          ${user 
            ? 'bg-white border-green-200 pr-4 pl-1.5' 
            : 'bg-green-600 border-green-500 pr-5 pl-4'
          }`}
      >
        {user ? (
          <>
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-white text-xs font-black mr-2 shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-bold text-gray-400 uppercase">My Points</span>
              <span className="text-sm font-black text-green-700">{user.points}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <span className="text-xs font-black text-white uppercase tracking-wider">Rewards</span>
          </div>
        )}
      </button>
    </header>
  );
};

export default Header;
