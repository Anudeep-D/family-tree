import { supaBucket, supabase } from "@/config/supabaseClient";

const signInWithGoogleToken = async (idToken: string | null) => {
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken ?? "",
  });
  if (error) console.error("Supabase sign-in failed:", error.message);
};

export const uploadImage = async (
  file: File,
  treeId: string,
  fileName: string,
  idToken: string | null
) => {
  await signInWithGoogleToken(idToken);
  const { data, error } = await supabase.storage
    .from(supaBucket)
    .upload(
      `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(fileName)}`,
      file,
      { cacheControl: "3600", upsert: true }
    );

  if (error) {
    console.error("Error uploading image:", error);
    // Optionally, inform the user about the error
    return null;
  }
  return data.path;
};

export const uploadImageWithUrl = async (
  file: File,
  url: string,
  idToken: string | null
) => {
  await signInWithGoogleToken(idToken);
  const { data, error } = await supabase.storage
    .from(supaBucket)
    .upload(url, file, { cacheControl: "3600", upsert: true });

  if (error) {
    console.error("Error uploading image:", error);
    // Optionally, inform the user about the error
    return null;
  }
  return data.path;
};

export const getImageUrl = async (treeId: string, fileName: string) => {
  const { data } = await supabase.storage
    .from(supaBucket)
    .createSignedUrl(
      `trees/${encodeURIComponent(treeId)}/${encodeURIComponent(fileName)}`,
      60 * 60
    );
  return data?.signedUrl ?? null;
};

export const getImage = async (url: string) => {
  const { data } = await supabase.storage
    .from(supaBucket)
    .createSignedUrl(url, 60 * 60);
  return data?.signedUrl ?? null;
};

export const deleteImage = async (url: string, idToken: string | null) => {
  await signInWithGoogleToken(idToken);
  const { data, error } = await supabase.storage.from(supaBucket).remove([url]);

  if (error) {
    console.error("Error deleting image:", error);
    return false;
  }
  console.log("Image deleted successfully:", data);

  return true;
};

export const renameImage = async (
  oldPath: string,
  newPath: string,
  idToken: string | null
) => {
  await signInWithGoogleToken(idToken);
  // Step 1: Download the original image
  const { data: downloadData, error: downloadError } = await supabase.storage
    .from(supaBucket)
    .download(oldPath);

  if (downloadError || !downloadData) {
    console.error("Failed to download file:", downloadError);
    return false;
  }

  // Step 2: Upload to new path
  const { error: uploadError } = await supabase.storage
    .from(supaBucket)
    .upload(newPath, downloadData, { cacheControl: "3600", upsert: true });

  if (uploadError) {
    console.error("Failed to upload to new path:", uploadError);
    return false;
  }

  // Step 3: Delete old file
  const { error: deleteError } = await supabase.storage
    .from(supaBucket)
    .remove([oldPath]);

  if (deleteError) {
    console.error(
      "Uploaded new file but failed to delete old one:",
      deleteError
    );
    return false;
  }

  console.log(`File renamed from ${oldPath} to ${newPath} successfully`);
  return true;
};
