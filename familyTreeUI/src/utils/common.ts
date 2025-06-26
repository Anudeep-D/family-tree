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

export const getDiff = <T extends { id: string; data?: Record<string, any> }>(
  prev: T[],
  current: T[]
) => {
  const prevMap = new Map(prev.map((item) => [item.id, item.data]));
  const currentMap = new Map(current.map((item) => [item.id, item]));

  const added = current.filter((item) => !prevMap.has(item.id));
  const removed = prev.filter((item) => !currentMap.has(item.id));
  const updated = current.filter((item) => {
    const prevItem = prevMap.get(item.id);
    if(prevItem && JSON.stringify(prevItem.data ?? {}) !== JSON.stringify(item.data ?? {})){
      const diff: Record<string, { prev: any; current: any }> = {};
      const prevData =prevItem.data ?? {};
      const currentData =item.data ?? {};
      const allKeys = new Set([...Object.keys(prevData), ...Object.keys(currentData)]);
      for (const key of allKeys) {
        if (prevData[key] !== currentData[key]) {
          diff[key] = {
            prev: prevData[key],
            current: currentData[key],
          };
        }
      }
      console.log(diff);
    }
    return (
      prevItem &&
      JSON.stringify(prevItem.data ?? {}) !== JSON.stringify(item.data ?? {})
    );
  });
  return { added, removed, updated };
};
