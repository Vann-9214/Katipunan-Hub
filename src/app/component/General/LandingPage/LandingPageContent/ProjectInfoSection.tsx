import React from "react";
import { motion } from "framer-motion";
import { Target, Search, CheckCircle2 } from "lucide-react";

const ProjectInfoSection = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* --- HEADER --- */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#8B0E0E] font-black font-montserrat text-[40px] lg:text-[52px] uppercase tracking-tight mb-4"
          >
            Why Katipunan Hub?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-montserrat text-lg max-w-2xl mx-auto"
          >
            Bridging the gap between information and the student body.
          </motion.p>
        </div>

        {/* --- CONTENT BLOCKS --- */}
        <div className="flex flex-col gap-24">
          {/* BLOCK 1: THE PROBLEM */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-[#8B0E0E]">
                  <Search size={24} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold font-montserrat text-gray-900">
                  The Problem
                </h3>
              </div>
              <p className="text-gray-600 font-montserrat text-lg leading-relaxed text-justify">
                Information at CIT was scattered. Lost ID? Buried in Facebook
                confessions. Important announcement? Missed between casual
                posts. The lack of a centralized system meant students were
                often out of the loop, frustrated, and disconnected from vital
                campus updates.
              </p>
            </div>
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              {/* Abstract Visual Representation */}
              <div className="relative h-[300px] w-full bg-gray-200 rounded-[32px] overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
                <p className="text-gray-400 font-montserrat font-semibold">
                  Problem Visualization (Image)
                </p>
                {/* Decorative Blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B0E0E]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* BLOCK 2: THE OBJECTIVE & SOLUTION */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="w-full lg:w-1/2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-[#EFBF04]">
                  <Target size={24} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-bold font-montserrat text-gray-900">
                  Our Objective
                </h3>
              </div>
              <p className="text-gray-600 font-montserrat text-lg leading-relaxed text-justify mb-6">
                We wanted to create a digital home for the CIT community. A
                place where every piece of information has a dedicated home—not
                buried in a feed, but categorized, searchable, and reliable.
              </p>
              <ul className="space-y-4">
                {[
                  "Centralized Announcements",
                  "Dedicated Lost & Found Tracker",
                  "Real-time Campus Event Calendar",
                  "Secure Student Verification",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-[#EFBF04]" />
                    <span className="text-gray-700 font-medium font-montserrat">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="relative h-[300px] w-full bg-gray-200 rounded-[32px] overflow-hidden border border-gray-100 shadow-inner flex items-center justify-center">
                <p className="text-gray-400 font-montserrat font-semibold">
                  Solution Visualization (Image)
                </p>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#EFBF04]/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfoSection;
