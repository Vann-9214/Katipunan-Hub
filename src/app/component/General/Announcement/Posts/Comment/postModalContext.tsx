"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
// Make sure this import path is correct
import { PostsProps } from "@/app/component/General/Announcement/Posts/Posts";

// 1. Define the type for the onClose callback
type OnCloseCallback = () => void;

interface PostModalContextType {
  spotlightPost: PostsProps | null;
  // 2. Update openPostModal signature to accept the callback
  openPostModal: (post: PostsProps, onClose?: OnCloseCallback) => void;
  closePostModal: () => void;
}

// Provide a default value for the context
const PostModalContext = createContext<PostModalContextType | undefined>(
  undefined
);

// Create the provider component
export const PostModalProvider = ({ children }: { children: ReactNode }) => {
  const [spotlightPost, setSpotlightPost] = useState<PostsProps | null>(null);
  // 3. Add state to hold the callback
  const [onCloseCallback, setOnCloseCallback] =
    useState<OnCloseCallback | null>(null);

  // 4. Update openPostModal implementation
  const openPostModal = useCallback(
    (post: PostsProps, onClose?: OnCloseCallback) => {
      setSpotlightPost(post);
      if (onClose) {
        // Store the function so we can call it later
        setOnCloseCallback(() => onClose);
      }
    },
    []
  );

  // 5. Update closePostModal implementation
  const closePostModal = useCallback(() => {
    if (onCloseCallback) {
      onCloseCallback(); // <-- THE MAGIC! Call the stored function
    }
    setSpotlightPost(null);
    setOnCloseCallback(null); // Clear the callback
  }, [onCloseCallback]);

  return (
    <PostModalContext.Provider
      value={{ spotlightPost, openPostModal, closePostModal }}
    >
      {children}
    </PostModalContext.Provider>
  );
};

// The custom hook
export const usePostModal = () => {
  const context = useContext(PostModalContext);
  if (context === undefined) {
    throw new Error("usePostModal must be used within a PostModalProvider");
  }
  return context;
};
