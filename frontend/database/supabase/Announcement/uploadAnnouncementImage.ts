import { supabase } from "../General/supabaseClient";

/**
 * Uploads an announcement image to the 'posts' Supabase storage bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadAnnouncementImage(
  file: File,
  userId: string
): Promise<{ url: string | null; error: any }> {
  try {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const cleanExt = ext.replace(/[^a-z0-9]/g, "");
    const randomId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    const filePath = `announcements/${userId}/${randomId}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from("posts")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Supabase image upload error:", uploadError);
      return { url: null, error: uploadError };
    }

    const { data: publicData } = supabase.storage
      .from("posts")
      .getPublicUrl(filePath);

    return { url: publicData.publicUrl, error: null };
  } catch (err) {
    console.error("Unexpected error in uploadAnnouncementImage:", err);
    return { url: null, error: err };
  }
}
