"use client";

import Image from "next/image";
import ImageAttachments from "../ImageAttachment/ImageAttachments";
import { TextButton } from "../../../ReusableComponent/Buttons";
import EditPostsButton from "./EditPostsButton";

interface PostsProps {
  title?: string;
  description?: string;
  date?: string;
  images?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export default function Posts({
  title = "Title",
  description = "Description",
  date = "Date",
  images = [],
  onEdit,
  onDelete,
  canEdit = false,
}: PostsProps) {
  return (
    <div>
      {/* Outer Post (Gold Background) */}
      <div className="w-[800px] bg-gold rounded-[30px] p-[5px]">
        {/* Inner Post (Dark Maroon Background) */}
        <div className="w-[790px] bg-darkmaroon rounded-t-[30px] flex flex-col">
          {/* Upper Section: Logo, Title, Date, Triple Dot */}
          <div className="flex items-start justify-between mt-[15px] mx-[20px]">
            {/* Logo + Title + Date */}
            <div className="flex">
              <div className="select-none">
                <Image
                  src="/Cit Logo.svg"
                  alt="Cit Logo"
                  width={70}
                  height={70}
                  draggable={false}
                />
              </div>

              <div className="flex flex-col ml-2 select-text">
                <h1 className="font-montserrat font-medium text-[45px] text-white leading-[45px]">
                  {title}
                </h1>
                <p className="text-white font-ptsans text-[15px]">{date}</p>
              </div>
            </div>

            {/* ✅ Conditionally show edit button */}
            {canEdit && (
              <div className="select-none">
                <EditPostsButton
                  onEdit={() => onEdit?.()}
                  onRemove={() => onDelete?.()}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="font-ptsans text-[22px] mt-[5px] mx-[20px] text-white select-text line-clamp-3 break-words mb-[10px]">
            {description}
          </div>

          {/* Images */}
          <div className="select-none">
            <ImageAttachments images={images} />
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between px-5 items-center">
          <TextButton text="10k" />
          <TextButton
            text="React"
            textSize="text-[28px]"
            fontSize="font-medium"
          />
        </div>
      </div>
    </div>
  );
}
