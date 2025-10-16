// Debug environment variables
export function debugEnvironment() {
  console.log("=== Environment Debug ===");
  console.log("VITE_SUPABASE_SERVICE_ROLE_KEY exists:", !!import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  
  if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    const key = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    console.log("Key length:", key.length);
    console.log("Key starts with:", key.substring(0, 20) + "...");
    console.log("Key format looks valid:", key.startsWith("eyJ") && key.includes("."));
  } else {
    console.log("❌ Service role key NOT found in environment");
    console.log("Available env vars:", Object.keys(import.meta.env));
  }
  console.log("========================");
}

