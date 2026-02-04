
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onConfirm: (name: string, mobile: string) => void;
}

const LoyaltyModal: React.FC<Props> = ({ onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !mobile.trim()) {
      setError('Please fill in all fields');
      return;
    }
    if (mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    onConfirm(name, mobile);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-sm rounded-[30px] p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6 pt-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            🎁
          </div>
          <h3 className="text-2xl font-black text-gray-800">Get Discounts</h3>
          <p className="text-sm text-gray-500 font-medium">Enter your details to collect points & rewards</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-2 mb-1">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
              placeholder="e.g. Sushil Kumar"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide ml-2 mb-1">Mobile Number</label>
            <input 
              type="tel" 
              value={mobile}
              onChange={(e) => { setMobile(e.target.value); setError(''); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
              placeholder="e.g. 9800000000"
              maxLength={10}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-3.5 rounded-xl font-black shadow-lg shadow-green-200 active:scale-95 transition-all hover:bg-green-700"
        >
          Check & Collect
        </button>
      </div>
    </div>
  );
};

export default LoyaltyModal;
