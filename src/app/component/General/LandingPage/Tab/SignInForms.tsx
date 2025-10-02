"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";

interface SignInFormProps {
  onClose?: () => void;
  onSwitch?: () => void;
}

export default function SignInForm({ onClose, onSwitch }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("login", { email, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex w-[90%] max-w-[1200px] h-[min(90vh,770px)] bg-white rounded-[20px] shadow-md relative overflow-hidden"
      >
        {/* Left Side */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-[linear-gradient(to_bottom,#800000,#5A0505)] w-[530px] max-h-full m-[10px] rounded-[20px] p-10"
        >
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
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="ml-8 flex flex-col flex-1 p-8"
        >
          {/* Logo */}
          <Logo unclickable={true} />
          {/* Header */}
          <p
            className="text-[30px] select-none mt-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Welcome, Teknoy!
          </p>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-[540px] h-[50px] bg-white rounded-[30px] border border-black/40 mt-2 flex justify-between items-center px-[5px]"
          >
            <Button
              text="Sign In"
              textcolor="text-white"
              bg="bg-maroon"
              height="h-[40px]"
              width="w-[260px]"
            />
            <TextButton
              text="Sign Up"
              className="mr-[70px] text-[#7C7C7C]"
              type="button"
              onClick={onSwitch}
            />
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col justify-between flex-1 gap-4 mt-5 w-full max-w-[540px]"
          >
            <div className="flex flex-col gap-4">
              <TextBox
                type="email"
                placeholder="Cit Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightImageSrc="/Email Icon.svg"
                rightImageAlt="email icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
              />
              <TextBox
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightImageSrc="/Open Eye Icon.svg"
                rightToggleImageSrc="Eye Off.svg"
                rightImageAlt="password icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                overrideTypeOnToggle={["password", "text"]}
              />
            </div>

            <div className="pt-2">
              <Button text="Login" width="w-full" />
            </div>
          </motion.form>
        </motion.div>

        {/* Close Button */}
        <TextButton
          text="X"
          onClick={onClose}
          className="absolute top-3 right-3"
        />
      </motion.div>
    </motion.div>
  );
}
