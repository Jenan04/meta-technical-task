'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Type, Loader2, X, UploadCloud } from 'lucide-react';
import Header from '../component/header';
import Link from 'next/link';
import { useToast } from '../context/toastContext';

export default function AddContentComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spaceId = searchParams.get('spaceId');
  const { showToast } = useToast();

  const [contentType, setContentType] = useState<'IMAGE' | 'NOTE'>('IMAGE');
  const [content, setContent] = useState(''); // سيعمل كـ URL للصورة أو نص للنوت
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !spaceId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation AddContent($spaceId: ID!, $type: ContentType!, $url: String, $text: String) {
              addContent(spaceId: $spaceId, type: $type, url: $url, text: $text) {
                id
              }
            }
          `,
          variables: {
            spaceId,
            type: contentType,
            url: contentType === 'IMAGE' ? content : null,
            text: contentType === 'NOTE' ? content : null,
          },
        }),
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      showToast("Content added successfully!", "success");
      router.back(); // العودة لصفحة السبيس
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add content";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[#162B1E]/40 hover:text-[#162B1E] mb-12 uppercase text-[10px] font-bold tracking-widest transition-all"
        >
          <ArrowLeft size={14} /> Discard & Go Back
        </button>

        <h1 className="text-5xl font-serif italic text-[#162B1E] mb-12">Add to Space</h1>

        {/* التبديل بين نوع المحتوى */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => { setContentType('IMAGE'); setContent(''); }}
            className={`flex-1 p-6 rounded-[30px] border transition-all flex flex-col items-center gap-3 ${
              contentType === 'IMAGE' ? 'bg-[#162B1E] text-white border-[#162B1E]' : 'bg-white text-[#162B1E]/40 border-[#162B1E]/10 hover:border-[#162B1E]/30'
            }`}
          >
            <ImageIcon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Image URL</span>
          </button>
          
          <button
            onClick={() => { setContentType('NOTE'); setContent(''); }}
            className={`flex-1 p-6 rounded-[30px] border transition-all flex flex-col items-center gap-3 ${
              contentType === 'NOTE' ? 'bg-[#162B1E] text-white border-[#162B1E]' : 'bg-white text-[#162B1E]/40 border-[#162B1E]/10 hover:border-[#162B1E]/30'
            }`}
          >
            <Type size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Text Note</span>
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            {contentType === 'IMAGE' ? (
              <div className="space-y-4">
                <input
                  type="url"
                  placeholder="Paste image URL here..."
                  className="w-full bg-white border border-[#162B1E]/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#576238] transition-all font-serif italic text-lg"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                {content && (
                  <div className="mt-4 rounded-3xl overflow-hidden border border-[#162B1E]/5 shadow-sm max-h-60">
                    <img src={content} alt="Preview" className="w-full h-full object-cover" onError={() => showToast("Invalid image URL", "error")} />
                  </div>
                )}
              </div>
            ) : (
              <textarea
                placeholder="Write your note here..."
                rows={6}
                className="w-full bg-white border border-[#162B1E]/10 rounded-3xl px-8 py-8 focus:outline-none focus:border-[#576238] transition-all font-serif italic text-2xl resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-5 bg-[#576238] text-white rounded-full font-bold uppercase tracking-[0.3em] text-[11px] hover:bg-[#46502d] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
            Add to My Space
          </button>
        </form>
      </main>
    </div>
  );
}