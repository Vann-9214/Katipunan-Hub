import { PostModalProvider } from "@/app/component/General/Announcement/Posts/Comment/postModalContext";
// 1. Import your new provider
import { ImageLightboxProvider } from "./imageLightboxContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PostModalProvider>
          {/* 2. Wrap your content with it */}
          <ImageLightboxProvider>{children}</ImageLightboxProvider>
        </PostModalProvider>
      </body>
    </html>
  );
}
