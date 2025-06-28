import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { AppNode } from "@/types/nodeTypes";
import { AppEdge } from "@/types/edgeTypes";

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


export const isDiff = (prevNodes:AppNode[], currNodes:AppNode[], prevEdges:AppEdge[], currEdges:AppEdge[]) => {
  const diffNodes = getDiff(prevNodes, currNodes);
  const diffEdges = getDiff(prevEdges, currEdges);
  if (
    diffNodes.added.length === 0 &&
    diffNodes.updated.length === 0 &&
    diffNodes.removed.length === 0 &&
    diffEdges.added.length === 0 &&
    diffEdges.updated.length === 0 &&
    diffEdges.removed.length === 0
  ) {
    return false;
  }
  return true;
}

export const getDiff = <T extends { id: string; data?: Record<string, any> }>(
  prev: T[],
  current: T[]
) => {
  const prevIds = prev.map((item) => item.id);
  const currIds = current.map((item) => item.id);
  const added = current.filter((item) => !prevIds.includes(item.id));
  const removed = prev.filter((item) => !currIds.includes(item.id));
  const updated = current.filter((currItem) => {
    const prevItem = prev.find((previous) => previous.id === currItem.id);
    if (
      prevItem &&
      JSON.stringify(prevItem.data ?? {}) !==
        JSON.stringify(currItem.data ?? {})
    ) {
      const diff: { prev: any; current: any }[] = [];
      const prevData = prevItem.data ?? {};
      const currentData = currItem.data ?? {};
      const allKeys = new Set([
        ...Object.keys(prevData),
        ...Object.keys(currentData),
      ]);
      for (const key of allKeys) {
        if (
          JSON.stringify(prevData[key]) !== JSON.stringify(currentData[key])
        ) {
          diff.push({
            prev: prevData[key],
            current: currentData[key],
          });
        }
      }
      console.log(diff);
    }
    return (
      prevItem &&
      JSON.stringify(prevItem.data ?? {}) !==
        JSON.stringify(currItem.data ?? {})
    );
  });
  return { added, removed, updated };
};
