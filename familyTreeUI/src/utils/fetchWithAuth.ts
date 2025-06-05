// familyTreeUI/src/utils/fetchWithAuth.ts

// const APP_SESSION_TOKEN_KEY = 'appSessionToken'; // No longer needed here

interface FetchOptions extends RequestInit {
  // Custom options
}

export const fetchWithAuth = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  // Token retrieval and Authorization header addition are removed
  // as HttpOnly session cookies are expected to be handled by the browser.

  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.append('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.append('Accept', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // credentials: 'include' // RTK Query's baseQuery already has this. 
    // If fetchWithAuth is used for different domains or specific needs,
    // 'credentials' might need to be set here too. For same-origin, it's often not needed
    // if cookies are standard session cookies. Assuming same-origin for now.
  });

  if (response.status === 401) {
    // Unauthorized: Dispatch event for AuthProvider to handle logout.
    // No token to remove from localStorage here.
    window.dispatchEvent(new CustomEvent('auth-error-logout'));
    throw new Error('Unauthorized: Session expired or invalid.');
  }

  return response;
};
