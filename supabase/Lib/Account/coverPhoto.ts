import { supabase } from "../General/supabaseClient";
import { updateUserAccount } from "./updateUserAccount";

export const uploadCover = async (userId: string, file: File) => {
  if (!file || !userId) return { publicUrl: null, error: new Error("Missing data") };

  const userFolderPath = `public/${userId}/`;

  // 1. Cleanup Old Covers (Filter for "cover-")
  const { data: existingFiles } = await supabase.storage
    .from("avatars") // Using same bucket
    .list(userFolderPath);

  const oldCoverFiles = existingFiles?.filter(f => f.name.startsWith("cover-")) || [];

  if (oldCoverFiles.length > 0) {
    const pathsToDelete = oldCoverFiles.map(f => `${userFolderPath}${f.name}`);
    await supabase.storage.from("avatars").remove(pathsToDelete);
    console.log("Deleted old covers:", pathsToDelete);
  }

  // 2. Upload New Cover
  const fileExt = file.name.split(".").pop() || "jpg";
  const filePath = `${userFolderPath}cover-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) return { publicUrl: null, error: uploadError };

  // 3. Get URL & Update DB
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const publicUrl = data.publicUrl;

  const { error: dbError } = await updateUserAccount(userId, { coverURL: publicUrl });

  return { publicUrl, error: dbError };
};