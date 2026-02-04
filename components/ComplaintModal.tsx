
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  itemName: string;
  onClose: () => void;
  onSubmit: (issue: string, details: string) => void;
}

const ISSUES = [
  "Hygiene Issue (Hair/Stone)",
  "Undercooked / Raw",
  "Burnt / Overcooked",
  "Taste / Seasoning",
  "Wrong Portion Size",
  "Stale / Not Fresh",
  "Wrong Item Served",
  "Other"
];

const ComplaintModal: React.FC<Props> = ({ itemName, onClose, onSubmit }) => {
  const [selectedIssue, setSelectedIssue] = useState(ISSUES[0]);
  const [details, setDetails] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = () => {
    onSubmit(selectedIssue, details);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="bg-white w-full max-w-lg rounded-t-[35px] p-6 pb-8 relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
        
        {/* Header */}
        <div className="text-center mb-6 shrink-0">
           <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-sm">
             <span className="text-3xl">📢</span>
           </div>
           <h3 className="text-xl font-black text-gray-800">Report Issue</h3>
           <p className="text-sm font-medium text-gray-500 mt-1">Item: <span className="text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-lg">{itemName}</span></p>
        </div>

        {/* Form Container */}
        <div className="space-y-5 flex-1 overflow-y-auto no-scrollbar pb-2">
           {/* Custom Dropdown */}
           <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 ml-1">Select Issue</label>
              
              {/* Dropdown Trigger */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full text-left bg-gray-50 border rounded-2xl px-5 py-4 font-bold text-gray-700 outline-none flex justify-between items-center transition-all active:scale-[0.99] ${isDropdownOpen ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-200'}`}
              >
                <span className="truncate mr-2">{selectedIssue}</span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-red-500' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-60 overflow-y-auto no-scrollbar">
                  {ISSUES.map((issue, index) => (
                    <button
                      key={issue}
                      onClick={() => {
                        setSelectedIssue(issue);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-colors border-b border-gray-50 last:border-0 hover:bg-red-50 hover:text-red-600
                        ${selectedIssue === issue ? 'bg-red-50 text-red-600' : 'text-gray-600'}
                      `}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              )}
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 ml-1">Additional Details</label>
              <textarea 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe the issue..."
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-medium text-gray-700 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all placeholder:text-gray-300 resize-none"
              />
           </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 space-y-3 shrink-0">
            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-200 active:scale-95 transition-all hover:bg-red-600 flex items-center justify-center gap-2"
            >
              <span>Send Report</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
            
            <button 
              onClick={onClose}
              className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 rounded-xl"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;
