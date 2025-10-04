"use client";

import { useState } from "react";
import ImageAttachments from "./ImageAttachments";
import UploadButton from "./UploadButton";
import Image from "next/image";
import { ImageButton, TextButton } from "../../ReusableComponent/Buttons";

export default function Posts() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <div>
      {/* Outer Post (Gold Background) */}
      <div className="w-[800px] bg-gold rounded-[30px] p-[10px]">
        {/* Inner Post (Dark Maroon Background) */}
        <div className="w-[780px] bg-darkmaroon rounded-t-[30px] flex flex-col">
          {/* Upper Section: Logo, Title, Date, Triple Dot */}
          <div className="flex items-start justify-between mt-[15px] mx-[20px]">
            {/* Logo + Title + Date */}
            <div className="flex">
              <div className="select-none">
                <Image
                  src="Cit Logo.svg"
                  alt="Cit Logo"
                  width={70}
                  height={70}
                  draggable={false}
                />
              </div>

              <div className="flex flex-col ml-2 select-text">
                <h1 className="font-montserrat font-medium text-[45px] text-white leading-[45px]">
                  Title (With Attachment)
                </h1>
                <p className="text-white font-ptsans text-[15px]">24/09/2025</p>
              </div>
            </div>

            {/* Triple dot menu */}
            <div className="select-none">
              <ImageButton src="Triple Dot.svg" width={50} height={50} />
            </div>
          </div>

          {/* Description (Truncated to 3 lines) */}
          <div className="font-ptsans text-[22px] mt-[5px] mx-[20px] text-white select-text line-clamp-3 break-words mb-[10px]">
            The quick brown fox jumps over the lazy dog while simultaneously
            reciting the alphabet backwards in order to impress the curious
            crowd that had gathered at the edge of the
            forest.WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw
          </div>

          {/* Images */}
          <ImageAttachments images={images} />
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between px-5 mt-2">
          <TextButton text="10k" />
          <TextButton
            text="React"
            textSize="text-[28px]"
            fontSize="font-medium"
          />
        </div>
      </div>

      {/* Upload area */}
      <div className="mt-10">
        <UploadButton
          onUpload={(files) => setImages((prev) => [...prev, ...files])}
        />
      </div>
    </div>
  );
}
