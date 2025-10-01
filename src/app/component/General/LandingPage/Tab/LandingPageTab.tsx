"use client";

import Logo from "@/app/component/ReusableComponent/Logo";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Button, { TextButton } from "../../../ReusableComponent/Buttons";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

type AuthMode = "signin" | "signup" | null;

export default function LandingPageTab() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const handleClose = () => setAuthMode(null);
  const handleSwitchToSignUp = () => setAuthMode("signup");
  const handleSwitchToSignIn = () => setAuthMode("signin");

  return (
    <div className="z-50 fixed top-0 left-0 py-2 flex shadow-md bg-white w-full h-auto min-h-[70px] max-h-[100px] justify-between items-center">
      <div className="ml-10">
        <Logo />
      </div>
      <div className="flex gap-5">
        <div className="flex gap-2">
          <TextButton
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            text="Home"
          />
          <TextButton text="Feature" />
          <TextButton text="About Us" />
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
