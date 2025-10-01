"use client";

import { useState } from "react";
import AppWrapper from "@/app/AppWrapper";
import Background from "@/app/component/ReusableComponent/Background";
import LandingPageTab from "@/app/component/General/LandingPage/Tab/LandingPageTab";
import LandingPageContent from "@/app/component/General/LandingPage/Tab/LandingPageContent";
import Features from "@/app/component/General/LandingPage/Tab/Features";
import Aboutus from "@/app/component/General/LandingPage/Tab/Aboutus";
import Announcement from "@/app/component/General/CorePages/Announcement"; // ✅ adjust path if different

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    console.log("✅ Login successful! Switching to announcements...");
    setIsLoggedIn(true);
  };

  return (
    <Background>
      <AppWrapper isLoggedIn={isLoggedIn}>
        {isLoggedIn ? (
          <Announcement />   
        ) : (
          <>
            <LandingPageTab onLoginSuccess={handleLoginSuccess} />
            <LandingPageContent onLoginSuccess={handleLoginSuccess} />
            <Features />
            <Aboutus />
          </>
        )}
      </AppWrapper>
    </Background>
  );
}