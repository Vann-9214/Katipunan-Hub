import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/app/component/ReusableComponent/Buttons";
import {
  containerVariants,
  itemVariants,
  floatingVariant,
  logoEntranceVariant,
  GlassCard,
} from "./LandingPageTypesAndUtils";
import { AuthMode } from "./LandingPageTypesAndUtils";

interface HeroSectionProps {
  setMode: React.Dispatch<React.SetStateAction<AuthMode>>;
}

const HeroSection: React.FC<HeroSectionProps> = ({ setMode }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#EFBF04] overflow-hidden flex flex-col justify-center">
      {/* --- Background Elements --- */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      {/* Maroon Curves */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-0 left-0 w-[80vw] h-[120vh] bg-[#8B0E0E] rounded-br-[400px] z-0 shadow-2xl"
      />

      {/* --- Main Content --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start text-left"
        >
          <motion.div variants={itemVariants}>
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1 mb-6">
              <span className="text-white font-montserrat text-sm font-semibold tracking-wide uppercase">
                Official CIT Community Platform
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="font-montserrat font-black leading-none text-white mb-6"
          >
            {/* Flip Text Animation Wrapper */}
            <div className="text-[56px] lg:text-[88px] flex flex-col gap-2">
              <span className="drop-shadow-lg text-[#EFBF04]">STAY</span>
              <div className="h-[1.1em] overflow-hidden relative">
                <div className="animate-[text-flip_6s_cubic-bezier(0.23,1,0.32,1.2)_infinite]">
                  <div className="h-[1.1em] flex items-center">CONNECTED</div>
                  <div className="h-[1.1em] flex items-center text-[#EFBF04]">
                    UPDATED
                  </div>
                  <div className="h-[1.1em] flex items-center">INFORMED</div>
                  <div className="h-[1.1em] flex items-center text-[#EFBF04]">
                    TOGETHER
                  </div>
                  <div className="h-[1.1em] flex items-center">CONNECTED</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-100/90 font-medium max-w-lg mb-10 leading-relaxed font-montserrat"
          >
            From school events to lost & found,{" "}
            <span className="text-[#EFBF04] font-bold">Katipunan Hub</span>{" "}
            centralizes everything a Wildcat needs in one secure place.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Button
              text="JOIN THE HUB"
              bg="bg-[#EFBF04]"
              textcolor="text-[#8B0E0E]"
              font="font-bold"
              textSize="text-[18px]"
              className="px-10 py-4 rounded-xl shadow-[0_10px_30px_rgba(239,191,4,0.3)] hover:shadow-[0_15px_40px_rgba(239,191,4,0.4)] hover:-translate-y-1 transition-all border-2 border-[#8B0E0E]"
              onClick={() => setMode("signup")}
            />
          </motion.div>
        </motion.div>

        {/* Right Column: Visuals */}
        <motion.div
          variants={logoEntranceVariant}
          initial="hidden"
          animate="visible"
          className="relative hidden lg:flex h-[600px] items-center justify-center"
        >
          {/* Center Logo */}
          <div className="relative z-20">
            <div className="absolute inset-0 bg-white/20 blur-[60px] rounded-full transform scale-150" />
            <Image
              src="/Logo.svg"
              alt="Katipunan Hub Logo"
              width={380}
              height={380}
              className="object-contain drop-shadow-2xl relative z-20"
              priority
            />
          </div>

          {/* Floating Elements */}
          <motion.div
            variants={floatingVariant}
            animate="float"
            className="absolute top-10 right-10 z-30"
          >
            <GlassCard className="p-4 hover:bg-white/40 transition-colors">
              <Image src="/Chat.svg" alt="Chat" width={50} height={50} />
            </GlassCard>
          </motion.div>
          <motion.div
            variants={floatingVariant}
            animate="floatReverse"
            className="absolute bottom-20 left-0 z-30"
          >
            <GlassCard className="p-4 hover:bg-white/40 transition-colors">
              <Image
                src="/Calendar.svg"
                alt="Calendar"
                width={50}
                height={50}
              />
            </GlassCard>
          </motion.div>
          <motion.div
            variants={floatingVariant}
            animate="float"
            className="absolute top-20 left-10 z-30"
          >
            <GlassCard className="p-4 hover:bg-white/40 transition-colors">
              <Image src="/found.svg" alt="Found" width={60} height={60} />
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      {/* CSS for flip text if not global */}
      <style jsx>{`
        @keyframes text-flip {
          0%,
          100% {
            margin-top: 0;
          }
          20% {
            margin-top: -1.1em;
          }
          40% {
            margin-top: -2.2em;
          }
          60% {
            margin-top: -3.3em;
          }
          80% {
            margin-top: -4.4em;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
