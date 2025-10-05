// app/component/Post/UploadButton.tsx
"use client";

interface UploadButtonProps {
  onUpload: (files: string[]) => void; // currently returns object URLs
}

export default function UploadButton({ onUpload }: UploadButtonProps) {
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    onUpload(urls);
  };

  return (
    <label className="cursor-pointer bg-gold text-darkmaroon px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition w-fit">
      Upload Images
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </label>
  );
}
