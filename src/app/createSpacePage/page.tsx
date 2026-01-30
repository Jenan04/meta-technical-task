
'use client';

import { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, FileText, Lock, Globe, Loader2, CheckCircle, X, Folder, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import { ContentItem, TempContentItem, CreateSpaceResponse, AddContentResponse, SpaceData } from "@/types";
import Header from '../component/header';
import QuickNoteModal from '../component/quickNote';
import DeleteContentModal from '../component/deleteContentModal'; // تأكدي من مسار المكون

export default function CreateSpacePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [loading, setLoading] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [tempContents, setTempContents] = useState<TempContentItem[]>([]);

  const [isDeletingContent, setIsDeletingContent] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<{id: string, isTemp: boolean, index?: number} | null>(null);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkSpaceCreated = () => {
    if (!spaceId) {
      toast.error("Create the Space first! Click 'CREATE EVERYTHING' to start.", {
        style: { borderRadius: '20px', background: '#162B1E', color: '#EBE5DD', fontSize: '11px' },
      });
      return false;
    }
    return true;
  };

  const handleDeleteTrigger = (id: string, isTemp: boolean, index?: number) => {
    if (isTemp) {
      setTempContents(prev => prev.filter((_, i) => i !== index));
    } else {
      setContentToDelete({ id, isTemp, index });
      setIsDeletingContent(true);
    }
  };

  const confirmDeleteContent = async () => {
    if (!contentToDelete || contentToDelete.isTemp) return;
    setIsDeletingLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation DeleteContent($id: ID!) { deleteContent(id: $id) }`,
          variables: { id: contentToDelete.id }
        })
      });
      
      const result = await response.json();
      if (response.ok && !result.errors) {
        // setContents(prev => prev.filter(c => c.id !== contentToDelete.id));
        setContents(prev => [...prev.filter(c => String(c.id) !== String(contentToDelete.id))]);
        toast.success("Item removed");
      }
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeletingLoading(false);
      setIsDeletingContent(false);
      setContentToDelete(null);
    }
  };

  const uploadAndSaveContent = async (item: TempContentItem, currentSpaceId: string) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    let url = item.url || '';
    let size = 0;

    if (item.file) {
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('userId', userId!);
      formData.append('spaceId', currentSpaceId);

      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`, { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      url = uploadData.url;
      size = uploadData.size;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: `
          mutation AddContent($userId: ID!, $spaceId: ID!, $type: ContentType!, $url: String, $text: String, $size: Int, $visibility: Type!) {
            addContent(userId: $userId, spaceId: $spaceId, type: $type, url: $url, text: $text, size: $size, visibility: $visibility) { id type url text createdAt }
          }
        `,
        variables: { userId, spaceId: currentSpaceId, type: item.type, url, text: item.text, size, visibility },
      }),
    });
    const json = await res.json();
    return json.data?.addContent;
  };

  const handleCreateEverything = async () => {
    if (name.trim().length < 2) return toast.error("Please enter a valid name");
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      const spaceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation CreateSpace($userId: ID!, $name: String!, $type: Type!) { createSpace(userId: $userId, name: $name, type: $type) { id } }`,
          variables: { userId, name, type: visibility },
        }),
      });
      const spaceJson = await spaceRes.json();
      const newSpaceId = spaceJson.data?.createSpace?.id;

      if (newSpaceId) {
        const uploadedContents: ContentItem[] = [];
        for (const item of tempContents) {
          const newContent = await uploadAndSaveContent(item, newSpaceId);
          if (newContent) uploadedContents.push(newContent);
        }
        setContents(uploadedContents);
        setSpaceId(newSpaceId);
        setTempContents([]);
        toast.success("Space Created Successfully!");
      }
    } catch (err) { toast.error("Creation failed"); }
    finally { setLoading(false); }
  };

  const handleUpdateSpaceName = async () => {
    if (name.trim().length < 2) return toast.error("Name too short");
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation UpdateSpace($id: ID!, $name: String!) { updateSpace(id: $id, name: $name) { id name } }`,
          variables: { id: spaceId, name },
        }),
      });
      toast.success("Name updated");
      setIsEditingName(false);
    } catch (e) { toast.error("Update failed"); }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        <section className={`bg-white p-8 rounded-[40px] border transition-all duration-300 ${spaceId ? 'border-[#576238]/20 shadow-lg' : 'border-[#162B1E]/5 shadow-sm'}`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`p-5 rounded-2xl transition-all ${spaceId ? 'bg-[#576238] text-white' : 'bg-[#EBE5DD] text-[#162B1E]/20'}`}>
              <Folder size={40} />
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!spaceId && !isEditingName}
                  placeholder="Name your space..."
                  className={`w-full bg-transparent text-3xl font-serif italic py-1 focus:outline-none ${isEditingName ? 'border-b border-[#576238]' : 'border-transparent'}`}
                />
                {spaceId && !isEditingName && (
                  <button onClick={() => setIsEditingName(true)} className="p-2 text-[#162B1E]/30 hover:text-[#162B1E]"><Edit3 size={18}/></button>
                )}
                {isEditingName && (
                  <button onClick={handleUpdateSpaceName} className="p-2 text-green-600"><CheckCircle size={20}/></button>
                )}
              </div>
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#162B1E]/30 mt-2">Space Identity</p>
            </div>

            <div className="flex bg-[#EBE5DD] p-1 rounded-full">
              <button onClick={() => !spaceId && setVisibility('PRIVATE')} className={`p-3 rounded-full transition ${visibility === 'PRIVATE' ? 'bg-[#576238] text-white shadow-md' : 'text-[#162B1E]/40'}`}><Lock size={18} /></button>
              <button onClick={() => !spaceId && setVisibility('PUBLIC')} className={`p-3 rounded-full transition ${visibility === 'PUBLIC' ? 'bg-[#576238] text-white shadow-md' : 'text-[#162B1E]/40'}`}><Globe size={18} /></button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => checkSpaceCreated() && imageInputRef.current?.click()} className={`group flex flex-col items-center gap-4 p-10 border-2 border-dashed rounded-[40px] transition-all ${!spaceId ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-[#576238] hover:bg-[#F7F4F0]'}`}>
            <ImageIcon size={32} className="text-[#576238] group-hover:scale-110 transition"/>
            <span className="font-bold text-xs uppercase tracking-widest text-[#162B1E]/60">Add Images</span>
          </button>

          <button onClick={() => checkSpaceCreated() && fileInputRef.current?.click()} className={`group flex flex-col items-center gap-4 p-10 border-2 border-dashed rounded-[40px] transition-all ${!spaceId ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-[#576238] hover:bg-[#F7F4F0]'}`}>
            <FileText size={32} className="text-[#576238] group-hover:scale-110 transition"/>
            <span className="font-bold text-xs uppercase tracking-widest text-[#162B1E]/60">Add Files</span>
          </button>

          <button onClick={() => checkSpaceCreated() && setShowNoteModal(true)} className={`group flex flex-col items-center gap-4 p-10 border-2 border-dashed rounded-[40px] transition-all ${!spaceId ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-[#576238] hover:bg-[#F7F4F0]'}`}>
            <Plus size={32} className="text-[#576238] group-hover:scale-110 transition"/>
            <span className="font-bold text-xs uppercase tracking-widest text-[#162B1E]/60">Quick Note</span>
          </button>
        </div>

        {(tempContents.length > 0 || contents.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {tempContents.map((item, idx) => (
              <div key={`temp-${idx}`} className="aspect-square bg-white border-2 border-dashed border-[#576238]/20 rounded-[35px] p-2 relative group overflow-hidden">
                {item.type === 'IMAGE' ? <img src={item.preview} className="w-full h-full object-cover rounded-[28px]" /> : <FileText className="m-auto opacity-20" size={40}/>}
                <button onClick={() => handleDeleteTrigger('', true, idx)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"><X size={14}/></button>
                <div className="absolute bottom-3 left-3 bg-[#576238] text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Pending</div>
              </div>
            ))}
            {contents.map((item) => (
              <div key={item.id} className="aspect-square bg-white border border-[#162B1E]/5 rounded-[35px] p-2 shadow-sm relative group overflow-hidden transition-all hover:-translate-y-1">
                {item.type === 'IMAGE' ? <img src={item.url} className="w-full h-full object-cover rounded-[28px]" /> : <div className="flex flex-col items-center justify-center h-full opacity-40"><FileText size={40}/><span className="text-[10px] font-bold mt-2 uppercase">{item.type}</span></div>}
                <button onClick={() => handleDeleteTrigger(item.id, false)} className="absolute top-3 right-3 p-2 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md border border-red-50"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 py-10">
          {!spaceId ? (
            <button onClick={handleCreateEverything} disabled={loading || name.length < 2} className="px-16 py-5 rounded-full bg-[#162B1E] text-white font-bold flex gap-3 items-center shadow-2xl transition-all active:scale-95 disabled:opacity-30">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              CREATE EVERYTHING
            </button>
          ) : (
            <button onClick={() => router.push('/profile')} className="px-16 py-5 rounded-full border-2 border-[#162B1E] text-[#162B1E] font-bold hover:bg-[#162B1E] hover:text-white transition-all shadow-lg">
              FINISH & GO BACK
            </button>
          )}
        </div>

        <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" 
          onChange={(e) => {
            const files = e.target.files;
            if (!files || !spaceId) return;
            Array.from(files).forEach(async (f) => {
              const res = await uploadAndSaveContent({ file: f, type: 'IMAGE' }, spaceId);
              if (res) setContents(p => [...p, res]);
            });
          }}
        />
        <input ref={fileInputRef} type="file" multiple className="hidden" 
          onChange={(e) => {
            const files = e.target.files;
            if (!files || !spaceId) return;
            Array.from(files).forEach(async (f) => {
              const res = await uploadAndSaveContent({ file: f, type: 'FILE' }, spaceId);
              if (res) setContents(p => [...p, res]);
            });
          }}
        />
      </main>

      {showNoteModal && (
        <QuickNoteModal 
          spaceId={spaceId!} 
          onClose={() => setShowNoteModal(false)} 
          onNoteAdded={(newContent: ContentItem) => {
            setContents(prev => [...prev, newContent]);
            toast.success("Note saved!");
          }} 
        />
      )}

      <DeleteContentModal 
        isOpen={isDeletingContent}
        onClose={() => setIsDeletingContent(false)}
        onConfirm={confirmDeleteContent}
        loading={isDeletingLoading}
        itemType="Item"
      />
    </div>
  );
}