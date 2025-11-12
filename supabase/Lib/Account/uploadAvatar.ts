import { supabase } from "../General/supabaseClient";

/**
 * Uploads a file to the 'avatars' bucket in Supabase Storage.
 *
 * @param userId - The ID of the user, used to create a unique folder.
 * @param file - The image file (Blob) to upload.
 * @returns {Promise<{ publicUrl: string | null, error: Error | null }>}
 */
export const uploadAvatar = async (userId: string, file: Blob) => {
  if (!file) {
    return { publicUrl: null, error: new Error("No file provided.") };
  }
  if (!userId) {
    return { publicUrl: null, error: new Error("No user ID provided.") };
  }

  // 1. Create a unique file path.
  const fileExt = file.type.split("/").pop() || "png";
  const filePath = `public/${userId}/avatar-${Date.now()}.${fileExt}`;

  // 2. Upload the file to the 'avatars' bucket.
  //    Make sure you have a public bucket named "avatars" in Supabase Storage.
  const { error: uploadError } = await supabase.storage
    .from("avatars") // BUCKET NAME
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // Overwrite existing file if any
    });

  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError.message);
    return { publicUrl: null, error: uploadError };
  }

  // 3. Get the public URL for the new file.
  const { data: urlData } = supabase.storage
    .from("avatars") // BUCKET NAME
    .getPublicUrl(filePath);

  if (!urlData.publicUrl) {
    const urlError = new Error("Could not get public URL.");
    console.error(urlError.message);
    return { publicUrl: null, error: urlError };
  }

  console.log("Avatar public URL:", urlData.publicUrl);
  return { publicUrl: urlData.publicUrl, error: null };
};