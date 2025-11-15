import { supabase } from "../General/supabaseClient";
// --- 1. ADD THIS IMPORT ---
import { updateUserAccount } from "./updateUserAccount";

/**
 * Uploads a file, gets the public URL, and updates the user's Account table.
 *
 * @param userId - The ID of the user.
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

  // 2. Upload the file to storage.
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

  // 3. Get the public URL.
  const { data: urlData } = supabase.storage
    .from("avatars") // BUCKET NAME
    .getPublicUrl(filePath);

  if (!urlData.publicUrl) {
    const urlError = new Error("Could not get public URL.");
    console.error(urlError.message);
    return { publicUrl: null, error: urlError };
  }

  const newUrl = urlData.publicUrl;

  // --- 4. ADDED: Update the database ---
  const { error: dbError } = await updateUserAccount(userId, {
    avatarURL: newUrl,
  });

  if (dbError) {
    console.error("Supabase DB Error:", dbError.message);
    return { publicUrl: null, error: dbError };
  }

  // 5. Success
  console.log("Avatar public URL:", newUrl);
  return { publicUrl: newUrl, error: null };
};