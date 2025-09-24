"use client";
import { useState } from "react";
import SignInForm from "@/app/component/General/LandingPage/Tab/SignInForms";

export default function LandingPageContent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    // ⬇️ only position content, don’t override background here
    <div className="absolute top-[160px] left-[150px] max-w-[600px] text-white z-10">
      {/* Headlines */}
      <div className="flex items-baseline">
        <span
          className="text-[96px] font-bold text-[#efbf04]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          STAY
        </span>
        <span
          className="ml-[8px] text-[64px] font-bold text-white"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          UPDATED
        </span>
      </div>
      <div className="flex items-baseline ml-[80px]">
        <span
          className="text-[96px] font-bold text-[#efbf04]"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          STAY
        </span>
        <span
          className="ml-[8px] text-[64px] font-bold text-white"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          CONNECTED
        </span>
      </div>

      {/* Subtitle */}
      <p
        className="mt-[20px] text-[20px] leading-[1.5] text-white"
        style={{ fontFamily: "'PT Sans', sans-serif" }}
      >
        From school events to lost &amp; found, Katipunan Hub keeps the whole
        CIT community in one place
      </p>

      {/* CTA buttons */}
      <div className="flex gap-[30px] mt-[40px]">
        <button
          className="bg-[#efbf04] text-black px-[55px] py-[20px] rounded-full font-semibold text-[21px] border-none cursor-pointer"
          onClick={() => setShowSignIn(true)}
        >
          Join Hub
        </button>
        <button className="bg-transparent text-white px-[55px] py-[20px] rounded-full font-semibold text-[21px] border-[3px] border-white cursor-pointer">
          Learn More
        </button>
      </div>

      {/* Sign In Form modal */}
      {showSignIn && <SignInForm onClose={() => setShowSignIn(false)} />}
    </div>
  );
}