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
