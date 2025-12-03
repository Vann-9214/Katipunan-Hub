"use client";

import Logo from "@/app/component/ReusableComponent/Logo";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Button from "../../../ReusableComponent/Buttons";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

// Export this type so parent can use it
export type AuthMode = "signin" | "signup" | "forgotpassword" | "verify" | null;

// --- PROPS INTERFACE ---
interface LandingPageTabProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  direction: number;
  setDirection: (dir: number) => void;
}

// ... (Keep LiquidGlassBar, ModalWrapper, and variants defined exactly as they were) ...
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

const ModalWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};

// --- MAIN COMPONENT ---
// Receives state from props instead of creating it
export default function LandingPageTab({
  authMode,
  setAuthMode,
  direction,
  setDirection,
}: LandingPageTabProps) {
  const handleClose = () => setAuthMode(null);

  const handleSwitchToSignUp = () => {
    setDirection(1); // Slide Left
    setAuthMode("signup");
  };

  const handleSwitchToSignIn = () => {
    setDirection(-1); // Slide Right
    setAuthMode("signin");
  };

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
              onClick={handleSwitchToSignIn}
              className="hover:opacity-70 transition-opacity"
            />
            <Button
              text="Sign Up"
              bg="bg-[#DAA520]"
              rounded="rounded-full"
              onClick={handleSwitchToSignUp}
              className="shadow-lg hover:shadow-xl hover:scale-105 transition-transform"
            />
          </div>
        </LiquidGlassBar>
      </div>

      <AnimatePresence>
        {authMode && (
          <ModalWrapper key="auth-modal">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] p-4"
            >
              <div className="relative w-full max-w-[1050px] h-[650px] bg-white rounded-[30px] shadow-2xl overflow-hidden">
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-800 z-50 cursor-pointer"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                <div className="relative w-full h-full">
                  <AnimatePresence
                    initial={false}
                    custom={direction}
                    mode="popLayout"
                  >
                    {authMode === "signin" && (
                      <motion.div
                        key="signin"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "tween", ease: "easeOut", duration: 0.5 },
                          opacity: { duration: 0.2 },
                        }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <SignInForm
                          onClose={handleClose}
                          onSwitchToSignUp={handleSwitchToSignUp}
                        />
                      </motion.div>
                    )}

                    {authMode === "signup" && (
                      <motion.div
                        key="signup"
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "tween", ease: "easeOut", duration: 0.5 },
                          opacity: { duration: 0.2 },
                        }}
                        className="absolute inset-0 w-full h-full"
                      >
                        <SignUpForm
                          onClose={handleClose}
                          onSwitch={handleSwitchToSignIn}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </>
  );
}
