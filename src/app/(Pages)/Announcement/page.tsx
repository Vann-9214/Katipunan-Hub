"use client";

import ButtonFIlter from "@/app/component/General/Announcement/ButtonFilter";
import HomepageTab from "@/app/component/ReusableComponent/HomepageTab";
import ToggleButton from "@/app/component/ReusableComponent/ToggleButton";
import SearchFilter from "@/app/component/General/Announcement/SearchFilter";
import { useEffect, useRef, useState } from "react";
import Posts from "../../component/General/Announcement/Posts";
import UploadButton from "../../component/General/Announcement/UploadButton";

export default function AnnouncementPage() {
  const [images, setImages] = useState<string[]>([]);

  const createdUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // FIX: Capture the value of createdUrlsRef.current here
    const urlsToRevoke = createdUrlsRef.current;

    return () => {
      // Use the captured variable in the cleanup function
      urlsToRevoke.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, []); // <--- Dependency array is empty, so it only runs on mount/unmount

  const handleUpload = (urls: string[]) => {
    urls.forEach((u) => createdUrlsRef.current.add(u));
    setImages((prev) => [...prev, ...urls]);
  };

  return (
    <div className="p-[25px] flex-col">
      <HomepageTab />
      <h1 className="font-bold font-montserrat text-[32px] text-maroon mt-[150px] ">
        Announcement
      </h1>
      {/* Below Announcement */}
      <div className="flex gap-10">
        {/* Posts Side (Left) */}
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
        {/* Filter Side (Right)*/}
        <div className="ml-210 fixed w-[540px] flex flex-col gap-4">
          <ToggleButton
            leftLabel="Announcement"
            rightLabel="Highlights"
            leftActiveBg="bg-maroon"
            rightActiveBg="bg-maroon"
          />
          <SearchFilter />
          <h1 className="font-montserrat font-semibold text-[23px]">
            Filters :
          </h1>
          <ButtonFIlter />
        </div>
      </div>
      {/* Upload area — separate from Posts */}
      <div>
        <UploadButton onUpload={handleUpload} />
      </div>
    </div>
  );
}
