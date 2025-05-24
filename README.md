# Medical Appointment System

A comprehensive medical appointment booking system with full features for managing doctors, patients, appointments, prescriptions, and an intelligent chatbot to assist users.

## Key Features

- **Doctor and Patient Management**: Complete profiles with medical information.
- **Appointment Booking**: Smart booking system with conflict checking.
- **Prescription Management**: Prescribe, track, and view prescription history.
- **Health Monitoring**: Record and analyze health metrics.
- **Smart Notifications**: Automatic appointment reminders and doctor reviews.
- **Support Chatbot**: Integrated GPT-4 to answer medical questions and assist with booking.

## Installation

1. Clone the project
```bash
git clone <repository_url>
cd medical-appointment-system
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` file with the following content:
```
# Database configuration
DATABASE_URL="postgresql://username:password@localhost:5432/medical_app"

# JWT configuration
JWT_SECRET="your-super-secret-jwt-key"

# OpenAI API configuration for chatbot
OPENAI_API_KEY="your-openai-api-key"
```

4. Configure database
```bash
npx prisma migrate dev
```

5. Start the application
```bash
npm run dev
```

## Chatbot Configuration with GPT-4

The chatbot system is integrated with OpenAI GPT-4 to handle:
- Preliminary symptom analysis
- General medical Q&A
- Smart appointment booking assistance

To use this feature, you need to:
1. Register an account at [OpenAI](https://platform.openai.com/)
2. Create an API key at [OpenAI API Keys](https://platform.openai.com/account/api-keys)
3. Add the API key to `.env.local` file

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register new account
- `POST /api/auth/login`: Login

### Doctors
- `GET /api/doctors`: Get list of doctors
- `GET /api/doctors/[id]`: View doctor information
- `GET /api/doctors/[id]/schedule`: View doctor's schedule

### Appointments
- `GET /api/appointments`: Get list of appointments
- `POST /api/appointments`: Create new appointment
- `PUT /api/appointments/[id]`: Update appointment
- `GET /api/appointments/[id]/prescriptions`: View appointment prescriptions

### Chatbot
- `POST /api/chat`: Send message to chatbot

### Health
- `GET /api/health/metrics`: View health monitoring data
- `POST /api/health/metrics`: Add new health metrics
- `GET /api/health/insights`: View health analysis

## Author

© 2025. Course Project. 