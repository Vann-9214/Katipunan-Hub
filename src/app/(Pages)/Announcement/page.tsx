"use client";

import HomepageTab from "@/app/component/ReusableComponent/HomepageTab";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import Button, { TextButton } from "@/app/component/ReusableComponent/Buttons";
import { useEffect, useRef, useState } from "react";
import Posts from "../../component/General/Announcement/Posts";
import UploadButton from "../../component/General/Announcement/UploadButton";

export default function AnnouncementPage() {
  const [images, setImages] = useState<string[]>([]);

  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      createdUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      createdUrlsRef.current.clear();
    };
  }, []);

  const handleUpload = (urls: string[]) => {
    urls.forEach((u) => createdUrlsRef.current.add(u));
    setImages((prev) => [...prev, ...urls]);
  };

  return (
    <div className="p-[25px] flex-col">
      <HomepageTab />
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[160px] mb-[15px]">
        Announcement
      </h1>
      {/* Below Announcement */}
      <div className="flex gap-10">
        {/* Posts Side */}
        <div className=" space-y-8">
          {/* Posts (only renders images passed to it) */}
          <Posts
            title="My Event Title"
            description="Detailed description about the event..."
            date="2025-10-05"
            images={images}
          />

          <Posts
            title="My Event Title"
            description="Detailed description about the event..."
            date="2025-10-05"
            images={images}
          />
        </div>
        {/* Filter Side */}
        <div className="ml-210 fixed w-[540px]">
          <ToggleButton
            leftLabel="Announcement"
            rightLabel="Highlights"
            leftActiveBg="bg-maroon"
            rightActiveBg="bg-maroon"
          />
        </div>
      </div>
      {/* Upload area — separate from Posts */}
      <div>
        <UploadButton onUpload={handleUpload} />
      </div>
    </div>
  );
}
