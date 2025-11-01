// app/Message/layout.tsx
import ChatSidebar from "@/app/component/ReusableComponent/HomepageTab/sidebar";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab/HomepageTab";

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This outer div ensures the layout doesn't break
    <div>
      {/*
        [Image of a component layout diagram showing a fixed header (`HomepageTab`) at the top, and a full-screen content `div` (with `pt-[80px]`) positioned underneath it. The content `div` is split into a `ChatSidebar` and the `main` content area.]
      */}

      {/* 1. The header (fixed to top) */}
      <HomepageTab />

      {/* 2. The main chat UI container */}
      {/* This has padding-top to sit BELOW the 80px fixed header */}
      <div className="flex h-screen w-full pt-[80px]">
        {/* COLUMN 1: Your sidebar */}
        <ChatSidebar />

        {/* COLUMN 2: The content (your page) */}
        <main className="flex-1 h-full bg-white">{children}</main>
      </div>
    </div>
  );
}
