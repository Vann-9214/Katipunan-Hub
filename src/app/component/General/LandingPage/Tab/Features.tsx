"use client";

import { motion } from "framer-motion";
import LandingPageComponent from "./LandingPageTab"; // 👈 import your navbar

export default function Features() {
  return (
    <motion.section
      id="feature"
      initial={{ opacity: 0, y: 50 }} // 👈 fade-in + small slide up
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.5 }} // 👈 trigger only when 50% in view
      className="h-screen relative flex flex-col"
      style={{
        backgroundImage: "url('/Rectangle.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Navigation tab stays fixed on top */}
      <LandingPageComponent />

      {/* Main content placeholder */}
      <div className="flex-1 flex justify-center items-center text-white">
        <h1 className="text-5xl font-bold">Features</h1>
      </div>
    </motion.section>
  );
}