
import React from 'react';

interface Props {
  onBack: () => void;
}

const AboutView: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col p-6 animate-in slide-in-from-right duration-300 overflow-hidden">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 leading-none">
            Nep<span className="text-green-600">Nola</span>
            <span className="text-yellow-500 text-4xl leading-none">.</span>
          </h1>
          <p className="text-[11px] font-bold text-gray-400 tracking-[0.25em] uppercase pl-0.5">Fine Dining</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 pb-32">
        <div className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-gray-100">
          <div className="relative h-48 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
              alt="Restaurant Interior" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/100 via-white/10 to-transparent" />
            <div className="absolute bottom-4 left-6 bg-green-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-md">
              Established 2009
            </div>
          </div>

          <div className="p-8 pt-4 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Our Story</h2>
              <div className="w-10 h-1 bg-green-500 rounded-full" />
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              NepNola is committed to delivering the finest dining experience in Kathmandu. We blend traditional flavors with modern culinary techniques, sourcing everything from local organic farms.
            </p>
            
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-xl shadow-inner">📍</div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Find Us</p>
                  <p className="text-sm font-bold text-gray-800">New Baneshwor, Kathmandu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-xl shadow-inner">⏰</div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Working Hours</p>
                  <p className="text-sm font-bold text-gray-800">07:00 AM - 11:00 PM</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-xl shadow-inner">📞</div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Direct Line</p>
                  <p className="text-sm font-bold text-gray-800">+977-9800000000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
