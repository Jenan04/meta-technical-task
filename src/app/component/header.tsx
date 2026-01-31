'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, Home, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  hideUserLinks?: boolean; 
}

const Header: React.FC<HeaderProps> = ({ hideUserLinks }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    setHasUser(!!userId && !!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation CreateUser($name: String!) {
              createPseudoUser(name: $name) {
                id
                name
                privateToken
              }
            }
          `,
          variables: {
            name: `User_${Math.floor(Math.random() * 1000)}`,
          },
        }),
      });

      const result = await response.json();
      const userData = result.data.createPseudoUser;

      if (userData?.id) {
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('token', userData.privateToken); // التوكن الضروري للـ Auth
        localStorage.setItem('userName', userData.name);
        setHasUser(true); 
        router.push('/feed');
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };


  const renderLinks = () => {
    if (!hasUser || hideUserLinks) {
      return (
        <button
          onClick={handleGetStarted}
          disabled={loading}
          className="relative inline-block rounded-[24px] overflow-hidden group disabled:opacity-70 transition-all active:scale-95"
        >
          <span className="block px-6 py-2 bg-[linear-gradient(90deg,_rgba(87,98,56,1)_0%,_rgba(176,170,160,1)_100%)] text-white font-medium">
            {loading ? 'Creating...' : 'Get Started'}
          </span>
          <span className="absolute inset-0 bg-[#576238] opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium">
            {loading ? 'Wait...' : 'Get Started'}
          </span>
        </button>
      );
    }

    const navItemClasses = (isActive: boolean) => `
      flex flex-col items-center justify-center min-w-[64px] py-1 px-2 rounded-xl transition-all duration-300
      ${isActive 
        ? 'text-[#576238] bg-[#576238]/5' // لون أخضر خفيف للخلفية عند التفعيل
        : 'text-[#162B1E]/60 hover:text-[#162B1E] hover:bg-[#D6B2B2]/10'
      }
    `;

    return (
      <div className="flex items-center gap-6">
        <button
          onClick={() => router.push('/feed')}
          className={navItemClasses(pathname === '/feed')}
        >
          <Home 
            size={22} 
            strokeWidth={pathname === '/feed' ? 2.5 : 2} 
            className="transition-transform duration-300 group-hover:scale-110"
          />
          <span className={`text-[10px]  tracking-wider font-bold mt-1 ${
            pathname === '/feed' ? 'opacity-100' : 'opacity-80'
          }`}>
            Feed
          </span>
          {pathname === '/feed' && (
            <div className="w-5 h-0.5 bg-[#576238] rounded-full mt-0.5" />
          )}
        </button>

        <button
          onClick={() => router.push('/profile')}
          className={navItemClasses(pathname === '/profile')}
        >
          <User 
            size={22} 
            strokeWidth={pathname === '/profile' ? 2.5 : 2} 
          />
          <span className={`text-[10px]  tracking-wider font-bold mt-1 ${
            pathname === '/profile' ? 'opacity-100' : 'opacity-80'
          }`}>
            Profile
          </span>

          {pathname === '/profile' && (
            <div className="w-5 h-0.5 bg-[#576238] rounded-full mt-0.5" />
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity duration-300 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <header className="fixed top-0 left-0 w-full z-50 bg-[#EBE5DD] shadow-sm border-b border-[#D6B2B2]/20">
        <div className="flex justify-between items-center px-6 md:px-[80px] py-4 max-w-7xl mx-auto">
          
          <div className="flex items-center gap-2 cursor-pointer">
            <Image
              src="/assets/sticker1.webp"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain"
            />
            <span className="text-2xl text-[#162B1E] font-semibold italic tracking-tighter font-serif antialiased">
             Share Space
           </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {renderLinks()}
          </nav>

          <div className="md:hidden">
            <button
              onClick={() => setOpen(!open)}
              className="text-[#162B1E] p-2 relative z-50"
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>

            {open && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 w-full bg-[#FCF7F7] shadow-2xl border-t border-gray-100 flex flex-col p-4 space-y-1 z-50 animate-in slide-in-from-top-2 duration-300"
              >
                <div className="pt-4 mt-2 border-gray-100 flex flex-col gap-3">
                  {renderLinks()}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="h-[82px]" />
    </>
  );
};

export default Header;
