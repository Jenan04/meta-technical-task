'use client';
import { useState, useEffect } from 'react';
import { User, MapPin, Plus, Camera, Loader2, Lock, Globe, Folder } from 'lucide-react';
import Header from '../component/header';
import { useRouter } from 'next/navigation';
import { Space, profileGraphQLResponse } from '@/types';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]); 
  
  const router = useRouter();

  useEffect(() => {
    const fetchUserDataAndSpaces = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetUserAndSpaces($id: ID!) {
                getUser(id: $id) {
                  name
                  isComplete
                }
                getUserSpaces(userId: $id) { 
                  id
                  name
                  type
                  slug
                }
              }
            `,
            variables: { id: userId },
          }),
        });

        const result: profileGraphQLResponse = await response.json();

        if (result.errors) {
            console.error("GraphQL Errors:", result.errors);
            setError("Failed to load profile data");
            return;
        }

        const userData = result.data?.getUser;
        const spacesData = result.data?.getUserSpaces;

        if (userData) {
            setSavedName(userData.name);
            setName(userData.name);
            setIsComplete(userData.isComplete);
        } else {
            console.warn("No user found for this ID");
        }

        if (spacesData) {
            setSpaces(spacesData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchUserDataAndSpaces();
  }, []);

  const handleSaveName = async () => {
    const userId = localStorage.getItem('userId');
    if (name.length < 2) {
      setError('Name is too short');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/graphql`, {
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
      const result: profileGraphQLResponse = await response.json();

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
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
                  className={`text-3xl font-serif italic bg-transparent border-b-2 w-full py-1 focus:outline-none ${
                    error ? 'border-red-400' : 'border-[#162B1E]/20 focus:border-[#162B1E]'
                  }`}
                  placeholder="yourname"
                />
                <button
                  onClick={handleSaveName}
                  disabled={loading}
                  className="mt-8 px-8 py-2 bg-[#162B1E] text-[#EBE5DD] rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Confirm Profile
                </button>
              </div>
            ) : (
              <div>
                <h1 className="text-5xl font-serif italic text-[#162B1E]">@{savedName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-[#162B1E]/50">
                  <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-tighter font-bold">
                    <MapPin size={14} /> Global Explorer
                  </span>
                  <button onClick={() => setIsEditing(true)} className="text-[11px] uppercase tracking-tighter font-bold border-b border-[#162B1E]/20">
                    Edit Name
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => isComplete ? router.push('/createSpacePage') : setError('Set name first')}
            className="group flex items-center gap-3 px-10 py-4 bg-[#576238] text-white rounded-full shadow-xl hover:-translate-y-1 transition-all"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500"/>
            <span className="font-bold text-sm tracking-widest uppercase">Add Space</span>
          </button>
        </div>

        <div className="h-[1px] w-full bg-[#162B1E]/5 mb-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {spaces.length > 0 ? (
            spaces.map((space) => (
              <div 
                key={space.id}
                onClick={() => router.push(`/${space.slug}`)} // نفترض أن لديك صفحة عرض للسبيس
                className="group cursor-pointer relative"
              >
                <div className="relative aspect-[16/11] bg-[#EBE5DD] rounded-2xl rounded-tl-none border border-[#162B1E]/5 p-6 transition-all group-hover:bg-[#D6CFC6] group-hover:-translate-y-2">

                  <div className="absolute -top-3 left-0 w-16 h-4 bg-[#EBE5DD] rounded-t-lg group-hover:bg-[#D6CFC6]" />
                  
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-white/50 rounded-lg">
                        {space.type === 'PRIVATE' ? <Lock size={18} className="text-[#576238]" /> : <Globe size={18} className="text-[#576238]" />}
                      </div>
                      {/* <Folder size={24} className="text-[#162B1E]/20 group-hover:text-[#162B1E]/40" /> */}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-[#162B1E] truncate">{space.name}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#162B1E]/40 mt-1">
                        {space.type} Space
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[#162B1E]/10 rounded-[40px]">
               <Folder size={48} className="text-[#162B1E]/10 mb-4" />
               <p className="font-serif italic text-[#162B1E]/40">No spaces created yet. Start by adding one!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}