
import React, { useState, useRef, useEffect } from 'react';
import ToastContainer, { ToastMessage, ToastType } from '../../Toast';
import ColorPicker from './ColorPicker';
import { useVat } from '../../../hooks/useVat';

export default function AdminSettingsManager() {
  // --- STATE ---
  const [formData, setFormData] = useState({
    name: 'Ravi Restaurant',
    slogan: 'Taste of Tradition',
    address: 'Kathmandu, Nepal',
    contact: '+977 9800000000',
    about: 'We serve the best traditional food with a modern twist. Come visit us for a delightful experience.'
  });

  const [logo, setLogo] = useState<string | null>(null);
  
  const [colors, setColors] = useState({
    primary: '#16a34a', // Green-600
    secondary: '#dcfce7' // Green-100
  });

  // VAT Hook
  const { config: vatConfig, updateConfig: updateVatConfig } = useVat();
  const [tempVatRate, setTempVatRate] = useState(vatConfig.rate.toString());

  // Sync local vat input with hook state when it loads/changes
  useEffect(() => {
      setTempVatRate(vatConfig.rate.toString());
  }, [vatConfig.rate]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save VAT
    const rate = parseFloat(tempVatRate);
    updateVatConfig({
        enabled: vatConfig.enabled,
        rate: isNaN(rate) ? 0 : rate
    });

    // In a real app, save other settings to API here
    addToast('success', 'Settings Saved', 'Configuration updated successfully.');
  };

  const handlePresetSelect = (primary: string, secondary: string) => {
    setColors({ primary, secondary });
  };

  return (
    <div className="flex flex-col h-full bg-[#f0fdf4] animate-in slide-in-from-right duration-300 relative overflow-hidden">
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Decorative Background for PC feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* --- HEADER --- */}
      <div className="px-6 md:px-10 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-20">
         <div>
            <h2 className="text-2xl font-black text-gray-900 leading-none">Settings</h2>
            <p className="text-xs text-green-600 font-bold mt-1">Customise</p>
         </div>
         
         <div className="flex items-center gap-4">
             {/* Small Logo Preview in Header */}
             <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                    {logo ? <img src={logo} className="w-full h-full object-cover" /> : 'R'}
                </div>
                <span className="text-xs font-black text-green-800">{formData.name}</span>
             </div>

             <button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center gap-2"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                <span>Save all changes</span>
             </button>
         </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8">
         <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            
            {/* LEFT COLUMN: DETAIL INFORMATION */}
            <div className="space-y-6">
               <div>
                  <h3 className="text-lg font-black text-green-900 mb-4 px-1">Detail information</h3>
                  
                  <div className="space-y-4">
                     <div className="group">
                        <input 
                           type="text" 
                           value={formData.name}
                           onChange={e => handleChange('name', e.target.value)}
                           placeholder="Name of the restaurant"
                           className="w-full bg-[#e6fce6] border border-green-600 text-green-900 font-bold text-sm rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-green-700/50"
                        />
                     </div>
                     
                     <div className="group">
                        <input 
                           type="text" 
                           value={formData.slogan}
                           onChange={e => handleChange('slogan', e.target.value)}
                           placeholder="Slogan"
                           className="w-full bg-[#e6fce6] border border-green-600 text-green-900 font-bold text-sm rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-green-700/50"
                        />
                     </div>

                     <div className="group">
                        <input 
                           type="text" 
                           value={formData.address}
                           onChange={e => handleChange('address', e.target.value)}
                           placeholder="Address"
                           className="w-full bg-[#e6fce6] border border-green-600 text-green-900 font-bold text-sm rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-green-700/50"
                        />
                     </div>

                     <div className="group">
                        <input 
                           type="text" 
                           value={formData.contact}
                           onChange={e => handleChange('contact', e.target.value)}
                           placeholder="Contact Information"
                           className="w-full bg-[#e6fce6] border border-green-600 text-green-900 font-bold text-sm rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-green-700/50"
                        />
                     </div>

                     <div className="group">
                        <textarea 
                           value={formData.about}
                           onChange={e => handleChange('about', e.target.value)}
                           placeholder="About"
                           rows={5}
                           className="w-full bg-[#e6fce6] border border-green-600 text-green-900 font-bold text-sm rounded-2xl px-5 py-4 outline-none focus:ring-4 focus:ring-green-100 transition-all placeholder:text-green-700/50 resize-none"
                        />
                     </div>
                  </div>
               </div>

               {/* Logo Upload Section */}
               <div className="bg-[#bbf7d0] border border-green-600 rounded-[24px] p-4 flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div className="flex items-center gap-4 z-10">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-full border-2 border-green-700 bg-green-400 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner hover:scale-105 transition-transform"
                     >
                        {logo ? (
                            <img src={logo} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl opacity-50">📷</span>
                        )}
                     </div>
                     <div>
                        <h4 className="text-green-900 font-black text-base">Upload a logo</h4>
                        <p className="text-[10px] text-green-700 font-bold leading-tight max-w-[150px]">Upload a png image that does not have background</p>
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 bg-green-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-900/20 active:scale-95 transition-all z-10 hover:bg-green-900"
                  >
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  
                  {/* Decorative */}
                  <div className="absolute -right-6 -bottom-10 w-32 h-32 bg-green-400/30 rounded-full blur-xl group-hover:scale-125 transition-transform" />
               </div>
            </div>

            {/* RIGHT COLUMN: BRANDING & PREVIEW */}
            <div className="space-y-6">
                
               {/* NEW: Tax Configuration Section */}
               <div className="bg-white border-2 border-blue-500/20 rounded-[30px] p-6 relative overflow-hidden shadow-sm">
                  <h3 className="text-lg font-black text-blue-800 mb-4 text-center">Tax Configuration</h3>
                  
                  <div className="flex items-center justify-between gap-4 mb-6 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div>
                          <p className="text-sm font-bold text-gray-700">Enable VAT</p>
                          <p className="text-[10px] text-gray-400 font-medium">Apply tax to customer bills</p>
                      </div>
                      
                      <button 
                        onClick={() => updateVatConfig({ ...vatConfig, enabled: !vatConfig.enabled })}
                        className={`w-14 h-8 rounded-full p-1 transition-all ${vatConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
                      >
                          <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-all ${vatConfig.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                  </div>

                  <div className={`transition-all duration-300 ${vatConfig.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                      <label className="text-xs font-black text-gray-400 uppercase ml-1 mb-1 block">VAT Percentage (%)</label>
                      <div className="flex gap-2 items-center">
                          <input 
                            type="number" 
                            value={tempVatRate}
                            onChange={(e) => setTempVatRate(e.target.value)}
                            className="flex-1 bg-[#f0f9ff] border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="13"
                          />
                          <div className="bg-blue-600 text-white font-bold px-4 py-3 rounded-xl text-sm shadow-md">
                              %
                          </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 text-center">
                          Currently applied: <span className="font-bold text-blue-600">{vatConfig.enabled ? tempVatRate : '0'}%</span> on all orders.
                      </p>
                  </div>
               </div>

               <div className="bg-[#f0fdf4] border-2 border-green-600 rounded-[30px] p-6 relative overflow-hidden">
                  <h3 className="text-lg font-black text-green-800 mb-6 text-center">Select a colour that suits your brand</h3>
                  
                  {/* Custom Color Pickers - Replaced Static Image */}
                  <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-12 mb-8">
                      <ColorPicker 
                        label="Primary Colour" 
                        color={colors.primary} 
                        onChange={(hex) => setColors(prev => ({ ...prev, primary: hex }))}
                      />
                      <ColorPicker 
                        label="Secondary Colour" 
                        color={colors.secondary} 
                        onChange={(hex) => setColors(prev => ({ ...prev, secondary: hex }))}
                      />
                  </div>

                  {/* Current Selection Indicators */}
                  <div className="flex justify-center gap-1 mb-8">
                      <div className="w-16 h-10 rounded-l-xl shadow-sm border border-black/5" style={{ backgroundColor: colors.primary }} />
                      <div className="w-16 h-10 rounded-r-xl shadow-sm border border-black/5" style={{ backgroundColor: colors.secondary }} />
                  </div>

                  {/* Presets */}
                  <div>
                      <p className="text-sm font-black text-green-800 mb-3 text-center">Or use one of these</p>
                      <div className="grid grid-cols-4 gap-3 justify-items-center">
                          {[
                              ['#008000', '#cbf0cb'], // Green
                              ['#ff0000', '#ffcccc'], // Red
                              ['#d97706', '#fef3c7'], // Orange
                              ['#2563eb', '#dbeafe'], // Blue
                              ['#db2777', '#fce7f3'], // Pink
                              ['#84cc16', '#fef9c3'], // Lime
                              ['#000000', '#e5e7eb'], // Black/Grey
                              ['#ffffff', '#000000'], // White/Black
                          ].map(([p, s], idx) => (
                              <button 
                                key={idx}
                                onClick={() => handlePresetSelect(p, s)}
                                className="flex w-14 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:scale-110 transition-transform active:scale-95"
                              >
                                  <div className="w-1/2 h-full" style={{ backgroundColor: p }} />
                                  <div className="w-1/2 h-full" style={{ backgroundColor: s }} />
                              </button>
                          ))}
                      </div>
                  </div>
               </div>

               {/* Previews */}
               <div>
                  <h3 className="text-lg font-black text-green-800 mb-4 px-1">See instant preview</h3>
                  <div className="grid grid-cols-4 gap-3">
                      {[
                          { label: 'Admin UI', icon: '⚙️' },
                          { label: 'User UI', icon: '👤' },
                          { label: 'Waiter UI', icon: '🤵' },
                          { label: 'Kitchen UI', icon: '👨‍🍳' },
                      ].map((item, idx) => (
                          <button 
                            key={idx}
                            className="bg-green-700 hover:bg-green-800 text-white rounded-xl aspect-square flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-200 active:scale-95 transition-all group"
                          >
                              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                              <span className="text-[10px] font-bold opacity-80">{item.label}</span>
                          </button>
                      ))}
                  </div>
               </div>

            </div>

         </div>
      </div>
    </div>
  );
}
