import { prisma, transaction, handlePrismaError } from '@/lib/db/prisma';
import { User, UserRole, Prisma } from '@prisma/client';
import { ApiError } from '@/lib/utils/apiError';
import { hashPassword, verifyPassword } from '@/lib/utils/passwords';
import { generateToken, verifyToken } from '@/lib/auth/jwt';

// Loại bỏ những trường nhạy cảm
type SafeUser = Omit<User, 'password'>;

// Cache cho users truy cập thường xuyên
const userCache = new Map<string, { user: SafeUser; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

/**
 * Tìm user theo ID với cache
 */
export async function findUserById(id: string): Promise<SafeUser | null> {
  // Kiểm tra cache
  const now = Date.now();
  const cachedData = userCache.get(id);
  
  if (cachedData && cachedData.expiresAt > now) {
    return cachedData.user;
  }
  
  // Không có trong cache hoặc đã hết hạn, query từ DB
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });
    
    if (!user) return null;
    
    // Loại bỏ password trước khi trả về
    const { password, ...safeUser } = user;
    
    // Lưu vào cache
    userCache.set(id, {
      user: safeUser as SafeUser,
      expiresAt: now + CACHE_TTL,
    });
    
    return safeUser as SafeUser;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Tìm user theo email (không cache vì email ít được truy vấn lặp lại)
 */
export async function findUserByEmail(email: string): Promise<SafeUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
    
    if (!user) return null;
    
    // Loại bỏ password trước khi trả về
    const { password, ...safeUser } = user;
    return safeUser as SafeUser;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Tạo user mới
 */
export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
}): Promise<SafeUser> {
  const { email, password, name, role = 'PATIENT', phone } = userData;
  
  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw ApiError.conflict('Email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Tạo user mới với transaction để đảm bảo tạo cả profile
    return await transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
          phone,
          profile: {
            create: {
              // Profile doesn't have name field - name is in User model
            },
          },
        },
        include: {
          profile: true,
        },
      });
      
      // Tạo default permissions dựa trên role
      if (role === 'PATIENT') {
        // Tìm patient permissions
        const patientPermissions = await tx.permission.findMany({
          where: {
            name: {
              in: ['view_doctors', 'book_appointment', 'view_own_records'],
            },
          },
        });
        
        // Gán permissions
        for (const permission of patientPermissions) {
          await tx.userPermission.create({
            data: {
              userId: newUser.id,
              permissionId: permission.id,
            },
          });
        }
      } else if (role === 'DOCTOR') {
        // Tìm doctor permissions
        const doctorPermissions = await tx.permission.findMany({
          where: {
            name: {
              in: [
                'view_patients',
                'manage_appointments',
                'create_prescriptions',
                'view_medical_records',
              ],
            },
          },
        });
        
        // Gán permissions
        for (const permission of doctorPermissions) {
          await tx.userPermission.create({
            data: {
              userId: newUser.id,
              permissionId: permission.id,
            },
          });
        }
      }
      
      // Loại bỏ password trước khi trả về
      const { password, ...safeUser } = newUser;
      return safeUser as SafeUser;
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    handlePrismaError(error);
    throw error; // Nếu không phải Prisma error
  }
}

/**
 * Xác thực người dùng
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: SafeUser; token: string; refreshToken: string }> {
  try {
    // Tìm user theo email (cần lấy cả password để verify)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
    
    if (!user || !user.password) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    
    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      // Tăng số lần đăng nhập thất bại
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: {
            increment: 1,
          },
        },
      });
      
      // Nếu đăng nhập thất bại quá nhiều lần, khóa tài khoản
      if (user.failedLoginAttempts >= 4) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isActive: false,
          },
        });
        throw ApiError.unauthorized('Account locked due to too many failed login attempts');
      }
      
      throw ApiError.unauthorized('Invalid email or password');
    }
    
    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      throw ApiError.forbidden('Account is locked. Please contact support.');
    }
    
    // Reset số lần đăng nhập thất bại
    if (user.failedLoginAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
        },
      });
    }
    
    // Lưu lịch sử đăng nhập
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: '127.0.0.1', // Cần lấy từ request
        userAgent: 'Unknown', // Cần lấy từ request
        status: 'SUCCESS',
      },
    });
    
    // Tạo JWT token
    const { password: _, ...safeUser } = user;
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
    });
    
    const refreshToken = await generateToken(
      {
        userId: user.id,
        tokenType: 'refresh',
      },
      '30d'
    );
    
    return {
      user: safeUser as SafeUser,
      token,
      refreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Authentication error:', error);
    throw ApiError.unauthorized('Authentication failed');
  }
}

/**
 * Cập nhật thông tin user
 */
export async function updateUser(
  userId: string,
  userData: {
    name?: string;
    phone?: string;
    email?: string;
  }
): Promise<SafeUser> {
  const { name, phone, email } = userData;
  
  try {
    return await transaction(async (tx) => {
      // Cập nhật user
      const userUpdate: Prisma.UserUpdateInput = {};
      if (email) userUpdate.email = email;
      if (phone) userUpdate.phone = phone;
      if (name) userUpdate.name = name;
      
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userUpdate,
        include: {
          profile: true,
        },
      });
      
      // Tạo profile nếu chưa tồn tại
      if (!updatedUser.profile) {
        await tx.profile.create({
          data: {
            userId,
          },
        });
      }
      
      // Xóa cache
      userCache.delete(userId);
      
      // Refresh lại user từ DB sau khi cập nhật
      const refreshedUser = await tx.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });
      
      if (!refreshedUser) {
        throw ApiError.notFound('User not found after update');
      }
      
      // Loại bỏ password trước khi trả về
      const { password, ...safeUser } = refreshedUser;
      return safeUser as SafeUser;
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    handlePrismaError(error);
    throw ApiError.internal('Failed to update user');
  }
}

/**
 * Đổi mật khẩu
 */
export async function changePassword(
  userId: string,
  data: { currentPassword: string; newPassword: string }
): Promise<boolean> {
  const { currentPassword, newPassword } = data;
  
  try {
    // Tìm user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw ApiError.notFound('User not found');
    }
    
    // Xác minh mật khẩu hiện tại
    const passwordValid = await verifyPassword(currentPassword, user.password);
    if (!passwordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }
    
    // Hash mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);
    
    // Cập nhật mật khẩu
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    handlePrismaError(error);
    throw ApiError.internal('Failed to change password');
  }
}

/**
 * Làm mới token
 */
export async function refreshUserToken(
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> {
  try {
    // Xác minh refresh token
    const payload = await verifyToken(refreshToken);
    
    if (payload.tokenType !== 'refresh') {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    
    // Tìm user
    const user = await findUserById(payload.userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    // Tạo token mới
    const newToken = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
    });
    
    const newRefreshToken = await generateToken(
      {
        userId: user.id,
        tokenType: 'refresh',
      },
      '30d'
    );
    
    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Token refresh error:', error);
    throw ApiError.unauthorized('Failed to refresh token');
  }
} 