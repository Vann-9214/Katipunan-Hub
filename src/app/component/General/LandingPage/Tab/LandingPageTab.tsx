"use client";

import Logo from "@/app/component/ReusableComponent/Logo";
import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Button, { TextButton } from "../../../ReusableComponent/Buttons";
import { useState } from "react";

export default function LandingPageComponent() {
  const [openSignInForm, setOpenSignInForm] = useState(false);
  const [openSignUpForm, setOpenSignUpForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Home"); // ✅ track which tab is active

  const navItems = ["Home", "Feature", "About Us"];

  return (
    <div className="fixed top-0 left-0 py-2 flex shadow-md bg-white w-full h-auto min-h-[70px] max-h-[100px] justify-between items-center z-50">
      <div className="ml-10">
        <Logo />
      </div>
      <div className="flex gap-5 items-center">
        <div className="flex gap-6">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveTab(item);
                if (item === "Home") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className={`relative pb-1 text-base font-medium transition-colors ${
                activeTab === item
                  ? "text-[#DAA520] after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[3px] after:bg-[#800000]"
                  : "text-gray-800 hover:text-[#800000]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <Button text="Log in" onClick={() => setOpenSignInForm(true)} />
        <Button
          text="Sign Up"
          bg="bg-[#DAA520]"
          rounded="rounded-l-[30px] rounded-r-none"
          width="w-[140px]"
          onClick={() => setOpenSignUpForm(true)}
        />
      </div>
      {openSignInForm && (
        <SignInForm onClose={() => setOpenSignInForm(false)} />
      )}
      {openSignUpForm && (
        <SignUpForm onClose={() => setOpenSignUpForm(false)} />
      )}
    </div>
  );
}