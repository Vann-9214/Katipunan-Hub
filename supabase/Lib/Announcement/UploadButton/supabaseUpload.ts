export async function uploadFileAndGetPublicUrl(
  file: File
): Promise<string | null> {
  try {
    return URL.createObjectURL(file);
  } catch (err) {
    console.error("uploadFileAndGetPublicUrl error", err);
    return null;
  }
}