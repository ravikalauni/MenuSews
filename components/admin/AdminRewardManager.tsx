
import React, { useState } from 'react';
import AdminRewardStats from './rewards/AdminRewardStats';
import AdminRewardRules from './rewards/AdminRewardRules';
import AdminRedemptionHistory from './rewards/AdminRedemptionHistory';
import AdminOffersModal, { RewardRulesData } from './rewards/AdminOffersModal';
import AdminOffersManager from './rewards/AdminOffersManager'; // IMPORT NEW MANAGER

interface Props {
  onNavigateToCustomers?: () => void;
  // New Props for linked data
  menuItems?: any[]; 
  onUpdateItem?: (item: any) => void;
}

const INITIAL_RULES: RewardRulesData = {
    spendAmount: '100',
    earnPoints: '1',
    bonuses: [
        { id: '1', name: 'Sign up Bonus', points: '50' },
        { id: '2', name: 'Birthday Bonus', points: '50' },
    ]
};

export default function AdminRewardManager({ onNavigateToCustomers, menuItems = [], onUpdateItem = () => {} }: Props) {
  // State for Rules Configuration
  const [rules, setRules] = useState<RewardRulesData>(INITIAL_RULES);
  const [showEditRulesModal, setShowEditRulesModal] = useState(false);
  
  // State for Offers Module
  const [showOffersManager, setShowOffersManager] = useState(false);

  const handleOffersClick = () => {
      setShowOffersManager(true);
  };

  const handleUpdateRules = (newRules: RewardRulesData) => {
      setRules(newRules);
      // In a real app, API call here
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] relative overflow-hidden animate-in slide-in-from-right duration-300">
       
       {/* Green Gradient Background Header with Radius on ALL corners to match screenshot request */}
       <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#86efac]/40 to-transparent pointer-events-none z-0 rounded-[30px]" />

       {/* Header Title Area */}
       <div className="px-6 md:px-8 pt-6 pb-2 relative z-10 flex justify-between items-center shrink-0">
          <div>
             <h2 className="text-2xl font-black text-green-800 leading-none">Customize Rewards</h2>
             <p className="text-xs text-gray-500 font-bold mt-1">Manage loyalty programs, discounts, and offers</p>
          </div>
          
          <button 
            onClick={handleOffersClick}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-green-200 active:scale-95 transition-all"
          >
             Offers
          </button>
       </div>

       {/* Scrollable Content */}
       <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-6">
             
             {/* 1. Stats Row */}
             <AdminRewardStats onNavigateToCustomers={onNavigateToCustomers} />

             {/* 2. Main Content Grid */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left: Rules (Pass data and edit handler) */}
                <div>
                   <AdminRewardRules 
                      rules={rules} 
                      onEditClick={() => setShowEditRulesModal(true)} 
                   />
                </div>

                {/* Right: History */}
                <div className="min-h-[300px] flex flex-col">
                   <AdminRedemptionHistory />
                </div>

             </div>
          </div>
       </div>

       {/* Reward Rules Modal */}
       {showEditRulesModal && (
          <AdminOffersModal 
             initialRules={rules}
             onClose={() => setShowEditRulesModal(false)} 
             onSave={handleUpdateRules}
          />
       )}

       {/* New Offers Module Overlay */}
       {showOffersManager && (
          <AdminOffersManager 
             menuItems={menuItems}
             onUpdateItem={onUpdateItem}
             onClose={() => setShowOffersManager(false)}
          />
       )}
    </div>
  );
}
