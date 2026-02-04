
import React, { useState, useEffect } from 'react';

export interface StaffMember {
  id: string;
  name: string;
  age: string;
  contact: string;
  department: string;
  username: string;
  bloodGroup?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  avatarColor?: string;
}

interface Props {
  initialData?: StaffMember | null;
  departments: string[];
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const AVATAR_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];

export default function StaffFormModal({ initialData, departments, onClose, onSave }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    contact: '',
    department: departments[0] || '',
    username: '',
    bloodGroup: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        age: initialData.age,
        contact: initialData.contact,
        department: initialData.department,
        username: initialData.username,
        bloodGroup: initialData.bloodGroup || '',
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!formData.name || !formData.department || !formData.username) return;

    const newStaff: StaffMember = {
      id: initialData?.id || Date.now().toString(),
      ...formData,
      status: initialData?.status || 'active',
      joinedDate: initialData?.joinedDate || new Date().toLocaleDateString(),
      avatarColor: initialData?.avatarColor || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };

    onSave(newStaff);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="bg-white w-full max-w-lg rounded-t-[35px] md:rounded-[35px] shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="bg-gray-900 px-8 py-6 rounded-t-[35px] flex justify-between items-center text-white shrink-0">
           <div>
              <h2 className="text-2xl font-black">{initialData ? 'Edit Profile' : 'New Staff'}</h2>
              <p className="text-gray-400 text-xs font-bold mt-1">
                 {initialData ? 'Update staff details' : 'Onboard a new team member'}
              </p>
           </div>
           <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
           
           {/* Section 1: Basic Info */}
           <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Identity</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. John Doe"
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Username (Login)</label>
                      <input 
                        type="text" 
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        placeholder="e.g. john.waiter"
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                  </div>
              </div>
           </div>

           {/* Section 2: Role & Contact */}
           <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Role & Contact</h3>
              
              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Department</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {departments.map(dept => (
                          <button
                            key={dept}
                            onClick={() => setFormData({...formData, department: dept})}
                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                                formData.department === dept 
                                ? 'bg-green-600 text-white border-green-600 shadow-md' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
                            }`}
                          >
                              {dept}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Contact No.</label>
                      <input 
                        type="tel" 
                        value={formData.contact}
                        onChange={e => setFormData({...formData, contact: e.target.value})}
                        placeholder="98..."
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Age</label>
                      <input 
                        type="number" 
                        value={formData.age}
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        placeholder="25"
                        className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800 outline-none focus:border-green-500 focus:bg-white transition-all"
                      />
                  </div>
              </div>
           </div>

           {/* Section 3: Optional */}
           <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Optional Details</h3>
              <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Blood Group (Optional)</label>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {BLOOD_GROUPS.map(bg => (
                          <button
                            key={bg}
                            onClick={() => setFormData({...formData, bloodGroup: bg === formData.bloodGroup ? '' : bg})}
                            className={`w-10 h-10 rounded-full text-xs font-black border shrink-0 transition-all flex items-center justify-center ${
                                formData.bloodGroup === bg 
                                ? 'bg-red-500 text-white border-red-500 shadow-md' 
                                : 'bg-white text-gray-400 border-gray-200 hover:border-red-300'
                            }`}
                          >
                              {bg}
                          </button>
                      ))}
                  </div>
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-[35px]">
            <button 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.username}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none hover:bg-green-700"
            >
                {initialData ? 'Update Staff Member' : 'Add Staff Member'}
            </button>
        </div>

      </div>
    </div>
  );
}
