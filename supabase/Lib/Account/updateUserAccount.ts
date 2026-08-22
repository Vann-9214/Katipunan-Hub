// Updated interface to allow nulls
interface UpdateData {
  fullName?: string;
  avatarURL?: string | null;
  coverURL?: string | null;
  bio?: string;
  location?: string;
}

export const updateUserAccount = async (
  _userId: string,
  updatedData: UpdateData
) => {
  return { data: [updatedData], error: null };
};