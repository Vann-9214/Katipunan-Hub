"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface SignInFormProps {
  onClose?: () => void;
}

export default function SignInForm({ onClose }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("login", { email, password });

    // ✅ After login, redirect to /announcement
    router.push("/announcement");
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex w-[90%] max-w-[1200px] h-[min(90vh,770px)] bg-white rounded-[20px] shadow-md relative overflow-hidden">
        {/* Left Panel */}
        <div className="bg-[linear-gradient(to_bottom,#800000,#5A0505)] w-[530px] max-h-full m-[10px] rounded-[20px] p-10">
          <h1
            className="font-bold text-white select-none"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(18px,4.5vw,32px)",
            }}
          >
            Your Gateway to Connection and Growth.
          </h1>
          <p
            className="text-white select-none mt-3"
            style={{
              fontFamily: "PT sans, sans-serif",
              fontSize: "clamp(12px,4.5vw,20px)",
            }}
          >
            Katipunan Hub brings together everything you need to thrive as a
            Teknoy. Stay updated with announcements, manage your schedule with
            ease, connect with peers through groups and chats, and access
            resources that support both learning and campus life. All in one
            platform designed for you.
          </p>
        </div>

        {/* Right Panel */}
        <div className="ml-8 mt-8 flex flex-col flex-1 p-8">
          <div>
            <Logo />
            <p
              className="text-[30px] select-none mt-2"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Welcome, Teknoy!
            </p>
            <div className="w-[540px] h-[50px] bg-white rounded-[30px] border mt-5 flex justify-between items-center px-[5px]">
              <Button
                text="Sign In"
                textcolor="text-white"
                bg="bg-maroon"
                height="h-[40px]"
                width="w-[260px]"
              />
              <TextButton text="Sign Up" className="mr-[70px]" />
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between flex-1 gap-4 mt-5 w-full max-w-[540px]"
          >
            <div className="flex flex-col gap-4">
              <TextBox
                type="email"
                placeholder="CIT Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightImageSrc="/Email Icon.svg"
                rightImageAlt="email icon"
                rightImageWidth={25}
                rightImageHeight={25}
                className="w-full"
              />
              <TextBox
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightImageSrc="/Open Eye Icon.svg"
                rightImageAlt="password icon"
                rightImageWidth={25}
                rightImageHeight={25}
                className="w-full"
              />
            </div>

            <div className="pt-2">
              {/* ✅ submit button triggers redirect */}
              <Button text="Log in" width="w-full" type="submit" />
            </div>
          </form>
        </div>

        {/* Close Button */}
        <div>
          <TextButton
            text="X"
            onClick={onClose}
            className="absolute top-3 right-3"
          />
        </div>
      </div>
    </div>
  );
}