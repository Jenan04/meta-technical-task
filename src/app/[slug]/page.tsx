'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, X, Settings2, Trash2, Plus, Globe, Lock, Loader2, Check, AlertTriangle } from 'lucide-react';
import Header from '../component/header';
import Link from 'next/link';
import { ContentItem, SpaceData } from '@/types';

export default function SpaceViewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditingSpace, setIsEditingSpace] = useState(false);
  const [isDeletingSpace, setIsDeletingSpace] = useState(false); // التحكم في المودال
  const [newName, setNewName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // حالة التحميل أثناء الحذف
  
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchSpace = async () => {
    if (!params.slug) return;
    try {
      const response = await fetch(`/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetSpaceBySlug($slug: String!) {
              getSpaceBySlug(slug: $slug) {
                id, name, type, slug
                contents { id, type, url, text, createdAt }
              }
            }
          `,
          variables: { slug: params.slug },
        }),
      });
      const result = await response.json();
      if (result.data?.getSpaceBySlug) {
        setSpace(result.data.getSpaceBySlug);
        setNewName(result.data.getSpaceBySlug.name);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSpace(); }, [params.slug]);

  const handleUpdateSpace = async (updatedFields: { name?: string, type?: 'PRIVATE' | 'PUBLIC' }) => {
    if (!space) return;
    setUpdating(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateSpace($id: ID!, $name: String, $type: Type) {
              updateSpace(id: $id, name: $name, type: $type) { id name type slug }
            }
          `,
          variables: { 
            id: space.id, 
            name: updatedFields.name || space.name, 
            type: updatedFields.type || space.type 
          }
        })
      });
      
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      const updatedData = result.data?.updateSpace;
      if (updatedData) {
        setToast({ msg: "Space updated successfully!", type: 'success' });
        if (updatedFields.name && updatedData.slug !== params.slug) {
          router.push(`/${updatedData.slug}`);
        } else {
          setSpace(prev => prev ? { ...prev, ...updatedData } : null);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Update failed";
      setToast({ msg: errorMessage, type: 'error' });
    } finally {
      setUpdating(false);
      setIsEditingSpace(false);
    }
  };


const handleDeleteSpace = async () => {
  if (!space) return;
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
        `, // لاحظ طلبنا القيمة مباشرة بدون { id } لأنها Boolean
        variables: { id: space.id }
      })
    });
    
    const result = await response.json();
    
    if (result.errors) throw new Error(result.errors[0].message);

    if (result.data?.deleteSpace) {
      setToast({ msg: "Space deleted successfully", type: 'success' });
      router.push('/profile');
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Failed to delete";
    setToast({ msg: errorMessage || "Failed to delete", type: 'error' });
  } finally {
    setIsDeleting(false);
    setIsDeletingSpace(false);
  }
};

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("Remove this item?")) return;
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation DeleteContent($id: ID!) { deleteContent(id: $id) }`,
          variables: { id: contentId }
        })
      });
      const result = await response.json();
      if (result.data?.deleteContent) {
        setSpace(prev => prev ? { ...prev, contents: prev.contents.filter(c => c.id !== contentId) } : null);
        setSelectedItem(null);
        setToast({ msg: "Item removed", type: 'success' });
      }
    } catch (err) { setToast({ msg: "Failed to delete", type: 'error' }); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-[#162B1E]/40 animate-pulse">Loading Space...</div>;
  if (!space) return <div className="min-h-screen flex items-center justify-center font-serif italic">Space not found.</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] relative">
      <Header />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 right-6 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
          toast.type === 'success' ? 'bg-[#576238] text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span className="text-xs font-bold uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="flex-1 w-full">
            <Link href="/profile" className="flex items-center gap-2 text-[#162B1E]/40 hover:text-[#162B1E] mb-4 uppercase text-[10px] font-bold tracking-widest transition-colors">
              <ArrowLeft size={14} /> Back
            </Link>
            
            {isEditingSpace ? (
              <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left duration-300">
                <input 
                  autoFocus
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateSpace({ name: newName });
                    if (e.key === 'Escape') setIsEditingSpace(false);
                  }}
                  className="text-4xl md:text-6xl font-serif italic bg-transparent border-b-2 border-[#162B1E] focus:outline-none text-[#162B1E] w-full max-w-xl pb-2"
                />
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleUpdateSpace({ name: newName })}
                    disabled={updating}
                    className="px-6 py-2 bg-[#162B1E] text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
                  >
                    {updating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    Save Name
                  </button>
                  <button 
                    onClick={() => { setIsEditingSpace(false); setNewName(space.name); }}
                    className="px-6 py-2 bg-transparent border border-[#162B1E]/10 text-[#162B1E]/40 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h1 className="text-5xl md:text-7xl font-serif italic text-[#162B1E] group flex items-center gap-4">
                {space.name}
                <button onClick={() => setIsEditingSpace(true)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-[#162B1E]/5 rounded-full transition-all">
                  <Settings2 size={24} className="text-[#162B1E]/20" />
                </button>
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleUpdateSpace({ type: space.type === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#162B1E]/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:shadow-md transition-all active:scale-95"
            >
              {space.type === 'PUBLIC' ? <Globe size={14} className="text-blue-500"/> : <Lock size={14} className="text-amber-600"/>} 
              <span>{space.type}</span>
            </button>
            
            <button 
              onClick={() => setIsEditingSpace(!isEditingSpace)} 
              className={`p-3 border rounded-full transition-all ${isEditingSpace ? 'bg-[#162B1E] text-white' : 'bg-white border-[#162B1E]/10 hover:rotate-90'}`}
            >
              <Settings2 size={18} />
            </button>
            
            <button 
              onClick={() => setIsDeletingSpace(true)}
              className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-full hover:bg-red-600 hover:text-white transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <button onClick={() => router.push(`/addContent?spaceId=${space.id}`)} className="aspect-square border-2 border-dashed border-[#162B1E]/10 rounded-[35px] flex flex-col items-center justify-center gap-3 text-[#162B1E]/30 hover:border-[#576238] hover:text-[#576238] transition-all group">
            <Plus size={32} className="group-hover:rotate-90 transition-all duration-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add Item</span>
          </button>
          {space.contents.map((item) => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className="group relative aspect-square bg-white border border-[#162B1E]/5 rounded-[35px] p-2 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden">
               <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#F4F1EE] flex items-center justify-center">
                {item.type === 'IMAGE' ? <img src={item.url} className="w-full h-full object-cover" alt=""/> : <FileText size={30} className="text-[#162B1E]/20" />}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Custom Delete Confirmation Modal */}
      {isDeletingSpace && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-[#162B1E]/40 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => !isDeleting && setIsDeletingSpace(false)} 
          />
          <div className="relative bg-white w-full max-w-md rounded-[40px] p-10 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="text-2xl font-serif italic text-[#162B1E] mb-2">Delete Space?</h3>
            <p className="text-[#162B1E]/60 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete <span className="font-bold">&quote;{space.name}&quote;</span>? 
              This will permanently remove the space and all its contents.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                disabled={isDeleting}
                onClick={handleDeleteSpace}
                className="w-full py-4 bg-red-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : "Yes, Delete Everything"}
              </button>
              
              <button 
                disabled={isDeleting}
                onClick={() => setIsDeletingSpace(false)}
                className="w-full py-4 bg-transparent text-[#162B1E]/40 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-[#162B1E] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal (كما هو) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#162B1E]/90 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-[#FDFCFB] w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#162B1E]/5 flex justify-between items-center">
              <button 
                onClick={() => handleDeleteContent(selectedItem.id)}
                className="flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-full transition-all"
              >
                <Trash2 size={14} /> Remove Item
              </button>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-12 flex items-center justify-center bg-[#EBE5DD]/20 min-h-[400px]">
              {selectedItem.type === 'IMAGE' ? <img src={selectedItem.url} className="max-h-[60vh] rounded-lg" alt=""/> : <p className="text-3xl font-serif italic text-center text-[#162B1E]">&quot;{selectedItem.text}&quot;</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}