'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FileText, ArrowLeft, X, Settings2, Trash2, Plus, Globe, Lock, Loader2, Check, AlertTriangle } from 'lucide-react';
import Header from '../component/header';
import Link from 'next/link';
import { ContentItem, SpaceData } from '../../types';
import DeleteSpaceModal from '../component/deleteSpaceMpdal';

export default function SpaceViewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  
  const [space, setSpace] = useState<SpaceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditingSpace, setIsEditingSpace] = useState(false);
  const [isDeletingSpace, setIsDeletingSpace] = useState(false); 
  const [newName, setNewName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); 
  
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
    } catch (err) { console.error("Fetch Error:", err); }
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
      setToast({ msg: "Update failed", type: 'error' });
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
          `,
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
      setToast({ msg: "Failed to delete", type: 'error' });
    } finally {
      setIsDeleting(false);
      setIsDeletingSpace(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
        setSelectedItem(null);

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
      if (response.ok && !result.errors) {
        setSpace((prev) => {
          if (!prev) return null;
          
          const filteredContents = prev.contents.filter(
            (item) => String(item.id) !== String(contentId)
          );
          return {
            ...prev,
            contents: [...filteredContents]
          };
        });

        setToast({ msg: "Item removed", type: 'success' });
      } else {
        throw new Error(result.errors?.[0]?.message || "Deletion failed");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      fetchSpace();
      setToast({ msg: "Error deleting item", type: 'error' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-serif italic text-[#162B1E]/40 animate-pulse">Loading Space...</div>;
  if (!space) return <div className="min-h-screen flex items-center justify-center font-serif italic">Space not found.</div>;

  return (
    <div className="min-h-screen bg-[#FDFCFB] relative">
      <Header />

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
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)} 
              className="group relative aspect-square bg-white border border-[#162B1E]/5 rounded-[35px] p-2 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
            >
              <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#F4F1EE] flex items-center justify-center">
                {item.type === 'IMAGE' ? <img src={item.url} className="w-full h-full object-cover" alt=""/> : <FileText size={30} className="text-[#162B1E]/20" />}
              </div>
            </div>
          ))}
        </div>
      </main>

      <DeleteSpaceModal 
        isOpen={isDeletingSpace} 
        spaceId={space.id} 
        spaceName={space.name} 
        onClose={() => setIsDeletingSpace(false)} 
        redirectAfterDelete="/profile"
      />

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#162B1E]/90 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
          <div className="relative bg-[#FDFCFB] w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
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
              {selectedItem.type === 'IMAGE' ? (
                <img src={selectedItem.url} className="max-h-[60vh] rounded-lg shadow-lg" alt=""/>
              ) : (
                <div className="max-w-2xl">
                    <p className="text-3xl md:text-4xl font-serif italic text-center text-[#162B1E] leading-relaxed">
                        &quot;{selectedItem.text}&quot;
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}