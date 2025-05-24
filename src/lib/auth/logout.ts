/**
 * Utility function to handle user logout
 * Clears all authentication data and redirects to home page
 */
export async function handleLogout(): Promise<void> {
  try {
    console.log('[LOGOUT] Starting logout process...');
    
    // Call logout API
    const response = await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include', // Include cookies
    });
    
    console.log('[LOGOUT] API response status:', response.status);
    
    if (!response.ok) {
      console.warn('[LOGOUT] API returned non-OK status, but continuing logout...');
    }
    
  } catch (error) {
    console.error('[LOGOUT] API call failed:', error);
    // Continue with client-side cleanup even if API fails
  }
  
  try {
    // Clear all client-side storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      console.log('[LOGOUT] Client storage cleared');
    }
  } catch (error) {
    console.error('[LOGOUT] Error clearing storage:', error);
  }
  
  // Redirect to home page
  try {
    if (typeof window !== 'undefined') {
      console.log('[LOGOUT] Redirecting to home page...');
      window.location.href = '/';
    }
  } catch (error) {
    console.error('[LOGOUT] Error redirecting:', error);
    // Fallback redirect method
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  }
} 