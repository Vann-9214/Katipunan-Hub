"use client";

import { useState } from "react";
import SignInForm from "@/app/component/General/LandingPage/Tab/SignInForms";
import SignUpForm from "@/app/component/General/LandingPage/Tab/SignUpForms";

export default function SwitchMode() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleSwitchToSignUp = () => {
    setIsSignInOpen(false);
    setIsSignUpOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(true);
  };

  return (
    <div>
      <h1>Welcome to Katipunan Hub</h1>
      <button onClick={() => setIsSignInOpen(true)}>Open Sign In</button>

      {isSignInOpen && (
        <SignInForm
          onClose={() => setIsSignInOpen(false)}
          onSwitch={handleSwitchToSignUp}
        />
      )}

      {isSignUpOpen && (
        <SignUpForm
          onClose={() => setIsSignUpOpen(false)}
          onSwitch={handleSwitchToSignIn}
        />
      )}
    </div>
  );
}