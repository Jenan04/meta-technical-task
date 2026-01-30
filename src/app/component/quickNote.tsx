'use client';

import { X, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ContentItem } from "@/types"

interface QuickNoteModalProps {
  spaceId: string | null;
  onClose: () => void;
  onNoteAdded: (content: ContentItem) => void; 
}

export default function QuickNoteModal({ spaceId, onClose, onNoteAdded }: QuickNoteModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveNote = async () => {
    if (!note.trim() || !spaceId) return toast.error('Note is empty or Space not found');

    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation AddContent(
              $userId: ID!
              $spaceId: ID!
              $type: ContentType!
              $text: String
              $visibility: Type!
            ) {
              addContent(
                userId: $userId
                spaceId: $spaceId
                type: $type
                text: $text
                visibility: $visibility
              ) {
                id
                type
              }
            }
          `,
          variables: {
            userId,
            spaceId,
            type: 'NOTE',
            text: note,
            visibility: 'PRIVATE',
          },
        }),
      });

      const result = await response.json();
      const newNoteId = result.data?.addContent?.id;

      if (newNoteId) {
        toast.success('Note added successfully!');
        onNoteAdded(newNoteId); 
        onClose(); 
      } else {
        throw new Error('Failed to save note');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#162B1E]/30 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="flex justify-between items-start p-8 pb-0">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif italic text-[#162B1E]">Quick Note</h2>
            <p className="text-[#162B1E]/40 text-xs uppercase tracking-[0.2em] font-bold">
              Write down your thoughts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#162B1E]/50 hover:text-[#162B1E]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write your note here..."
            className="w-full h-40 border border-[#162B1E]/20 rounded-2xl p-4 resize-none focus:outline-none focus:border-[#576238] transition"
          />
        </div>

        <div className="flex justify-end px-8 pb-8">
          <button
            onClick={handleSaveNote}
            disabled={loading || !note.trim()}
            className="px-6 py-2 bg-[#576238] text-white font-bold rounded-full flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition-all active:scale-95"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
