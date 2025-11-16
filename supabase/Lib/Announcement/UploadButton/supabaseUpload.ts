import { supabase } from "../../General/supabaseClient";

  export async function uploadFileAndGetPublicUrl(
    file: File
  ): Promise<string | null> {
    try {
      const ext = (file.name.split(".").pop() || "bin").replace(
        /[^a-zA-Z0-9]/g,
        ""
      );
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id ?? "anon";
      const randomId = crypto.randomUUID();
      const path = `${uid}/${randomId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, file);

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return null;
      }

      const { data: publicData } = supabase.storage
        .from("posts")
        .getPublicUrl(path);
      return publicData?.publicUrl ?? null;
    } catch (err) {
      console.error("uploadFileAndGetPublicUrl error", err);
      return null;
    }
  }