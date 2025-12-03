"use client";

import React from "react";
import Image from "next/image";
import { Instagram, Linkedin, Mail } from "lucide-react";

// --- TEAM DATA ---
const TEAM_MEMBERS = [
  {
    name: "Ivan Cañete",
    role: "Project Lead / Backend",
    bio: "Building the secure core of Katipunan Hub. ensuring seamless data flow and robust API integrations for the community.",
    skills: "Node.js • Supabase • Database Design",
    image: null, // Add image path when available
  },
  {
    name: "Member Name 2",
    role: "UI/UX & Frontend",
    bio: "Crafting intuitive interfaces and translating designs into responsive, interactive experiences that students love.",
    skills: "React • Tailwind • Framer Motion",
    image: null,
  },
  {
    name: "Member Name 3",
    role: "Full Stack Developer",
    bio: "Bridging the gap between server and client, ensuring functionality is seamless across the entire platform.",
    skills: "TypeScript • SQL • System Arch",
    image: null,
  },
];

const TeamSection = () => {
  return (
    <section className="w-full py-32 relative text-white overflow-hidden z-10 bg-[#1a1a1a]">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#8B0E0E] via-[#2b0505] to-[#111] opacity-60 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-20 text-center space-y-4">
          <h2 className="text-white font-montserrat font-bold text-[48px] lg:text-[56px] drop-shadow-xl tracking-tight">
            Meet the Builders
          </h2>
          <p className="text-gray-300 font-montserrat text-lg max-w-2xl mx-auto leading-relaxed">
            The student developers turning the Katipunan Hub vision into reality.
          </p>
        </div>

        {/* 3-Column Static Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-stretch justify-center">
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-[30px] overflow-hidden hover:bg-white/10 hover:border-white/20 hover:-translate-y-2 transition-all duration-300 shadow-2xl flex flex-col"
            >
              {/* Image Area */}
              <div className="h-[240px] w-full bg-gradient-to-b from-gray-700/50 to-gray-900/50 relative flex items-center justify-center overflow-hidden group-hover:shadow-inner transition-all">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors">
                    <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center">
                      <span className="text-3xl font-bold">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />
              </div>

              {/* Content Area */}
              <div className="p-8 flex-1 flex flex-col relative">
                {/* Floating Role Badge */}
                <div className="absolute -top-5 left-8 bg-[#EFBF04] text-[#8B0E0E] text-xs font-bold px-4 py-2 rounded-full shadow-lg font-montserrat tracking-wide uppercase">
                  {member.role}
                </div>

                <div className="mt-4 mb-2">
                  <h3 className="text-2xl font-bold font-montserrat text-white tracking-wide group-hover:text-[#EFBF04] transition-colors">
                    {member.name}
                  </h3>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed font-ptsans mb-6 line-clamp-3">
                  {member.bio}
                </p>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 font-montserrat">
                    Tech Stack
                  </p>
                  <p className="text-gray-300 text-sm font-medium font-mono">
                    {member.skills}
                  </p>

                  {/* Social Icons */}
                  <div className="flex gap-4 mt-6">
                    <button className="text-gray-400 hover:text-[#EFBF04] transition-colors">
                      <Linkedin size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-[#EFBF04] transition-colors">
                      <Instagram size={20} />
                    </button>
                    <button className="text-gray-400 hover:text-[#EFBF04] transition-colors">
                      <Mail size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;