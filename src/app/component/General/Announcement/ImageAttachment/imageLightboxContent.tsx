"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
// Import the component you just created
import ImageLightbox from "./imageLightbox";

// This is what the hook will provide
interface ImageLightboxContextType {
  openLightbox: (images: string[], startIndex: number) => void;
}

// Internal state for the provider
interface LightboxState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
}

const ImageLightboxContext = createContext<
  ImageLightboxContextType | undefined
>(undefined);

export const ImageLightboxProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, setState] = useState<LightboxState>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });

  const openLightbox = useCallback((images: string[], startIndex: number) => {
    setState({ isOpen: true, images, currentIndex: startIndex });
  }, []);

  const closeLightbox = useCallback(() => {
    setState({ isOpen: false, images: [], currentIndex: 0 });
  }, []);

  const nextImage = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex + 1) % s.images.length,
    }));
  }, []);

  const prevImage = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex - 1 + s.images.length) % s.images.length,
    }));
  }, []);

  return (
    <ImageLightboxContext.Provider value={{ openLightbox }}>
      {children}

      {/* The Lightbox component is rendered here, at the top level,
        but it will only be visible when state.isOpen is true.
      */}
      <ImageLightbox
        {...state}
        onClose={closeLightbox}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </ImageLightboxContext.Provider>
  );
};

// This is the hook you will use in your components
export const useImageLightbox = () => {
  const context = useContext(ImageLightboxContext);
  if (!context) {
    throw new Error(
      "useImageLightbox must be used within an ImageLightboxProvider"
    );
  }
  return context;
};
