"use client";

import Button, { TextButton } from "../ReusableComponent/Buttons";
import { useState } from "react";
export default function LandingPageComponent() {
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const openModal = (m: "signin" | "signup") => {
    setMode(m);
    setShow(true);
  };

  const closeModal = () => setShow(false);

  return (
    <div className="fixed top-0 left-0 flex shadow-md bg-white w-full h-[100px] justify-between items-center pl-25">
      <div>
        <h1
          style={{ fontFamily: "Montserrat, sans-serif" }}
          className="font-bold text-[33px] bg-gradient-to-r from-[#BF1B2C] to-[#6D5050] bg-clip-text text-transparent leading-none select-none"
        >
          {" "}
          KATIPUNAN
          <br />
          HUB
        </h1>
      </div>
      <div className="flex gap-8 mr-10">
        <div className="flex gap-2">
          <TextButton
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            text="Home"
          />
          <TextButton text="Feature" />
          <TextButton text="About Us" />
        </div>
        <Button text="Sign in" onClick={() => openModal("signin")} />
        <Button
          text="Sign Up"
          bg="bg-[#DAA520]"
          onClick={() => openModal("signup")}
        />
      </div>
    </div>
  );
}
