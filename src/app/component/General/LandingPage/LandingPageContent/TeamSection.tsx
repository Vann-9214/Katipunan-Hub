"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

/* --- TEAM DATA --- */
const TEAM_MEMBERS = [
  {
    name: "Ivan Cañete",
    role: "Project Lead / Full Stack",
    bio: "As the driving force behind Katipunan Hub, Ivan leads the entire project development and oversees the full stack architecture, ensuring seamless integration from backend logic to the user interface.",
    skills: "Full Stack Dev • System Arch • Leadership",
    image: "/Ivan.jpeg",
  },
  {
    name: "Clark Jaca",
    role: "Frontend Developer",
    bio: "Focused on the user interface design and implementation. Crafted the Landing Page and the visual layout for the Lost and Found feature.",
    skills: "React • UI Implementation • Frontend Design",
    image: "/Clark.jpeg",
  },
  {
    name: "Adriyanna Diana",
    role: "Frontend Developer",
    bio: "Specialized in the Calendar interface. Designed the visual elements and layout to ensure the scheduling features are intuitive and user-friendly.",
    skills: "React • UI Design • Calendar Interfaces",
    image: "/DefaultAvatar.svg",
  },
];

// Animation Variants - Explicitly typed to fix TypeScript error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20,
    },
  },
};

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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center space-y-4"
        >
          <h2 className="text-white font-montserrat font-bold text-[48px] lg:text-[56px] drop-shadow-xl tracking-tight">
            Meet the Builders
          </h2>
          <p className="text-gray-300 font-montserrat text-lg max-w-2xl mx-auto leading-relaxed">
            The student developers turning the Katipunan Hub vision into
            reality.
          </p>
        </motion.div>

        {/* 3-Column Grid with Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-stretch justify-center"
        >
          {TEAM_MEMBERS.map((member, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-[30px] overflow-hidden hover:bg-white/10 hover:border-white/20 transition-colors duration-300 shadow-2xl flex flex-col"
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

                <p className="text-gray-400 text-sm leading-relaxed font-ptsans mb-6">
                  {member.bio}
                </p>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 font-montserrat">
                    Tech Stack
                  </p>
                  <p className="text-gray-300 text-sm font-medium font-mono">
                    {member.skills}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
