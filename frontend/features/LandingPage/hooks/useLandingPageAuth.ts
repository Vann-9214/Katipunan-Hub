import { useState } from "react";
import { AuthMode } from "../utils/types";

export function useLandingPageAuth() {
  const [introFinished, setIntroFinished] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const openSignUp = () => setAuthMode("signup");
  const openSignIn = () => setAuthMode("signin");
  const closeModal = () => setAuthMode(null);

  return {
    introFinished,
    setIntroFinished,
    authMode,
    setAuthMode,
    openSignUp,
    openSignIn,
    closeModal,
  };
}
