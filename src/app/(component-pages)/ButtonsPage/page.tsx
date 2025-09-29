"use client";

import Button, {
  ImageButton,
  TextButton,
} from "@/app/component/ReusableComponent/Buttons";

export default function ButtonPage() {
  return (
    <div className="p-4 justify-center items-center flex min-h-screen">
      <Button text="Click Me" />
      <TextButton text="Hello" />
      <ImageButton src="Open Eye Icon.svg" />
    </div>
  );
}
