
import React from 'react';
import { User } from '../types';

interface Props {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

const ProfileModal: React.FC<Props> = ({ user, onClose, onLogout, onSwitchAccount }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-xs rounded-[35px] p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Avatar Section */}
        <div className="relative mb-4 mt-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-4xl text-white font-black shadow-lg shadow-green-200">
            {user.name.charAt(0)}
          </div>
          <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm">
            <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* User Info */}
        <div className="text-center mb-8 space-y-1">
          <h3 className="text-xl font-black text-gray-800 tracking-tight">{user.name}</h3>
          <p className="text-sm font-bold text-gray-400 tracking-wider font-mono">{user.mobile}</p>
          
          <div className="pt-3">
             <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
                <span className="text-lg">🪙</span>
                <span className="text-sm font-black text-orange-600">{user.points} Points</span>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button 
            onClick={onSwitchAccount}
            className="w-full py-3.5 bg-green-50 text-green-700 rounded-2xl font-black text-sm hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Switch Account
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-3.5 bg-white border-2 border-red-50 text-red-500 rounded-2xl font-black text-sm hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Unlink Device
          </button>
        </div>

        <p className="mt-6 text-[10px] text-gray-300 font-bold uppercase tracking-widest">Member since 2024</p>
      </div>
    </div>
  );
};

export default ProfileModal;
