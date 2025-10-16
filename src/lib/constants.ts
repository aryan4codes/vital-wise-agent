// Static admin user for no-auth mode
export const STATIC_ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";
export const STATIC_ADMIN_USER = {
  id: STATIC_ADMIN_USER_ID,
  email: "admin@healthguard.local",
  full_name: "Admin User",
};

// Gemini API Configuration
// Add your Gemini API key here or use environment variable
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
