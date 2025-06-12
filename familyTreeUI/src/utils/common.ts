import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError
): string {
  if ("status" in error) {
    // FetchBaseQueryError
    if (typeof error.data === "string") {
      return error.data;
    } else if (error.data && typeof error.data === "object") {
      // Try to get a message field from API response
      return (error.data as any).message || JSON.stringify(error.data);
    } else {
      return `Error status: ${error.status}`;
    }
  } else {
    // SerializedError (fallback for unexpected failures)
    return error.message || "An unknown error occurred";
  }
}

export const getDiff = <T extends { id: string }>(prev: T[], current: T[]) => {
  const prevMap = new Map(prev.map((item) => [item.id, item]));
  const currentMap = new Map(current.map((item) => [item.id, item]));

  const added = current.filter((item) => !prevMap.has(item.id));
  const removed = prev.filter((item) => !currentMap.has(item.id));
  const updated = current.filter((item) => {
    const prevItem = prevMap.get(item.id);
    return prevItem && JSON.stringify(prevItem) !== JSON.stringify(item);
  });
  return { added, removed, updated };
};
