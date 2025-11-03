"use client";
import React from "react";

/**
 * --- Reusable Avatar Component ---
 *
 * Displays a user's avatar with a fallback to a default SVG.
 * Handles broken image links automatically.
 *
 * @param avatarURL - The URL from Supabase (e.g., account.avatarURL)
 * @param altText - The alt text for the image (e.g., account.fullName)
 * @param className - Tailwind classes for sizing (e.g., "w-10 h-10", "w-16 h-16")
 */

// Define the props interface
interface AvatarProps {
  /** The URL for the user's avatar, (can be null or undefined) */
  avatarURL: string | null | undefined;
  /** Alt text for accessibility (e.g., user's full name) */
  altText?: string;
  /** Additional Tailwind classes for sizing, borders, etc. */
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  avatarURL,
  altText = "User Avatar", // Provides a sensible default alt text
  className = "w-10 h-10", // Sets a default size, matching your ChatPopup
}) => {
  // Path to your default avatar in the `public` folder
  const defaultAvatarPath = "/DefaultAvatar.svg";

  // Determine the source: use avatarURL if it exists, otherwise fall back to the default
  const imgSrc = avatarURL || defaultAvatarPath;

  /**
   * Handles errors if the `avatarURL` is broken or fails to load.
   * It will automatically set the image source to the default SVG.
   */
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    // Prevent an infinite loop if the default avatar also fails
    if (target.src !== defaultAvatarPath) {
      target.src = defaultAvatarPath;
    }
  };

  return (
    <img
      src={imgSrc}
      alt={altText}
      onError={handleError}
      className={`rounded-full object-cover ${className}`} // Base styles + custom classes
    />
  );
};

export default Avatar;
