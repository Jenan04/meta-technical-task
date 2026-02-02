'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  User, MapPin, Plus, Camera, Loader2, Lock, Globe, Folder, 
  MoreVertical, Trash2, Edit3, Share2, ExternalLink, LinkIcon 
} from 'lucide-react';
import Header from '../component/header';
import { useRouter } from 'next/navigation';
import DeleteSpaceModal from '../component/deleteSpaceMpdal';
import { Space, profileGraphQLResponse } from '@/types';
import { useToast } from '../context/toastContext';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spaces, setSpaces] = useState<Space[]>([]); 
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<{id: string, name: string} | null>(null);
  const [userSlug, setUserSlug] = useState('');
  const [privateToken, setPrivateToken] = useState('');
  
  const router = useRouter();
  const { showToast } = useToast();

  const fetchUserDataAndSpaces = useCallback(async (userId: string) => {
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
                slug          
                privateToken
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
      const userData = result.data?.getUser;

      if (userData) {
        setSavedName(userData.name);
        setName(userData.name);
        setUserSlug(userData.slug);
        setPrivateToken(userData.privateToken);
        setIsComplete(userData.isComplete);
      }

      if (result.data?.getUserSpaces) {
        setSpaces(result.data.getUserSpaces);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth');
      const pathSegments = window.location.pathname.split('/');
      const slugFromUrl = pathSegments[pathSegments.length - 1];

      if (authToken && slugFromUrl) {
        try {
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                query GetPrivateByToken($slug: String!, $token: String!) {
                  getPrivateProfileByToken(slug: $slug, token: $token) {
                    id
                  }
                }
              `,
              variables: { slug: slugFromUrl, token: authToken }
            }),
          });
          const result = await response.json();
          const user = result.data?.getPrivateProfileByToken;

          if (user) {
            localStorage.setItem('userId', user.id);
            showToast("Admin access granted via secret link", "success");
            window.history.replaceState({}, '', window.location.pathname);
            fetchUserDataAndSpaces(user.id);
            return;
          }
        } catch (err) {
          showToast("Secret link invalid or expired", "error");
        }
      }

      const userId = localStorage.getItem('userId');
      if (userId) {
        fetchUserDataAndSpaces(userId);
      } else {
        setIsInitialLoading(false);
      }
    };

    initSession();

    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, [fetchUserDataAndSpaces, showToast]);

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
                slug
                privateToken
                isComplete
              }
            }
          `,
          variables: { id: userId, name: name },
        }),
      });
      const result: profileGraphQLResponse = await response.json();
      if (result.data?.updateUser) {
        const updated = result.data.updateUser;
        setSavedName(updated.name);
        setUserSlug(updated.slug);
        setPrivateToken(updated.privateToken);
        setIsComplete(updated.isComplete);
        setIsEditing(false);
        setError('');
        showToast("Identity confirmed!", "success");
      }
    } catch (err) {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (type: 'public' | 'admin') => {
    if (!userSlug) {
      showToast("Set your name first!", "error");
      return;
    }
    const origin = window.location.origin;
    const url = type === 'public' 
      ? `${origin}/share/${userSlug}`
      : `${origin}/profile/${userSlug}?auth=${privateToken}`;
    
    navigator.clipboard.writeText(url);
    showToast(`${type === 'public' ? 'Public link' : 'Admin secret link'} copied!`, "success");
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
          </div>

          <div className="flex-1 text-center md:text-left">
            {isEditing || !isComplete ? (
              <div className="max-w-sm mx-auto md:mx-0">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
                  className={`text-3xl font-serif italic bg-transparent border-b-2 w-full py-1 focus:outline-none ${
                    error ? 'border-red-400' : 'border-[#162B1E]/20 focus:border-[#162B1E]'
                  }`}
                  placeholder="yourname"
                />
                {error && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase">{error}</p>}
                <button
                  onClick={handleSaveName}
                  disabled={loading}
                  className="mt-6 px-8 py-2.5 bg-[#162B1E] text-[#EBE5DD] rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Confirm Identity
                </button>
              </div>
            ) : (
              <div>
                <h1 className="text-5xl font-serif italic text-[#162B1E]">@{savedName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-[#162B1E]/50">
                  <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-tighter font-bold">
                    <MapPin size={14} /> Digital Native
                  </span>
                  <button onClick={() => setIsEditing(true)} className="text-[11px] uppercase tracking-tighter font-bold border-b border-[#162B1E]/20 hover:text-[#162B1E]">
                    Change Name
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => isComplete ? router.push('/createSpacePage') : showToast('Set name first', 'error')}
            className="group flex items-center gap-3 px-10 py-4 bg-[#576238] text-white rounded-full shadow-xl hover:-translate-y-1 transition-all"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500"/>
            <span className="font-bold text-sm tracking-widest uppercase">Add Space</span>
          </button>
        </div>

        {/* Sharing Links */}
        {isComplete && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <div className="p-5 bg-white border border-[#162B1E]/5 rounded-[30px] flex items-center justify-between group hover:border-[#576238]/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#F4F1EE] rounded-2xl text-[#162B1E]/40 group-hover:text-[#576238] transition-colors">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-30">Public Profile</p>
                  <p className="text-xs font-medium opacity-60">share/{userSlug}</p>
                </div>
              </div>
              <button onClick={() => copyUrl('public')} className="p-2 hover:bg-[#F4F1EE] rounded-xl transition-colors">
                <Share2 size={16} className="text-[#162B1E]/40" />
              </button>
            </div>

            <div className="p-5 bg-white border border-[#162B1E]/5 rounded-[30px] flex items-center justify-between group hover:border-amber-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600/40 group-hover:text-amber-600 transition-colors">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-amber-600/50">Admin Secret Link</p>
                  <p className="text-xs font-medium opacity-60 italic truncate max-w-[150px]">Secret Access Token</p>
                </div>
              </div>
              <button onClick={() => copyUrl('admin')} className="p-2 hover:bg-amber-50 rounded-xl transition-colors">
                <LinkIcon size={16} className="text-amber-600/40" />
              </button>
            </div>
          </div>
        )}

        <div className="h-[1px] w-full bg-[#162B1E]/5 mb-16" />

        {/* Spaces Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space.id} className="group relative">
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === space.id ? null : space.id); }} 
                  className="p-2 hover:bg-white/50 rounded-full transition-colors text-[#162B1E]/40 hover:text-[#162B1E]"
                >
                  <MoreVertical size={18} />
                </button>
                {activeMenu === space.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#162B1E]/10 rounded-2xl shadow-xl overflow-hidden z-30">
                    <div className="py-2 flex flex-col">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/${space.slug}`); }} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#162B1E] hover:bg-[#F4F1EE] flex items-center gap-3"><ExternalLink size={14} /> Open</button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const url = space.type === 'PUBLIC' 
                            ? `${window.location.origin}/share/${userSlug}/${space.slug}`
                            : `${window.location.origin}/${space.slug}`;
                          navigator.clipboard.writeText(url); 
                          showToast("Link copied!", "success"); 
                        }} 
                        className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-[#162B1E] hover:bg-[#F4F1EE] flex items-center gap-3"
                      >
                        <Share2 size={14} /> Copy Link
                      </button>
                      <div className="h-[1px] bg-[#162B1E]/5 my-1" />
                      <button onClick={(e) => { e.stopPropagation(); setSpaceToDelete({id: space.id, name: space.name}); }} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3"><Trash2 size={14} /> Delete</button>
                    </div>
                  </div>
                )}
              </div>
              <div onClick={() => router.push(`/${space.slug}`)} className="relative aspect-[16/11] bg-[#EBE5DD] rounded-2xl rounded-tl-none border border-[#162B1E]/5 p-6 transition-all group-hover:bg-[#D6CFC6] group-hover:-translate-y-2 cursor-pointer shadow-sm">
                <div className="absolute -top-3 left-0 w-16 h-4 bg-[#EBE5DD] rounded-t-lg group-hover:bg-[#D6CFC6] transition-all" />
                <div className="flex flex-col h-full justify-between">
                  <div className="p-2 bg-white/50 w-fit rounded-lg shadow-sm">
                    {space.type === 'PRIVATE' ? <Lock size={16} className="text-[#576238]" /> : <Globe size={16} className="text-[#576238]" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#162B1E] truncate pr-8">{space.name}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#162B1E]/40 mt-1">{space.type} Space</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {spaces.length === 0 && !isInitialLoading && (
            <div className="col-span-full py-20 border-2 border-dashed border-[#162B1E]/5 rounded-[40px] flex flex-col items-center justify-center text-[#162B1E]/20">
              <Folder size={40} strokeWidth={1} className="mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No spaces created yet</p>
            </div>
          )}
        </div>
      </main>

      <DeleteSpaceModal 
        isOpen={!!spaceToDelete} 
        spaceId={spaceToDelete?.id || ''} 
        spaceName={spaceToDelete?.name || ''} 
        onClose={() => setSpaceToDelete(null)}
        onSuccess={() => {
          setSpaces(spaces.filter(s => s.id !== spaceToDelete?.id));
          showToast("Space deleted forever", "success");
        }}
      />
    </div>
  );
}

