export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  name?: string;
  tokenType?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
} 