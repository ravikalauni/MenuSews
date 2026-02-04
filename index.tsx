
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="gradient-bg flex items-center justify-center p-4">
      <div className={`glass rounded-[40px] p-8 md:p-12 text-center transition-all duration-500 transform ${clicked ? 'scale-105' : 'scale-100 hover:scale-[1.02]'}`}>
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl">
          👋
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
          Hello <span className="text-yellow-300">World</span>.
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-medium max-w-xs mx-auto mb-8">
          Welcome to your stunning new interface. Everything is working perfectly.
        </p>
        
        <button 
          onClick={() => setClicked(!clicked)}
          className="group relative px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all overflow-hidden"
        >
          <span className="relative z-10">
            {clicked ? '✨ MAGIC HAPPENED' : 'CLICK FOR MAGIC'}
          </span>
          <div className="absolute inset-0 bg-yellow-300 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        {clicked && (
          <div className="mt-6 animate-bounce text-yellow-300 font-bold tracking-widest text-sm">
            UI UPDATED SUCCESSFULLY
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 text-white/40 text-xs font-bold uppercase tracking-[0.4em]">
        Design by Gemini API
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
