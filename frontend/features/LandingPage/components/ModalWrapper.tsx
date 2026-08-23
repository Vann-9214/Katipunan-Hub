"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ModalWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
