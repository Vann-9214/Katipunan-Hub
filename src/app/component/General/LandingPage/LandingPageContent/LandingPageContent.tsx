"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Imports for Modals and Tabs (from original structure)
import ForgotPasswordForm from "../LandingPageTab/ForgotPasswordForm";
import EmailVerificationMessage from "../LandingPageTab/EmailVerificationMessage";
import LandingPageTab from "../LandingPageTab/LandingPageTab";
import SignUpForm from "../LandingPageTab/SignUpForms";
import SignInForm from "../LandingPageTab/SignInForms";

// Imports for the new separated files
import StructuralContent from "./StructuralContent";
import { AuthMode } from "./LandingPageTypesAndUtils";

export default function LandingPageContent() {
  /**
   * STATE
   */
  const [mode, setMode] = useState<AuthMode>("none");
  const [signupEmail, setSignupEmail] = useState("");

  /**
   * HELPER FUNCTIONS (Copied from original)
   */

  const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
    if (typeof document === "undefined") return null;
    return createPortal(children, document.body);
  };

  const handleSuccessfulSignUp = (email: string) => {
    setSignupEmail(email);
    setMode("verify"); // CRITICAL: This triggers the new UI
  };

  return (
    // Changed from h-screen to min-h-screen and flex-col to allow scrolling
    <div className="bg-white min-h-screen w-full relative flex flex-col overflow-x-hidden">
      {/* LandingPageTab is fixed at the top (z-50). */}
      <LandingPageTab />

      {/* =========================================================
        MAIN CONTENT SECTIONS (Bundled into StructuralContent.tsx)
        =========================================================
      */}
      <StructuralContent setMode={setMode} />

      {/* --- Modals --- (Preserved original Modal logic) */}
      <AnimatePresence mode="wait">
        {mode === "signup" && (
          <ModalWrapper>
            <SignUpForm
              key="signup"
              onClose={() => setMode("none")}
              onSwitch={() => setMode("signin")}
              onSuccessfulSignUp={handleSuccessfulSignUp}
            />
          </ModalWrapper>
        )}
        {mode === "signin" && (
          <ModalWrapper>
            <SignInForm
              key="signin"
              onClose={() => setMode("none")}
              onSwitchToSignUp={() => setMode("signup")}
              onSwitchToForgotPassword={() => setMode("forgotpassword")}
            />
          </ModalWrapper>
        )}
        {mode === "forgotpassword" && (
          <ModalWrapper>
            <ForgotPasswordForm
              key="forgotpassword"
              onClose={() => setMode("none")}
              onSwitchToSignIn={() => setMode("signin")}
            />
          </ModalWrapper>
        )}
        {mode === "verify" && (
          <ModalWrapper>
            <EmailVerificationMessage
              key="verify"
              onClose={() => setMode("none")}
              email={signupEmail}
            />
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
