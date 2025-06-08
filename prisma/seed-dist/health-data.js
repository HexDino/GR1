"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedHealthData = seedHealthData;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedHealthData() {
    console.log('Seeding health data (metrics, goals, notifications)...');
    // Get patients to create health data for
    const patients = await prisma.user.findMany({
        where: { role: 'PATIENT' },
        take: 20
    });
    if (patients.length === 0) {
        console.log('ℹ️ No patients found, skipping health data seeding...');
        return;
    }
    // Check if health data already exists
    const existingMetrics = await prisma.healthMetric.count();
    const existingGoals = await prisma.healthGoal.count();
    const existingNotifications = await prisma.notification.count();
    if (existingMetrics === 0) {
        // Create health metrics
        const healthMetrics = [];
        for (const patient of patients) {
            const now = new Date();
            // Create metrics for the past 3 months
            for (let i = 0; i < 90; i++) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                // Skip some days randomly (not everyone tracks daily)
                if (Math.random() < 0.3)
                    continue;
                // Blood Pressure (120-140 systolic, 80-90 diastolic)
                if (Math.random() < 0.6) {
                    const systolic = Math.floor(Math.random() * 20) + 120;
                    const diastolic = Math.floor(Math.random() * 10) + 80;
                    healthMetrics.push({
                        userId: patient.id,
                        type: client_1.MetricType.BLOOD_PRESSURE,
                        value: systolic,
                        notes: `Systolic: ${systolic}, Diastolic: ${diastolic}`,
                        createdAt: date,
                        updatedAt: date
                    });
                }
                // Weight (50-100 kg)
                if (Math.random() < 0.4) {
                    const weight = Math.round((Math.random() * 50 + 50) * 10) / 10;
                    healthMetrics.push({
                        userId: patient.id,
                        type: client_1.MetricType.WEIGHT,
                        value: weight,
                        notes: `Weight measurement`,
                        createdAt: date,
                        updatedAt: date
                    });
                }
                // Blood Sugar (80-120 mg/dL fasting)
                if (Math.random() < 0.3) {
                    const bloodSugar = Math.floor(Math.random() * 40) + 80;
                    healthMetrics.push({
                        userId: patient.id,
                        type: client_1.MetricType.BLOOD_SUGAR,
                        value: bloodSugar,
                        notes: `Fasting blood glucose`,
                        createdAt: date,
                        updatedAt: date
                    });
                }
                // Heart Rate (60-100 bpm)
                if (Math.random() < 0.5) {
                    const heartRate = Math.floor(Math.random() * 40) + 60;
                    healthMetrics.push({
                        userId: patient.id,
                        type: client_1.MetricType.HEART_RATE,
                        value: heartRate,
                        notes: `Resting heart rate`,
                        createdAt: date,
                        updatedAt: date
                    });
                }
            }
        }
        await prisma.healthMetric.createMany({
            data: healthMetrics,
            skipDuplicates: true
        });
        console.log(`✅ Created ${healthMetrics.length} health metrics`);
    }
    else {
        console.log(`ℹ️ Health metrics already exist (${existingMetrics} found), skipping...`);
    }
    if (existingGoals === 0) {
        // Create health goals
        const healthGoals = [];
        const goalTemplates = [
            {
                title: 'Weight Loss Goal',
                description: 'Lose weight through diet and exercise',
                category: client_1.HealthGoalCategory.WEIGHT,
                target: '70',
                unit: 'kg',
                priority: client_1.HealthGoalPriority.HIGH
            },
            {
                title: 'Daily Exercise',
                description: 'Exercise for at least 30 minutes daily',
                category: client_1.HealthGoalCategory.EXERCISE,
                target: '30',
                unit: 'minutes',
                priority: client_1.HealthGoalPriority.MEDIUM
            },
            {
                title: 'Healthy Diet',
                description: 'Eat 5 servings of fruits and vegetables daily',
                category: client_1.HealthGoalCategory.NUTRITION,
                target: '5',
                unit: 'servings',
                priority: client_1.HealthGoalPriority.MEDIUM
            },
            {
                title: 'Better Sleep',
                description: 'Get 8 hours of sleep every night',
                category: client_1.HealthGoalCategory.SLEEP,
                target: '8',
                unit: 'hours',
                priority: client_1.HealthGoalPriority.HIGH
            },
            {
                title: 'Medication Adherence',
                description: 'Take prescribed medication as scheduled',
                category: client_1.HealthGoalCategory.MEDICATION,
                target: '100',
                unit: 'percent',
                priority: client_1.HealthGoalPriority.HIGH
            },
            {
                title: 'Stress Management',
                description: 'Practice meditation or relaxation techniques',
                category: client_1.HealthGoalCategory.MENTAL_HEALTH,
                target: '15',
                unit: 'minutes',
                priority: client_1.HealthGoalPriority.MEDIUM
            }
        ];
        for (const patient of patients) {
            // Each patient has 1-3 health goals
            const numGoals = Math.floor(Math.random() * 3) + 1;
            const selectedGoals = goalTemplates
                .sort(() => 0.5 - Math.random())
                .slice(0, numGoals);
            for (const goalTemplate of selectedGoals) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Started 0-30 days ago
                const deadline = new Date(startDate);
                deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 90) + 30); // 30-120 days duration
                const progress = Math.floor(Math.random() * 80) + 10; // 10-90% progress
                let status = client_1.HealthGoalStatus.ACTIVE;
                if (progress >= 95)
                    status = client_1.HealthGoalStatus.COMPLETED;
                else if (deadline < new Date())
                    status = client_1.HealthGoalStatus.OVERDUE;
                const goal = {
                    userId: patient.id,
                    title: goalTemplate.title,
                    description: goalTemplate.description,
                    category: goalTemplate.category,
                    target: goalTemplate.target,
                    current: Math.floor(parseFloat(goalTemplate.target) * (progress / 100)).toString(),
                    unit: goalTemplate.unit,
                    startDate,
                    deadline,
                    progress,
                    status,
                    priority: goalTemplate.priority,
                    reminder: Math.random() < 0.7,
                    reminderTime: Math.random() < 0.7 ? '08:00' : '20:00'
                };
                healthGoals.push(goal);
            }
        }
        await prisma.healthGoal.createMany({
            data: healthGoals,
            skipDuplicates: true
        });
        console.log(`✅ Created ${healthGoals.length} health goals`);
    }
    else {
        console.log(`ℹ️ Health goals already exist (${existingGoals} found), skipping...`);
    }
    if (existingNotifications === 0) {
        // Create notifications
        const notifications = [];
        // Get some recent appointments for appointment notifications
        const recentAppointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)) // Last 7 days
                }
            },
            take: 20
        });
        // Get some prescriptions for medication reminders
        const activePrescriptions = await prisma.prescription.findMany({
            where: { status: 'ACTIVE' },
            take: 15
        });
        for (const patient of patients) {
            // Appointment reminders
            const patientAppointments = recentAppointments.filter(apt => apt.patientId === patient.id);
            for (const appointment of patientAppointments) {
                if (Math.random() < 0.8) { // 80% get reminders
                    notifications.push({
                        userId: patient.id,
                        type: client_1.NotificationType.APPOINTMENT_REMINDER,
                        title: 'Appointment Reminder',
                        message: `You have an upcoming appointment scheduled for ${appointment.date.toLocaleDateString()}.`,
                        isRead: Math.random() < 0.3,
                        createdAt: new Date(appointment.date.getTime() - (24 * 60 * 60 * 1000)) // 1 day before
                    });
                }
            }
            // Medication reminders
            const patientPrescriptions = activePrescriptions.filter(rx => rx.patientId === patient.id);
            for (const prescription of patientPrescriptions) {
                if (Math.random() < 0.6) { // 60% get medication reminders
                    notifications.push({
                        userId: patient.id,
                        type: client_1.NotificationType.PRESCRIPTION_REMINDER,
                        title: 'Medication Reminder',
                        message: `Don't forget to take your prescribed medication for ${prescription.diagnosis}.`,
                        isRead: Math.random() < 0.4,
                        createdAt: new Date()
                    });
                }
            }
            // General health tips
            if (Math.random() < 0.7) {
                const healthTips = [
                    'Remember to stay hydrated throughout the day!',
                    'Regular exercise can improve your overall health.',
                    'A balanced diet is key to maintaining good health.',
                    'Getting enough sleep is important for your wellbeing.',
                    'Don\'t forget to schedule your regular health check-up.'
                ];
                notifications.push({
                    userId: patient.id,
                    type: client_1.NotificationType.GENERAL,
                    title: 'Health Tip',
                    message: healthTips[Math.floor(Math.random() * healthTips.length)],
                    isRead: Math.random() < 0.5,
                    createdAt: new Date(new Date().getTime() - Math.random() * (7 * 24 * 60 * 60 * 1000))
                });
            }
        }
        await prisma.notification.createMany({
            data: notifications,
            skipDuplicates: true
        });
        console.log(`✅ Created ${notifications.length} notifications`);
    }
    else {
        console.log(`ℹ️ Notifications already exist (${existingNotifications} found), skipping...`);
    }
}
