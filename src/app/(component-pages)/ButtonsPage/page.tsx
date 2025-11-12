"use client";

import Button, {
  ImageButton,
  TextButton,
} from "@/app/component/ReusableComponent/Buttons";

export default function ButtonPage() {
  return (
    <div className="p-6 flex flex-col items-center gap-6 min-h-screen bg-gray-50">
      <div className="flex gap-4">
        <Button text="Click Me" />
        <TextButton text="Hello" />
        <ImageButton src="Open Eye Icon.svg" />
      </div>
    </div>
  );
}
