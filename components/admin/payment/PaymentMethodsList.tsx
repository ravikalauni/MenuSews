
import React from 'react';
import { PaymentMethodConfig } from './PaymentMethodFormModal';

interface Props {
  methods: PaymentMethodConfig[];
  onAdd: () => void;
  onEdit: (method: PaymentMethodConfig) => void;
  onToggle: (id: string) => void;
  onBack: () => void;
}

const MethodRow: React.FC<{ 
  method: PaymentMethodConfig; 
  onEdit: (method: PaymentMethodConfig) => void; 
  onToggle: (id: string) => void; 
}> = ({ method, onEdit, onToggle }) => (
  <div className="bg-white border border-green-100 rounded-2xl p-3 md:p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
     <div className="flex items-center gap-4">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-2 shrink-0">
           {method.logo ? (
               <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
           ) : (
               <span className="text-xl font-black text-gray-300">{method.name.charAt(0)}</span>
           )}
        </div>
        <div>
           <h4 className="font-black text-gray-800 text-sm md:text-base leading-tight">{method.name}</h4>
           <p className="text-xs font-bold text-gray-400 mt-0.5 font-mono">{method.identifier}</p>
           <div className="flex items-center gap-2 mt-1 md:hidden">
              {method.qrCode && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold border border-green-100">QR Available</span>}
           </div>
        </div>
     </div>

     <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex flex-col items-end mr-4">
           {method.qrCode ? (
               <div className="bg-white border border-gray-200 p-1 rounded-lg">
                  <img src={method.qrCode} className="w-8 h-8 object-contain" alt="QR" />
               </div>
           ) : (
               <span className="text-xs text-gray-300 font-bold italic">No QR</span>
           )}
        </div>

        <button 
          onClick={() => onEdit(method)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-black shadow-md shadow-green-100 active:scale-95 transition-all flex items-center gap-2"
        >
           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
           <span className="hidden md:inline">Edit</span>
        </button>

        <div 
           onClick={() => onToggle(method.id)}
           className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${method.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
        >
           <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${method.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
     </div>
  </div>
);

export default function PaymentMethodsList({ methods, onAdd, onEdit, onToggle, onBack }: Props) {
  const activeMethods = methods.filter(m => m.isActive);
  const inactiveMethods = methods.filter(m => !m.isActive);

  return (
    <div className="flex flex-col h-full bg-[#f0fdf4]">
       {/* Header */}
       <div className="px-6 py-5 flex items-center justify-between border-b border-green-100 bg-[#f0fdf4] shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-green-100 text-green-700 flex items-center justify-center hover:bg-green-50 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <div>
                <h2 className="text-xl md:text-2xl font-black text-green-900 leading-none">Payment Methods</h2>
                <p className="text-xs font-bold text-green-600 mt-0.5">Manage Customer Options</p>
             </div>
          </div>
          <button 
            onClick={onAdd}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2"
          >
             <span className="text-lg leading-none">+</span>
             <span className="hidden md:inline">Add New</span>
          </button>
       </div>

       {/* Lists */}
       <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
          
          {/* Active List */}
          <div className="space-y-4">
             <h3 className="text-xs font-black text-green-800 uppercase tracking-widest pl-1">Active Methods ({activeMethods.length})</h3>
             {activeMethods.length === 0 ? (
                 <div className="p-8 text-center border-2 border-dashed border-green-200 rounded-2xl bg-green-50/50">
                    <p className="text-sm font-bold text-green-400">No active payment methods visible to customers.</p>
                 </div>
             ) : (
                 activeMethods.map(method => (
                    <MethodRow 
                      key={method.id} 
                      method={method} 
                      onEdit={onEdit} 
                      onToggle={onToggle} 
                    />
                 ))
             )}
          </div>

          {/* Deactivated List */}
          {inactiveMethods.length > 0 && (
             <div className="space-y-4 pt-4 border-t border-green-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Deactivated ({inactiveMethods.length})</h3>
                <div className="opacity-70 grayscale hover:grayscale-0 transition-all duration-300 space-y-3">
                   {inactiveMethods.map(method => (
                      <MethodRow 
                        key={method.id} 
                        method={method} 
                        onEdit={onEdit} 
                        onToggle={onToggle} 
                      />
                   ))}
                </div>
             </div>
          )}

       </div>
    </div>
  );
}
