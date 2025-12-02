import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Layout,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";

const TECH_STACK = [
  { name: "Next.js 14", icon: <Code2 size={28} />, desc: "Framework" },
  { name: "React", icon: <Layout size={28} />, desc: "UI Library" },
  { name: "TypeScript", icon: <ShieldCheck size={28} />, desc: "Type Safety" },
  { name: "Tailwind CSS", icon: <Zap size={28} />, desc: "Styling" },
  { name: "Supabase", icon: <Database size={28} />, desc: "Database & Auth" },
  { name: "Node.js", icon: <Server size={28} />, desc: "Backend Logic" },
];

const TechStackSection = () => {
  return (
    <section className="w-full py-20 bg-[#1a1a1a] text-white relative overflow-hidden">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          {/* Left: Title */}
          <div className="lg:w-1/3">
            <h2 className="text-[#EFBF04] font-bold font-montserrat text-[48px] leading-tight mb-4">
              Built With <br /> Modern Tech
            </h2>
            <p className="text-gray-400 font-montserrat leading-relaxed">
              We utilized the latest industry-standard technologies to ensure
              Katipunan Hub is fast, secure, and scalable for the entire campus.
            </p>
          </div>

          {/* Right: Grid */}
          <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {TECH_STACK.map((tech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group cursor-default"
              >
                <div className="text-[#EFBF04] mb-3 group-hover:scale-110 transition-transform duration-300">
                  {tech.icon}
                </div>
                <h4 className="font-bold font-montserrat text-lg">
                  {tech.name}
                </h4>
                <p className="text-xs text-gray-500 font-montserrat uppercase tracking-wider mt-1">
                  {tech.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
