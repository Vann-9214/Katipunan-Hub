import { supabase } from "../General/supabaseClient";
import { updateUserAccount } from "./updateUserAccount";

/**
 * Uploads a file, updates the user's Account table,
 * and DELETES all old avatars in the user's folder.
 */
export const uploadAvatar = async (userId: string, file: Blob) => {
  
  // Validation
  if (!file) {
    return { publicUrl: null, error: new Error("No file provided.") };
  }
  if (!userId) {
    return { publicUrl: null, error: new Error("No user ID provided.") };
  }

  // --- THIS IS YOUR ORIGINAL PATH ---
  const userFolderPath = `public/${userId}/`;

  // List Old Files
  const { data: oldFiles, error: listError } = await supabase.storage
    .from("avatars")
    .list(userFolderPath);

  if (listError) {
    console.warn(
      "Could not list old avatars, proceeding anyway:",
      listError.message
    );
  }

  // Upload New File
  const fileExt = file.type.split("/").pop() || "png";
  const newFilePath = `${userFolderPath}avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(newFilePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase Storage Error:", uploadError.message);
    return { publicUrl: null, error: uploadError };
  }

  // Get Public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(newFilePath);

  if (!urlData.publicUrl) {
    const urlError = new Error("Could not get public URL.");
    console.error(urlError.message);
    return { publicUrl: null, error: urlError };
  }

  const newUrl = urlData.publicUrl;

  // Update Database
  const { error: dbError } = await updateUserAccount(userId, {
    avatarURL: newUrl,
  });

  if (dbError) {
    console.error("Supabase DB Error:", dbError.message);
    return { publicUrl: null, error: dbError };
  }

  // Delete Old Files
  if (oldFiles && oldFiles.length > 0) {
    const oldFilePaths = oldFiles.map((f) => `${userFolderPath}${f.name}`);
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove(oldFilePaths);

    if (deleteError) {
      console.error("Failed to delete old avatars:", deleteError.message);
    } else {
      console.log("Successfully deleted old avatars:", oldFilePaths);
    }
  }

  // Return
  console.log("Avatar updated. New URL:", newUrl);
  return { publicUrl: newUrl, error: null };
};