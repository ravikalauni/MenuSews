
import React, { useState, useMemo } from 'react';
import ToastContainer, { ToastMessage, ToastType } from '../../Toast';
import StaffFormModal, { StaffMember } from './StaffFormModal';

const INITIAL_DEPARTMENTS = ['Kitchen', 'Waiter', 'Bar', 'Reception', 'Cashier', 'Cleaning'];

const MOCK_STAFF: StaffMember[] = [
    { id: '1', name: 'Ramesh Chef', age: '32', contact: '9841000000', department: 'Kitchen', username: 'ramesh.k', status: 'active', joinedDate: '1/12/2023', avatarColor: 'bg-orange-500' },
    { id: '2', name: 'Sita Waitress', age: '24', contact: '9803000000', department: 'Waiter', username: 'sita.w', status: 'active', joinedDate: '5/08/2024', avatarColor: 'bg-blue-500' },
    { id: '3', name: 'Hari Manager', age: '40', contact: '9851000000', department: 'Reception', username: 'hari.m', status: 'active', joinedDate: '10/01/2020', avatarColor: 'bg-purple-500' },
    { id: '4', name: 'Gopal Barman', age: '28', contact: '9812000000', department: 'Bar', username: 'gopal.b', status: 'inactive', joinedDate: '2/03/2024', avatarColor: 'bg-pink-500' },
];

export default function AdminStaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [departments, setDepartments] = useState<string[]>(INITIAL_DEPARTMENTS);
  const [activeDept, setActiveDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isEditingDepts, setIsEditingDepts] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- HANDLERS ---

  const handleSaveStaff = (newStaff: StaffMember) => {
      if (editingStaff) {
          setStaff(prev => prev.map(s => s.id === newStaff.id ? newStaff : s));
          addToast('success', 'Profile Updated', `${newStaff.name}'s details saved.`);
      } else {
          setStaff(prev => [newStaff, ...prev]);
          addToast('success', 'Staff Added', `${newStaff.name} joined ${newStaff.department}.`);
      }
      setShowFormModal(false);
      setEditingStaff(null);
  };

  const handleDeleteStaff = (id: string) => {
      if (window.confirm('Are you sure you want to remove this staff member?')) {
          setStaff(prev => prev.filter(s => s.id !== id));
          addToast('info', 'Staff Removed', 'The record has been deleted.');
      }
  };

  const handleToggleStatus = (id: string) => {
      setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
  };

  const handleAddDept = () => {
      if (newDeptName.trim() && !departments.includes(newDeptName.trim())) {
          setDepartments([...departments, newDeptName.trim()]);
          setNewDeptName('');
          addToast('success', 'Department Added', newDeptName);
      }
  };

  const handleDeleteDept = (dept: string) => {
      if (window.confirm(`Delete ${dept} department? Staff in this department will need reassignment.`)) {
          setDepartments(prev => prev.filter(d => d !== dept));
          if (activeDept === dept) setActiveDept('All');
      }
  };

  const filteredStaff = useMemo(() => {
      return staff.filter(s => {
          const matchesDept = activeDept === 'All' || s.department === activeDept;
          const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.username.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesDept && matchesSearch;
      });
  }, [staff, activeDept, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] animate-in slide-in-from-right duration-300 relative overflow-hidden">
       
       <ToastContainer toasts={toasts} removeToast={removeToast} />

       {/* --- HEADER --- */}
       <div className="px-6 md:px-8 py-6 bg-white border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-20">
          <div>
             <h2 className="text-2xl font-black text-gray-900 leading-none">Inside Users</h2>
             <p className="text-xs text-gray-400 font-bold mt-1">Manage staff, roles & permissions</p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => setIsEditingDepts(!isEditingDepts)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all ${isEditingDepts ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
             >
                {isEditingDepts ? 'Done Editing' : 'Edit Depts'}
             </button>
             <button 
                onClick={() => { setEditingStaff(null); setShowFormModal(true); }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center gap-2"
             >
                <span>+ Add Staff</span>
             </button>
          </div>
       </div>

       {/* --- MAIN CONTENT --- */}
       <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT: DEPARTMENTS (Desktop Sidebar / Mobile Top Bar) */}
          <div className={`
             bg-white md:w-64 border-b md:border-b-0 md:border-r border-gray-100 shrink-0 flex flex-col transition-all duration-300
             ${isEditingDepts ? 'md:w-80' : ''}
          `}>
             <div className="p-4 md:p-6 overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col gap-2">
                
                {/* Search Bar (Only visible on Desktop here, moved to main on mobile usually but let's keep simple) */}
                <div className="hidden md:block mb-4">
                   <div className="bg-gray-100 rounded-xl px-3 py-2 flex items-center">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <input 
                        type="text" 
                        placeholder="Search staff..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="bg-transparent w-full text-xs font-bold text-gray-700 outline-none"
                      />
                   </div>
                </div>

                <div className="md:hidden w-full mb-2">
                   <input 
                     type="text" 
                     placeholder="Search staff..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="bg-gray-100 w-full rounded-xl px-4 py-3 text-xs font-bold text-gray-700 outline-none"
                   />
                </div>

                {/* Add Dept Input (Visible when editing) */}
                {isEditingDepts && (
                   <div className="flex gap-2 mb-4 animate-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        value={newDeptName}
                        onChange={e => setNewDeptName(e.target.value)}
                        placeholder="New Dept Name"
                        className="flex-1 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs font-bold text-orange-800 outline-none placeholder-orange-300"
                      />
                      <button onClick={handleAddDept} className="bg-orange-500 text-white rounded-lg px-3 font-black text-lg shadow-sm active:scale-95">+</button>
                   </div>
                )}

                {/* Department List */}
                <button 
                   onClick={() => setActiveDept('All')}
                   className={`
                      px-4 py-3 md:py-4 rounded-xl text-left font-bold text-xs md:text-sm transition-all whitespace-nowrap md:whitespace-normal shrink-0 flex justify-between items-center
                      ${activeDept === 'All' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                   `}
                >
                   <span>All Staff</span>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeDept === 'All' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>{staff.length}</span>
                </button>

                {departments.map(dept => (
                   <div key={dept} className="relative group shrink-0">
                       <button 
                          onClick={() => setActiveDept(dept)}
                          className={`
                             w-full px-4 py-3 md:py-4 rounded-xl text-left font-bold text-xs md:text-sm transition-all whitespace-nowrap md:whitespace-normal flex justify-between items-center
                             ${activeDept === dept 
                               ? 'bg-green-100 text-green-800 border-green-200 shadow-sm' 
                               : 'bg-white border border-gray-100 text-gray-600 hover:border-green-200 hover:text-green-700'}
                          `}
                       >
                          <span>{dept}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeDept === dept ? 'bg-white/50 text-green-900' : 'bg-gray-100 text-gray-400'}`}>
                             {staff.filter(s => s.department === dept).length}
                          </span>
                       </button>
                       {isEditingDepts && (
                          <button 
                            onClick={() => handleDeleteDept(dept)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-md active:scale-95 z-10"
                          >
                             ✕
                          </button>
                       )}
                   </div>
                ))}
             </div>
          </div>

          {/* RIGHT: STAFF GRID */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 bg-[#f8fafc]">
             {filteredStaff.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full opacity-50 py-20">
                    <div className="text-5xl mb-4 grayscale">🧑‍🤝‍🧑</div>
                    <p className="font-bold text-gray-400">No staff members found.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredStaff.map(member => (
                       <div key={member.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 relative group hover:shadow-xl transition-all hover:-translate-y-1">
                          
                          {/* Top Actions */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => { setEditingStaff(member); setShowFormModal(true); }}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600"
                             >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                             </button>
                             <button 
                                onClick={() => handleDeleteStaff(member.id)}
                                className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white"
                             >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                          </div>

                          {/* Avatar & Basic Info */}
                          <div className="flex flex-col items-center text-center mt-2">
                             <div className={`w-20 h-20 rounded-full ${member.avatarColor || 'bg-gray-300'} flex items-center justify-center text-white text-2xl font-black shadow-lg mb-3`}>
                                {member.name.charAt(0)}
                             </div>
                             <h3 className="text-lg font-black text-gray-800 leading-tight">{member.name}</h3>
                             <p className="text-xs font-bold text-gray-400 mt-1">@{member.username}</p>
                             
                             <div className="mt-3 flex gap-2">
                                <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide">
                                   {member.department}
                                </span>
                                <button 
                                   onClick={() => handleToggleStatus(member.id)}
                                   className={`px-3 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${
                                      member.status === 'active' 
                                      ? 'bg-blue-50 text-blue-600 border-blue-100' 
                                      : 'bg-gray-100 text-gray-500 border-gray-200'
                                   }`}
                                >
                                   {member.status === 'active' ? 'Active' : 'Inactive'}
                                </button>
                             </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gray-100 w-full my-4" />

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-left">
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Age</p>
                                <p className="text-sm font-bold text-gray-700">{member.age} yrs</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Contact</p>
                                <p className="text-sm font-bold text-gray-700 truncate">{member.contact}</p>
                             </div>
                             <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase">Joined</p>
                                <p className="text-xs font-bold text-gray-600">{member.joinedDate}</p>
                             </div>
                             {member.bloodGroup && (
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase">Blood</p>
                                    <p className="text-xs font-black text-red-500">{member.bloodGroup}</p>
                                </div>
                             )}
                          </div>

                          {/* Switch Role Button */}
                          <button className="w-full mt-5 bg-gray-900 text-white py-3 rounded-xl text-xs font-black shadow-lg shadow-gray-200 active:scale-95 transition-all hover:bg-black flex items-center justify-center gap-2">
                             <span>Login as {member.name.split(' ')[0]}</span>
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          </button>

                       </div>
                    ))}
                 </div>
             )}
          </div>
       </div>

       {/* Form Modal */}
       {showFormModal && (
          <StaffFormModal 
             initialData={editingStaff}
             departments={departments}
             onClose={() => setShowFormModal(false)}
             onSave={handleSaveStaff}
          />
       )}

    </div>
  );
}
