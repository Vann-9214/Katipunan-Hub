"use client";

import Image from "next/image";

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

// Helper component for the navigation icons
const ChevronIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3} // Made stroke thicker for visibility
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

export default function ImageLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  // Don't render anything if it's not open or has no images
  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  // Prevent background scroll when modal is open
  // Note: You might want a more robust solution if this doesn't work
  if (typeof window !== "undefined") {
    document.body.style.overflow = "hidden";
  }

  const handleClose = () => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = "auto"; // Re-enable scroll
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Close Button (Top Right) */}
      <button
        onClick={handleClose}
        className="cursor-pointer fixed top-4 right-4 z-[70] p-2 text-white bg-black/30 rounded-full hover:bg-black/60 transition-colors"
        aria-label="Close image carousel"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Main Content (Image) */}
      <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
          <Image
            src={currentImage}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            layout="fill"
            objectFit="contain" // 'contain' shows the whole image
            key={currentImage} // Force re-render on src change
            className="select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Left Chevron */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent backdrop click
            onPrev();
          }}
          className="cursor-pointer fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[70] p-3 text-white bg-black/30 rounded-full hover:bg-black/60 transition-colors"
          aria-label="Previous image"
        >
          <ChevronIcon className="w-7 h-7" />
        </button>
      )}

      {/* Right Chevron */}
      {hasMultipleImages && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent backdrop click
            onNext();
          }}
          className="cursor-pointer fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[70] p-3 text-white bg-black/30 rounded-full hover:bg-black/60 transition-colors"
          aria-label="Next image"
        >
          <ChevronIcon className="w-7 h-7 transform rotate-180" />
        </button>
      )}
    </>
  );
}
