// Mock authentication session for static admin user
// This bypasses the need for actual authentication while satisfying RLS policies

import { STATIC_ADMIN_USER_ID, STATIC_ADMIN_USER } from "./constants";

function createMockJWT(): string {
  // Create a properly formatted JWT token (header.payload.signature)
  // Even though it's fake, it needs the right structure
  
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  const payload = {
    sub: STATIC_ADMIN_USER_ID,
    aud: "authenticated",
    role: "authenticated",
    email: STATIC_ADMIN_USER.email,
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    app_metadata: {
      provider: "email",
      providers: ["email"]
    },
    user_metadata: {
      full_name: STATIC_ADMIN_USER.full_name
    },
    exp: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    iat: Math.floor(Date.now() / 1000),
    iss: "https://xwrrforhndpinxatxqda.supabase.co/auth/v1"
  };
  
  // Base64url encode (note: this is a simplified version, real JWT uses base64url)
  const base64UrlEncode = (obj: any) => {
    return btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const fakeSignature = base64UrlEncode({ mock: "signature" });
  
  return `${encodedHeader}.${encodedPayload}.${fakeSignature}`;
}

export function setupMockAuthSession() {
  // Create a mock session that Supabase will recognize
  const mockJWT = createMockJWT();
  
  const mockSession = {
    access_token: mockJWT,
    refresh_token: mockJWT,
    expires_in: 999999999,
    expires_at: Math.floor(Date.now() / 1000) + 999999999,
    token_type: "bearer",
    user: {
      id: STATIC_ADMIN_USER_ID,
      aud: "authenticated",
      role: "authenticated",
      email: STATIC_ADMIN_USER.email,
      email_confirmed_at: new Date().toISOString(),
      phone: "",
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: {
        provider: "email",
        providers: ["email"],
      },
      user_metadata: {
        full_name: STATIC_ADMIN_USER.full_name,
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  // Store in localStorage where Supabase looks for sessions
  const storageKey = `sb-xwrrforhndpinxatxqda-auth-token`;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(mockSession));
    console.log("✅ Mock auth session created for admin user");
    console.log("Mock JWT:", mockJWT.substring(0, 50) + "...");
  } catch (error) {
    console.error("Failed to setup mock auth session:", error);
  }
}

// Clear mock session if needed
export function clearMockAuthSession() {
  const storageKey = `sb-xwrrforhndpinxatxqda-auth-token`;
  localStorage.removeItem(storageKey);
}

