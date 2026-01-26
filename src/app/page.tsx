import React from 'react'
import Header from './component/header';
import HeroSection from './component/heroSection';
import HowItWorks from './component/howItsWork';
import Footer from './component/footer';

function page() {
  return (
   <div className="min-h-screen font-sans">
      <Header />
      <HeroSection />
      <HowItWorks />
      <Footer />
    </div>  
  )
}

export default page