"use client";

import { Combobox } from "@/app/component/ReusableComponent/Combobox";

export default function ComboBoxPage() {
  const frameworks = [
    { value: "next.js", label: "Next.js" },
    { value: "sveltekit", label: "SvelteKit" },
    { value: "nuxt.js", label: "Nuxt.js" },
    { value: "remix", label: "Remix" },
    { value: "astro", label: "Astro" },
  ];
  return (
    <div className="p-4 justify-center items-center flex min-h-screen">
      <Combobox
        items={frameworks}
        width="w-[300px]"
        buttonHeight="h-[50px]"
        dropdownHeight="h-[250px]"
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
    </div>
  );
}
