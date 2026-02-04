
import React, { useState } from 'react';

export interface RewardRulesData {
  spendAmount: string;
  earnPoints: string;
  bonuses: { id: string; name: string; points: string }[];
}

interface Props {
  onClose: () => void;
  initialRules: RewardRulesData;
  onSave: (rules: RewardRulesData) => void;
}

export default function AdminOffersModal({ onClose, initialRules, onSave }: Props) {
  // State for Spend/Earn Ratio
  const [spendAmount, setSpendAmount] = useState(initialRules.spendAmount);
  const [earnPoints, setEarnPoints] = useState(initialRules.earnPoints);

  // State for Bonuses
  const [bonuses, setBonuses] = useState(initialRules.bonuses);

  // State for New Bonus Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBonusName, setNewBonusName] = useState('');
  const [newBonusPoints, setNewBonusPoints] = useState('');

  const handleUpdateBonus = (id: string, val: string) => {
    setBonuses(prev => prev.map(b => b.id === id ? { ...b, points: val } : b));
  };

  const handleDeleteBonus = (id: string) => {
      setBonuses(prev => prev.filter(b => b.id !== id));
  };

  const handleAddBonus = () => {
    if (!newBonusName.trim() || !newBonusPoints.trim()) return;
    
    setBonuses(prev => [
      ...prev, 
      { id: Date.now().toString(), name: newBonusName, points: newBonusPoints }
    ]);
    
    // Reset Form
    setNewBonusName('');
    setNewBonusPoints('');
    setShowAddForm(false);
  };

  const handleSave = () => {
      onSave({
          spendAmount,
          earnPoints,
          bonuses
      });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-[#f0fdf4] w-full max-w-md rounded-t-[35px] md:rounded-[35px] p-6 pb-8 relative z-10 flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom duration-300 border border-green-100">
        
        {/* Mobile Drag Handle */}
        <div className="md:hidden w-12 h-1.5 bg-green-200 rounded-full mx-auto mb-6 shrink-0" />

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 shrink-0">
           <h2 className="text-2xl font-black text-green-800">Edit Bonus details</h2>
           
           <div className="flex justify-end">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center gap-1.5"
              >
                 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                 Add New Bonuses
              </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-4">
           
           {/* 1. Spend / Earn Section */}
           <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#dcfce7] border border-green-400 rounded-lg h-12 flex items-center px-4 relative focus-within:ring-2 focus-within:ring-green-500/30 transition-all">
                 <span className="text-xs font-bold text-green-800 mr-2 whitespace-nowrap">Spend Rs</span>
                 <input 
                    type="number" 
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="w-full bg-transparent outline-none font-black text-green-900 text-sm"
                 />
              </div>
              <span className="text-xl font-black text-green-800">=</span>
              <div className="flex-1 bg-[#dcfce7] border border-green-400 rounded-lg h-12 flex items-center px-4 relative focus-within:ring-2 focus-within:ring-green-500/30 transition-all">
                 <span className="text-xs font-bold text-green-800 mr-2 whitespace-nowrap">Earn Pts</span>
                 <input 
                    type="number" 
                    value={earnPoints}
                    onChange={(e) => setEarnPoints(e.target.value)}
                    className="w-full bg-transparent outline-none font-black text-green-900 text-sm"
                 />
              </div>
           </div>

           {/* 2. Existing Bonuses List */}
           <div className="space-y-4">
              {bonuses.map((bonus) => (
                 <div key={bonus.id} className="flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-black text-green-900">{bonus.name}</label>
                        {/* Only allow deleting if it's not a core one, purely illustrative logic here */}
                        {/* Assuming first 2 are core for this demo, usually better to check a flag */}
                        {['Sign up Bonus', 'Birthday Bonus'].indexOf(bonus.name) === -1 && (
                            <button onClick={() => handleDeleteBonus(bonus.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}
                    </div>
                    <div className="w-32 bg-[#dcfce7] border border-green-400 rounded-lg h-10 flex items-center px-3 focus-within:ring-2 focus-within:ring-green-500/30 transition-all">
                       <span className="text-[10px] font-bold text-green-600 mr-2 border-r border-green-300 pr-2 h-full flex items-center">Pts</span>
                       <input 
                          type="number"
                          value={bonus.points}
                          onChange={(e) => handleUpdateBonus(bonus.id, e.target.value)}
                          className="w-full bg-transparent outline-none font-black text-green-900 text-sm"
                       />
                    </div>
                 </div>
              ))}
           </div>

           {/* 3. Add New Bonus Form (Visible when toggled) */}
           {showAddForm && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 animate-in fade-in slide-in-from-top-4">
                 <h4 className="text-xs font-black text-green-800 mb-4">Add a new bonus</h4>
                 
                 <div className="space-y-3">
                    <div className="bg-[#e8fbe8] border border-green-200 rounded-xl px-4 py-2.5">
                       <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Bonus Name</p>
                       <input 
                          type="text" 
                          value={newBonusName}
                          onChange={(e) => setNewBonusName(e.target.value)}
                          placeholder="Enter a name"
                          className="w-full bg-transparent outline-none text-sm font-bold text-green-900 placeholder-green-400"
                       />
                    </div>

                    <div className="bg-[#e8fbe8] border border-green-200 rounded-xl px-4 py-2.5">
                       <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Points</p>
                       <input 
                          type="number" 
                          value={newBonusPoints}
                          onChange={(e) => setNewBonusPoints(e.target.value)}
                          placeholder="Enter points"
                          className="w-full bg-transparent outline-none text-sm font-bold text-green-900 placeholder-green-400"
                       />
                    </div>

                    <button 
                       onClick={handleAddBonus}
                       className="w-full bg-green-600 text-white py-3 rounded-xl font-black text-sm shadow-md hover:bg-green-700 active:scale-95 transition-all mt-2"
                    >
                       Add
                    </button>
                 </div>
              </div>
           )}

        </div>

        {/* Footer Save Button */}
        <div className="mt-4 pt-0 shrink-0">
           <button 
             onClick={handleSave}
             className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-green-200 active:scale-95 transition-all hover:bg-green-700"
           >
              Save
           </button>
        </div>

      </div>
    </div>
  );
}
