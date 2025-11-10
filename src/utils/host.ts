// Centralized API host helper
// Use this to pick the correct backend depending on runtime environment
export function getApiHost(): string {
  // When running in browser on localhost, use local backend port
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4001';
    }
  }

  // Otherwise use production host
  return 'https://partywings.exyconn.com';
}

export const API_HOST = getApiHost();
