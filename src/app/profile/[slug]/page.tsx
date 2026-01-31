'use client';
import { useState, useEffect, useCallback, use } from 'react'; // أضفنا use هنا
import { 
  User, MapPin, Plus, Camera, Loader2, Lock, Globe, Folder, 
  MoreVertical, Trash2, Edit3, Share2, ExternalLink, LinkIcon 
} from 'lucide-react';
import Header from '../../component/header';
import { useRouter } from 'next/navigation';
import DeleteSpaceModal from '../../component/deleteSpaceMpdal';
import { Space, profileGraphQLResponse } from '../../../types';
import { useToast } from '../../context/toastContext';

export default function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slugFromUrl = resolvedParams.slug;

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
            showToast("Admin access granted", "success");
            window.history.replaceState({}, '', window.location.pathname);
            fetchUserDataAndSpaces(user.id);
            return;
          }
        } catch (err) {
          showToast("Secret link invalid", "error");
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
  }, [fetchUserDataAndSpaces, showToast, slugFromUrl]);

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
        // إعادة التوجيه للسلج الجديد إذا تغير الاسم
        router.push(`/profile/${updated.slug}`);
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
          <div className="w-36 h-36 rounded-full bg-[#EBE5DD] flex items-center justify-center">
            <User size={70} strokeWidth={0.5} className="text-[#162B1E]/40" />
          </div>

          <div className="flex-1 text-center md:text-left">
            {isEditing || !isComplete ? (
              <div className="max-w-sm mx-auto md:mx-0">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/\s/g, ''))}
                  className="text-3xl font-serif italic bg-transparent border-b-2 border-[#162B1E]/20 focus:border-[#162B1E] w-full py-1 focus:outline-none"
                  placeholder="yourname"
                />
                <button onClick={handleSaveName} className="mt-6 px-8 py-2.5 bg-[#162B1E] text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Confirm Identity
                </button>
              </div>
            ) : (
              <div>
                <h1 className="text-5xl font-serif italic text-[#162B1E]">@{savedName}</h1>
                <button onClick={() => setIsEditing(true)} className="text-[11px] uppercase font-bold mt-4 opacity-40 hover:opacity-100 transition-opacity">
                  Change Name
                </button>
              </div>
            )}
          </div>

          <button onClick={() => router.push('/createSpacePage')} className="bg-[#576238] text-white px-10 py-4 rounded-full shadow-xl hover:-translate-y-1 transition-all flex items-center gap-3">
            <Plus size={20} /> <span className="font-bold text-sm uppercase">Add Space</span>
          </button>
        </div>

        {isComplete && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
             <div onClick={() => copyUrl('public')} className="p-5 bg-white border border-[#162B1E]/5 rounded-[30px] flex justify-between items-center cursor-pointer group">
               <div>
                 <p className="text-[10px] font-bold uppercase opacity-30">Public Profile</p>
                 <p className="text-xs font-medium">share/{userSlug}</p>
               </div>
               <Share2 size={16} className="text-[#162B1E]/20 group-hover:text-[#576238]" />
             </div>

             <div onClick={() => copyUrl('admin')} className="p-5 bg-white border border-amber-200/50 rounded-[30px] flex justify-between items-center cursor-pointer group">
               <div>
                 <p className="text-[10px] font-bold uppercase text-amber-600/50">Secret Link</p>
                 <p className="text-xs font-medium opacity-60">Admin Access</p>
               </div>
               <Lock size={16} className="text-amber-600/30 group-hover:text-amber-600" />
             </div>
          </div>
        )}

        <div className="h-[1px] w-full bg-[#162B1E]/5 mb-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space.id} onClick={() => router.push(`/${space.slug}`)} className="bg-[#EBE5DD] aspect-[16/11] rounded-2xl p-6 relative group cursor-pointer hover:-translate-y-2 transition-all">
               <div className="absolute -top-3 left-0 w-16 h-4 bg-[#EBE5DD] rounded-t-lg" />
               <div className="flex flex-col h-full justify-between">
                 <div className="bg-white/50 p-2 rounded-lg w-fit">
                    {space.type === 'PRIVATE' ? <Lock size={16} /> : <Globe size={16} />}
                 </div>
                 <h3 className="font-bold text-[#162B1E] truncate">{space.name}</h3>
               </div>
            </div>
          ))}
        </div>
      </main>

      <DeleteSpaceModal 
        isOpen={!!spaceToDelete} 
        spaceId={spaceToDelete?.id || ''} 
        spaceName={spaceToDelete?.name || ''} 
        onClose={() => setSpaceToDelete(null)}
        onSuccess={() => {
          setSpaces(spaces.filter(s => s.id !== spaceToDelete?.id));
          showToast("Deleted!", "success");
        }}
      />
    </div>
  );
}