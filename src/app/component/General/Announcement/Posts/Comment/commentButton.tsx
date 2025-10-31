import Image from "next/image";

export default function CommentButton() {
  return (
    <div className="cursor-pointer rounded-[10px] text-[22px] font-montserrat font-medium hover:bg-black/10 h-[35px] w-full flex gap-1 items-center justify-center">
      <Image src="/Comment.svg" alt="Like" height={23} width={23} />
      Comment
    </div>
  );
}
