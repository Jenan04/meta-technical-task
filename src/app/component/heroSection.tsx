'use client';
import React from 'react';
import { motion } from 'framer-motion';
import UploadScene from './uploadAnimation';

const Hero = () => {
  return (
    <section className="relative min-h-[calc(100vh-82px)] flex items-center  px-6 md:px-[80px]  overflow-hidden pt-10">
      
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#576238]/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-[#D6B2B2]/20 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-serif font-semibold text-[#162B1E] leading-[1.1] mb-6">
            Your Digital <br />
            <span className="italic font-light text-[#576238]">Content Space</span>
          </h1>
          
          <p className="text-lg text-[#576238]/90 max-w-md mb-10 leading-relaxed">
            A minimal, scalable registry to host and showcase your files. Built for speed, designed for clarity.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="px-10 py-4 bg-[#576238] text-white rounded-full font-medium transition-transform active:scale-95 shadow-lg shadow-[#162B1E]/20">
              Start Now
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <UploadScene />
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;