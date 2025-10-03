"use client";

import LandingPageTab from "@/app/component/General/LandingPage/Tab/LandingPageTab";
import Button from "@/app/component/ReusableComponent/Buttons";
import SignUpForm from "@/app/component/General/LandingPage/Tab/SignUpForms";
import { useState } from "react";
export default function LandingPageBG() {
  const [openSignUpForm, setOpenSignUpForm] = useState(false);

  return (
    <div className="bg-gold h-screen w-full relative overflow-hidden flex">
      <LandingPageTab />

      {/* Texts */}
      <div
        className="relative z-1 px-24 select-none"
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <h1 className="mt-40 leading-[1.1]">
          <span className="text-gold font-bold text-[96px]">STAY </span>{" "}
          <span className="text-white font-bold text-[64px]">UPDATED</span>
          <br />
          <span className="text-gold font-bold text-[96px] pl-20">
            STAY{" "}
          </span>{" "}
          <span className="text-white font-bold text-[64px]">CONNECTED</span>
          <br />
        </h1>
        <p
          className="text-[28px] text-gray-200 font-bold mt-10"
          style={{ fontFamily: "PT Sans, sans-serif" }}
        >
          From school events to lost & found, Katipunan Hub keeps
          <br />{" "}
          <span className="ml-25">the whole CIT community in one place</span>
        </p>

        {/* Buttons */}
        <Button
          text="JOIN THE HUB"
          bg="bg-gold"
          font="font-bold"
          className="mt-5 ml-20"
          onClick={() => setOpenSignUpForm(true)}
        />
      </div>
      {openSignUpForm && (
        <SignUpForm onClose={() => setOpenSignUpForm(false)} />
      )}
      {/* Background circle */}
      <div className="absolute -top-180 -left-80 w-[1400px] h-[1400px] rounded-full bg-maroon z-0" />
    </div>
  );
}