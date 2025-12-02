"use client";

import Logo from "@/app/component/ReusableComponent/Logo";

import SignUpForm from "./SignUpForms";

import SignInForm from "./SignInForms";

import Button from "../../../ReusableComponent/Buttons";

import { useState, useEffect } from "react";

// FIXED: Imported Variants type

import { AnimatePresence, motion, Variants } from "framer-motion";

import { createPortal } from "react-dom";

// --- Custom Liquid Glass Component ---

const LiquidGlassBar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`

      relative

      bg-white/25

      backdrop-blur-xl

      border border-white/40

      shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]

      rounded-full

      flex items-center justify-between

      before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:to-transparent before:opacity-50 before:pointer-events-none before:rounded-full

      ${className}

    `}
  >
    {children}
  </div>
);

// --- Portal Wrapper ---

const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(children, document.body);
};

// --- Animation Variants for Modal Switching ---

// FIXED: Explicitly typed as Variants to avoid string literal errors

const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },

  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },

  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// Cleaned up AuthMode: 'updatepassword' is removed as it's now internal to ForgotPasswordForm
type AuthMode = "signin" | "signup" | "forgotpassword" | "verify" | null;

export default function LandingPageTab() {
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const handleClose = () => setAuthMode(null);

  const handleSwitchToSignUp = () => setAuthMode("signup");

  const handleSwitchToSignIn = () => setAuthMode("signin");

  return (
    <>
      <div className="z-50 fixed top-0 left-0 w-full flex justify-center pt-6 px-4 pointer-events-none">
        <LiquidGlassBar className="w-full max-w-7xl h-[80px] px-6 lg:px-10 pointer-events-auto transition-all duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)] hover:bg-white/30">
          <div className="flex-shrink-0">
            <Logo />
          </div>

          <div className="flex gap-4 items-center">
            <Button
              text="Log in"
              onClick={() => setAuthMode("signin")}
              className="hover:opacity-70 transition-opacity"
            />

            <Button
              text="Sign Up"
              bg="bg-[#DAA520]"
              rounded="rounded-full"
              onClick={() => setAuthMode("signup")}
              className="shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
            />
          </div>
        </LiquidGlassBar>
      </div>

      <AnimatePresence mode="wait">
        {authMode === "signin" && (
          <ModalWrapper key="signin-modal">
            <motion.div
              key="signin"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            >
              <div className="pointer-events-auto w-full h-full flex items-center justify-center">
                <SignInForm
                  onClose={handleClose}
                  onSwitchToSignUp={handleSwitchToSignUp}
                />
              </div>
            </motion.div>
          </ModalWrapper>
        )}

        {authMode === "signup" && (
          <ModalWrapper key="signup-modal">
            <motion.div
              key="signup"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            >
              <div className="pointer-events-auto w-full h-full flex items-center justify-center">
                <SignUpForm
                  onClose={handleClose}
                  onSwitch={handleSwitchToSignIn}
                />
              </div>
            </motion.div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </>
  );
}
