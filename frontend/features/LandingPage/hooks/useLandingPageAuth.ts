import { useState } from "react";
import { AuthMode } from "../utils/types";

export function useLandingPageAuth() {
  const [introFinished, setIntroFinished] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [direction, setDirection] = useState(0);

  const openSignUp = () => {
    setDirection(1);
    setAuthMode("signup");
  };

  const openSignIn = () => {
    setDirection(-1);
    setAuthMode("signin");
  };

  const closeModal = () => {
    setAuthMode(null);
  };

  return {
    introFinished,
    setIntroFinished,
    authMode,
    setAuthMode,
    direction,
    setDirection,
    openSignUp,
    openSignIn,
    closeModal,
  };
}
