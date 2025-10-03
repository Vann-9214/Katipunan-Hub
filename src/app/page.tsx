"use client";

import LandingPageBG from "@/app/component/General/LandingPageBG";
import Features from "@/app/component/General/LandingPage/Tab/Features";
import Aboutus from "@/app/component/General/LandingPage/Tab/Aboutus";

export default function LandingPage() {
  return (
    <>
      <LandingPageBG />
      <Features />
      <Aboutus />
    </>
  );
}