
import React from 'react';

export default function WaiterApp({ onHome }: { onHome: () => void }) {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center text-blue-900">
       <h1 className="text-3xl font-black mb-2">Welcome Waiter</h1>
       <p className="text-blue-400 mb-8">Service Terminal Ready</p>
       <button onClick={onHome} className="text-sm font-bold text-blue-500 hover:text-blue-700 border border-blue-200 px-4 py-2 rounded-full bg-white">Back to Home</button>
    </div>
  );
}
