"use client";
import React, { useState } from "react";
import Image from "next/image";

/**
 * --- Reusable Avatar Component ---
 *
 * Displays a user's avatar using next/image with a fallback to a default SVG.
 * Handles broken image links automatically.
 *
 * @param avatarURL - The URL from Supabase (e.g., account.avatarURL)
 * @param altText - The alt text for the image (e.g., account.fullName)
 * @param className - Tailwind classes for sizing (e.g., "w-10 h-10", "w-16 h-16")
 */

// Define the props interface
interface AvatarProps {
  /** The URL for the user's avatar, (can be null or undefined) */
  avatarURL:
    | string
    | null
    | undefined /** Alt text for accessibility (e.g., user's full name) */;
  altText?: string /** Additional Tailwind classes for sizing, borders, etc. */;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  avatarURL,
  altText = "User Avatar",
  className = "w-10 h-10", // Sets a default size
}) => {
  // Path to your default avatar in the `public` folder
  const defaultAvatarPath = "/DefaultAvatar.svg"; // Use state to manage the image source for error handling

  const [imgSrc, setImgSrc] = useState(avatarURL || defaultAvatarPath);

  return (
    // The Image 'fill' prop needs a parent with 'relative' and a defined size.
    // We pass the sizing className to this wrapper div.
    <div className={`relative ${className}`}>
      <Image // Use the state variable as the source
        src={imgSrc}
        alt={altText} // Use 'fill' to make the image fill the parent div
        fill // Apply styling to the Image itself
        className="rounded-full object-cover border border-black" // The 'onError' handler updates the state to the fallback
        onError={() => {
          setImgSrc(defaultAvatarPath);
        }} // Add a 'sizes' prop for performance optimization with 'fill'
        sizes="(max-width: 640px) 10vw, 5vw"
      />
    </div>
  );
};

export default Avatar;
