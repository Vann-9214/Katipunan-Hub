"use client";

import { ReactNode } from "react";
import Announcement from "@/app/component/General/CorePages/Announcement";

interface AppWrapperProps {
  children: ReactNode;
  isLoggedIn: boolean;
}

export default function AppWrapper({ children, isLoggedIn }: AppWrapperProps) {
  // If logged in, show Announcement
  if (isLoggedIn) return <Announcement />;

  // Otherwise, show children
  return <>{children}</>;
}