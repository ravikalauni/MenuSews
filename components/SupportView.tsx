
import React, { useState, useEffect } from 'react';

interface Props {
  onBack: () => void;
}

const SupportView: React.FC<Props> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-8 pb-40 animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-green-600 rounded-[40px] p-8 text-center text-white shadow-2xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

        {loading ? (
          <div className="py-12 flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-lg">Contacting server...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-black">Your call was successfully received by a waiter.</h2>
            <p className="text-green-50 text-sm font-medium">Please wait for a moment...</p>
            
            <button 
              onClick={onBack}
              className="w-full bg-white text-green-700 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-green-50 active:scale-95 transition-all"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportView;
