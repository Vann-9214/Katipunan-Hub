// supabase/lib/storage.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Helper to extract storage path from public URL
const getFilePathFromPublicUrl = (url: string): string | null => {
  // expected pattern: /storage/v1/object/public/<bucket>/<path>
  const marker = "/storage/v1/object/public/posts/";
  const idx = url.indexOf(marker);
  if (idx !== -1) return url.substring(idx + marker.length);
  // fallback: sometimes URL may be custom domain or different format - attempt to find 'posts/' part
  const alt = url.split("/posts/").pop();
  return alt ? alt : null;
};

// Delete given public URLs from the 'posts' bucket
export const deleteUrlsFromBucket = async (urls: string[]) => {
  if (!urls || urls.length === 0) return;
  const paths = urls
    .map(getFilePathFromPublicUrl)
    .filter((p): p is string => !!p);

  if (paths.length === 0) return;

  // Create a client instance specifically for this function
  const supabase = createClientComponentClient();
  const { error } = await supabase.storage.from("posts").remove(paths);

  if (error) {
    console.error("Error deleting images from storage:", error);
  } else {
    console.log("Deleted images from storage:", paths);
  }
};