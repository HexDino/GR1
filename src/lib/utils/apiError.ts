/**
 * Lớp ApiError để chuẩn hóa xử lý lỗi API trong toàn bộ ứng dụng
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: any;

  constructor(statusCode: number, message: string, isOperational = true, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    // Đặt prototype đúng cách cho kế thừa Error
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Tạo lỗi Bad Request (400)
   */
  static badRequest(message: string, errors?: any): ApiError {
    return new ApiError(400, message, true, errors);
  }

  /**
   * Tạo lỗi Unauthorized (401)
   */
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Tạo lỗi Forbidden (403)
   */
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Tạo lỗi Not Found (404)
   */
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Tạo lỗi Method Not Allowed (405)
   */
  static methodNotAllowed(message = 'Method not allowed'): ApiError {
    return new ApiError(405, message);
  }

  /**
   * Tạo lỗi Conflict (409)
   */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Tạo lỗi Unprocessable Entity (422) - thường dùng cho lỗi validation
   */
  static validationError(errors: any): ApiError {
    return new ApiError(422, 'Validation Error', true, errors);
  }

  /**
   * Tạo lỗi Internal Server Error (500)
   */
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }

  /**
   * 429 Too Many Requests - khi client gửi quá nhiều request
   */
  static tooManyRequests(message: string = 'Too many requests, please try again later'): ApiError {
    return new ApiError(429, message, true);
  }
}

/**
 * Hàm middleware xử lý lỗi cho Next.js API Routes
 */
export function handleApiError(error: any, res: any) {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    // Nếu là lỗi API đã được định nghĩa
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
  }
  
  // Nếu là lỗi không xác định, trả về lỗi server (500)
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

/**
 * Hàm middleware bắt lỗi cho Next.js API Routes 
 */
export function withErrorHandling(handler: Function) {
  return async (req: any, res: any) => {
    try {
      return await handler(req, res);
    } catch (error) {
      return handleApiError(error, res);
    }
  };
} 