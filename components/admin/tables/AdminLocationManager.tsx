
import React, { useState } from 'react';

interface Props {
  locations: string[];
  onClose: () => void;
  onAdd: (loc: string) => void;
  onDelete: (loc: string) => void;
}

export default function AdminLocationManager({ locations, onClose, onAdd, onDelete }: Props) {
  const [newLoc, setNewLoc] = useState('');

  const handleAdd = () => {
    if (newLoc.trim()) {
      onAdd(newLoc.trim());
      setNewLoc('');
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="bg-white w-full max-w-sm rounded-[30px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
           <h3 className="font-black text-gray-800 text-lg">Manage Locations</h3>
           <button onClick={onClose} className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <div className="p-6 space-y-4">
           {/* Add New */}
           <div className="flex gap-2">
              <input 
                type="text" 
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                placeholder="e.g. Rooftop, Garden"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-green-500"
              />
              <button 
                onClick={handleAdd}
                disabled={!newLoc.trim()}
                className="bg-green-600 text-white px-4 rounded-xl font-black text-sm shadow-md disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
              >
                Add
              </button>
           </div>

           {/* List */}
           <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2">
              {locations.length === 0 ? (
                 <p className="text-center text-gray-400 text-xs py-4 font-medium">No locations added yet.</p>
              ) : (
                 locations.map((loc) => (
                    <div key={loc} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
                       <span className="text-sm font-bold text-gray-700">{loc}</span>
                       <button onClick={() => onDelete(loc)} className="text-red-400 hover:text-red-600 p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                 ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
