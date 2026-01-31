'use client';

import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface DeleteContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  itemType: string;
}

export default function DeleteContentModal({ isOpen, onClose, onConfirm, loading, itemType }: DeleteContentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#162B1E]/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
            <AlertTriangle size={32} />
          </div>
          
          <h3 className="text-2xl font-serif italic text-[#162B1E] mb-2">Remove this item?</h3>
          <p className="text-sm text-[#162B1E]/60 leading-relaxed mb-8">
            Are you sure you want to delete this {itemType.toLowerCase()}? This action cannot be undone.
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              Confirm Delete
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-4 bg-[#EBE5DD]/30 hover:bg-[#EBE5DD]/50 text-[#162B1E] rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}