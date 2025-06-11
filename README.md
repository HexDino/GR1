# Hệ Thống Đặt Lịch Khám Bệnh Trực Tuyến

Một hệ thống đặt lịch khám bệnh trực tuyến hoàn chỉnh với đầy đủ các tính năng quản lý bác sĩ, bệnh nhân, lịch hẹn, đơn thuốc và chatbot AI thông minh hỗ trợ người dùng.

## ✨ Tính Năng Chính

- **🏥 Quản Lý Bác Sĩ & Bệnh Nhân**: Hồ sơ chi tiết với thông tin y tế đầy đủ
- **📅 Đặt Lịch Khám**: Hệ thống đặt lịch thông minh với kiểm tra xung đột lịch trình
- **💊 Quản Lý Đơn Thuốc**: Kê đơn, theo dõi và xem lịch sử đơn thuốc
- **📊 Theo Dõi Sức Khỏe**: Ghi nhận và phân tích các chỉ số sức khỏe
- **🔔 Thông Báo Thông Minh**: Nhắc nhở lịch hẹn tự động và đánh giá bác sĩ
- **🤖 Chatbot Hỗ Trợ**: Tích hợp GPT-4 để tư vấn y tế và hỗ trợ đặt lịch

## 🛠 Công Nghệ Sử Dụng

- **Frontend**: Next.js 13, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js, JWT
- **AI Integration**: OpenAI GPT-4
- **Cloud Storage**: Cloudinary
- **UI Components**: Heroicons, React Icons

## 📋 Yêu Cầu Hệ Thống

- Node.js 18+
- PostgreSQL 12+
- npm hoặc yarn

## 🚀 Cài Đặt

### 1. Clone dự án
```bash
git clone <repository_url>
cd medical-appointment-system
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Tạo file `.env.local` với nội dung sau:
```env
# Cấu hình database
DATABASE_URL="postgresql://username:password@localhost:5432/medical_app"

# Cấu hình JWT
JWT_SECRET="your-super-secret-jwt-key"

# Cấu hình OpenAI API cho chatbot
OPENAI_API_KEY="your-openai-api-key"

# Cấu hình NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Cấu hình Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 4. Thiết lập database
```bash
# Chạy migration
npx prisma migrate dev

# Seed dữ liệu mẫu (optional)
npm run seed
```

### 5. Chạy ứng dụng
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🤖 Cấu Hình Chatbot với GPT-4

Hệ thống chatbot được tích hợp với OpenAI GPT-4 để xử lý:
- Phân tích triệu chứng sơ bộ
- Tư vấn y tế tổng quát
- Hỗ trợ đặt lịch thông minh

**Để sử dụng tính năng này:**
1. Đăng ký tài khoản tại [OpenAI](https://platform.openai.com/)
2. Tạo API key tại [OpenAI API Keys](https://platform.openai.com/account/api-keys)
3. Thêm API key vào file `.env.local`

## 📖 API Endpoints

### 🔐 Xác Thực
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập

### 👨‍⚕️ Bác Sĩ
- `GET /api/doctors` - Lấy danh sách bác sĩ
- `GET /api/doctors/[id]` - Xem thông tin bác sĩ
- `GET /api/doctors/[id]/schedule` - Xem lịch trình bác sĩ

### 📅 Lịch Hẹn
- `GET /api/appointments` - Lấy danh sách lịch hẹn
- `POST /api/appointments` - Tạo lịch hẹn mới
- `PUT /api/appointments/[id]` - Cập nhật lịch hẹn
- `GET /api/appointments/[id]/prescriptions` - Xem đơn thuốc của lịch hẹn

### 🤖 Chatbot
- `POST /api/chat` - Gửi tin nhắn đến chatbot

### 📊 Sức Khỏe
- `GET /api/health/metrics` - Xem dữ liệu theo dõi sức khỏe
- `POST /api/health/metrics` - Thêm chỉ số sức khỏe mới
- `GET /api/health/insights` - Xem phân tích sức khỏe

## 📁 Cấu Trúc Dự Án

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── doctors/        # Doctor pages
│   ├── login/          # Authentication pages
│   └── ...
├── components/         # React components
├── lib/               # Utility libraries
├── services/          # Business logic
├── hooks/             # Custom React hooks
└── types/             # TypeScript types

prisma/
├── schema.prisma      # Database schema
├── migrations/        # Database migrations
└── seed/              # Seed data
```

## 🤝 Đóng Góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/TinhNangMoi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/TinhNangMoi`)
5. Tạo Pull Request

## 📄 Giấy Phép

Dự án này được phát triển cho mục đích học tập.

## 👨‍💻 Tác Giả

© 2025. Đồ án môn học.

---

**Lưu ý**: Đây là hệ thống demo cho mục đích học tập. Không sử dụng cho mục đích y tế thực tế mà không có sự giám sát của chuyên gia y tế. 