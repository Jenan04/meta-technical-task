'use client';

import { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, FileText, Lock, Globe, Loader2, CheckCircle, X, Folder, Trash2, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ContentItem, TempContentItem, CreateSpaceResponse, AddContentResponse } from "@/types";
import Header from '../component/header';
import QuickNoteModal from '../component/quickNote';

export default function CreateSpacePage() {
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');
  const [loading, setLoading] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [contents, setContents] = useState<ContentItem[]>([]);
  
  const [tempContents, setTempContents] = useState<TempContentItem[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'IMAGE' | 'FILE') => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map(file => ({
      file,
      type,
      preview: type === 'IMAGE' ? URL.createObjectURL(file) : undefined
    }));
    setTempContents(prev => [...prev, ...newFiles]);
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
            addContent(userId: $userId, spaceId: $spaceId, type: $type, url: $url, text: $text, size: $size, visibility: $visibility) { id type url text }
          }
        `,
        variables: { userId, spaceId: currentSpaceId, type: item.type, url, text: item.text, size, visibility },
      }),
    });
    const json: AddContentResponse = await res.json();
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
      const spaceJson: CreateSpaceResponse = await spaceRes.json();
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

  const handleDeleteContent = async (contentId: string, isTemp: boolean, index?: number) => {
    if (isTemp) {
      setTempContents(prev => prev.filter((_, i) => i !== index));
    } else {
      setContents(prev => prev.filter(c => c.id !== contentId));
      toast.success("Item deleted");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">

        <section className="bg-white p-8 rounded-[40px] border border-[#162B1E]/5 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`p-5 rounded-2xl shadow-lg transition-all ${spaceId ? 'bg-[#576238] text-white rotate-0' : 'bg-[#EBE5DD] text-[#162B1E]/20'}`}>
              <Folder size={40} />
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={spaceId ? !isEditingName : false}
                  placeholder="Name your space..."
                  className={`w-full bg-transparent  text-3xl font-serif italic py-1 focus:outline-none  ${isEditingName ? 'border-[#576238]' : 'border-transparent'}`}
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

        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => imageInputRef.current?.click()} className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-[#162B1E]/10 rounded-[40px] hover:bg-[#F7F4F0] transition">
              <ImageIcon size={32} className="text-[#576238] group-hover:scale-110 transition"/>
              <span className="font-bold text-xs uppercase tracking-widest">Add Images</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-[#162B1E]/10 rounded-[40px] hover:bg-[#F7F4F0] transition">
              <FileText size={32} className="text-[#576238] group-hover:scale-110 transition"/>
              <span className="font-bold text-xs uppercase tracking-widest">Add Files</span>
            </button>
            <button onClick={() => setShowNoteModal(true)} className="group flex flex-col items-center gap-4 p-10 border-2 border-dashed border-[#162B1E]/10 rounded-[40px] hover:bg-[#F7F4F0] transition">
              <Plus size={32} className="text-[#576238] group-hover:scale-110 transition"/>
              <span className="font-bold text-xs uppercase tracking-widest">Add Quick Note</span>
            </button>
          </div>

          {(tempContents.length > 0 || contents.length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in duration-700">

              {tempContents.map((item, idx) => (
                <div key={`temp-${idx}`} className="aspect-square bg-white border-2 border-dashed border-[#576238]/20 rounded-[35px] p-2 relative group overflow-hidden">
                  {item.type === 'IMAGE' ? <img src={item.preview} className="w-full h-full object-cover rounded-[28px]" /> : <FileText className="m-auto opacity-20" size={40}/>}
                  <button onClick={() => handleDeleteContent('', true, idx)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"><X size={14}/></button>
                  <div className="absolute bottom-3 left-3 bg-[#576238] text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Pending</div>
                </div>
              ))}
              {contents.map((item) => (
                <div key={item.id} className="aspect-square bg-white border border-[#162B1E]/5 rounded-[35px] p-2 shadow-sm relative group overflow-hidden transition-hover hover:-translate-y-1">
                  {item.type === 'IMAGE' ? <img src={item.url} className="w-full h-full object-cover rounded-[28px]" /> : <div className="flex flex-col items-center justify-center h-full opacity-40"><FileText size={40}/><span className="text-[10px] font-bold mt-2 uppercase">{item.type}</span></div>}
                  <button onClick={() => handleDeleteContent(item.id, false)} className="absolute top-3 right-3 p-2 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md border border-red-50"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 py-10">
          {!spaceId ? (
            <button
              onClick={handleCreateEverything}
              disabled={loading || name.length < 2}
              className="px-16 py-5 rounded-full bg-[#162B1E] text-white font-bold flex gap-3 items-center shadow-2xl hover:scale-105 transition active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              CREATE EVERYTHING
            </button>
          ) : (
            <button onClick={() => router.push('/profile')} className="px-16 py-5 rounded-full border-2 border-[#162B1E] text-[#162B1E] font-bold hover:bg-[#162B1E] hover:text-white transition shadow-lg">
              FINISH & GO BACK
            </button>
          )}
          <p className="text-[10px] text-[#162B1E]/40 font-bold uppercase tracking-[0.3em]">Assemble your memories</p>
        </div>

        <input ref={imageInputRef} type="file" multiple accept="image/*" className="hidden" 
          // onChange={(e) => spaceId ? Array.from(e.target.files || []).map(f => uploadAndSaveContent({file: f, type: 'IMAGE'}, spaceId).then(res => setContents(p => [...p, res]))) : handleFileSelect(e, 'IMAGE')} 
          onChange={(e) => {
            const files = e.target.files;
            if (!files) return;
            if (spaceId) {
              Array.from(files).forEach(async (f) => {
                const res = await uploadAndSaveContent({ file: f, type: 'IMAGE' }, spaceId);
                if (res) setContents(p => [...p, res]);
              });
            } else {
              handleFileSelect(e, 'IMAGE');
            }
          }}
           />
        <input ref={fileInputRef} type="file" multiple className="hidden" 
          // onChange={(e) => spaceId ? Array.from(e.target.files || []).map(f => uploadAndSaveContent({file: f, type: 'FILE'}, spaceId).then(res => setContents(p => [...p, res]))) : handleFileSelect(e, 'FILE')} 
          onChange={(e) => {
            const files = e.target.files;
            if (!files) return;
            if (spaceId) {
              Array.from(files).forEach(async (f) => {
                const res = await uploadAndSaveContent({ file: f, type: 'FILE' }, spaceId);
                if (res) setContents(p => [...p, res]);
              });
            } else {
              handleFileSelect(e, 'FILE');
            }
          }}
          />
      </main>

      {showNoteModal && (
        <QuickNoteModal 
          spaceId={spaceId} 
          onClose={() => setShowNoteModal(false)} 
          onNoteAdded={(newId) => {
            if(!spaceId) {
               setTempContents(prev => [...prev, { type: 'NOTE', text: 'New Quick Note' }]); 
               toast.success("Note added to queue");
            } else {
              //  setContents(prev => [...prev, { id: newId, type: 'NOTE' }]);
              const newNote: ContentItem = {
           id: newId,
           type: 'NOTE',
           text: 'New Quick Note',
           url: '', 
           createdAt: new Date().toISOString()
         };
         
         setContents(prev => [...prev, newNote]);
            }
          }} 
        />
      )}
    </div>
  );
}