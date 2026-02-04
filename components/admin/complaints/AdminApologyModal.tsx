
import React, { useState } from 'react';

interface Props {
  complaint: any;
  onClose: () => void;
  onSendApology: (message: string) => void;
  onNotifyKitchen: () => void;
  onNotifyWaiter: () => void;
}

export default function AdminApologyModal({ complaint, onClose, onSendApology, onNotifyKitchen, onNotifyWaiter }: Props) {
  const [message, setMessage] = useState(
    `We sincerely apologize for the inconvenience regarding the ${complaint.itemName}. Our team member is on the way to verify the issue. If confirmed, you will receive a full cashback/replacement for the item. Thank you.`
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="bg-[#fff1f2] w-full max-w-md rounded-[30px] p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 md:zoom-in-95 border-t-4 border-red-500">
        
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-red-200 rounded-full mx-auto mb-6 md:hidden" />

        {/* Header Section */}
        <div className="bg-white/60 border border-red-100 rounded-2xl p-4 flex items-center gap-4 mb-6 shadow-sm">
            <div className="w-14 h-14 bg-red-600 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {complaint.table}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Complaint</span>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">{complaint.time}</span>
                </div>
                <p className="text-sm font-black text-red-900 leading-tight line-clamp-2">{complaint.issue}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-500 truncate">
                    <span>{complaint.itemName}</span>
                    <span className="text-red-300">•</span>
                    <span>{complaint.location}</span>
                </div>
            </div>
        </div>

        <h3 className="text-lg font-black text-red-800 text-center mb-4">Send Apology Message</h3>

        {/* Message Box */}
        <div className="bg-white border-2 border-red-100 rounded-2xl p-4 mb-6 shadow-inner focus-within:ring-2 focus-within:ring-red-200 transition-all">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 text-sm font-medium text-gray-700 outline-none resize-none bg-transparent placeholder-gray-300 leading-relaxed"
                placeholder="Type your apology message here..."
            />
        </div>

        {/* Send Button */}
        <button 
            onClick={() => onSendApology(message)}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-200 active:scale-95 transition-all mb-6 flex items-center justify-center gap-2"
        >
            <span>Send to {complaint.table}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>

        {/* Notification Actions */}
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={onNotifyKitchen}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-red-100 rounded-2xl shadow-sm active:scale-95 transition-all hover:bg-red-50 group"
            >
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <span className="text-xs font-black text-red-800 uppercase">Notify Kitchen</span>
            </button>

            <button 
                onClick={onNotifyWaiter}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-red-100 rounded-2xl shadow-sm active:scale-95 transition-all hover:bg-red-50 group"
            >
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span className="text-xs font-black text-red-800 uppercase">Notify Waiter</span>
            </button>
        </div>

      </div>
    </div>
  );
}
