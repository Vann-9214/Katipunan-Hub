import { updateUserAccount } from "./updateUserAccount";

export const uploadAvatar = async (userId: string, file: Blob) => {
  if (!file) return { publicUrl: null, error: new Error("No file provided.") };
  if (!userId) return { publicUrl: null, error: new Error("No user ID provided.") };

  const newUrl = URL.createObjectURL(file);
  const { error: dbError } = await updateUserAccount(userId, { avatarURL: newUrl });

  return { publicUrl: newUrl, error: dbError };
};