import { updateUserAccount } from "./updateUserAccount";

export const uploadCover = async (userId: string, file: File) => {
  if (!file || !userId) return { publicUrl: null, error: new Error("Missing data") };

  const publicUrl = URL.createObjectURL(file);
  const { error: dbError } = await updateUserAccount(userId, { coverURL: publicUrl });

  return { publicUrl, error: dbError };
};