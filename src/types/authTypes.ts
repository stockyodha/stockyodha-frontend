// Based on #/components/schemas/Token
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string; // Typically "bearer"
}

// Based on #/components/schemas/RefreshTokenRequest
export interface RefreshTokenRequest {
  refresh_token: string;
}

// Based on #/components/schemas/Body_login_for_access_token_api_v1_auth_token_post
// Using standard OAuth2 names (username, password)
export interface LoginRequest {
  username: string;
  password: string;
  // grant_type, scope, client_id, client_secret are usually handled by the library/backend
} 