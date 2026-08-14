import { supabase } from "../General/supabaseClient";
import { updateUserAccount } from "./updateUserAccount";

export const uploadAvatar = async (userId: string, file: Blob) => {
  if (!file) return { publicUrl: null, error: new Error("No file provided.") };
  if (!userId) return { publicUrl: null, error: new Error("No user ID provided.") };

  const userFolderPath = `public/${userId}/`;
  
  // 1. List ALL files in the user's folder
  const { data: existingFiles } = await supabase.storage
    .from("avatars")
    .list(userFolderPath);

  // 2. Filter specifically for old AVATARS (files starting with "avatar-")
  // This protects your "cover-" photos from being deleted
  const oldAvatarFiles = existingFiles?.filter(f => f.name.startsWith("avatar-")) || [];

  if (oldAvatarFiles.length > 0) {
    const pathsToDelete = oldAvatarFiles.map(f => `${userFolderPath}${f.name}`);
    await supabase.storage.from("avatars").remove(pathsToDelete);
    console.log("Deleted old avatars:", pathsToDelete);
  }

  // 3. Upload New File
  const fileExt = file.type.split("/").pop() || "png";
  // Ensure consistent naming convention
  const newFilePath = `${userFolderPath}avatar-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(newFilePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { publicUrl: null, error: uploadError };

  // 4. Get Public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(newFilePath);

  const newUrl = urlData.publicUrl;

  // 5. Update Database
  const { error: dbError } = await updateUserAccount(userId, { avatarURL: newUrl });

  return { publicUrl: newUrl, error: dbError };
};