"use client";

import Logo from "@/app/component/ReusableComponent/Logo";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Button, { TextButton } from "../../../ReusableComponent/Buttons";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type AuthMode = "signin" | "signup" | null;

export default function LandingPageTab() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const pathname = usePathname();

  const handleClose = () => setAuthMode(null);
  const handleSwitchToSignUp = () => setAuthMode("signup");
  const handleSwitchToSignIn = () => setAuthMode("signin");

  const handleHomeClick = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" }); // already on home page scroll up
    } else {
      window.location.href = "/"; // forces full reload and goes landing page
    }
  };

  const handleAboutUsClick = () => {
    if (pathname === "/AboutUs") {
      window.scrollTo({ top: 0, behavior: "smooth" }); // already on home page scroll up
    } else {
      window.location.href = "/AboutUs"; // forces full reload and goes AboutUs
    }
  };

  const handleFeaturesClick = () => {
    if (pathname === "/Features") {
      window.scrollTo({ top: 0, behavior: "smooth" }); // already on home page scroll up
    } else {
      window.location.href = "/Features"; // forces full reload and goes Features
    }
  };

  return (
    // Fixed White Tab
    <div className="z-50 fixed top-0 left-0 py-2 flex shadow-md bg-white w-full h-auto min-h-[60px] max-h-[80px] justify-between items-center">
      {/* Logo */}
      <div className="ml-10">
        <Logo />
      </div>
      {/* Buttons */}
      <div className="flex gap-5">
        <div className="flex gap-2">
          <TextButton onClick={handleHomeClick} text="Home" />
          <TextButton onClick={handleFeaturesClick} text="Feature" />
          <TextButton onClick={handleAboutUsClick} text="About Us" />
        </div>

        <Button text="Log in" onClick={() => setAuthMode("signin")} />
        <Button
          text="Sign Up"
          bg="bg-[#DAA520]"
          rounded="rounded-l-[30px] rounded-r-none"
          onClick={() => setAuthMode("signup")}
        />
      </div>

      <AnimatePresence mode="wait">
        {authMode === "signin" && (
          <SignInForm
            key="signin"
            onClose={handleClose}
            onSwitch={handleSwitchToSignUp}
          />
        )}
        {authMode === "signup" && (
          <SignUpForm
            key="signup"
            onClose={handleClose}
            onSwitch={handleSwitchToSignIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
