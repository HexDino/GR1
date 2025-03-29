# Hệ thống đặt lịch khám bệnh

Hệ thống đặt lịch khám bệnh với đầy đủ các tính năng quản lý bác sĩ, bệnh nhân, lịch hẹn, đơn thuốc và chatbot thông minh hỗ trợ người dùng.

## Tính năng chính

- **Quản lý bác sĩ và bệnh nhân**: Hồ sơ đầy đủ với thông tin y tế.
- **Đặt lịch khám**: Hệ thống đặt lịch thông minh với kiểm tra xung đột.
- **Quản lý đơn thuốc**: Kê đơn, theo dõi và xem lịch sử đơn thuốc.
- **Theo dõi sức khỏe**: Ghi nhận và phân tích chỉ số sức khỏe.
- **Thông báo thông minh**: Tự động gửi nhắc nhở lịch hẹn, đánh giá bác sĩ.
- **Chatbot hỗ trợ**: Tích hợp GPT-4 để trả lời câu hỏi y tế và hỗ trợ đặt lịch.

## Cài đặt

1. Clone dự án
```bash
git clone <repository_url>
cd medical-appointment-system
```

2. Cài đặt các phụ thuộc
```bash
npm install
```

3. Tạo file `.env.local` với nội dung sau:
```
# Cấu hình cơ sở dữ liệu
DATABASE_URL="postgresql://username:password@localhost:5432/medical_app"

# Cấu hình JWT
JWT_SECRET="your-super-secret-jwt-key"

# Cấu hình OpenAI API cho chatbot
OPENAI_API_KEY="your-openai-api-key"
```

4. Cấu hình cơ sở dữ liệu
```bash
npx prisma migrate dev
```

5. Khởi động ứng dụng
```bash
npm run dev
```

## Cấu hình Chatbot với GPT-4

Hệ thống chatbot được tích hợp với OpenAI GPT-4 để xử lý:
- Phân tích triệu chứng sơ bộ
- Trả lời câu hỏi y tế tổng quát
- Hỗ trợ đặt lịch thông minh

Để sử dụng tính năng này, bạn cần:
1. Đăng ký tài khoản tại [OpenAI](https://platform.openai.com/)
2. Tạo API key tại [OpenAI API Keys](https://platform.openai.com/account/api-keys)
3. Thêm API key vào file `.env.local`

## API Endpoints

### Authentication
- `POST /api/auth/register`: Đăng ký tài khoản mới
- `POST /api/auth/login`: Đăng nhập

### Bác sĩ
- `GET /api/doctors`: Lấy danh sách bác sĩ
- `GET /api/doctors/[id]`: Xem thông tin bác sĩ
- `GET /api/doctors/[id]/schedule`: Xem lịch làm việc của bác sĩ

### Lịch hẹn
- `GET /api/appointments`: Lấy danh sách lịch hẹn
- `POST /api/appointments`: Tạo lịch hẹn mới
- `PUT /api/appointments/[id]`: Cập nhật lịch hẹn
- `GET /api/appointments/[id]/prescriptions`: Xem đơn thuốc của lịch hẹn

### Chatbot
- `POST /api/chat`: Gửi tin nhắn đến chatbot

### Sức khỏe
- `GET /api/health/metrics`: Xem số liệu theo dõi sức khỏe
- `POST /api/health/metrics`: Thêm số liệu sức khỏe mới
- `GET /api/health/insights`: Xem phân tích sức khỏe

## Tác giả

© 2025. Đồ án môn học. 