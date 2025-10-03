"use client";

import TextBox from "@/app/component/ReusableComponent/Textbox";

export default function TextboxPage() {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4">
      {/* Non Click */}
      <TextBox
        type="email"
        width="w-100"
        placeholder="Cit Email"
        rightImageSrc="Email Icon.svg"
        rightImageAlt="email icon"
        rightImageWidth={25}
        rightImageHeight={25}
      />
      {/* Click 1*/}
      <TextBox
        type="password"
        width="w-100"
        placeholder="Password"
        rightImageSrc="Open Eye Icon.svg"
        rightImageAlt="password icon"
        rightImageWidth={25}
        rightImageHeight={25}
        overrideTypeOnToggle={["password", "text"]}
        onRightClick={() => console.log("Right icon clicked")}
      />
      {/* Click 2 */}
      <TextBox
        type="password"
        width="w-100"
        placeholder="Password"
        rightImageSrc="Open Eye Icon.svg"
        rightImageAlt="password icon"
        rightToggleImageSrc="Eye Off.svg"
        rightImageWidth={25}
        rightImageHeight={25}
        overrideTypeOnToggle={["password", "text"]}
        onRightClick={() => console.log("Right icon clicked")}
      />
    </div>
  );
}
