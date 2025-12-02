"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  ArrowLeft, ArrowRight 
} from "lucide-react";

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';

// Custom Components
import LandingPageTab from "./LandingPageTab/LandingPageTab";
import Button from "../../ReusableComponent/Buttons";
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
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

const floatingVariant: Variants = {
  float: {
    y: [0, -20, 0],
    x: [0, 5, 0],
    rotate: [0, 3, -3, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  },
  floatReverse: {
    y: [0, 20, 0],
    x: [0, -5, 0],
    rotate: [0, -3, 3, 0],
    transition: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 },
  },
};

const logoEntranceVariant: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    opacity: 1, 
    scale: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

// --- TEAM DATA ---
const TEAM_MEMBERS = [
  { 
    name: "Ivan Cañete", 
    role: "Project Lead / Backend Developer", 
    bio: "Focused on building secure and reliable systems for Katipunan Hub. Ensuring data integrity and smooth API integrations.",
    skills: "Node.js, Supabase, API Integration, Database Design",
    image: null 
  }, 
  { 
    name: "Member Name 2", 
    role: "Frontend Developer / UI/UX", 
    bio: "Crafting intuitive user experiences and translating designs into responsive, interactive React components.",
    skills: "React, Next.js, Tailwind CSS, Framer Motion",
    image: null 
  },
  { 
    name: "Member Name 3", 
    role: "Full Stack Developer", 
    bio: "Bridging the gap between front-end and back-end, ensuring seamless functionality across the entire platform.",
    skills: "JavaScript, TypeScript, SQL, System Architecture",
    image: null 
  },
];

export default function LandingPageContent() {
  const [bgColor, setBgColor] = useState("#FFFFFF");

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans">
      
      {/* --- INJECTED STYLES --- */}
      <style jsx global>{`
        .flip-container { height: 1.2em; overflow: hidden; }
        .flip-inner { animation: text-flip 6s cubic-bezier(0.23, 1, 0.32, 1.2) infinite; }
        @keyframes text-flip {
            0% { margin-top: 0; }
            25% { margin-top: -1.2em; } 
            50% { margin-top: -1.2em; }
            55% { margin-top: -2.4em; }
            80% { margin-top: -2.4em; }
            85% { margin-top: -3.6em; }
            99.99% { margin-top: -3.6em; }
            100% { margin-top: 0; }
        }
        
        /* Holographic styles */
        .holographic-card { transition: all 0.3s ease; cursor: pointer; z-index: 10; }
        .holographic-card:hover {
            background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255, 183, 197, 0.4) 25%, rgba(173, 216, 230, 0.4) 50%, rgba(238, 130, 238, 0.4) 75%, rgba(255,255,255,0.2) 100%);
            background-size: 200% 200%; animation: holo-shimmer 2s infinite linear;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.4);
            border-color: rgba(255, 255, 255, 0.9); backdrop-filter: blur(20px);
        }
        @keyframes holo-shimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Swiper overrides */
        .swiper { width: 100%; padding-top: 40px; padding-bottom: 50px; }
        .swiper-slide { background-position: center; background-size: cover; width: 290px; height: auto; }
        
        /* --- VISIBILITY FIX: STRICTLY 3 CARDS --- */
        .swiper-slide { 
            opacity: 0; 
            filter: blur(2px) grayscale(100%); 
            transition: all 0.3s ease; 
        }

        .swiper-slide-active { 
            opacity: 1; 
            filter: none; 
            z-index: 10; 
        }

        .swiper-slide-prev, .swiper-slide-next { 
            opacity: 0.5; 
            filter: blur(1px) grayscale(50%); 
            z-index: 5; 
        }

        .swiper-button-next::after, .swiper-button-prev::after { display: none; }
      `}</style>

      {/* --- FIXED TAB BAR --- */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
         <LandingPageTab />
      </div>

      {/* ========================================= */}
      {/* SECTION 1: HERO (STICKY)                  */}
      {/* ========================================= */}
      <div className="sticky top-0 h-screen w-full bg-[#EFBF04] overflow-hidden flex flex-col pt-20 z-0"> 
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <motion.div initial={{ scale: 1.2, x: -150, y: -150, opacity: 0 }} animate={{ scale: 1, x: -20, y: -20, opacity: 1 }} transition={{ duration: 2, ease: "easeOut" }} className="absolute top-0 left-0 w-[145%] h-[145%] lg:w-[78vw] lg:h-screen bg-[#A52A2A] z-0 opacity-50 rounded-br-[100%] rounded-tr-[25%]" />
        <motion.div initial={{ scale: 1.2, x: -100, y: -100, opacity: 0 }} animate={{ scale: 1, x: 0, y: 0, opacity: 1 }} transition={{ duration: 1.8, ease: "easeOut" }} className="absolute top-0 left-0 w-[140%] h-[140%] lg:w-[75vw] lg:h-screen bg-[#8B0E0E] z-0 shadow-2xl rounded-br-[100%] rounded-tr-[20%]" />

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24 pt-10 lg:pt-0">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-start max-w-3xl select-none mt-10 lg:mt-0 relative z-40">
            <motion.div variants={itemVariants} className="w-full">
              <h1 className="leading-[1.1] flex flex-col gap-2 font-montserrat">
                <div className="flex flex-wrap items-baseline gap-3 lg:gap-6 text-[64px] lg:text-[96px] font-bold tracking-tight">
                  <span className="text-white drop-shadow-md">STAY</span>
                  <div className="flip-container inline-block align-bottom relative">
                    <div className="flip-inner flex flex-col">
                        <div className="h-[1.2em] flex items-center text-[#EFBF04]">UPDATED</div>
                        <div className="h-[1.2em] flex items-center text-[#EFBF04]">CONNECTED</div>
                        <div className="h-[1.2em] flex items-center text-[#EFBF04]">INFORMED</div>
                        <div className="h-[1.2em] flex items-center text-[#EFBF04]">UPDATED</div>
                    </div>
                  </div>
                </div>
              </h1>
            </motion.div>
            <motion.p variants={itemVariants} className="text-[18px] lg:text-[24px] text-gray-200 font-medium mt-8 mb-8 max-w-lg font-ptsans leading-relaxed">
              From school events to lost & found, Katipunan Hub keeps the whole <span className="text-[#EFBF04] font-bold">CIT community</span> in one place.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Button text="JOIN THE HUB" bg="bg-[#EFBF04]" textcolor="text-[#8B0E0E]" font="font-bold" textSize="text-[20px]" className="px-10 py-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-transform border-2 border-[#8B0E0E]" />
            </motion.div>
          </motion.div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="hidden lg:flex relative w-[600px] h-[600px] items-center justify-center pointer-events-none">
            <div className="absolute w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse" />
            <motion.div variants={logoEntranceVariant} initial="hidden" animate="visible" className="absolute z-20">
              <Image src="/Logo.svg" alt="Katipunan Hub Logo" width={300} height={300} className="object-contain drop-shadow-2xl" priority />
            </motion.div>
            <motion.div variants={itemVariants} className="absolute top-20 right-0 z-30 pointer-events-auto"><motion.div variants={floatingVariant} animate="float"><GlassCard className="holographic-card p-5 rotate-6 hover:rotate-0 transition-transform duration-500 group"><Image src="/Chat.svg" alt="Chat" width={60} height={60} className="drop-shadow-md transition-transform group-hover:scale-110" /></GlassCard></motion.div></motion.div>
            <motion.div variants={itemVariants} className="absolute top-40 left-0 z-30 pointer-events-auto"><motion.div variants={floatingVariant} animate="float"><GlassCard className="holographic-card p-5 hover:scale-110 transition-transform duration-500 group"><Image src="/found.svg" alt="Found" width={70} height={70} className="object-contain drop-shadow-md transition-transform group-hover:scale-110" /></GlassCard></motion.div></motion.div>
            <motion.div variants={itemVariants} className="absolute bottom-12 left-10 z-30 pointer-events-auto"><motion.div variants={floatingVariant} animate="floatReverse"><GlassCard className="holographic-card p-5 -rotate-6 hover:rotate-0 transition-transform duration-500 group"><Image src="/Calendar.svg" alt="Calendar" width={60} height={60} className="drop-shadow-md transition-transform group-hover:scale-110" /></GlassCard></motion.div></motion.div>
            <motion.div variants={itemVariants} className="absolute bottom-24 right-20 z-30 pointer-events-auto"><motion.div variants={floatingVariant} animate="floatReverse"><GlassCard className="holographic-card p-4 rotate-3 hover:-rotate-3 transition-transform duration-500 group"><Image src="/Bellplus.svg" alt="Notify" width={50} height={50} className="drop-shadow-md transition-transform group-hover:scale-110" /></GlassCard></motion.div></motion.div>
          </motion.div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* REST OF CONTENT (Scrolls OVER the Hero)                 */}
      {/* ======================================================= */}
      <div className="relative z-10 bg-white">
        
        <motion.div 
            className="absolute inset-0 z-0 h-full w-full"
            animate={{ backgroundColor: bgColor }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        {/* SECTION 2: OUR STORY */}
        <motion.section 
            onViewportEnter={() => setBgColor("#FFF5E1")} 
            viewport={{ amount: 0.4 }}
            className="w-full py-24 relative overflow-hidden z-10"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
                        <div className="absolute -inset-3 border-2 border-[#EFBF04]/20 rounded-[35px] transform rotate-2 pointer-events-none" />
                        <div className="relative aspect-[4/3] w-full bg-white rounded-[30px] overflow-hidden shadow-xl border border-white flex items-center justify-center">
                            <p className="text-gray-400 font-montserrat text-xl">Our pic together 3 of us</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                        <h2 className="text-[#8B0E0E] font-bold text-[48px] lg:text-[60px] leading-tight mb-8 drop-shadow-sm font-montserrat">Our Story</h2>
                        <div className="space-y-8 font-montserrat text-gray-800 text-lg leading-relaxed text-justify relative">
                            <p>We built Katipunan Hub because we wanted to solve a problem that many students face every day. Important updates and resources were scattered, often buried in Facebook groups like CIT Confessions.</p>
                            <p>This project is not only our answer to that problem but also our stepping stone as aspiring programmers. By creating Katipunan Hub, we are learning how to turn ideas into real solutions that can make a difference for our community.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>

        {/* SECTION 3: THE PROBLEM */}
        <motion.section 
            onViewportEnter={() => setBgColor("#FFFFFF")} 
            viewport={{ amount: 0.4 }}
            className="w-full py-24 relative overflow-hidden z-10"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
                        <h2 className="text-[#EFBF04] font-bold text-[48px] lg:text-[56px] leading-tight mb-8 drop-shadow-md font-montserrat">The Problem <br/> We Saw</h2>
                        <div className="space-y-6 text-lg leading-relaxed text-justify font-medium font-montserrat text-gray-800">
                            <p>As students at CIT we experienced firsthand how scattered and messy important information could be. Whenever we needed updates we often turned to Facebook groups like CIT Confessions or CIT - U official page.</p>
                            <p>Over time this made it harder to find what truly mattered. A simple lost ID could get buried under dozens of unrelated posts. Announcements about events and deadlines were easy to miss because they blended in with casual discussions.</p>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2 flex flex-col gap-6">
                        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] h-[240px] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 border border-gray-50 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#EFBF04]/5 to-transparent opacity-50" />
                            <p className="text-gray-400 font-montserrat font-medium text-lg relative z-10">Problem pic sa page</p>
                        </div>
                        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] h-[240px] flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-300 border border-gray-50 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#8B0E0E]/5 to-transparent opacity-50" />
                            <p className="text-gray-400 font-montserrat font-medium text-lg relative z-10">Problem pic sa page</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>

        {/* SECTION 4: THE SOLUTION */}
        <motion.section 
            onViewportEnter={() => setBgColor("#FFF0E0")} 
            viewport={{ amount: 0.4 }}
            className="w-full py-24 relative overflow-hidden z-10"
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                <motion.div className="w-full flex flex-col gap-6" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <div className="bg-white rounded-[20px] shadow-xl h-[240px] flex items-center justify-center border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EFBF04]/20 to-transparent rounded-bl-full" />
                        <p className="text-gray-400 font-montserrat font-medium text-lg z-10">Solution pic sato system</p>
                    </div>
                    <div className="bg-white rounded-[20px] shadow-xl h-[240px] flex items-center justify-center border border-white relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#8B0E0E]/10 to-transparent rounded-tr-full" />
                        <p className="text-gray-400 font-montserrat font-medium text-lg z-10">Solution pic sato system</p>
                    </div>
                </motion.div>

                <motion.div className="w-full" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h2 className="text-[#8B0E0E] font-bold text-[48px] lg:text-[56px] leading-tight mb-10 drop-shadow-sm font-montserrat">The Solution <br/> We Built</h2>
                    <div className="space-y-6 text-lg leading-relaxed text-justify text-gray-800 font-montserrat relative">
                        <p>Seeing how information was always buried and scattered pushed us to think differently. We wanted something that would make life easier not only for us but for every student at CIT.</p>
                        <p>Instead of scrolling through endless anonymous posts just to find one important update we imagined a platform where everything was already in its right place. Announcements would have their own space. Lost and found items would be easy to track.</p>
                    </div>
                </motion.div>
            </div>
        </motion.section>

        {/* SECTION 5: TEAM */}
        <motion.section 
            onViewportEnter={() => setBgColor("#222222")} 
            viewport={{ amount: 0.4 }}
            className="w-full py-24 relative text-white overflow-hidden z-10"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#8B0E0E] via-[#3a0a0a] to-[#222] opacity-50 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="mb-12 text-center">
                    <h2 className="text-white font-montserrat font-bold text-[48px] drop-shadow-lg">Get to Know Us</h2>
                    <p className="text-gray-300 mt-4 font-montserrat">The minds behind Katipunan Hub.</p>
                </div>

                <div className="relative px-4 md:px-16">
                    <Swiper
                        effect={'coverflow'}
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={3}
                        loop={true}
                        coverflowEffect={{ 
                          rotate: 0, 
                          stretch: 0, 
                          depth: 200, 
                          modifier: 1, 
                          slideShadows: false 
                        }}
                        navigation={{ nextEl: '.swiper-button-next-custom', prevEl: '.swiper-button-prev-custom' }}
                        modules={[EffectCoverflow, Navigation]}
                        className="team-swiper"
                        observer={true}
                        observeParents={true}
                    >
                        {[...TEAM_MEMBERS, ...TEAM_MEMBERS].map((member, index) => (
                            <SwiperSlide key={index}>
                                <div className="bg-white rounded-[35px] overflow-hidden shadow-2xl h-full text-black transition-all duration-300 select-none">
                                    <div className="h-[190px] bg-gray-200 relative flex items-center justify-center">
                                        {member.image ? (
                                            <Image src={member.image} alt={member.name} fill className="object-cover" />
                                        ) : (
                                            <p className="font-montserrat text-gray-500 text-lg font-medium">(Image Nato)</p>
                                        )}
                                    </div>
                                    <div className="p-6 text-left">
                                        <h3 className="text-2xl font-bold font-montserrat mb-1">{member.name}</h3>
                                        <p className="text-gray-600 font-medium text-sm mb-4 font-montserrat">{member.role}</p>
                                        <p className="text-gray-700 text-sm mb-4 leading-relaxed font-ptsans line-clamp-4">{member.bio}</p>
                                        <div className="mb-6">
                                            <p className="text-xs font-bold text-[#8B0E0E] uppercase tracking-wider mb-1">Skills</p>
                                            <p className="text-gray-600 text-xs font-medium">{member.skills}</p>
                                        </div>
                                        <div className="flex gap-4 mt-auto">
                                            <Instagram className="w-6 h-6 text-gray-800 hover:text-[#8B0E0E] cursor-pointer transition-colors" />
                                            <Facebook className="w-6 h-6 text-gray-800 hover:text-[#8B0E0E] cursor-pointer transition-colors" />
                                            <div className="w-6 h-6 bg-black text-white flex items-center justify-center rounded-sm hover:bg-[#8B0E0E] cursor-pointer transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    
                    {/* --- FIX APPLIED: Removed standalone 'flex' so it doesn't conflict with 'hidden' --- */}
                    <div className="swiper-button-prev-custom absolute top-1/2 left-0 -translate-y-1/2 z-20 bg-white text-black w-14 h-14 rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-[#EFBF04] hover:scale-110 transition-all hidden md:flex">
                        <ArrowLeft size={24} />
                    </div>
                    <div className="swiper-button-next-custom absolute top-1/2 right-0 -translate-y-1/2 z-20 bg-white text-black w-14 h-14 rounded-full shadow-lg items-center justify-center cursor-pointer hover:bg-[#EFBF04] hover:scale-110 transition-all hidden md:flex">
                        <ArrowRight size={24} />
                    </div>
                </div>
            </div>
        </motion.section>

        {/* FOOTER */}
        <footer className="bg-black text-white pt-16 pb-8 border-t border-white/10 z-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                      <Logo width={60} height={70} unclickable />
                      <span className="font-montserrat font-bold text-xl tracking-wider">KATIPUNAN HUB</span>
                  </div>
                  <p className="font-montserrat text-sm text-gray-500 font-medium">
                      © 2025 Katipunan Hub. All rights reserved.
                  </p>
              </div>
          </div>
        </footer>
      </div>

    </div>
  );
}