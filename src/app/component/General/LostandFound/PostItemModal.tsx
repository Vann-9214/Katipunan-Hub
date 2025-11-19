"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, Check, Laptop, Book, Shirt, Blocks, UploadCloud } from "lucide-react";

// --- Type definitions (No Change) ---
type ModalCategory =
  | "Electronics"
  | "Wallets"
  | "Books"
  | "Clothing"
  | "Other"
  | "Select Category";

// --- Icon Helper (No Change) ---
const modalCategoryIcons: { [key in ModalCategory]?: React.ReactNode } = {
  "Electronics": <Laptop size={18} />,
  "Books": <Book size={18} />,
  "Clothing": <Shirt size={18} />,
  "Other": <Blocks size={18} />,
};

interface PostItemModalProps {
  onClose: () => void;
  onPublish: (data: any) => void;
}

export default function PostItemModal({ onClose, onPublish }: PostItemModalProps) {
  // --- State for Modal Inputs (No Change) ---
  const [itemName, setItemName] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [itemType, setItemType] = useState<"Lost" | "Found" | null>(null);
  const [itemLocation, setItemLocation] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // --- State for Category Dropdown in Modal (No Change) ---
  const [showModalCategoryDropdown, setShowModalCategoryDropdown] = useState<boolean>(false);
  const [selectedModalCategory, setSelectedModalCategory] =
    useState<ModalCategory>("Select Category");
  const modalCategories: ModalCategory[] = [
    "Electronics",
    "Books",
    "Clothing",
    "Other",
  ];

  // --- Ref for Modal Click-Away (No Change) ---
  const modalRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // --- Click-Away Logic (No Change) ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowModalCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Drag & Drop Handlers (No Change) ---
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

  // --- Publish Handler (No Change) ---
  const handlePublishClick = () => {
    if (!itemName || !itemDescription || !itemType || !itemLocation || selectedModalCategory === "Select Category" || !attachment) {
      alert("Please fill in all fields and add an attachment.");
      return;
    }
    const postData = {
      itemName,
      itemDescription,
      itemType,
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
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
        className="relative rounded-3xl w-[600px] max-h-[95vh] overflow-y-auto"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()} 
        style={{
          backgroundColor: "rgba(255, 250, 245, 0.75)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 4px 60px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
        }}
      >
        <motion.div
          className="w-full p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.05 } }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100/50 hover:bg-gray-200/70 text-gray-800 z-10"
          >
            <X size={20} />
          </button>

          <h2 className="text-3xl font-extrabold text-[#800000] mb-4">Post Item</h2>

          {/* Input: Item Name */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter name of the item..."
              className="w-full p-4 bg-[#800000] text-white rounded-xl focus:outline-none placeholder-white placeholder-opacity-70"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Input: Detailed Information */}
          <div className="mb-4">
            <textarea
              placeholder="Enter detailed information to be shared with the community..."
              className="w-full p-4 bg-[#800000] text-white rounded-xl focus:outline-none placeholder-white placeholder-opacity-70 resize-none"
              rows={4}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Type & Category Selection */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-lg font-semibold text-gray-700">Type</span>
            
            <div className="flex space-x-2">
              <button
                className={`px-6 py-3 rounded-full font-semibold transition-all text-white ${
                  itemType === "Lost" ? "bg-red-900 ring-4 ring-yellow-400" : "bg-[#800000] hover:bg-red-900"
                }`}
                onClick={() => setItemType("Lost")}
              >
                Lost
              </button>
              <button
                className={`px-6 py-3 rounded-full font-semibold transition-all text-white ${
                  itemType === "Found" ? "bg-red-900 ring-4 ring-yellow-400" : "bg-[#800000] hover:bg-red-900"
                }`}
                onClick={() => setItemType("Found")}
              >
                Found
              </button>
            </div>

            {/* --- CATEGORY DROPDOWN FIXES: Covers button and has consistent glassmorphism --- */}
            <div className="relative flex-grow" ref={categoryDropdownRef}>
              <button
                className="flex items-center justify-between px-5 py-3 bg-[#800000] text-white rounded-full font-medium hover:bg-red-900 w-full"
                onClick={() => setShowModalCategoryDropdown(!showModalCategoryDropdown)}
              >
                <span className="truncate">{selectedModalCategory}</span>
                <ChevronDown size={20} />
              </button>
              {showModalCategoryDropdown && (
                <div 
                  className="absolute top-0 left-0 w-full rounded-xl shadow-lg z-50 overflow-hidden p-2 animate-fadeIn"
                  // --- STYLE MATCHES MAIN MODAL ---
                  style={{
                    backgroundColor: "rgba(255, 250, 245, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 60px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                  }}
                >
                  {modalCategories.map(category => (
                    <button
                      key={category}
                      className={`flex items-center justify-start gap-2 w-full px-5 pl-6 py-3 font-medium rounded-full mb-1 last:mb-0 transition-all ${
                        selectedModalCategory === category
                          ? 'bg-yellow-400 text-black'
                          : 'bg-yellow-300 text-gray-700 hover:bg-yellow-400'
                      }`}
                      onClick={() => {
                        setSelectedModalCategory(category);
                        setShowModalCategoryDropdown(false);
                      }}
                    >
                      {modalCategoryIcons[category] || <Blocks size={18} />}
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* --- END OF CATEGORY DROPDOWN FIXES --- */}

          </div>

          {/* Input: Location */}
          <div className="mb-4">
            <span className="text-lg font-semibold text-gray-700 block mb-2">Location</span>
            <input
              type="text"
              placeholder="Enter location where it was lost or found..."
              className="w-full p-4 bg-[#800000] text-white rounded-xl focus:outline-none placeholder-white placeholder-opacity-70"
              value={itemLocation}
              onChange={(e) => setItemLocation(e.target.value)}
            />
          </div>

          {/* Attachment */}
          <div className="mb-6">
            <span className="text-lg font-semibold text-gray-700 block mb-2">Attachment</span>
            <div
              className="w-full h-32 bg-[#800000] rounded-xl flex items-center justify-center border-2 border-dashed border-white text-white p-4 text-center cursor-pointer relative"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              {attachment ? (
                <p>{attachment.name}</p>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={30} className="mb-2" />
                  <p>Drag & drop or click to upload an image.</p>
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
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#800000] text-white rounded-full font-semibold hover:bg-red-900 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePublishClick}
              className="px-8 py-3 bg-[#800000] text-white rounded-full font-semibold hover:bg-red-900 transition-all"
            >
              Publish
            </button>
          </div>

        </motion.div>
      </motion.div>
    </motion.div>
  );
}