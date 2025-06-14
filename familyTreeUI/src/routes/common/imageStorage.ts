import { supaBucket, supabase } from "@/config/supabaseClient";

export const uploadImage = async (
  file: File,
  treeId: string,
  fileName: string
) => {
  const { data, error } = await supabase.storage
    .from(supaBucket)
    .upload(`trees/${encodeURIComponent(treeId)}/${encodeURIComponent(fileName)}`, file, { cacheControl: '3600', upsert: true });

  if (error) {
      console.error("Error uploading image:", error);
      // Optionally, inform the user about the error
      return null;
    }
  return data.path;
};

export const getImageUrl = async (treeId: string, fileName: string ) => {
  const { data } = await supabase.storage
    .from(supaBucket)
    .createSignedUrl(`trees/${encodeURIComponent(treeId)}/${encodeURIComponent(fileName)}`, 60*60);
  return data?.signedUrl ?? null;
};
