"use client";

import { motion } from "framer-motion";
import LandingPageComponent from "./LandingPageTab"; // 👈 import your navbar

export default function Aboutus() {
  return (
    <motion.section
      id="aboutus"
      initial={{ y: "-100vh", opacity: 0 }} // start above
      whileInView={{ y: 0, opacity: 1 }}   // slide down
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}             // animate once
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
        <h1 className="text-5xl font-bold">About Us</h1>
      </div>
    </motion.section>
  );
}