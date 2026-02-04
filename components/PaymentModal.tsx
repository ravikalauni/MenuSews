
import React, { useState, useEffect } from 'react';
import { PaymentMethod, User } from '../types';

interface Props {
  total: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, userName?: string, userMobile?: string, ratings?: any) => void;
  currentUser: User | null;
  onChangeDetails: () => void;
}

type Stage = 'select_method' | 'details' | 'confirm_upload';

const PaymentModal: React.FC<Props> = ({ total, onClose, onConfirm, currentUser, onChangeDetails }) => {
  const [stage, setStage] = useState<Stage>('select_method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.ESEWA);
  
  // User Input State - Initialize with empty strings
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Ratings State
  const [ratingFood, setRatingFood] = useState(0);
  const [ratingAmbience, setRatingAmbience] = useState(0);
  const [ratingWaiter, setRatingWaiter] = useState(0);

  // Sync state with currentUser prop whenever it changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setMobile(currentUser.mobile);
    }
  }, [currentUser]);

  // Logic to calculate estimated points lost
  const estimatedPoints = Math.round(total * 0.10);

  // Check if inputs are valid for points collection
  const hasValidDetails = name.trim().length > 0 && mobile.trim().length >= 10;
  
  // Is this a digital payment?
  const isDigital = selectedMethod !== PaymentMethod.CASH;
  
  // Is the order free (covered by points)?
  const isFree = total === 0;

  const handleInitialPayClick = () => {
    // Stage 1: Check details
    if (hasValidDetails) {
      if (!isFree && isDigital) {
        setStage('confirm_upload'); // Go to screenshot upload ONLY if not free
      } else {
        // Cash or Free + Details = Done
        // If free, we can pass CASH or any method, since amount is 0.
        onConfirm(isFree ? PaymentMethod.CASH : selectedMethod, name.trim(), mobile.trim(), { ratingFood, ratingAmbience, ratingWaiter });
      }
    } else {
      // Missing details -> Trigger "Lost Points" Warning
      // Note: If order is free (0 total), points earned is likely 0 anyway, but we still want details for record.
      const proceed = window.confirm(
        `⚠️ WAIT! You are missing details.\n\n` + 
        `You will LOSE ${estimatedPoints} Loyalty Points for this order.\n\n` +
        `Do you want to add your details to collect points?`
      );
      
      if (proceed) {
        // User wants to add details, stay here and focus
        const nameInput = document.getElementById('input-name');
        if (nameInput) nameInput.focus();
      } else {
        // User doesn't care about points
        if (!isFree && isDigital) {
            setStage('confirm_upload');
        } else {
            onConfirm(isFree ? PaymentMethod.CASH : selectedMethod, undefined, undefined, { ratingFood, ratingAmbience, ratingWaiter });
        }
      }
    }
  };

  const handleFinalConfirm = (hasScreenshot: boolean) => {
    if (isDigital && !hasScreenshot) {
       // Manual confirm by waiter logic (ignore upload)
    }
    onConfirm(selectedMethod, hasValidDetails ? name.trim() : undefined, hasValidDetails ? mobile.trim() : undefined, { ratingFood, ratingAmbience, ratingWaiter });
  };

  // Render Star Rating Component - Redesigned
  const StarRating = ({ value, onChange, label, disabled }: any) => (
    <div className={`
      flex items-center justify-between p-3 rounded-xl border transition-all
      ${disabled ? 'opacity-50 grayscale border-gray-100 bg-gray-50' : 'bg-white border-gray-100 hover:border-green-200 shadow-sm'}
    `}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${disabled ? 'bg-gray-200' : 'bg-green-50'}`}>
          {label === 'Food' && '🍔'}
          {label === 'Place' && '🏠'}
          {label === 'Service' && '👨‍🍳'}
        </div>
        <span className="text-xs font-black text-gray-700 uppercase tracking-wide">{label}</span>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={disabled}
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform active:scale-110 p-1"
          >
            <svg 
              className={`w-5 h-5 ${star <= value ? 'text-yellow-400 fill-current drop-shadow-sm' : 'text-gray-200'}`} 
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={star <= value ? 0 : 2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-xl font-black text-gray-800">{isFree ? 'Order Confirmation' : 'Checkout'}</h3>
            <p className="text-xs font-bold text-green-600">Total: Rs. {total}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
          
          {stage === 'select_method' && (
            <>
              {/* 1. Payment Methods - Hide if Free */}
              {!isFree && (
                <div>
                  <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest pl-1">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSelectedMethod(PaymentMethod.ESEWA)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${selectedMethod === PaymentMethod.ESEWA ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white font-black text-xl shadow-sm">e</div>
                      <span className="font-bold text-sm text-gray-700">eSewa</span>
                    </button>
                    <button 
                      onClick={() => setSelectedMethod(PaymentMethod.KHALTI)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${selectedMethod === PaymentMethod.KHALTI ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xl shadow-sm">K</div>
                      <span className="font-bold text-sm text-gray-700">Khalti</span>
                    </button>
                    <button 
                      onClick={() => setSelectedMethod(PaymentMethod.CONNECT_IPS)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${selectedMethod === PaymentMethod.CONNECT_IPS ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-sm">+</div>
                      <span className="font-bold text-sm text-gray-700">IPS</span>
                    </button>
                    <button 
                      onClick={() => setSelectedMethod(PaymentMethod.CASH)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 ${selectedMethod === PaymentMethod.CASH ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xl shadow-sm">💵</div>
                      <span className="font-bold text-sm text-gray-700">Cash</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. QR Code Display (Digital Only & Not Free) */}
              {!isFree && isDigital && (
                <div className="bg-gray-900 rounded-2xl p-6 text-center text-white relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500" />
                  <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Scan to Pay</p>
                  
                  {/* Mock QR */}
                  <div className="w-40 h-40 bg-white mx-auto rounded-xl p-2 mb-4">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nepnola-payment-${total}`} 
                       alt="Payment QR" 
                       className="w-full h-full object-contain"
                     />
                  </div>
                  
                  <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Save QR to Device
                  </button>
                </div>
              )}

              {/* 3. Customer Info */}
              <div className="bg-green-50/30 rounded-3xl p-5 border border-green-100">
                 <div className="flex items-center justify-between mb-4">
                   <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Your Details</h4>
                   {!hasValidDetails && <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full animate-pulse">Earn {estimatedPoints} pts</span>}
                 </div>
                 
                 {currentUser ? (
                   // Read-Only View for Logged In User
                   <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-green-100">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black">
                           {name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-black text-gray-800 text-sm leading-none">{name}</p>
                           <p className="text-xs font-bold text-gray-400 mt-1">{mobile}</p>
                         </div>
                      </div>
                      <button 
                        onClick={onChangeDetails}
                        className="text-xs font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 active:scale-95 transition-all"
                      >
                        Change
                      </button>
                   </div>
                 ) : (
                   // Input View for Guest
                   <div className="space-y-3">
                     <input 
                        id="input-name"
                        type="text" 
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                     />
                     <input 
                        type="tel" 
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all placeholder:text-gray-300"
                     />
                   </div>
                 )}
              </div>

              {/* 4. Ratings (Beautifully Bordered) */}
              <div className={`transition-all duration-300 ${!hasValidDetails ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                 <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest pl-1">Rate Experience</h4>
                 <div className="space-y-3">
                    <StarRating label="Food" value={ratingFood} onChange={setRatingFood} disabled={!hasValidDetails} />
                    <StarRating label="Place" value={ratingAmbience} onChange={setRatingAmbience} disabled={!hasValidDetails} />
                    <StarRating label="Service" value={ratingWaiter} onChange={setRatingWaiter} disabled={!hasValidDetails} />
                 </div>
                 {!hasValidDetails && <p className="text-[10px] text-red-400 mt-3 font-bold text-center bg-red-50 py-1 rounded-lg">Add details above to unlock ratings</p>}
              </div>
            </>
          )}

          {stage === 'confirm_upload' && (
            <div className="text-center py-4 space-y-6">
               <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce shadow-inner">
                 📸
               </div>
               <div>
                 <h3 className="text-xl font-black text-gray-800">Payment Proof</h3>
                 <p className="text-sm text-gray-500 mt-2 font-medium px-8">Please upload a screenshot of your successful transaction.</p>
               </div>

               <div className="border-2 border-dashed border-gray-300 rounded-3xl p-10 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                     <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <p className="text-sm font-bold text-gray-400 group-hover:text-green-600 transition-colors">Tap to upload screenshot</p>
               </div>

               <div className="space-y-3 pt-2">
                 <button 
                   onClick={() => handleFinalConfirm(true)}
                   className="w-full py-4 bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-200 active:scale-95 transition-transform text-sm"
                 >
                   Upload & Confirm
                 </button>
                 <button 
                   onClick={() => handleFinalConfirm(false)}
                   className="w-full py-3 text-gray-400 text-xs font-bold hover:text-gray-600"
                 >
                   I can't upload, verify manually
                 </button>
               </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        {stage === 'select_method' && (
          <div className="p-6 bg-white border-t border-gray-100">
            <button 
              onClick={handleInitialPayClick}
              className="w-full py-4 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-green-700"
            >
              {isFree ? 'Done' : (isDigital ? 'Payment Done / Verify' : 'Confirm Cash Order')}
              {!isFree && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
