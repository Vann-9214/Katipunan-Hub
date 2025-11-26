"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Instagram, Facebook, Twitter } from "lucide-react"; // Added icons for Team section

// Custom Components
import LandingPageTab from "./LandingPageTab/LandingPageTab";
import Button from "../../ReusableComponent/Buttons";
import SignUpForm from "./LandingPageTab/SignUpForms";
import SignInForm from "./LandingPageTab/SignInForms";
import Logo from "../../ReusableComponent/Logo";

// --- 1. Custom GlassCard Component ---
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`
      relative overflow-hidden
      bg-white/20 
      backdrop-blur-xl 
      border border-white/30 
      shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
      rounded-[24px]
      before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-50 before:pointer-events-none
      ${className}
    `}
  >
    {children}
  </div>
);

// --- ANIMATION VARIANTS ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
      duration: 0.8,
      ease: "easeInOut"
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 50, 
      damping: 20 
    },
  },
};

const floatingVariant: Variants = {
  float: {
    y: [0, -20, 0],
    x: [0, 5, 0],
    rotate: [0, 3, -3, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  floatReverse: {
    y: [0, 20, 0],
    x: [0, -5, 0],
    rotate: [0, -3, 3, 0],
    transition: {
      duration: 9,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1,
    },
  },
};

const logoEntranceVariant: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function LandingPageContent() {
  const [mode, setMode] = useState<"none" | "signup" | "signin">("none");

  const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof document === "undefined") return null;
    return createPortal(children, document.body);
  };

  return (
    // Changed from h-screen to min-h-screen and flex-col to allow scrolling
    <div className="bg-white min-h-screen w-full relative flex flex-col overflow-x-hidden">
      
      {/* LandingPageTab is fixed at the top (z-50). */}
      <LandingPageTab />

      {/* ========================================= */}
      {/* SECTION 1: HERO (Original Redesigned)     */}
      {/* ========================================= */}
      <div className="relative min-h-screen w-full bg-[#EFBF04] overflow-hidden flex flex-col">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Layer 1: Lighter Maroon Shadow */}
        <motion.div
          initial={{ scale: 1.2, x: -150, y: -150, opacity: 0 }}
          animate={{ scale: 1, x: -20, y: -20, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-0 left-0 w-[145%] h-[145%] lg:w-[78vw] lg:h-screen bg-[#A52A2A] z-0 opacity-50"
          style={{
            borderBottomRightRadius: "100%",
            borderTopRightRadius: "25%", 
          }}
        />

        {/* Layer 2: Main Maroon Shape */}
        <motion.div
          initial={{ scale: 1.2, x: -100, y: -100, opacity: 0 }}
          animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="absolute top-0 left-0 w-[140%] h-[140%] lg:w-[75vw] lg:h-screen bg-[#8B0E0E] z-0 shadow-2xl"
          style={{
            borderBottomRightRadius: "100%",
            borderTopRightRadius: "20%", 
          }}
        />

        {/* Decorative Blob */}
        <motion.div 
           className="absolute top-[20%] left-[10%] w-64 h-64 bg-white opacity-5 rounded-full blur-3xl z-0"
           animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
           transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Content Container */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24 pt-32 lg:pt-0">
          
          {/* Left Side: Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start max-w-2xl select-none mt-10 lg:mt-0"
          >
            <motion.div variants={itemVariants}>
              <h1
                className="leading-[0.9] lg:leading-[1]"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
                <div className="flex flex-wrap items-baseline gap-4 mb-2">
                  <span className="text-[#EFBF04] font-bold text-[64px] lg:text-[96px] drop-shadow-md">
                    STAY
                  </span>
                  <span className="text-white font-bold text-[40px] lg:text-[64px]">
                    UPDATED
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-4 pl-0 lg:pl-20">
                  <span className="text-[#EFBF04] font-bold text-[64px] lg:text-[96px] drop-shadow-md">
                    STAY
                  </span>
                  <span className="text-white font-bold text-[40px] lg:text-[64px]">
                    CONNECTED
                  </span>
                </div>
              </h1>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-[18px] lg:text-[24px] text-gray-200 font-medium mt-8 mb-8 max-w-lg"
              style={{ fontFamily: "PT Sans, sans-serif", lineHeight: "1.4" }}
            >
              From school events to lost & found, Katipunan Hub keeps
              the whole <span className="text-[#EFBF04] font-bold">CIT community</span> in one place.
            </motion.p>

            <motion.div variants={itemVariants} className="ml-0 lg:ml-10">
              <Button
                text="JOIN THE HUB"
                bg="bg-[#EFBF04]"
                textcolor="text-[#8B0E0E]"
                font="font-bold"
                textSize="text-[20px]"
                className="px-10 py-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-transform border-2 border-[#8B0E0E]"
                onClick={() => setMode("signup")}
              />
            </motion.div>
          </motion.div>

          {/* Right Side: Floating Visuals */}
          <div className="hidden lg:flex relative w-[600px] h-[600px] items-center justify-center pointer-events-none">
            <div className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" />
            
            {/* Logo */}
            <motion.div
              variants={logoEntranceVariant}
              initial="hidden"
              animate="visible"
              className="absolute z-20"
            >
              <Image 
                src="/Logo.svg" 
                alt="Katipunan Hub Logo" 
                width={300} 
                height={300} 
                className="object-contain drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Floating Cards */}
            <motion.div variants={floatingVariant} animate="float" className="absolute top-0 right-10 z-30">
              <GlassCard className="p-5 rotate-6 hover:rotate-0 transition-transform duration-500 group hover:bg-white/30">
                <Image src="/Chat.svg" alt="Chat" width={60} height={60} className="drop-shadow-md transition-transform group-hover:scale-110" />
              </GlassCard>
            </motion.div>

            <motion.div variants={floatingVariant} animate="floatReverse" className="absolute bottom-20 left-5 z-30">
              <GlassCard className="p-5 -rotate-6 hover:rotate-0 transition-transform duration-500 group hover:bg-white/30">
                <Image src="/Calendar.svg" alt="Calendar" width={60} height={60} className="drop-shadow-md transition-transform group-hover:scale-110" />
              </GlassCard>
            </motion.div>

            <motion.div variants={floatingVariant} animate="float" className="absolute top-32 left-0 z-30">
              <GlassCard className="p-5 hover:scale-110 transition-transform duration-500 group hover:bg-white/30">
                <Image src="/found.svg" alt="Found" width={70} height={70} className="object-contain drop-shadow-md transition-transform group-hover:scale-110" />
              </GlassCard>
            </motion.div>

            <motion.div variants={floatingVariant} animate="floatReverse" className="absolute bottom-10 right-24 z-30">
              <GlassCard className="p-4 rotate-3 hover:-rotate-3 transition-transform duration-500 group hover:bg-white/30">
                <Image src="/Bellplus.svg" alt="Notify" width={50} height={50} className="drop-shadow-md transition-transform group-hover:scale-110" />
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* SECTION 2: OUR STORY / ABOUT US           */}
      {/* ========================================= */}
      <section className="w-full flex flex-col relative">

        {/* 2A: Top Banner (About Us) */}
        <div className="relative h-[500px] w-full bg-[#5A0505] flex flex-col items-center justify-center overflow-hidden shrink-0 z-0">
           {/* Background Image - AboutUs.svg */}
           <div className="absolute inset-0 z-0">
             <Image 
               src="/AboutUs.svg" 
               alt="About Us Background" 
               fill 
               className="object-cover object-center opacity-50"
               priority
             />
             {/* Dark Overlay */}
             <div className="absolute inset-0 bg-black/50" />
           </div>

           {/* Title centered on the banner */}
           <div className="z-10 text-center relative mt-10">
              <h2 className="text-white font-bold font-montserrat text-[50px] drop-shadow-2xl">About Us</h2>
           </div>
        </div>

        {/* 2B: Content Area (Beige/Peach with Nodes) */}
        <div className="flex-1 bg-gradient-to-b from-[#FFF5E1] to-[#FFE6CE] relative py-24 z-10">
            {/* Background Pattern - OurStory.svg */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <Image
                    src="/OurStory.svg"
                    alt="Background decoration"
                    fill
                    className="object-cover object-center"
                />
            </div>
            
            <div className="max-w-7xl mx-auto px-8">
                {/* FIX: items-stretch ensures equal height children */}
                <div className="flex flex-col lg:flex-row lg:items-stretch items-center gap-20">
                   
                   {/* LEFT: Image Card Column */}
                   <div className="w-full lg:w-[55%] flex flex-col z-20">
                     <motion.div 
                       initial={{ opacity: 0, y: 50 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.8 }}
                       className="bg-white rounded-[30px] shadow-2xl p-3 w-full h-full"
                     >
                       <div className="w-full h-full rounded-[20px] border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 min-h-[400px]">
                         <p className="text-gray-400 font-montserrat text-xl font-medium">Our pic together 3 of us</p>
                       </div>
                     </motion.div>
                   </div>

                   {/* RIGHT: Text Content */}
                   <div className="w-full lg:w-[45%] z-10 flex flex-col justify-center">
                      <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                         <h2 className="text-[#8B0E0E] font-bold text-[48px] lg:text-[60px] leading-tight mb-8 drop-shadow-sm font-montserrat">
                           Our Story
                         </h2>
                         
                         <div className="space-y-8 font-montserrat text-gray-800 text-lg leading-relaxed text-justify">
                           <p>
                             We built Katipunan Hub because we wanted to solve a problem that many students face every day. 
                             Important updates and resources were scattered, often buried in Facebook groups like CIT Confessions 
                             where lost and found posts, announcements, and discussions all mixed together. We felt the need 
                             for a space where everything important could finally come together in one place.
                           </p>
                           <p>
                             This project is not only our answer to that problem but also our stepping stone as aspiring programmers. 
                             By creating Katipunan Hub, we are learning how to turn ideas into real solutions that can make a difference 
                             for our community. What started as a project for three students has become a platform that represents 
                             both our growth and our vision to reach greater heights in programming and beyond.
                           </p>
                         </div>
                      </motion.div>
                   </div>

                </div>
            </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 3: THE PROBLEM WE SAW             */}
      {/* ========================================= */}
      <section className="w-full min-h-screen flex items-center justify-center relative py-20 overflow-hidden">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <Image 
              src="/TheProblemWeSaw.svg" 
              alt="The Problem Background" 
              fill 
              className="object-cover object-center"
              priority
            />
        </div>

        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-20 z-10">
            
            {/* Left: Text Content */}
            <div className="w-full lg:w-1/2 text-white font-montserrat">
              <h2 className="text-[#EFBF04] font-bold text-[48px] lg:text-[56px] leading-tight mb-8 drop-shadow-md">
                The Problem <br/> We Saw
              </h2>
              
              <div className="space-y-6 text-lg leading-relaxed text-justify font-medium">
                <p>
                  As students at CIT we experienced firsthand how scattered and messy important information could be. 
                  Whenever we needed updates we often turned to Facebook groups like CIT Confessions or CIT - U official page. 
                  While these groups gave us a space to share they also turned into a mix of announcements, lost and found posts, 
                  anonymous confessions and student conversations all in one place.
                </p>
                <p>
                  Over time this made it harder to find what truly mattered. A simple lost ID could get buried under dozens 
                  of unrelated posts. Announcements about events and deadlines were easy to miss because they blended in with 
                  casual discussions. What should have been a reliable source of information turned into a confusing mix that 
                  left many students frustrated.
                </p>
                <p>
                  We knew there had to be a better way to keep our community informed without losing the connection that 
                  made us feel part of something bigger.
                </p>
              </div>
            </div>

            {/* Right: Images Stack */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8">
              {/* Top Image Card */}
              <div className="bg-white rounded-[20px] shadow-lg h-[280px] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
                <p className="text-gray-400 font-montserrat font-medium text-lg">Problem pic sa page</p>
              </div>
              {/* Bottom Image Card */}
              <div className="bg-white rounded-[20px] shadow-lg h-[280px] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300">
                <p className="text-gray-400 font-montserrat font-medium text-lg">Problem pic sa page</p>
              </div>
            </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 4: THE SOLUTION WE BUILT (RESTORED) */}
      {/* ========================================= */}
      <section className="w-full min-h-screen flex items-center justify-center relative py-20 overflow-hidden bg-gradient-to-tl from-[#FFF5E1] to-[#FFE6CE]">
        
        {/* Background Pattern - OurStory.svg (reused as requested) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
            <Image
                src="/OurStory.svg"
                alt="Background decoration"
                fill
                className="object-cover object-center"
            />
        </div>
        {/* Additional glow for depth */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#EFBF04]/10 rounded-full blur-[100px] pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-8 flex flex-col-reverse lg:flex-row items-center gap-20 z-10">
            
            {/* Left: Images Stack */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8">
              {/* Top Image Card */}
              <div className="bg-white rounded-[20px] shadow-xl h-[280px] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 border border-gray-100">
                <p className="text-gray-400 font-montserrat font-medium text-lg">Solution pic sato system</p>
              </div>
              {/* Bottom Image Card */}
              <div className="bg-white rounded-[20px] shadow-xl h-[280px] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 border border-gray-100">
                <p className="text-gray-400 font-montserrat font-medium text-lg">Solution pic sato system</p>
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="w-full lg:w-1/2 font-montserrat text-black text-right lg:text-left">
              <h2 className="text-[#8B0E0E] font-bold text-[48px] lg:text-[56px] leading-tight mb-10 drop-shadow-sm">
                The Solution <br/> We Built
              </h2>
              
              <div className="space-y-6 text-lg leading-relaxed text-justify text-gray-800">
                <p>
                  Seeing how information was always buried and scattered pushed us to think differently. 
                  We wanted something that would make life easier not only for us but for every student at CIT. 
                  That is where Katipunan Hub began.
                </p>
                <p>
                  Instead of scrolling through endless anonymous posts just to find one important update we imagined a 
                  platform where everything was already in its right place. Announcements would have their own space. 
                  Lost and found items would be easy to track. Events would be visible on a calendar instead of being 
                  buried in a feed. Conversations would still exist but in a way that kept the important things clear and accessible.
                </p>
                <p>
                  Katipunan Hub is our answer to that problem. It is more than a school project. It is our way of 
                  contributing to the community that shaped us. Building this system is also our stepping stone as 
                  programmers teaching us how to transform a simple idea into something that can create real impact.
                </p>
              </div>
            </div>
        </div>
      </section>

      {/* ========================================= */}
      {/* SECTION 5: GET TO KNOW US & FOOTER        */}
      {/* ========================================= */}
      <section className="w-full min-h-screen flex flex-col relative">
        
        {/* 5A: Team Carousel Section */}
        <div className="flex-1 bg-gradient-to-b from-[#8B0E0E] to-[#5A0505] relative flex flex-col items-center justify-center py-24 overflow-hidden">
          {/* Title */}
          <h2 className="text-white font-montserrat font-light text-[48px] mb-16 drop-shadow-lg">
            Get to Know Us
          </h2>

          {/* Carousel Container */}
          <div className="flex items-center gap-12 z-10">
            {/* Left Arrow */}
            <button className="w-14 h-14 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white backdrop-blur-sm">
              <ArrowLeft size={24} />
            </button>

            {/* Team Member Card */}
            <div className="w-[350px] bg-white rounded-[30px] overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
              {/* Image Placeholder (Top Half) */}
              <div className="h-[300px] bg-gray-200 flex items-center justify-center relative border-b border-gray-100">
                 <p className="text-gray-400 font-montserrat text-xl">(Image Nato)</p>
              </div>
              
              {/* Details (Bottom Half) */}
              <div className="p-8 text-left">
                <h3 className="font-bold text-2xl text-black font-montserrat mb-1">
                  Ivan Cañete
                </h3>
                <p className="text-sm text-gray-500 font-montserrat mb-6 font-medium">
                  Project Lead / Backend Developer
                </p>
                
                <p className="text-sm text-gray-700 font-montserrat leading-relaxed mb-8 min-h-[80px]">
                  Focused on building secure and reliable systems for Katipunan Hub. Skilled in Node.js, Supabase, and API integration.
                </p>

                {/* Social Icons */}
                <div className="flex gap-4 items-center">
                   <Instagram className="w-6 h-6 text-black hover:text-[#8B0E0E] cursor-pointer transition-colors" />
                   <Facebook className="w-6 h-6 text-black hover:text-[#8B0E0E] cursor-pointer transition-colors" />
                   <div className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-sm hover:bg-[#8B0E0E] cursor-pointer transition-colors">
                     <Twitter size={14} fill="currentColor" />
                   </div>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button className="w-14 h-14 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white backdrop-blur-sm">
              <ArrowRight size={24} />
            </button>
          </div>

          {/* Optional: Background Ghost Cards for depth effect (Visual polish based on image style) */}
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-white/5 rounded-[30px] blur-[2px] -z-0 rotate-[-5deg] opacity-50" />
          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-white/5 rounded-[30px] blur-[2px] -z-0 rotate-[5deg] opacity-50" />
        </div>

        {/* 5B: Footer (Gold/Beige) */}
        <div className="bg-[#FFF5E1] border-t-[6px] border-[#EFBF04] relative py-10 px-16">
           {/* Background Nodes Pattern */}
           <div className="absolute inset-0 opacity-30 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle, #EFBF04 2px, transparent 2px)', backgroundSize: '30px 30px' }} 
           />

           <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
             {/* Logo & Text */}
             <div className="flex items-center gap-4">
                <Logo width={60} height={70} unclickable />
             </div>
             
             <p className="font-montserrat text-sm text-gray-500 font-medium mt-4">
               © 2025 Katipunan Hub. All rights reserved.
             </p>
           </div>
        </div>
      </section>

      {/* --- Modals --- */}
      <AnimatePresence mode="wait">
        {mode === "signup" && (
          <ModalWrapper>
            <SignUpForm
              key="signup"
              onClose={() => setMode("none")}
              onSwitch={() => setMode("signin")}
            />
          </ModalWrapper>
        )}
        {mode === "signin" && (
          <SignInForm
            key="signin"
            onClose={() => setMode("none")}
            onSwitch={() => setMode("signup")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}