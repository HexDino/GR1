"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

// Định nghĩa schema validation
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type Error = { path: string; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Error[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    console.log('Login attempt with:', formData.email);

    try {
      // Validate form data
      loginSchema.parse(formData);
      console.log('Form validation passed');

      // Call login API
      console.log('Sending login request to API...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: true,
        }),
      });

      console.log('Login API response status:', response.status);
      const data = await response.json();
      console.log('Login API response:', data);

      if (data.success) {
        console.log('Login successful, user role:', data.data.user.role);
        
        // Redirect based on user role
        const redirectPath = `/dashboard/${data.data.user.role.toLowerCase()}`;
        console.log('Redirecting to:', redirectPath);
        
        // Add a small delay to ensure cookies are set
        setTimeout(() => {
          router.push(redirectPath);
        }, 500);
      } else {
        // Show error message
        console.log('Login failed:', data.message);
        setErrors([{
          path: 'server',
          message: data.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
        }]);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Validation error:', error.errors);
        setErrors(error.errors.map(err => ({
          path: err.path[0].toString(),
          message: err.message,
        })));
      } else {
        console.error('Login error:', error);
        setErrors([{
          path: 'server',
          message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorForField = (fieldName: string) => {
    return errors.find(error => error.path === fieldName)?.message;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden md:flex">
        {/* Left side - Login Form */}
        <div className="w-full p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
            <p className="mt-2 text-sm text-gray-600">
              Đăng nhập để truy cập tài khoản của bạn
            </p>
          </div>

          {getErrorForField('server') && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-700">{getErrorForField('server')}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  getErrorForField('email') ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                placeholder="Email của bạn"
              />
              {getErrorForField('email') && (
                <p className="mt-1 text-sm text-red-600">{getErrorForField('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  getErrorForField('password') ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm`}
                placeholder="Mật khẩu của bạn"
              />
              {getErrorForField('password') && (
                <p className="mt-1 text-sm text-red-600">{getErrorForField('password')}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <a href="/register" className="font-medium text-purple-600 hover:text-purple-500">
                  Đăng ký ngay
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 