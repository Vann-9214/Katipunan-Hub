"use client";

import { useState } from "react";
import SignInForm from "./SignInForms";
import SignUpForm from "./SignUpForms";

export default function SwitchMode() {
  // State to control which form is open
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  // Function to handle switching from Sign In to Sign Up
  const handleSwitchToSignUp = () => {
    setIsSignInOpen(false); // Close the sign-in form
    setIsSignUpOpen(true); // Open the sign-up form
  };

  // You can create a similar function for the SignUpForm to switch back
  const handleSwitchToSignIn = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(true);
  };

  return (
    <div>
      {/* Your main page content */}
      <h1>Welcome to Katipunan Hub</h1>
      <button onClick={() => setIsSignInOpen(true)}>Open Sign In</button>

      {/* Conditionally render the forms based on state */}

      {isSignInOpen && (
        <SignInForm
          onClose={() => setIsSignInOpen(false)}
          onSwitch={handleSwitchToSignUp} // Pass the switch handler here
        />
      )}

      {isSignUpOpen && (
        <SignUpForm
          onClose={() => setIsSignUpOpen(false)}
          // Optional: Add an onSwitch prop to SignUpForm to switch back
          onSwitch={handleSwitchToSignIn}
        />
      )}
    </div>
  );
}
