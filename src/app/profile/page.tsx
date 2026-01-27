'use client';
import { useState, useEffect } from 'react';
import { User, MapPin, Plus, Camera, Loader2 } from 'lucide-react';
import Header from '../component/header';
import AddSpaceModal from '../component/addSpaceModal';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // الحل هنا
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetUser($id: ID!) {
                getUser(id: $id) {
                  name
                  isComplete
                }
              }
            `,
            variables: { id: userId },
          }),
        });
        const result = await response.json();
        const userData = result.data?.getUser;

        if (userData) {
          setSavedName(userData.name);
          setName(userData.name);
          setIsComplete(userData.isComplete);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, ''); 
    if (value.length <= 16) {
      setName(value);
      setError('');
    }
  };

  const handleSaveName = async () => {
    const userId = localStorage.getItem('userId');
    if (name.length < 2) {
      setError('Name is too short');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation UpdateUser($id: ID!, $name: String!) {
              updateUser(id: $id, name: $name) {
                name
                isComplete
              }
            }
          `,
          variables: { id: userId, name: name },
        }),
      });
      const result = await response.json();
      if (result.data?.updateUser) {
        setSavedName(result.data.updateUser.name);
        setIsComplete(result.data.updateUser.isComplete);
        setIsEditing(false);
      }
    } catch (err) {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center">
          <div className="w-36 h-36 rounded-full bg-[#EBE5DD] animate-pulse mb-8" />
          <div className="w-48 h-8 bg-[#EBE5DD] animate-pulse rounded-full" />
        </div>
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center gap-10 mb-16">
          
          <div className="relative group">
            <div className="w-36 h-36 rounded-full bg-[#EBE5DD] border border-[#162B1E]/10 flex items-center justify-center overflow-hidden">
              <User size={70} strokeWidth={0.5} className="text-[#162B1E]/40" />
            </div>
            <button className="absolute bottom-2 right-2 p-2.5 bg-white rounded-full shadow-md text-[#162B1E] hover:bg-[#162B1E] hover:text-white transition-all">
              <Camera size={18} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            {isEditing || !isComplete ? (
              <div className="max-w-sm">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className={`text-3xl font-serif italic bg-transparent border-b-2 w-full py-1 focus:outline-none ${
                      error ? 'border-red-400' : 'border-[#162B1E]/20 focus:border-[#162B1E]'
                    }`}
                    placeholder="yourname"
                  />
                  <span className="absolute right-0 -bottom-6 text-[10px] opacity-40 font-bold">{name.length}/16</span>
                </div>
                <button
                  onClick={handleSaveName}
                  disabled={loading}
                  className="mt-8 px-8 py-2 bg-[#162B1E] text-[#EBE5DD] rounded-full text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Confirm Profile
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-700">
                <h1 className="text-5xl font-serif italic text-[#162B1E] leading-tight">@{savedName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-[#162B1E]/50">
                  <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-tighter font-bold">
                    <MapPin size={14} /> Global Explorer
                  </span>
                  <button onClick={() => setIsEditing(true)} className="text-[11px] uppercase tracking-tighter font-bold border-b border-[#162B1E]/20 hover:border-[#162B1E]">
                    Edit Name
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => isComplete ? setIsModalOpen(true) : setError('Set name first')}
            className="group flex items-center gap-3 px-10 py-4 bg-[#576238] text-white rounded-full shadow-xl hover:shadow-[#576238]/20 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500"/>
            <span className="font-bold text-sm tracking-widest uppercase">Add Space</span>
          </button>
        </div>

        <div className="h-[1px] w-full bg-[#162B1E]/5 mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40">
          <div className="aspect-[16/10] rounded-[40px] bg-[#F7F4F0] border border-dashed border-[#162B1E]/20 flex items-center justify-center">
             <p className="font-serif italic text-sm text-[#162B1E]/40">Your shared spaces will appear here</p>
          </div>
          <div className="aspect-[16/10] rounded-[40px] bg-[#F7F4F0] border border-dashed border-[#162B1E]/20 flex items-center justify-center">
             <p className="font-serif italic text-sm text-[#162B1E]/40">No content added yet</p>
          </div>
        </div>
      </main>

      <AddSpaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}