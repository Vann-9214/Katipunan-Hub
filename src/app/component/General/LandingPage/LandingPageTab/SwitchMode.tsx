"use client";

import { useState } from "react";
import SignInForm from "./SignInForms";
import SignUpForm from "./SignUpForms";

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

  const handleSwitchToForgotPassword = () => {
    console.log("Switching to Forgot Password mode.");
    handleSwitchToSignIn();
  };

  return (
    <div>
      <h1>Welcome to Katipunan Hub</h1>
      <button onClick={() => setIsSignInOpen(true)}>Open Sign In</button>

      {isSignInOpen && (
        <SignInForm
          onClose={() => setIsSignInOpen(false)}
          // FIX: Updated prop names to match the current SignInForm interface
          onSwitchToSignUp={handleSwitchToSignUp}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
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
