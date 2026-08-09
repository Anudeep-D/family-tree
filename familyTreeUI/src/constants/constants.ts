// In the container, the browser talks to the nginx proxy at the same origin.
// Nginx forwards /api/* to the backend, so no explicit host/port is needed.
export const baseUrl = ``;