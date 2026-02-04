
import React, { useState } from 'react';
import AdminApologyModal from './AdminApologyModal';
import AdminCustomizeComplaintsModal, { ComplaintConfig } from './AdminCustomizeComplaintsModal';
import AdminComplainsHistoryModal from './AdminComplainsHistoryModal';
import ToastContainer, { ToastMessage, ToastType } from '../../Toast';

const MOCK_COMPLAINTS = [
    { id: 'c1', table: 'T12', location: 'Rooftop', issue: 'I found hair in the food.', itemName: 'Veg Momo', time: '2m ago', status: 'pending' },
    { id: 'c2', table: 'T6', location: 'Ground Floor', issue: 'I don’t like waiter’s behaviour.', itemName: 'Service', time: '5m ago', status: 'pending' },
    { id: 'c3', table: 'T18', location: 'Garden', issue: 'The food is not as expected.', itemName: 'Chicken Pizza', time: '9m ago', status: 'pending' },
    { id: 'c4', table: 'T3', location: 'Hall', issue: 'My food is too salty and not edible.', itemName: 'Spicy Noodles', time: '12m ago', status: 'pending' },
];

const INITIAL_CONFIGS: ComplaintConfig[] = [
    { id: '1', complaintText: 'I found a hair in my food.', apologyText: 'We really sorry that you found a hair in your food. One of our staff members is coming to your table right now to check and assist you. If the issue is confirmed, the item will be on us with a 100% cashback.' },
    { id: '2', complaintText: 'There’s an insect in my dish.', apologyText: 'This is unacceptable. We are rushing to your table immediately.' },
    { id: '3', complaintText: 'My order is completely different from what I asked for.', apologyText: 'Apologies for the mix-up. We will replace it immediately.' },
    { id: '4', complaintText: 'I’ve been waiting for my order for a very long time.', apologyText: 'We are sorry for the delay. We are prioritizing your order now.' },
    { id: '5', complaintText: 'The food is cold even though it was supposed to be hot.', apologyText: 'We will reheat or replace your dish right away.' },
];

export default function AdminComplainsManager() {
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [complaintConfigs, setComplaintConfigs] = useState(INITIAL_CONFIGS);
  
  // History State
  const [history, setHistory] = useState<any[]>([]); // Resolved complaints
  
  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleApologiseClick = (complaint: any) => {
      setSelectedComplaint(complaint);
  };

  const handleSendApology = (message: string) => {
      // 1. Create Resolved Record
      const resolvedRecord = {
          ...selectedComplaint,
          resolvedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          apologyNote: message
      };

      // 2. Add to History
      setHistory(prev => [resolvedRecord, ...prev]);

      // 3. Remove from Active
      setComplaints(prev => prev.filter(c => c.id !== selectedComplaint.id));
      
      // 4. Close & Toast
      addToast('success', 'Apology Sent', `Message sent to Table ${selectedComplaint.table}`);
      setSelectedComplaint(null);
  };

  const handleNotify = (target: string) => {
      addToast('info', 'Staff Notified', `${target} has been alerted for Table ${selectedComplaint.table}`);
  };

  const handleSaveConfigs = (newConfigs: ComplaintConfig[]) => {
      setComplaintConfigs(newConfigs);
      addToast('success', 'Settings Saved', 'Complaint configurations updated successfully.');
  };

  const handleDeleteHistory = (id: string) => {
      setHistory(prev => prev.filter(h => h.id !== id));
      addToast('success', 'Record Deleted', 'History item removed.');
  };

  return (
    <div className="flex flex-col h-full bg-[#f0fdf4] animate-in slide-in-from-right duration-300 relative overflow-hidden">
       
       <ToastContainer toasts={toasts} removeToast={removeToast} />

       {/* Decorative Background */}
       <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-green-100/50 to-transparent pointer-events-none" />

       {/* Header - Mobile Optimized */}
       <div className="px-5 md:px-8 pt-6 pb-4 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-xl md:text-2xl font-black text-green-800 leading-none">Active Complaints</h2>
             <div className="flex items-center gap-2 mt-1.5">
                <span className="text-green-600 font-bold text-xs">Live Issues</span>
                {complaints.length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-red-200 shadow-sm">
                        {complaints.length} New
                    </span>
                )}
             </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowHistory(true)}
                className="flex-1 md:flex-none bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl font-black text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <span className="text-base">📜</span>
                 History
              </button>
              
              <button 
                onClick={() => setShowCustomize(true)}
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                 Settings
              </button>
          </div>
       </div>

       {/* List of Complaints */}
       <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 pb-8 relative z-10">
          <div className="space-y-3 md:space-y-4 max-w-4xl">
             {complaints.length === 0 ? (
                 <div className="text-center py-24 opacity-50 flex flex-col items-center">
                     <div className="text-6xl mb-4 grayscale filter">😌</div>
                     <p className="font-bold text-gray-500 text-lg">All clear!</p>
                     <p className="text-sm text-gray-400">No active complaints at the moment.</p>
                 </div>
             ) : (
                 complaints.map((comp) => (
                    <div key={comp.id} className="bg-white rounded-[20px] p-3 md:p-2 md:pr-4 border border-red-100 shadow-sm md:flex items-center gap-4 transition-all hover:shadow-md hover:border-red-200 group relative overflow-hidden">
                        {/* Mobile: Top Row Info */}
                        <div className="flex items-start gap-3 md:contents">
                            {/* Table Badge */}
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md shadow-red-200 shrink-0">
                               {comp.table}
                            </div>

                            <div className="flex-1 min-w-0 md:py-1">
                                <div className="flex justify-between items-start md:block">
                                    <p className="text-[10px] font-bold text-red-400 md:mb-0.5 uppercase tracking-wide">{comp.time}</p>
                                </div>
                                <h4 className="text-sm md:text-base font-black text-red-600 leading-tight mb-1.5 md:mb-1 mt-0.5 line-clamp-2">{comp.issue}</h4>
                                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                    <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200 truncate max-w-[100px]">
                                        {comp.itemName}
                                    </span>
                                    <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                                        {comp.location}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Mobile: Action Button Full Width */}
                        <div className="mt-3 md:mt-0 md:block">
                            <button 
                               onClick={() => handleApologiseClick(comp)}
                               className="w-full md:w-auto bg-[#fff1f2] text-red-600 border border-red-100 hover:bg-red-50 hover:border-red-200 px-6 py-3 md:py-2.5 rounded-xl font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                               <span>Apologise</span>
                               <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    </div>
                 ))
             )}
          </div>
       </div>

       {/* --- MODALS --- */}
       
       {selectedComplaint && (
           <AdminApologyModal 
              complaint={selectedComplaint}
              onClose={() => setSelectedComplaint(null)}
              onSendApology={handleSendApology}
              onNotifyKitchen={() => handleNotify('Kitchen')}
              onNotifyWaiter={() => handleNotify('Waiter')}
           />
       )}

       {showCustomize && (
           <AdminCustomizeComplaintsModal 
              initialConfigs={complaintConfigs}
              onClose={() => setShowCustomize(false)}
              onSave={handleSaveConfigs}
           />
       )}

       {showHistory && (
           <AdminComplainsHistoryModal 
              history={history}
              onClose={() => setShowHistory(false)}
              onDelete={handleDeleteHistory}
              onClearAll={() => {
                  setHistory([]);
                  addToast('success', 'History Cleared', 'All records have been removed.');
              }}
           />
       )}

    </div>
  );
}
