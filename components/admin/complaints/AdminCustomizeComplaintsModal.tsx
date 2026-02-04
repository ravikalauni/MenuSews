
import React, { useState } from 'react';

export interface ComplaintConfig {
    id: string;
    complaintText: string;
    apologyText: string;
}

interface Props {
  initialConfigs: ComplaintConfig[];
  onClose: () => void;
  onSave: (configs: ComplaintConfig[]) => void;
}

export default function AdminCustomizeComplaintsModal({ initialConfigs, onClose, onSave }: Props) {
  const [configs, setConfigs] = useState<ComplaintConfig[]>(initialConfigs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formComplaint, setFormComplaint] = useState('');
  const [formApology, setFormApology] = useState('');

  const handleEditClick = (config: ComplaintConfig) => {
      setEditingId(config.id);
      setFormComplaint(config.complaintText);
      setFormApology(config.apologyText);
      setIsAdding(false);
  };

  const handleAddClick = () => {
      setEditingId(null);
      setFormComplaint('');
      setFormApology('');
      setIsAdding(true);
  };

  const handleSaveForm = () => {
      if (!formComplaint.trim() || !formApology.trim()) return;

      let newConfigs = [...configs];
      if (isAdding) {
          newConfigs.push({
              id: Date.now().toString(),
              complaintText: formComplaint,
              apologyText: formApology
          });
      } else if (editingId) {
          newConfigs = newConfigs.map(c => c.id === editingId ? { ...c, complaintText: formComplaint, apologyText: formApology } : c);
      }

      setConfigs(newConfigs);
      // Reset view
      setEditingId(null);
      setIsAdding(false);
  };

  const handleGlobalSave = () => {
      onSave(configs);
      onClose();
  };

  const isFormVisible = isAdding || editingId;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="bg-gradient-to-b from-[#e6fffa] to-white w-full max-w-lg h-[80vh] rounded-[30px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-center bg-transparent shrink-0">
            <div>
               <h2 className="text-xl font-black text-green-800">Customize Complains</h2>
               <p className="text-xs text-green-600 font-bold opacity-70">Manage issues & auto-responses</p>
            </div>
            
            {!isFormVisible && (
                <button 
                    onClick={handleGlobalSave}
                    className="bg-green-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-200 active:scale-95 transition-all"
                >
                    Save & Close
                </button>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6">
            
            {/* Form View */}
            {isFormVisible ? (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-100 animate-in zoom-in-95">
                    <h3 className="text-sm font-black text-green-700 uppercase mb-4 text-center">
                        {isAdding ? 'Add New Scenario' : 'Edit Scenario'}
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-green-600 ml-1 mb-1 block">Complaint (User sees/sends)</label>
                            <input 
                                type="text" 
                                value={formComplaint} 
                                onChange={e => setFormComplaint(e.target.value)}
                                className="w-full bg-[#f0fdf4] border border-green-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-green-500 transition-all"
                                placeholder="e.g. Food is cold"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-green-600 ml-1 mb-1 block">Apology (Default response)</label>
                            <textarea 
                                value={formApology}
                                onChange={e => setFormApology(e.target.value)}
                                className="w-full h-32 bg-[#f0fdf4] border border-green-200 rounded-xl px-4 py-3 text-xs font-medium text-gray-700 outline-none focus:border-green-500 transition-all resize-none"
                                placeholder="e.g. We are terribly sorry..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button 
                                onClick={() => { setIsAdding(false); setEditingId(null); }}
                                className="py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-xs"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveForm}
                                className="py-3 bg-green-600 text-white rounded-xl font-black text-xs shadow-md shadow-green-200"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                // List View
                <div className="space-y-3">
                    <button 
                        onClick={handleAddClick}
                        className="w-full py-3 border-2 border-dashed border-green-300 rounded-xl text-green-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-colors mb-4"
                    >
                        <span className="text-lg">+</span> Add New
                    </button>

                    {configs.map((config) => (
                        <div 
                            key={config.id} 
                            onClick={() => handleEditClick(config)}
                            className="bg-[#f0fdf4] border border-green-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer group hover:bg-green-100 transition-colors active:scale-95"
                        >
                            <span className="text-sm font-bold text-green-900 line-clamp-1 flex-1 pr-4">{config.complaintText}</span>
                            <div className="w-8 h-8 rounded-lg bg-white border border-green-200 flex items-center justify-center text-green-600 shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
      </div>
    </div>
  );
}
