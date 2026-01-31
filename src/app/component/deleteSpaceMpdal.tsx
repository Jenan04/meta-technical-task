'use client';
import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteSpaceModalProps {
  spaceId: string;
  spaceName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; 
  redirectAfterDelete?: string; 
}

export default function DeleteSpaceModal({ 
  spaceId, 
  spaceName, 
  isOpen, 
  onClose, 
  onSuccess,
  redirectAfterDelete 
}: DeleteSpaceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation DeleteSpace($id: ID!) {
              deleteSpace(id: $id)
            }
          `,
          variables: { id: spaceId }
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      if (result.data?.deleteSpace) {
        if (onSuccess) onSuccess();
        if (redirectAfterDelete) {
          router.push(redirectAfterDelete);
        }
        onClose();
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete space");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-[#162B1E]/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => !isDeleting && onClose()} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        
        <h3 className="text-2xl font-serif italic text-[#162B1E] mb-2">Delete Space?</h3>
        <p className="text-[#162B1E]/60 text-sm mb-8 leading-relaxed">
          Are you sure you want to delete <span className="font-bold">&quote;{spaceName}&quote;</span>? 
          This action is permanent and cannot be undone.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            disabled={isDeleting}
            onClick={handleDelete}
            className="w-full py-4 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
          >
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : "Yes, Delete Everything"}
          </button>
          
          <button 
            disabled={isDeleting}
            onClick={onClose}
            className="w-full py-4 bg-transparent text-[#162B1E]/40 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-[#162B1E] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}