
import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSelect: (start: Date, end: Date | null) => void;
  initialDate: Date;
}

export default function DatePickerModal({ onClose, onSelect, initialDate }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate));
  const [startDate, setStartDate] = useState<Date | null>(initialDate);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentMonth);

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(clickedDate);
      setEndDate(null);
    } else {
      // Complete range or reset if invalid
      if (clickedDate < startDate) {
        setStartDate(clickedDate);
        setEndDate(null);
      } else {
        // Check 30 day limit
        const diffTime = Math.abs(clickedDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays > 30) {
           alert("Range cannot exceed 30 days");
           return;
        }
        setEndDate(clickedDate);
      }
    }
  };

  const handleConfirm = () => {
    if (startDate) {
      onSelect(startDate, endDate);
      onClose();
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth.setMonth(currentMonth.getMonth() + offset));
    setCurrentMonth(new Date(newDate));
  };

  const isSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (startDate && date.getTime() === startDate.getTime()) return 'start';
    if (endDate && date.getTime() === endDate.getTime()) return 'end';
    if (startDate && endDate && date > startDate && date < endDate) return 'middle';
    return null;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="bg-white rounded-[30px] p-6 w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="font-black text-lg text-gray-800">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2 mb-6">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const status = isSelected(day);
            let bgClass = '';
            let textClass = 'text-gray-700 hover:bg-gray-100';
            
            if (status === 'start' || status === 'end') {
              bgClass = 'bg-green-600 text-white shadow-md scale-110';
              textClass = 'text-white font-black';
            } else if (status === 'middle') {
              bgClass = 'bg-green-100 text-green-800';
              textClass = 'text-green-800 font-bold';
            }

            return (
              <button 
                key={day} 
                onClick={() => handleDateClick(day)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all mx-auto ${bgClass} ${textClass}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3">
           <div className="text-center">
              <p className="text-xs font-bold text-gray-500">
                 {startDate ? startDate.toLocaleDateString() : 'Select Start'} 
                 {endDate ? ` - ${endDate.toLocaleDateString()}` : ''}
              </p>
           </div>
           <button 
             onClick={handleConfirm}
             disabled={!startDate}
             className="w-full bg-green-600 text-white py-3 rounded-xl font-black shadow-lg shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
           >
             Apply Range
           </button>
        </div>

      </div>
    </div>
  );
}
