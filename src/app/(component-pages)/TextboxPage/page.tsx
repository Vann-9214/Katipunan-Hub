import TextBox from "@/app/component/ReusableComponent/Textbox";

export default function TextboxPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <TextBox
        type="email"
        className="w-10"
        placeholder="Cit Email"
        rightImageSrc="Email Icon.svg"
        rightImageAlt="email icon"
        rightImageWidth={25}
        rightImageHeight={25}
      />
    </div>
  );
}
