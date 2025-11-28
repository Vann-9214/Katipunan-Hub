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
  items: { value: string; label: string; selectedPlaceholder?: string }[];
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
  dropdownRounded?: string;

  selectedTextColor?: string;

  disabled?: boolean;
  onChange?: (value: string) => void;

  defaultMode?: "none" | "first" | "value";
  defaultValue?: string | null;
  
  // 1. Add className to interface
  className?: string;
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
  textColor = "text-black/100",
  hoverBG = "hover:bg-gray-100",
  hoverTextColor = "hover:text-black/80",
  activeHoverBG = "bg-white",
  activeHoverTextColor = "text-black",
  checkArrowColor = "text-green-600",

  dropdownBG = "bg-white",
  dropdownTextColor = "text-black/70",
  dropdownHoverBG = "hover:bg-gray-200",
  dropdownHoverTextColor = "hover:text-black",
  dropdownBorderColor = "border border-gray-200",
  dropdownRounded = "rounded-[20px]",

  selectedTextColor = "text-black",

  disabled = false,
  onChange,

  defaultMode = "none",
  defaultValue = null,
  
  // 2. Destructure className
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<string>("");

  const hasItem = React.useCallback(
    (v: string | null | undefined) =>
      !!v && items && items.some((it) => it.value === v),
    [items]
  );

  React.useEffect(() => {
    if (!items || items.length === 0) {
      setValue("");
      return;
    }

    if (defaultMode === "first") {
      const v = items[0].value;
      setValue(v);
      onChange?.(v);
      return;
    }

    if (defaultMode === "value" && defaultValue && hasItem(defaultValue)) {
      setValue(defaultValue);
      onChange?.(defaultValue);
      return;
    }

    setValue("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!items || items.length === 0) {
      setValue("");
      return;
    }
    if (value && hasItem(value)) {
      return;
    }
    if (defaultMode === "first") {
      const v = items[0].value;
      setValue(v);
      onChange?.(v);
      return;
    }
    if (defaultMode === "value" && defaultValue && hasItem(defaultValue)) {
      setValue(defaultValue);
      onChange?.(defaultValue);
      return;
    }
    setValue("");
  }, [items, defaultMode, defaultValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedItem = items.find((item) => item.value === value);
  const selectedLabel = value
    ? selectedItem?.selectedPlaceholder || selectedItem?.label || placeholder
    : placeholder;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "justify-between transition-colors text-[20px] font-light font-montserrat px-4 select-none overflow-hidden",
            width,
            buttonHeight,
            rounded,
            borderColor,
            disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70"
              : [
                  buttonBG,
                  "cursor-pointer",
                  !value ? textColor : selectedTextColor,
                  hoverBG,
                  hoverTextColor,
                ],
            open ? activeHoverBG : "",
            open ? activeHoverTextColor : "",
            // 3. Apply className to the button
            className
          )}
        >
          {selectedLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      {!disabled && (
        <PopoverContent
          className={cn(
            "p-0 overflow-y-auto text-[20px] font-light font-montserrat",
            "w-[var(--radix-popover-trigger-width)]",
            dropdownHeight,
            dropdownRounded,
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
                      const newValue =
                        currentValue === value ? "" : currentValue;
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
      )}
    </Popover>
  );
}