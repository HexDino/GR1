import * as bcrypt from 'bcrypt';

/**
 * Băm mật khẩu sử dụng bcrypt
 * @param password Mật khẩu cần băm
 * @returns Chuỗi hash đã được băm
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Xác thực mật khẩu
 * @param password Mật khẩu cần kiểm tra
 * @param hashedPassword Hash của mật khẩu từ DB
 * @returns true nếu mật khẩu khớp, false nếu không khớp
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
} 