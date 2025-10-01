"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
  items: { value: string; label: string }[];
  placeholder?: string;
  emptyText?: string;

  width?: string; // shared width
  buttonHeight?: string; // button height
  dropdownHeight?: string; // dropdown max height
  rounded?: string; // shared rounded for both

  buttonBG?: string;
  borderColor?: string;
  textColor?: string;
  hoverBG?: string;
  hoverTextColor?: string;
  activeHoverBG?: string;
  activeHoverTextColor?: string;
  checkArrowColor?: string;

  dropdownBG?: string;
  dropdownTextColor?: string;
  dropdownHoverBG?: string;
  dropdownHoverTextColor?: string;
  dropdownBorderColor?: string;

  onChange?: (value: string) => void;
}

export function Combobox({
  items,
  placeholder = "Select option...",
  emptyText = "No items found.",

  width = "w-[200px]",
  buttonHeight = "h-9",
  dropdownHeight = "max-h-60",
  rounded = "rounded-md",

  buttonBG = "bg-white",
  borderColor = "border-gray-300",
  textColor = "text-gray-900",
  hoverBG = "hover:bg-gray-100",
  hoverTextColor = "hover:text-gray-900",
  activeHoverBG = "bg-gray-200",
  activeHoverTextColor = "text-gray-900",
  checkArrowColor = "text-green-500",

  dropdownBG = "bg-white",
  dropdownTextColor = "text-gray-900",
  dropdownHoverBG = "hover:bg-gray-100",
  dropdownHoverTextColor = "hover:text-gray-900",
  dropdownBorderColor = "border-gray-300",

  onChange,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const selectedLabel = value
    ? items.find((item) => item.value === value)?.label
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between transition-colors cursor-pointer  text-[20px] font-montserrat",
            width,
            buttonHeight,
            rounded,
            borderColor,
            buttonBG,
            textColor,
            hoverBG,
            hoverTextColor,
            open || value ? activeHoverBG : "",
            open || value ? activeHoverTextColor : ""
          )}
        >
          {selectedLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "p-0 overflow-y-auto text-[20px] font-montserrat",
          "w-[var(--radix-popover-trigger-width)]",
          dropdownHeight,
          rounded,
          dropdownBG,
          dropdownTextColor,
          dropdownBorderColor
        )}
      >
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue;
                    setValue(newValue);
                    setOpen(false);
                    onChange?.(newValue);
                  }}
                  className={cn(
                    "cursor-pointer text-[20px] font-montserrat",
                    dropdownTextColor,
                    `${dropdownHoverBG} ${dropdownHoverTextColor} !important`,
                    "data-[selected=true]:bg-maroon data-[selected=true]:text-white"
                  )}
                >
                  {item.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === item.value ? checkArrowColor : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
