"use client";

import Background from "@/app/component/ReusableComponent/Background";
import LandingPageTab from "@/app/component/General/LandingPage/Tab/LandingPageTab";
import LandingPageContent from "@/app/component/General/LandingPage/Tab/LandingPageContent";
import Features from "@/app/component/General/LandingPage/Tab/Features";
import Aboutus from "@/app/component/General/LandingPage/Tab/Aboutus";

export default function LandingPage() {
  return (
    <Background>
      <LandingPageTab />
      <LandingPageContent />
      <Features />
      <Aboutus />
    </Background>
  );
}