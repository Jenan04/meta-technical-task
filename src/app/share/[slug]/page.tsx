'use client';
import { useState, useEffect, use } from 'react';
import { Globe, MapPin, Loader2, FolderOpen, ExternalLink } from 'lucide-react';
import Header from '@/app/component/header';
import { useToast } from '../../context/toastContext'; 
import { PublicProfileData, PublicProfileResponse } from '@/types';

export default function PublicViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetPublic($slug: String!) {
                getPublicProfile(slug: $slug) {
                  name
                  spaces {
                    id
                    name
                    slug
                    type
                    contents {
                      id
                    }
                  }
                }
              }
            `,
            variables: { slug },
          }),
        });
        const result = await response.json();
        if (result.data?.getPublicProfile) {
          setData(result.data.getPublicProfile);
        }
      } catch (error) {
        showToast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <Loader2 className="animate-spin text-[#576238]" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="text-center">
        <p className="font-serif italic text-[#162B1E]/40 text-xl">Profile not found.</p>
        <button onClick={() => window.location.href = '/'} className="mt-4 text-[10px] font-bold uppercase tracking-widest border-b border-[#162B1E]/20">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-20">

        <div className="text-center mb-20">
          <div className="w-24 h-24 bg-[#EBE5DD] rounded-full mx-auto mb-6 flex items-center justify-center border border-[#162B1E]/5 shadow-sm">
             <span className="text-3xl font-serif italic text-[#162B1E]/40">
               {data.name[0].toUpperCase()}
             </span>
          </div>
          <h1 className="text-4xl font-serif italic text-[#162B1E]">@{data.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-[#162B1E]/40">
            <MapPin size={14} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Public Collection</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {data.spaces.map((space) => (
            <div 
              key={space.id} 
              className="group relative bg-white border border-[#162B1E]/5 rounded-[40px] p-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer"
              onClick={() => showToast("Opening space...", "success")}
            >
              <div className="flex justify-between items-start mb-12">
                <div className="p-4 bg-[#F4F1EE] rounded-2xl text-[#576238] group-hover:bg-[#576238] group-hover:text-white transition-colors duration-500">
                  <Globe size={24} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-20 group-hover:opacity-40">
                    {space.contents?.length || 0} Items
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-[#162B1E] mb-2">{space.name}</h3>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-[#576238]">View Contents</span>
                   <ExternalLink size={12} className="text-[#576238]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.spaces.length === 0 && (
          <div className="py-32 text-center opacity-10">
            <FolderOpen size={60} className="mx-auto mb-4 stroke-1" />
            <p className="text-xs font-bold uppercase tracking-[0.3em]">No Public Spaces</p>
          </div>
        )}

      </main>
      
      <footer className="py-10 text-center opacity-20">
        <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Digitally Archived</p>
      </footer>
    </div>
  );
}