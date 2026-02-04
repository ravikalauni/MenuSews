
import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface Props {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<Props> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-6 left-0 right-0 z-[9999] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 3000;
    const interval = 10;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          handleDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
        onDismiss();
    }, 400);
  };

  const config = {
    success: { 
        icon: (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
             <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        ),
        barColor: 'bg-green-500'
    },
    error: { 
        icon: (
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
             <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
        ),
        barColor: 'bg-red-500'
    },
    warning: { 
        icon: (
          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
             <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        ),
        barColor: 'bg-orange-500'
    },
    info: { 
        icon: (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
             <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        ),
        barColor: 'bg-blue-500'
    },
  };
  
  const style = config[toast.type];

  return (
    <div 
        className={`
            pointer-events-auto relative bg-black/85 backdrop-blur-xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] overflow-hidden flex flex-row items-center
            transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) origin-top
            ${isExiting 
                ? 'opacity-0 scale-95 -translate-y-4' 
                : 'opacity-100 scale-100 translate-y-0 animate-in slide-in-from-top-4'
            }
        `}
        style={{ minWidth: '300px', maxWidth: '92vw' }}
    >
       <div className="flex items-center p-3.5 gap-3 w-full">
           {/* Icon */}
           <div className="shrink-0">
              {style.icon}
           </div>

           {/* Text Content */}
           <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h4 className="text-white text-[13px] font-bold leading-tight tracking-wide">{toast.title}</h4>
              <p className="text-gray-300 text-[11px] font-medium leading-tight mt-0.5 truncate">{toast.message}</p>
           </div>

           {/* Close Button */}
           <button 
             onClick={handleDismiss} 
             className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors active:scale-90"
           >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
       </div>
       
       {/* Progress Bar (Bottom Line) */}
       <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
           <div 
             className={`h-full ${style.barColor} transition-all duration-75 ease-linear shadow-[0_0_10px_currentColor]`} 
             style={{ width: `${progress}%` }}
           />
       </div>
    </div>
  );
};

export default ToastContainer;
