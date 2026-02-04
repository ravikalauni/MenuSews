
import React from 'react';

interface ResolvedComplaint {
  id: string;
  table: string;
  location: string;
  issue: string;
  itemName: string;
  resolvedAt: string;
  apologyNote: string;
}

interface Props {
  history: ResolvedComplaint[];
  onClose: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function AdminComplainsHistoryModal({ history, onClose, onDelete, onClearAll }: Props) {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="bg-[#f8fafc] w-full max-w-2xl h-[85vh] rounded-[30px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
            <div>
               <h2 className="text-2xl font-black text-gray-800">Complaint History</h2>
               <p className="text-xs text-gray-400 font-bold mt-1">Review past issues & resolutions</p>
            </div>
            <div className="flex gap-3">
                {history.length > 0 && (
                    <button 
                        onClick={() => { if(window.confirm('Clear all history?')) onClearAll(); }}
                        className="text-red-500 text-xs font-bold px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Clear All
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <div className="text-5xl mb-4 grayscale">📜</div>
                    <p className="font-bold text-gray-400">No history found</p>
                </div>
            ) : (
                history.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-[24px] border border-green-100 shadow-sm relative group hover:shadow-md transition-all">
                        
                        {/* Top Row */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-black shadow-sm">
                                    {item.table}
                                </div>
                                <span className="text-xs font-bold text-gray-400 border-l border-gray-200 pl-3">
                                    {item.location} • {item.itemName}
                                </span>
                            </div>
                            <button 
                                onClick={() => onDelete(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                title="Delete Record"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>

                        {/* Issue */}
                        <div className="mb-4">
                            <p className="text-sm font-black text-gray-800 leading-tight">"{item.issue}"</p>
                        </div>

                        {/* Footer: Resolution Details */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase text-green-600">✅ Resolved</span>
                                <span className="text-[10px] font-bold text-gray-400">{item.resolvedAt}</span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 italic leading-relaxed">
                                <span className="font-bold text-gray-400 not-italic mr-1">Note Sent:</span> 
                                {item.apologyNote}
                            </p>
                        </div>

                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}
