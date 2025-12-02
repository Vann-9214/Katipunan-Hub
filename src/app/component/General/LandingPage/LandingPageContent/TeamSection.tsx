import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Facebook, Instagram, Github } from "lucide-react";

const TEAM_MEMBERS = [
  {
    name: "Ivan Cañete",
    role: "Project Lead / Backend",
    bio: "Ensuring secure data flow and robust system architecture.",
    image: null,
  },
  {
    name: "Member Name 2",
    role: "Frontend / UI/UX",
    bio: "Crafting intuitive interfaces and smooth user experiences.",
    image: null,
  },
  {
    name: "Member Name 3",
    role: "Full Stack Developer",
    bio: "Bridging the gap between server and client for seamless interaction.",
    image: null,
  },
];

const TeamSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-black font-bold font-montserrat text-[40px] mb-2">
            Meet the Team
          </h2>
          <div className="h-1 w-20 bg-[#8B0E0E] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="group"
            >
              <div className="relative h-[350px] w-full rounded-[20px] overflow-hidden mb-6 bg-gray-100 shadow-lg">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-400 font-montserrat">
                      (Image Placeholder)
                    </span>
                  </div>
                )}

                {/* Overlay Socials */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <button className="text-white hover:text-[#EFBF04] transition-colors">
                    <Facebook />
                  </button>
                  <button className="text-white hover:text-[#EFBF04] transition-colors">
                    <Instagram />
                  </button>
                  <button className="text-white hover:text-[#EFBF04] transition-colors">
                    <Github />
                  </button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold font-montserrat text-gray-900">
                  {member.name}
                </h3>
                <p className="text-[#8B0E0E] font-medium font-montserrat text-sm mb-2">
                  {member.role}
                </p>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
