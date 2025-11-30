"use client";

import Logo from "@/app/component/ReusableComponent/Logo";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Button from "../../../ReusableComponent/Buttons";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ForgotPasswordForm from "./ForgotPasswordForm";
import EmailVerificationMessage from "./EmailVerificationMessage";
import { supabase } from "../../../../../../supabase/Lib/General/supabaseClient";

// Cleaned up AuthMode: 'updatepassword' is removed as it's now internal to ForgotPasswordForm
type AuthMode = "signin" | "signup" | "forgotpassword" | "verify" | null;

export default function LandingPageTab() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [signupEmail, setSignupEmail] = useState("");

  // 1. Check URL params (Only for general cleanup now)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "signin") {
      setAuthMode("signin");
      window.history.replaceState({}, "", "/");
    }
    // No need to check for 'recovery' params anymore since we use OTP
  }, []);

  const handleClose = () => setAuthMode(null);
  const handleSwitchToSignUp = () => setAuthMode("signup");
  const handleSwitchToSignIn = () => setAuthMode("signin");
  const handleSwitchToForgotPassword = () => setAuthMode("forgotpassword");

  const handleVerificationNeeded = (email: string) => {
    setSignupEmail(email);
    setAuthMode("verify");
  };

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
            onSwitchToSignUp={handleSwitchToSignUp}
            onSwitchToForgotPassword={handleSwitchToForgotPassword}
            onSwitchToVerification={handleVerificationNeeded}
          />
        )}
        {authMode === "signup" && (
          <SignUpForm
            key="signup"
            onClose={handleClose}
            onSwitch={handleSwitchToSignIn}
            onSuccessfulSignUp={handleVerificationNeeded}
          />
        )}
        {authMode === "forgotpassword" && (
          <ForgotPasswordForm
            key="forgotpassword"
            onClose={handleClose}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
        {authMode === "verify" && (
          <EmailVerificationMessage
            key="verify"
            onClose={handleClose}
            email={signupEmail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
