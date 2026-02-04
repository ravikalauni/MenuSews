
import React, { useState, useRef } from 'react';

interface Ingredient {
  id: string;
  name: string;
  image: string;
}

interface Props {
  ingredients: Ingredient[];
  onClose: () => void;
  onAdd: (name: string, image: string) => void;
  onEdit: (id: string, name: string, image: string) => void;
  onDelete: (id: string) => void;
}

export default function AdminIngredientManager({ ingredients, onClose, onAdd, onEdit, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    // Default placeholder if no image uploaded
    const img = image || 'https://via.placeholder.com/100?text=Ing'; 
    
    if (editingId) {
        onEdit(editingId, name, img);
        setEditingId(null);
    } else {
        onAdd(name, img);
    }
    
    // Reset Form
    setName('');
    setImage(null);
  };

  const startEdit = (ing: Ingredient) => {
      setEditingId(ing.id);
      setName(ing.name);
      setImage(ing.image);
      // Ensure form is visible on mobile
      document.querySelector('.admin-ing-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
      setEditingId(null);
      setName('');
      setImage(null);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Container: Taller and wider on PC */}
      <div className="bg-white w-full sm:max-w-lg md:max-w-4xl rounded-t-[35px] sm:rounded-[35px] shadow-2xl relative z-10 flex flex-col max-h-[85vh] md:h-[600px] animate-in slide-in-from-bottom duration-300 overflow-hidden">
         
         {/* Header */}
         <div className="bg-orange-500 p-6 pb-8 text-white text-center relative shrink-0 md:text-left md:flex md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-black relative z-10">Manage Ingredients</h2>
                <p className="text-orange-100 text-xs font-bold relative z-10">Add, Edit or Remove customization options</p>
            </div>
            <button 
                onClick={onClose} 
                className="absolute top-5 right-5 md:static md:bg-white/20 md:hover:bg-white/30 text-white/70 hover:text-white md:text-white rounded-full p-1 md:p-2 transition-all z-20"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>

         {/* Body: Split Layout on PC */}
         <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50">
            
            {/* Left: Form Section (Sticky on PC, Compact Row on Mobile) */}
            <div className="p-4 md:p-6 md:w-1/3 md:border-r md:border-gray-200 md:bg-white shrink-0 admin-ing-form">
                <div className="bg-white md:bg-gray-50 p-3 md:p-4 rounded-2xl shadow-sm border border-orange-100 md:border-gray-100 h-full flex flex-col justify-center md:justify-start">
                    
                    {/* Header Title - Hidden on Mobile */}
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4 hidden md:block">
                        {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
                    </h3>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-stretch gap-3 md:gap-4">
                        {/* Image Uploader */}
                        <div className="shrink-0 md:self-center">
                            <div 
                                onClick={handleImageClick}
                                className="w-12 h-12 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-orange-50 hover:border-orange-300 overflow-hidden relative group transition-colors"
                            >
                                {image ? (
                                    <img src={image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-400 flex flex-col items-center justify-center">
                                        <span className="text-lg md:text-2xl leading-none">📷</span>
                                        <span className="text-[9px] font-bold uppercase hidden md:block mt-1">Upload</span>
                                    </div>
                                )}
                                {/* Overlay hint */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {/* Name Input */}
                        <div className="flex-1 md:space-y-1 min-w-0">
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 hidden md:block">Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ingredient Name..." 
                                className="w-full bg-gray-50 md:bg-white border border-gray-200 rounded-xl px-3 py-2.5 md:px-4 md:py-3 text-sm font-bold text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-400"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-0 md:mt-2 shrink-0">
                            {editingId && (
                                <button 
                                    onClick={cancelEdit}
                                    className="w-10 h-10 md:w-auto md:h-auto md:flex-1 md:py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 text-xs transition-colors flex items-center justify-center"
                                    title="Cancel"
                                >
                                    <span className="md:hidden text-lg">✕</span>
                                    <span className="hidden md:inline">Cancel</span>
                                </button>
                            )}
                            <button 
                                onClick={handleSubmit}
                                disabled={!name.trim()}
                                className="w-12 h-10 md:w-auto md:h-auto md:flex-1 bg-orange-500 text-white md:py-3 rounded-xl font-black shadow-md shadow-orange-200 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all text-xs uppercase tracking-wide hover:bg-orange-600 flex items-center justify-center"
                            >
                                <span className="md:hidden text-lg">{editingId ? '✓' : '+'}</span>
                                <span className="hidden md:inline">{editingId ? 'Update' : 'Add'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: List Section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 md:p-6 pb-0 bg-gray-50 md:bg-gray-50 z-10">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search existing..." 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400 shadow-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3 md:content-start">
                    {filteredIngredients.map(ing => (
                        <div 
                            key={ing.id} 
                            className={`flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm transition-all group hover:shadow-md
                                ${editingId === ing.id ? 'border-orange-400 ring-2 ring-orange-100 bg-orange-50' : 'border-gray-100'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <img src={ing.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
                                <span className="font-bold text-sm text-gray-700 truncate">{ing.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 shrink-0">
                                <button 
                                    onClick={() => startEdit(ing)}
                                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-colors active:scale-95"
                                    title="Edit"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button 
                                    onClick={() => onDelete(ing.id)}
                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors active:scale-95"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {filteredIngredients.length === 0 && (
                        <div className="col-span-full py-8 text-center">
                            <p className="text-sm font-bold text-gray-400">No ingredients match your search.</p>
                        </div>
                    )}
                </div>
            </div>

         </div>
      </div>
    </div>
  );
}
