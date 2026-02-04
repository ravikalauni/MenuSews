
import React, { useState, useRef, useEffect } from 'react';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  provider: 'esewa' | 'khalti' | 'fonepay' | 'bank' | 'cash' | 'other';
  identifier: string;
  logo: string;
  qrCode?: string;
  isActive: boolean;
  stats?: {
    revenue: number;
    orders: number;
  };
}

interface Props {
  initialData?: PaymentMethodConfig | null;
  onClose: () => void;
  onSave: (data: PaymentMethodConfig) => void;
}

const PROVIDERS = [
  { id: 'esewa', name: 'eSewa', logo: 'e', color: 'bg-green-500' },
  { id: 'khalti', name: 'Khalti', logo: 'K', color: 'bg-purple-600' },
  { id: 'fonepay', name: 'FonePay', logo: 'F', color: 'bg-red-500' },
  { id: 'nabil', name: 'Nabil Bank', logo: 'N', color: 'bg-green-700' },
];

export default function PaymentMethodFormModal({ initialData, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIdentifier(initialData.identifier);
      setIsActive(initialData.isActive);
      setLogoPreview(initialData.logo);
      setQrPreview(initialData.qrCode || null);
    }
  }, [initialData]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setQrPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || !identifier) return;

    const method: PaymentMethodConfig = {
      id: initialData?.id || Date.now().toString(),
      name,
      identifier,
      isActive,
      logo: logoPreview || '',
      qrCode: qrPreview || undefined,
      provider: 'other', // logic to detect provider can be added here
      stats: initialData?.stats || { revenue: 0, orders: 0 }
    };
    onSave(method);
  };

  const applyPreset = (p: typeof PROVIDERS[0]) => {
    setName(p.name);
    // In a real app, you'd set the actual logo URL here
    // For now we assume the user uploads it or we generate a placeholder
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-[35px] md:rounded-[35px] shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 bg-[#f0fdf4] border-b border-green-100 flex justify-between items-center shrink-0">
           <div>
              <h2 className="text-xl font-black text-green-800 leading-none">
                {initialData ? 'Edit Method' : 'Add Payment Method'}
              </h2>
              <p className="text-xs font-bold text-green-600 mt-1">Configure payment gateway</p>
           </div>
           <button onClick={onClose} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-green-700 shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
           
           {/* Logo Upload */}
           <div 
             onClick={() => logoInputRef.current?.click()}
             className="w-full h-40 rounded-3xl border-2 border-dashed border-green-200 bg-green-50 flex flex-col items-center justify-center cursor-pointer hover:bg-green-100 transition-colors group relative overflow-hidden"
           >
              {logoPreview ? (
                 <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
              ) : (
                 <>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </div>
                    <span className="text-xs font-black text-green-700 uppercase tracking-wide">Upload Logo</span>
                 </>
              )}
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
           </div>

           {/* Presets (Only on Add) */}
           {!initialData && (
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Or use existing provider</p>
                <div className="flex gap-3">
                   {PROVIDERS.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className="w-12 h-12 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center text-lg font-black text-gray-700 hover:border-green-300 hover:bg-green-50 transition-all active:scale-95"
                      >
                         {p.logo}
                      </button>
                   ))}
                </div>
             </div>
           )}

           {/* QR Code Upload */}
           <div 
             onClick={() => qrInputRef.current?.click()}
             className="w-full h-32 rounded-3xl border border-gray-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-green-300 transition-colors relative overflow-hidden"
           >
              {qrPreview ? (
                 <img src={qrPreview} alt="QR" className="w-full h-full object-contain p-2" />
              ) : (
                 <div className="flex flex-col items-center">
                    <svg className="w-8 h-8 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    <span className="text-[10px] font-bold text-gray-400">Upload QR Code</span>
                 </div>
              )}
              <input type="file" ref={qrInputRef} className="hidden" accept="image/*" onChange={handleQrUpload} />
           </div>

           {/* Inputs */}
           <div className="space-y-4">
              <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Method Name</label>
                 <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 bg-[#f0fdf4] border border-green-200 rounded-xl px-4 font-bold text-green-900 outline-none focus:border-green-500"
                    placeholder="e.g. eSewa"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">ID / Phone Number</label>
                 <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full h-12 bg-[#f0fdf4] border border-green-200 rounded-xl px-4 font-bold text-green-900 outline-none focus:border-green-500"
                    placeholder="e.g. 9800000000"
                 />
              </div>
           </div>

           {/* Toggle Active */}
           <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl">
              <span className="font-bold text-gray-700 text-sm">Activate instantly</span>
              <div 
                 onClick={() => setIsActive(!isActive)}
                 className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
           </div>

        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-gray-50">
           <button 
             onClick={handleSave}
             disabled={!name || !identifier}
             className="w-full bg-green-600 hover:bg-green-700 text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-green-200 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
           >
              {initialData ? 'Save Changes' : 'Publish Method'}
           </button>
        </div>

      </div>
    </div>
  );
}
