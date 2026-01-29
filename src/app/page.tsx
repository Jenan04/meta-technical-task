'use client';
import React, { useEffect, useState } from 'react';
import Header from './component/header';
import HeroSection from './component/heroSection';
import HowItWorks from './component/howItsWork';
import Footer from './component/footer';
import { useRouter } from 'next/navigation';

function Page() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      router.replace('/feed');
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) return null; 

  return (
    <div className="min-h-screen font-sans">
      <Header hideUserLinks />
      <HeroSection />
      <HowItWorks />
      <Footer />
    </div>
  );
}

export default Page;
