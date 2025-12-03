"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Search,
  CheckCircle2,
  MessageCircle,
  Calendar,
  Bell,
} from "lucide-react";

const ProjectInfoSection = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-[#fafafa]">
      {/* --- DECORATIVE BACKGROUND ELEMENTS --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-yellow-100/40 rounded-full blur-3xl translate-y-1/2" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#8B0E0E 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* --- HEADER --- */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <h2 className="text-[#8B0E0E] font-black font-montserrat text-[42px] lg:text-[56px] uppercase tracking-tighter mb-4 relative z-10">
              What is Katipunan Hub?
            </h2>
            {/* Underline Decoration */}
            <div className="h-2 w-24 bg-[#EFBF04] mx-auto rounded-full" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-montserrat text-lg max-w-2xl mx-auto mt-6 leading-relaxed"
          >
            An exclusive, centralized platform designed to unify the CIT
            community and bridge the gap between students and resources.
          </motion.p>
        </div>

        {/* --- CONTENT BLOCKS --- */}
        <div className="flex flex-col gap-32">
          {/* BLOCK 1: THE OBJECTIVE */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Text Content */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#8B0E0E] shadow-lg shadow-red-900/20 flex items-center justify-center text-white rotate-3">
                  <Target size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold font-montserrat text-gray-900 tracking-tight">
                  The Objective
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-6 text-gray-600 font-montserrat text-lg leading-relaxed text-justify"
              >
                <p>
                  Our primary goal is to{" "}
                  <strong className="text-[#8B0E0E] bg-red-50 px-1 rounded">
                    expose students to the Peer Learning Center (PLC)
                  </strong>
                  . We realized that while the PLC is a vital resource, many
                  students were missing out simply because they didn&apos;t know
                  it existed or how to access it.
                </p>
                <p>
                  We also wanted to{" "}
                  <strong className="text-[#8B0E0E] bg-red-50 px-1 rounded">
                    centralize communication
                  </strong>
                  . Whether you are looking for lost items, checking the latest
                  announcements, or just scrolling through campus feeds, we
                  wanted one place where it all happens.
                </p>
              </motion.div>
            </div>

            {/* Visual: Abstract Feed Representation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 order-1 lg:order-2"
            >
              <div className="relative h-[400px] w-full bg-gradient-to-br from-gray-50 to-white rounded-[40px] border border-white shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-100/50 to-transparent rounded-full blur-3xl" />

                {/* Mock UI Card - Feed Post */}
                <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 transform group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 bg-gray-200 rounded w-1/3" />
                      <div className="h-2 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-2 bg-gray-100 rounded w-full" />
                    <div className="h-2 bg-gray-100 rounded w-5/6" />
                    <div className="h-2 bg-gray-100 rounded w-4/6" />
                  </div>
                  <div className="h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-300">
                    <MessageCircle size={24} />
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-10 right-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white flex items-center gap-3 animate-bounce duration-[3000ms]">
                  <div className="w-10 h-10 rounded-full bg-[#8B0E0E] flex items-center justify-center text-white">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      Status
                    </p>
                    <p className="text-sm font-bold text-gray-800">Connected</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BLOCK 2: ALL IN ONE SOLUTION */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
            {/* Text Content */}
            <div className="w-full lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#EFBF04] shadow-lg shadow-yellow-500/20 flex items-center justify-center text-[#8B0E0E] -rotate-3">
                  <Search size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold font-montserrat text-gray-900 tracking-tight">
                  All-in-One Solution
                </h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-6 text-gray-600 font-montserrat text-lg leading-relaxed text-justify mb-8"
              >
                <p>
                  Katipunan Hub is an{" "}
                  <strong className="text-[#8B0E0E]">
                    all-CIT student exclusive
                  </strong>{" "}
                  system. We didn&apos;t just build a website; we built a
                  digital campus.
                </p>
                <p>
                  It centralizes Announcements, Feeds, and Lost & Found. We also
                  integrated a{" "}
                  <strong className="text-[#8B0E0E]">Smart Calendar</strong>{" "}
                  that lets students manage personal events, while Admins can
                  push global updates like{" "}
                  <strong className="text-[#8B0E0E]">
                    &quot;No Class&quot;
                  </strong>{" "}
                  dates instantly.
                </p>
              </motion.div>

              <ul className="space-y-4">
                {[
                  "Exclusive for CIT Students",
                  "Smart Calendar (Global & Personal)",
                  "Integrated Lost & Found & Feeds",
                  "Direct PLC System Exposure",
                ].map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:border-[#EFBF04] transition-colors"
                  >
                    <CheckCircle2
                      size={22}
                      className="text-[#EFBF04] shrink-0"
                    />
                    <span className="text-gray-700 font-medium font-montserrat">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Visual: Abstract Dashboard Representation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2"
            >
              <div className="relative h-[400px] w-full bg-[#1a1a1a] rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden group border border-gray-800">
                {/* Background Decoration */}
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#EFBF04]/20 to-transparent rounded-full blur-3xl" />

                {/* Mock UI Card - Calendar/Dashboard */}
                <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 transform group-hover:scale-105 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-3 w-24 bg-white/20 rounded-full" />
                    <div className="h-8 w-8 rounded-full bg-[#EFBF04] flex items-center justify-center text-[#8B0E0E]">
                      <Calendar size={16} />
                    </div>
                  </div>
                  {/* Fake Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="h-6 rounded bg-white/5" />
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(28)].map((_, i) => {
                      // Subtle visual indicator for event days
                      const isEvent = i === 12 || i === 18;
                      return (
                        <div
                          key={i}
                          className={`h-8 rounded relative flex items-center justify-center ${
                            isEvent ? "bg-[#8B0E0E]/80" : "bg-white/5"
                          }`}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Mock Notification Popup (Replaces the old tiny text) */}
                  <div className="mt-5 bg-[#2a2a2a] p-3 rounded-xl border border-white/10 flex items-center gap-3 shadow-lg">
                    <div className="w-8 h-8 rounded-full bg-[#8B0E0E] flex items-center justify-center text-white shrink-0">
                      <Bell size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-24 bg-white/40 rounded-full mb-1.5" />
                      <div className="h-1.5 w-full bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectInfoSection;
