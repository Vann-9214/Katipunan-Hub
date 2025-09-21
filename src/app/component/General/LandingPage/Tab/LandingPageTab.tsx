"use client";

import SignUpForm from "./SignUpForms";
import SignInForm from "./SignInForms";
import Image from "next/image";
import Button, { TextButton } from "../../../ReusableComponent/Buttons";
import { useState } from "react";
export default function LandingPageComponent() {
  const [openSignInForm, setOpenSignInForm] = useState(false);
  const [openSignUpForm, setOpenSignUpForm] = useState(false);

  return (
    <div className="fixed top-0 left-0 py-2 flex shadow-md bg-white w-full h-auto min-h-[70px] max-h-[100px] justify-between items-center">
      <div className="flex items-center gap-3 ml-10">
        <Image
          src="logo.svg"
          alt="My Logo"
          width={65}
          height={80}
          draggable="false"
        />
        <h1
          style={{ fontFamily: "Montserrat, sans-serif" }}
          className="font-bold text-[25px] bg-maroon bg-clip-text text-transparent leading-none select-none"
        >
          {" "}
          KATIPUNAN
          <br />
          HUB
        </h1>
      </div>
      <div className="flex gap-5">
        <div className="flex gap-2">
          <TextButton
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            text="Home"
          />
          <TextButton text="Feature" />
          <TextButton text="About Us" />
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
