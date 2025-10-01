"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import Logo from "@/app/component/ReusableComponent/Logo";
import TextBox from "@/app/component/ReusableComponent/Textbox";
import { Combobox } from "@/app/component/ReusableComponent/Combobox";

interface SignUpFormProps {
  onClose?: () => void;
  onSwitch?: () => void;
}

export default function SignUpForm({ onClose, onSwitch }: SignUpFormProps) {
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [studentID, setStudentID] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("signup", {
      firstName,
      email,
      studentID,
      password,
      confirmPassword,
    });
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
          className="bg-[linear-gradient(to_bottom,#FFCB00,#B79308)] w-[530px] max-h-full m-[10px] rounded-[20px] p-10"
        >
          <h1
            className="font-bold text-white select-none"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(18px,4.5vw,32px)",
            }}
          >
            Create Your Account
          </h1>
          <p
            className="text-white select-none mt-3"
            style={{
              fontFamily: "PT sans, sans-serif",
              fontSize: "clamp(12px,4.5vw,20px)",
            }}
          >
            Join the Katipunan Hub and be part of a platform made for every
            Teknoy. Signing up gives you access to announcements, events,
            groups, chats, and tools that make campus life more connected and
            engaging.
          </p>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="ml-8 flex flex-col flex-1 p-8"
        >
          <Logo unclickable={true} />
          <p
            className="text-[30px] select-none mt-2"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Join the Katipunan Hub!
          </p>

          {/* Toggle Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-[540px] h-[50px] bg-white rounded-[30px] border mt-2 flex justify-between items-center px-[5px]"
          >
            <TextButton
              text="Sign In"
              className="ml-[75px] text-[#7C7C7C]"
              type="button"
              onClick={onSwitch}
            />
            <Button
              text="Sign Up"
              textcolor="text-white"
              bg="bg-gold"
              height="h-[40px]"
              width="w-[260px]"
              type="button"
            />
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col justify-between flex-1 gap-3 mt-5  max-w-[540px]"
          >
            <div className="flex flex-col gap-3">
              <TextBox
                type="text"
                placeholder="Full Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                rightImageSrc="/User.svg"
                rightImageAlt="user icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              <TextBox
                type="email"
                placeholder="Cit Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                rightImageSrc="/Mail Plus.svg"
                rightImageAlt="Mail Plus icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              <TextBox
                type="text"
                placeholder="Student ID"
                value={studentID}
                onChange={(e) => setStudentID(e.target.value)}
                rightImageSrc="/Id Card.svg"
                rightImageAlt="Id icon"
                rightImageWidth={30}
                rightImageHeight={30}
                className="w-full"
                height="h-[55px]"
              />
              <Combobox
                items={frameworks}
                rounded="rounded-[30px]"
                width="w-full"
                buttonHeight="h-[55px]"
                dropdownHeight="h-[300px]"
                placeholder="Pick your framework"
                emptyText="Nothing found."
                buttonBG="bg-white"
                borderColor="border-maroon"
                textColor="text-maroon"
                hoverBG="hover:bg-maroon"
                hoverTextColor="hover:text-white"
                activeHoverBG="data-[state=open]:bg-maroon"
                activeHoverTextColor="data-[state=open]:text-white"
                checkArrowColor="text-green-500"
                dropdownBG="bg-white"
                dropdownTextColor="text-maroon"
                dropdownHoverBG="hover:bg-maroon"
                dropdownHoverTextColor="hover:text-white"
                dropdownBorderColor="border-maroon"
                onChange={(val) => console.log("Selected:", val)}
              />
              <div className="flex justify-between">
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
                  width="w-[260px]"
                  overrideTypeOnToggle={["password", "text"]}
                  height="h-[55px]"
                />
                <TextBox
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  rightImageSrc="/Open Eye Icon.svg"
                  rightToggleImageSrc="Eye Off.svg"
                  rightImageAlt="password icon"
                  rightImageWidth={30}
                  rightImageHeight={30}
                  width="w-[260px]"
                  overrideTypeOnToggle={["password", "text"]}
                  height="h-[55px]"
                />
              </div>
            </div>

            <div>
              <Button text="Sign Up" bg="bg-gold" width="w-full" />
            </div>
          </motion.form>
        </motion.div>

        {/* Close */}
        <TextButton
          text="X"
          onClick={onClose}
          className="absolute top-3 right-3"
        />
      </motion.div>
    </motion.div>
  );
}
