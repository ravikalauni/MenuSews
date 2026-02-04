
import React, { useState, useEffect } from 'react';
import { TableSession } from '../../../types';

interface Props {
  locations: string[];
  existingTables: TableSession[]; // Added for validation
  initialData?: TableSession | null; // Added for Edit Mode
  onClose: () => void;
  onSave: (tableData: { id?: string, tableNumber: string, capacity: number, location: string, isSpecial: boolean }) => void;
  onManageLocations: () => void;
}

export default function AdminAddTableModal({ locations, existingTables, initialData, onClose, onSave, onManageLocations }: Props) {
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [location, setLocation] = useState(locations[0] || '');
  const [isSpecial, setIsSpecial] = useState(false);
  const [error, setError] = useState('');
  
  // UI State for Custom Dropdown
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Initialize for Edit Mode
  useEffect(() => {
    if (initialData) {
        setTableNumber(initialData.tableNumber);
        setCapacity(initialData.capacity.toString());
        setLocation(initialData.location || locations[0] || '');
        setIsSpecial(initialData.isSpecial || false);
    }
  }, [initialData, locations]);

  const handleSubmit = () => {
    if (!tableNumber || !location) {
        setError('Please enter a table number and select a location.');
        return;
    }

    const formattedNumber = tableNumber.trim().toUpperCase();
    
    // Check for duplicates: Same Name AND Same Location
    // EXCLUDE current table if in edit mode (initialData.id)
    const isDuplicate = existingTables.some(t => 
        t.tableNumber.toUpperCase() === formattedNumber && 
        t.location === location &&
        t.id !== initialData?.id
    );

    if (isDuplicate) {
        setError(`Table "${formattedNumber}" already exists in "${location}".`);
        return;
    }

    onSave({
        id: initialData?.id, // Pass ID back if editing
        tableNumber: formattedNumber,
        capacity: parseInt(capacity),
        location,
        isSpecial
    });
  };

  const isEditMode = !!initialData;

  return (
    <div className="fixed inset-0 z-[170] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="bg-white w-full sm:max-w-md rounded-t-[35px] sm:rounded-[35px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className={`${isEditMode ? 'bg-indigo-600' : 'bg-green-600'} px-6 py-6 text-white flex justify-between items-center transition-colors`}>
           <div>
              <h2 className="text-2xl font-black">{isEditMode ? 'Edit Table' : 'Add Table'}</h2>
              <p className={`${isEditMode ? 'text-indigo-100' : 'text-green-100'} text-xs font-bold`}>
                  {isEditMode ? 'Update Details' : 'Generate QR & Setup'}
              </p>
           </div>
           <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <div className="p-6 space-y-5">
           
           {/* Table Number */}
           <div>
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-1 block">Table Number / Name</label>
              <input 
                type="text" 
                value={tableNumber}
                onChange={(e) => { setTableNumber(e.target.value); setError(''); }}
                placeholder="e.g. T5 or Garden-1"
                className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 font-bold text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-all"
              />
           </div>

           {/* Capacity & Special Toggle */}
           <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-1 block">Seats</label>
                 <div className="relative">
                    <input 
                        type="number" 
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 font-bold text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Pax</div>
                 </div>
              </div>
              <div className="flex-1">
                 <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-1 block">Special?</label>
                 <div 
                    onClick={() => setIsSpecial(!isSpecial)}
                    className={`h-12 rounded-xl border cursor-pointer flex items-center justify-between px-3 transition-all ${isSpecial ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}
                 >
                    <span className={`text-xs font-bold ${isSpecial ? 'text-orange-600' : 'text-gray-400'}`}>{isSpecial ? 'VIP/Reserved' : 'Standard'}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isSpecial ? 'bg-orange-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${isSpecial ? 'left-[22px]' : 'left-[2px]'}`} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Location Dropdown - Custom UI */}
           <div className="relative z-20"> 
              <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-1 block">Location Area</label>
              
              {/* Click outside listener for dropdown */}
              {isLocationOpen && (
                  <div className="fixed inset-0 z-30" onClick={() => setIsLocationOpen(false)} />
              )}

              <div className="flex gap-2 relative z-40">
                 {/* Custom Dropdown Trigger */}
                 <div className="relative flex-1">
                    <button
                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                        className={`w-full h-12 rounded-xl border flex items-center justify-between px-4 transition-all bg-white outline-none
                            ${isLocationOpen 
                                ? 'border-green-500 ring-2 ring-green-100' 
                                : 'border-gray-200 hover:border-green-300'
                            }
                        `}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-lg">📍</span>
                            <span className={`text-sm font-bold truncate ${location ? 'text-gray-800' : 'text-gray-400'}`}>
                                {location || 'Select Area'}
                            </span>
                        </div>
                        <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`} 
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown List */}
                    {isLocationOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-48 overflow-y-auto no-scrollbar z-50">
                            {locations.length > 0 ? (
                                locations.map((loc) => (
                                    <button
                                        key={loc}
                                        onClick={() => {
                                            setLocation(loc);
                                            setError('');
                                            setIsLocationOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors border-b border-gray-50 last:border-0
                                            ${location === loc ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}
                                        `}
                                    >
                                        <span>{loc}</span>
                                        {location === loc && (
                                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-xs text-gray-400 font-medium">No locations found. Add one.</div>
                            )}
                        </div>
                    )}
                 </div>

                 {/* Manage Button */}
                 <button 
                    onClick={onManageLocations}
                    className="w-12 h-12 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center hover:bg-green-100 transition-colors shrink-0 shadow-sm"
                    title="Manage Locations"
                 >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                 </button>
              </div>
           </div>

           {error && (
               <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                   <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   {error}
               </div>
           )}

           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-[10px] text-blue-800 font-bold leading-relaxed">
                 ℹ️ <strong>QR Logic:</strong> {isEditMode ? 'Updating details will keep the QR active.' : 'A unique QR code will be generated.'} 
                 <br/><span className="underline break-all opacity-80">{window.location.origin}/user?table={tableNumber || '...'}&location={location || '...'}</span>
              </p>
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
           <button 
             onClick={handleSubmit}
             disabled={!tableNumber || !location}
             className={`w-full text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none
                ${isEditMode ? 'bg-indigo-600 shadow-indigo-200' : 'bg-green-600 shadow-green-200'}
             `}
           >
             {isEditMode ? 'Save Changes' : 'Create Table'}
           </button>
        </div>

      </div>
    </div>
  );
}
