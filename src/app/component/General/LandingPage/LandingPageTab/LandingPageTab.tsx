"use client";

import Logo from "@/app/component/ReusableComponent/Logo";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Button from "../../../ReusableComponent/Buttons";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ForgotPasswordForm from "./ForgotPasswordForm"; // ADDED

type AuthMode = "signin" | "signup" | "forgotpassword" | null; // UPDATED

export default function LandingPageTab() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const handleClose = () => setAuthMode(null);
  const handleSwitchToSignUp = () => setAuthMode("signup");
  const handleSwitchToSignIn = () => setAuthMode("signin");
  const handleSwitchToForgotPassword = () => setAuthMode("forgotpassword"); // ADDED

  return (
    <div className="z-50 fixed top-0 left-0 py-2 flex shadow-md bg-white w-full h-auto min-h-[60px] max-h-[80px] justify-between items-center">
      <div className="ml-10">
        <Logo />
      </div>
      <div className="flex gap-5">
        <Button text="Log in" onClick={() => setAuthMode("signin")} />
        <Button
          text="Sign Up"
          bg="bg-[#DAA520]"
          rounded="rounded-l-[30px] rounded-r-none"
          onClick={() => setAuthMode("signup")}
        />
      </div>

      <AnimatePresence>
        {authMode === "signin" && (
          <SignInForm
            key="signin"
            onClose={handleClose}
            onSwitchToSignUp={handleSwitchToSignUp} // UPDATED PROP NAME
            onSwitchToForgotPassword={handleSwitchToForgotPassword} // ADDED
          />
        )}
        {authMode === "signup" && (
          <SignUpForm
            key="signup"
            onClose={handleClose}
            onSwitch={handleSwitchToSignIn}
          />
        )}
        {authMode === "forgotpassword" && ( // ADDED
          <ForgotPasswordForm
            key="forgotpassword"
            onClose={handleClose}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
