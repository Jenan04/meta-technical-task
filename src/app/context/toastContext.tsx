'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Check, X } from 'lucide-react';

type ToastType = 'success' | 'error' | null;

interface ToastContextType {
  showToast: (msg: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const showToast = (msg: string, type: ToastType) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className={`px-8 py-3 rounded-full border shadow-sm backdrop-blur-md flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-[#576238]/10 border-[#576238]/20 text-[#576238]' 
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {toast.type === 'success' ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {toast.msg}
            </span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};