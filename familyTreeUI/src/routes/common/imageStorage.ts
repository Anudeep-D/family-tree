import { subaBucket, supabase } from "@/config/supabaseClient";

export const uploadImage = async (
  file: File,
  projectId: string,
  fileName: string
) => {
  const { data, error } = await supabase.storage
    .from(subaBucket)
    .upload(`projects/${projectId}/${fileName}`, file);

  if (error) throw error;
  return data.path;
};

export const getImageUrl = async (fileName: string, projectId: string) => {
  const { data } = supabase.storage
    .from(subaBucket)
    .getPublicUrl(`projects/${projectId}/${fileName}`);
  return data.publicUrl;
};
