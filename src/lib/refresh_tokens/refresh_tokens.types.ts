export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}
export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}
