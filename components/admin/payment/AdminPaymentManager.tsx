
import React, { useState } from 'react';
import PaymentDashboard from './PaymentDashboard';
import PaymentMethodsList from './PaymentMethodsList';
import PaymentMethodFormModal, { PaymentMethodConfig } from './PaymentMethodFormModal';
import ToastContainer, { ToastMessage, ToastType } from '../../Toast';
import { OrderHistoryItem } from '../../../types';

// Mock Initial Data
const MOCK_METHODS: PaymentMethodConfig[] = [
  { 
    id: '1', name: 'eSewa', provider: 'esewa', identifier: '9800000000', isActive: true, 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp', 
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=esewa',
    stats: { revenue: 680, orders: 12 }
  },
  { 
    id: '2', name: 'Khalti', provider: 'khalti', identifier: '9800000000', isActive: true, 
    logo: 'https://seeklogo.com/images/K/khalti-logo-F0B0A72D05-seeklogo.com.png', 
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=khalti',
    stats: { revenue: 130, orders: 4 }
  },
  { 
    id: '3', name: 'FonePay', provider: 'fonepay', identifier: '9800000000', isActive: true, 
    logo: 'https://play-lh.googleusercontent.com/fJwrKphCg8P3jO5qZJ0y3Y9L6y7XJ5qK5z9w8w8w8w8w8w8w8w8w8w8w8w8w8w8w', 
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=fonepay',
    stats: { revenue: 370, orders: 8 }
  },
  { 
    id: '4', name: 'Nabil Bank', provider: 'bank', identifier: '9800000000', isActive: true, 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nabil_Bank_Limited_Logo.png', 
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nabil',
    stats: { revenue: 400, orders: 5 }
  },
  { 
    id: '5', name: 'Cash', provider: 'cash', identifier: '-', isActive: true, 
    logo: '', 
    stats: { revenue: 800, orders: 15 }
  },
  { 
    id: '6', name: 'Prabhu Bank', provider: 'bank', identifier: '9800000000', isActive: false, 
    logo: 'https://www.prabhubank.com/images/logo.png', 
    stats: { revenue: 0, orders: 0 }
  }
];

interface Props {
    onViewBill?: (order: OrderHistoryItem, isHistory?: boolean) => void;
}

export default function AdminPaymentManager({ onViewBill }: Props) {
  const [view, setView] = useState<'dashboard' | 'methods'>('dashboard');
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(MOCK_METHODS);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: ToastType, title: string, message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message }]);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  // Handlers
  const handleSaveMethod = (data: PaymentMethodConfig) => {
    if (editingMethod) {
      setMethods(prev => prev.map(m => m.id === data.id ? data : m));
      addToast('success', 'Updated', `${data.name} details updated.`);
    } else {
      setMethods(prev => [...prev, data]);
      addToast('success', 'Created', `${data.name} added to payment methods.`);
    }
    setShowModal(false);
    setEditingMethod(null);
  };

  const handleToggle = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  return (
    <div className="h-full relative overflow-hidden animate-in slide-in-from-right duration-300">
       <ToastContainer toasts={toasts} removeToast={removeToast} />
       
       {view === 'dashboard' ? (
         <PaymentDashboard 
            methods={methods} 
            onCustomizeClick={() => setView('methods')}
            onViewBill={onViewBill}
         />
       ) : (
         <PaymentMethodsList 
            methods={methods}
            onAdd={() => { setEditingMethod(null); setShowModal(true); }}
            onEdit={(m) => { setEditingMethod(m); setShowModal(true); }}
            onToggle={handleToggle}
            onBack={() => setView('dashboard')}
         />
       )}

       {showModal && (
         <PaymentMethodFormModal 
            initialData={editingMethod}
            onClose={() => setShowModal(false)}
            onSave={handleSaveMethod}
         />
       )}
    </div>
  );
}
