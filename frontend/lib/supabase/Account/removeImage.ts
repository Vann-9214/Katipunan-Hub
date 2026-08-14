import { supabase } from "../General/supabaseClient";
import { updateUserAccount } from "./updateUserAccount";

export const removeUserImage = async (userId: string, type: "avatar" | "cover") => {
  // 1. Update DB to NULL immediately (Priority)
  const updatePayload = type === "avatar" 
    ? { avatarURL: null } 
    : { coverURL: null };

  const { error } = await updateUserAccount(userId, updatePayload);

  if (error) {
    return { error };
  }

  // 2. Clean up storage (Secondary step)
  // We do this after a successful DB update to ensure the UI doesn't break
  const userFolderPath = `public/${userId}/`;
  const prefix = type === "avatar" ? "avatar-" : "cover-";

  const { data: files } = await supabase.storage
    .from("avatars")
    .list(userFolderPath);

  const filesToDelete = files?.filter(f => f.name.startsWith(prefix)) || [];

  if (filesToDelete.length > 0) {
    const paths = filesToDelete.map(f => `${userFolderPath}${f.name}`);
    await supabase.storage.from("avatars").remove(paths);
    console.log(`Deleted ${type} files:`, paths);
  }

  return { error: null };
};