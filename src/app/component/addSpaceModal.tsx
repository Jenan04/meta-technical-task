'use client';
import { X, Plus, Image as ImageIcon, Link, FileText } from 'lucide-react';

interface AddSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSpaceModal: React.FC<AddSpaceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const options = [
    { 
      title: 'New Space', 
      desc: 'Create a private or public collection', 
      icon: <Plus size={22} />, 
      color: 'bg-[#576238] text-white' 
    },
    { 
      title: 'Upload Content', 
      desc: 'Images, videos or documents', 
      icon: <ImageIcon size={22} />, 
      color: 'bg-[#EBE5DD] text-[#162B1E]' 
    },
    { 
      title: 'Quick Note', 
      desc: 'Write down your thoughts', 
      icon: <FileText size={22} />, 
      color: 'bg-[#F7F4F0] text-[#162B1E] border border-[#162B1E]/10' 
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-[#162B1E]/30 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">      
        <div className="flex justify-between items-start p-8 pb-0">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif italic text-[#162B1E]">Add to Space</h2>
            <p className="text-[#162B1E]/40 text-xs uppercase tracking-[0.2em] font-bold">Choose an action</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#162B1E]/50 hover:text-[#162B1E]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-3">
          {options.map((opt, idx) => (
            <button
              key={idx}
              className="w-full group flex items-center gap-5 p-5 rounded-[24px] hover:bg-[#FDFCFB] border border-transparent hover:border-[#162B1E]/10 transition-all duration-300 text-left active:scale-[0.98]"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm transition-transform duration-500 group-hover:rotate-6 ${opt.color}`}>
                {opt.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#162B1E] text-sm uppercase tracking-tight">{opt.title}</h3>
                <p className="text-[#162B1E]/50 text-xs mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-[#F7F4F0]/50 p-6 text-center">
          <p className="text-[10px] text-[#162B1E]/30 uppercase tracking-[0.1em]">
            Share Space &copy; 2026 • Privacy First
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddSpaceModal;