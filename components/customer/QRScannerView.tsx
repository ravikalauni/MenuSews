
import React, { useState, useEffect } from 'react';

interface Props {
  onScan: (tableId: string) => void;
}

export default function QRScannerView({ onScan }: Props) {
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Simulate camera delay
    setTimeout(() => {
        // Mock a successful scan of Table 4
        onScan('4'); 
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
        {/* Camera Viewfinder Simulation */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6">
            {isScanning ? (
                <>
                    <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600")' }}></div>
                    <div className="w-72 h-72 border-2 border-green-500 rounded-3xl relative z-10 animate-pulse flex items-center justify-center">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-xl" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-xl" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-xl" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-xl" />
                        
                        <div className="w-full h-0.5 bg-red-500 absolute top-1/2 animate-[ping_1.5s_infinite]" />
                    </div>
                    <p className="text-white font-bold mt-8 z-10 text-shadow bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">Scanning Table QR...</p>
                </>
            ) : (
                <div className="text-center w-full max-w-sm">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20 shadow-2xl">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    </div>
                    
                    <h2 className="text-3xl font-black text-white mb-3">Scan to Order</h2>
                    <p className="text-gray-400 text-sm leading-relaxed mb-10 px-4">
                        Please point your camera at the QR code located on your table to access the menu.
                    </p>
                    
                    <button 
                        onClick={handleSimulateScan}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-900/50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Open Scanner
                    </button>
                </div>
            )}
        </div>
        
        {/* Footer Brand */}
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">NepNola System</p>
        </div>
    </div>
  );
}
