export interface JWTPayload {
  userId: string
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
  email: string
  name: string
  iat: number
  exp: number
} 