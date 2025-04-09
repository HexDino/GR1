import { PrismaClient } from '@prisma/client'

// Add prisma to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Tối ưu number of connections trong development
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Tạo các util functions cho transaction và batch operations
export async function transaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return await fn(tx as unknown as PrismaClient)
  })
}

// Utility function để xử lý Prisma errors
export function handlePrismaError(error: any): never {
  console.error('Database error:', error)
  
  // Xử lý các loại lỗi phổ biến từ Prisma
  if (error.code === 'P2002') {
    // Unique constraint failed
    throw new Error(`Dữ liệu đã tồn tại: ${error.meta?.target?.join(', ')}`)
  } else if (error.code === 'P2025') {
    // Record not found
    throw new Error('Không tìm thấy dữ liệu')
  } else if (error.code === 'P2003') {
    // Foreign key constraint failed
    throw new Error('Lỗi ràng buộc dữ liệu')
  }
  
  throw new Error(`Database error: ${error.message || 'Unknown error'}`)
} 