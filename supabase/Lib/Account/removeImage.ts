import { updateUserAccount } from "./updateUserAccount";

export const removeUserImage = async (userId: string, type: "avatar" | "cover") => {
  const updatePayload = type === "avatar" 
    ? { avatarURL: null } 
    : { coverURL: null };

  const { error } = await updateUserAccount(userId, updatePayload);
  return { error };
};