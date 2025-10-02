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

  width?: string;
  buttonHeight?: string;
  dropdownHeight?: string;
  rounded?: string;

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

  selectedTextColor?: string;

  onChange?: (value: string) => void;
}

export function Combobox({
  items,
  placeholder = "Select option...",
  emptyText = "No items found.",

  width = "w-full",
  buttonHeight = "h-[55px]",
  dropdownHeight = "h-[300px]",
  rounded = "rounded-[30px]",

  buttonBG = "bg-white",
  borderColor = "border border-black",
  textColor = "text-customgray",
  hoverBG = "hover:bg-gray-50",
  hoverTextColor = "hover:text-black/70",
  activeHoverBG = "bg-white",
  activeHoverTextColor = "text-black",
  checkArrowColor = "text-green-600",

  dropdownBG = "bg-white",
  dropdownTextColor = "text-customgray",
  dropdownHoverBG = "hover:bg-gray-200",
  dropdownHoverTextColor = "hover:text-black",
  dropdownBorderColor = "border border-gray-200",

  selectedTextColor = "text-black",

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
            "justify-between transition-colors cursor-pointer text-[20px] font-light font-montserrat px-4 select-none",
            width,
            buttonHeight,
            rounded,
            borderColor,
            buttonBG,
            !value ? textColor : selectedTextColor,
            hoverBG,
            hoverTextColor,
            open ? activeHoverBG : "",
            open ? activeHoverTextColor : ""
          )}
        >
          {selectedLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "p-0 overflow-y-auto text-[20px] font-light font-montserrat",
          "w-[var(--radix-popover-trigger-width)]",
          dropdownHeight,
          rounded,
          dropdownBG,
          dropdownTextColor,
          dropdownBorderColor
        )}
      >
        <Command>
          <CommandInput placeholder={placeholder} className="h-9 pl-4 pr-3" />
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
                    "cursor-pointer text-[20px] font-light font-montserrat px-4",
                    dropdownTextColor,
                    dropdownHoverBG,
                    dropdownHoverTextColor,
                    value === item.value
                      ? `${selectedTextColor} font-normal`
                      : ""
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
