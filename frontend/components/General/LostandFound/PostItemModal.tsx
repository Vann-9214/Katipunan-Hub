"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  ChevronDown,
  Laptop,
  Book,
  Shirt,
  Blocks,
  UploadCloud,
  Check,
} from "lucide-react";
import { Montserrat, PT_Sans } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
// FIXED: PT Sans only supports 400 and 700
const ptSans = PT_Sans({ subsets: ["latin"], weight: ["400", "700"] });

// --- Type definitions ---
export type ModalCategory =
  | "Electronics"
  | "Wallets"
  | "Books"
  | "Clothing"
  | "Other"
  | "Select Category";

export interface ModalPostData {
  itemName: string;
  itemDescription: string;
  itemType: "Lost" | "Found";
  itemLocation: string;
  itemCategory: ModalCategory;
  attachment: File | null;
}

// --- Icon Helper ---
const modalCategoryIcons: { [key in ModalCategory]?: React.ReactNode } = {
  Electronics: <Laptop size={16} />,
  Books: <Book size={16} />,
  Clothing: <Shirt size={16} />,
  Other: <Blocks size={16} />,
};

interface PostItemModalProps {
  onClose: () => void;
  onPublish: (data: ModalPostData) => void;
}

export default function PostItemModal({
  onClose,
  onPublish,
}: PostItemModalProps) {
  // --- State for Modal Inputs ---
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemLocation, setItemLocation] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // --- State for Category Dropdown ---
  const [showModalCategoryDropdown, setShowModalCategoryDropdown] =
    useState<boolean>(false);
  const [selectedModalCategory, setSelectedModalCategory] =
    useState<ModalCategory>("Select Category");

  const modalCategories: ModalCategory[] = [
    "Electronics",
    "Books",
    "Clothing",
    "Other",
  ];

  const modalRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // --- Click-Away Logic ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowModalCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Drag & Drop Handlers ---
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachment(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  // --- Publish Handler ---
  const handlePublishClick = () => {
    if (
      !itemName ||
      !itemDescription ||
      !itemLocation ||
      selectedModalCategory === "Select Category"
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const postData: ModalPostData = {
      itemName,
      itemDescription,
      itemType: "Lost",
      itemLocation,
      itemCategory: selectedModalCategory,
      attachment,
    };

    onPublish(postData);
    onClose();
  };

  // --- RENDER ---
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <motion.div
        layoutId="post-item-modal"
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="relative rounded-3xl w-[600px] max-h-[90vh] overflow-y-auto bg-white shadow-2xl"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="w-full p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.05 } }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-10"
          >
            <X size={20} />
          </button>

          <h2
            className={`${montserrat.className} text-3xl font-extrabold text-[#1a1a1a] mb-6`}
          >
            Report Lost Item
          </h2>

          {/* Input: Item Name */}
          <div className="mb-4">
            <label
              className={`${ptSans.className} text-sm font-bold text-gray-700 block mb-1.5`}
            >
              Item Name
            </label>
            <input
              type="text"
              placeholder="Enter name of the item..."
              className={`${ptSans.className} w-full p-3.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/10 focus:border-[#8B0E0E] placeholder-gray-400 transition-all`}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Input: Detailed Information */}
          <div className="mb-4">
            <label
              className={`${ptSans.className} text-sm font-bold text-gray-700 block mb-1.5`}
            >
              Description
            </label>
            <textarea
              placeholder="Enter detailed information..."
              className={`${ptSans.className} w-full p-3.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/10 focus:border-[#8B0E0E] placeholder-gray-400 transition-all resize-none`}
              rows={4}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
            ></textarea>
          </div>

          {/* --- CATEGORY DROPDOWN --- */}
          <div className="mb-4 relative" ref={categoryDropdownRef}>
            <label
              className={`${ptSans.className} text-sm font-bold text-gray-700 block mb-1.5`}
            >
              Category
            </label>
            <button
              className={`${ptSans.className} flex items-center justify-between w-full p-3.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none hover:bg-gray-100 transition-colors text-left`}
              onClick={() =>
                setShowModalCategoryDropdown(!showModalCategoryDropdown)
              }
            >
              <span className="truncate">{selectedModalCategory}</span>
              <ChevronDown size={18} className="text-gray-400" />
            </button>
            {showModalCategoryDropdown && (
              <div className="absolute top-full left-0 w-full rounded-xl shadow-xl border border-gray-100 bg-white z-50 overflow-hidden p-1 mt-1 animate-fadeIn">
                {modalCategories.map((category) => (
                  <button
                    key={category}
                    className={`flex items-center justify-start gap-2 w-full px-4 py-2.5 text-sm font-medium rounded-lg mb-0.5 last:mb-0 transition-all ${
                      selectedModalCategory === category
                        ? "bg-[#8B0E0E] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedModalCategory(category);
                      setShowModalCategoryDropdown(false);
                    }}
                  >
                    {modalCategoryIcons[category] || <Blocks size={16} />}
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input: Location */}
          <div className="mb-4">
            <span
              className={`${ptSans.className} text-sm font-bold text-gray-700 block mb-1.5`}
            >
              Location
            </span>
            <input
              type="text"
              placeholder="Enter location..."
              className={`${ptSans.className} w-full p-3.5 bg-gray-50 border border-gray-200 text-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B0E0E]/10 focus:border-[#8B0E0E] placeholder-gray-400 transition-all`}
              value={itemLocation}
              onChange={(e) => setItemLocation(e.target.value)}
            />
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <span
              className={`${ptSans.className} text-sm font-bold text-gray-700 block mb-1.5`}
            >
              Attachment (Optional)
            </span>
            <div
              className="w-full h-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-all"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {attachment ? (
                <div className="flex items-center gap-2 text-[#8B0E0E] font-medium">
                  <Check size={18} />
                  <span className="truncate max-w-[200px]">
                    {attachment.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <UploadCloud size={24} className="text-gray-400" />
                  <p className="text-sm">Click or drag to upload</p>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>

          {/* --- BUTTONS --- */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className={`${montserrat.className} px-6 py-2.5 text-gray-500 font-bold hover:text-gray-800 transition-colors`}
            >
              Cancel
            </button>
            <button
              onClick={handlePublishClick}
              className={`${montserrat.className} px-8 py-2.5 bg-[#8B0E0E] text-white rounded-xl font-bold shadow-lg shadow-red-900/20 hover:bg-[#720b0b] hover:shadow-red-900/30 transition-all`}
            >
              Publish
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
