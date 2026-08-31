"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Logo from "@/components/Logo";
import Button from "@/components/Buttons";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import ModalWrapper from "./ModalWrapper";
import { AuthMode } from "../utils/types";
import {
  AUTH_PANEL_RESTING_OFFSET,
  modalSlideTransition,
} from "../utils/variants";

export type { AuthMode };

interface LandingPageTabProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
}

const LiquidGlassBar = ({
  children,
  className = "",
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

/**
 * One sliding auth panel.
 *
 * Two things keep this at 60fps, both of which were measured rather than guessed:
 *
 * 1. The panel is promoted to its own compositor layer while it moves. Without that,
 *    Chrome repaints the whole 1050x650 subtree every frame AND re-rasterises the
 *    full-viewport backdrop-blur underneath it — ~617ms of stalled frames on a
 *    4x-throttled CPU. We release the layer at rest so an idle modal isn't holding a
 *    large texture while the user fills the form in.
 *
 * 2. Both panels stay mounted for the lifetime of the modal, so a switch is pure
 *    transform work. Mounting the incoming form mid-transition cost a further 67ms
 *    (4x) to 133ms (6x) stall right as the slide began, which read as the animation
 *    starting late rather than as a low frame rate.
 */
function AuthPanel({
  active,
  restingOffset,
  children,
}: {
  active: boolean;
  restingOffset: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [moving, setMoving] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={{ x: active ? "0%" : restingOffset }}
      transition={modalSlideTransition}
      onAnimationStart={() => setMoving(true)}
      onAnimationComplete={() => {
        setMoving(false);
        // Both forms are always mounted, so `autoFocus` can't do this for us — it only
        // fires on mount and would fight between the two panels. Focus after the slide
        // settles so focusing can't scroll a panel that's still in flight.
        if (active) ref.current?.querySelector("input")?.focus();
      }}
      style={{
        willChange: moving ? "transform" : "auto",
        backfaceVisibility: "hidden",
      }}
      // Keeps the off-screen form out of the tab order and away from screen readers.
      inert={!active}
      className="absolute inset-0 w-full h-full"
    >
      {children}
    </motion.div>
  );
}

export default function LandingPageTab({
  authMode,
  setAuthMode,
}: LandingPageTabProps) {
  // Stable identities so the memoised forms can bail out of re-rendering when authMode
  // flips — without this, memo() never gets a chance to help.
  const handleClose = useCallback(() => setAuthMode(null), [setAuthMode]);
  const handleSwitchToSignUp = useCallback(
    () => setAuthMode("signup"),
    [setAuthMode]
  );
  const handleSwitchToSignIn = useCallback(
    () => setAuthMode("signin"),
    [setAuthMode]
  );

  return (
    <>
      <div className="z-50 fixed top-0 left-0 w-full flex justify-center pt-6 px-4 pointer-events-none">
        <LiquidGlassBar className="w-full max-w-7xl h-[80px] px-6 lg:px-10 pointer-events-auto transition-shadow duration-300 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]">
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
                  <AuthPanel
                    active={authMode === "signin"}
                    restingOffset={AUTH_PANEL_RESTING_OFFSET.signin}
                  >
                    <SignInForm
                      onClose={handleClose}
                      onSwitchToSignUp={handleSwitchToSignUp}
                    />
                  </AuthPanel>

                  <AuthPanel
                    active={authMode === "signup"}
                    restingOffset={AUTH_PANEL_RESTING_OFFSET.signup}
                  >
                    <SignUpForm
                      onClose={handleClose}
                      onSwitch={handleSwitchToSignIn}
                    />
                  </AuthPanel>
                </div>
              </div>
            </motion.div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </>
  );
}
