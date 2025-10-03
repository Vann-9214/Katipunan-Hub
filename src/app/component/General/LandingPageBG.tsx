"use client";

import { useState } from "react";
import LandingPageTab from "@/app/component/General/LandingPage/Tab/LandingPageTab";
import Button from "@/app/component/ReusableComponent/Buttons";
import SignUpForm from "@/app/component/General/LandingPage/Tab/SignUpForms";
import SignInForm from "@/app/component/General/LandingPage/Tab/SignInForms";

export default function LandingPageBG() {
  const [openSignUpForm, setOpenSignUpForm] = useState(false);
  const [openSignInForm, setOpenSignInForm] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4c542]">
      {/* Navbar */}
      <LandingPageTab />

      {/* Background shape (maroon blob) */}
      <div
        className="absolute z-0"
        style={{
          top: "-20vh",
          left: "-5vw",
          width: "80vw",
          height: "80vw",
          maxWidth: "1200px",
          maxHeight: "1200px",
          backgroundImage: "url('/maroon-shape.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Page Content */}
      <div className="relative z-10 h-screen flex flex-col justify-center px-[150px] text-white">
        {/* Headlines */}
        <div className="flex items-baseline">
          <span className="text-[96px] font-bold text-[#efbf04] font-poppins">
            STAY
          </span>
          <span className="ml-[8px] text-[64px] font-bold text-white font-poppins">
            UPDATED
          </span>
        </div>
        <div className="flex items-baseline ml-[80px]">
          <span className="text-[96px] font-bold text-[#efbf04] font-poppins">
            STAY
          </span>
          <span className="ml-[8px] text-[64px] font-bold text-white font-poppins">
            CONNECTED
          </span>
        </div>

        {/* Subtitle */}
        <p className="mt-[20px] text-[20px] leading-[1.5] font-ptsans">
          From school events to lost &amp; found, Katipunan Hub keeps the whole
          CIT community in one place
        </p>

        {/* CTA buttons */}
        <div className="flex gap-[30px] mt-[40px]">
          <button
            className="bg-[#efbf04] text-black px-[55px] py-[20px] rounded-full font-semibold text-[21px] border-none cursor-pointer"
            onClick={() => setOpenSignInForm(true)}
          >
            Join Hub
          </button>
          <button
            className="bg-transparent text-white px-[55px] py-[20px] rounded-full font-semibold text-[21px] border-[3px] border-white cursor-pointer"
            onClick={() => {
              const section = document.getElementById("feature");
              if (section) {
                section.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Modals */}
      {openSignUpForm && <SignUpForm onClose={() => setOpenSignUpForm(false)} />}
      {openSignInForm && <SignInForm onClose={() => setOpenSignInForm(false)} />}
    </div>
  );
}