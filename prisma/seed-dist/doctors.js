"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDoctors = seedDoctors;
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const doctorSpecialties = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology',
    'Gynecology',
    'Urology',
    'Psychiatry',
    'Oncology',
];
const doctorData = [
    {
        email: 'dr.nguyen@example.com',
        name: 'Dr. William Nguyen',
        password: 'doctor123',
        specialty: 'Cardiology',
        experience: 10,
        consultationFee: 500000,
        bio: 'Cardiology specialist with over 10 years of experience, graduate of Harvard Medical School.',
    },
    {
        email: 'dr.tran@example.com',
        name: 'Dr. Michael Tran',
        password: 'doctor123',
        specialty: 'Neurology',
        experience: 8,
        consultationFee: 450000,
        bio: 'Neurology specialist focused on treating brain and spinal cord disorders.',
    },
    {
        email: 'dr.pham@example.com',
        name: 'Dr. Emily Pham',
        password: 'doctor123',
        specialty: 'Pediatrics',
        experience: 12,
        consultationFee: 400000,
        bio: 'Pediatrician with extensive experience caring for children from newborns to adolescents.',
    },
    {
        email: 'dr.le@example.com',
        name: 'Dr. Thomas Le',
        password: 'doctor123',
        specialty: 'Orthopedics',
        experience: 15,
        consultationFee: 550000,
        bio: 'Orthopedic surgeon specialized in joint replacement and sports medicine.',
    },
    {
        email: 'dr.hoang@example.com',
        name: 'Dr. Robert Hoang',
        password: 'doctor123',
        specialty: 'Dermatology',
        experience: 7,
        consultationFee: 350000,
        bio: 'Dermatologist specializing in skin disorders and cosmetic procedures.',
    },
    {
        email: 'dr.vo@example.com',
        name: 'Dr. Sarah Vo',
        password: 'doctor123',
        specialty: 'Ophthalmology',
        experience: 9,
        consultationFee: 400000,
        bio: 'Ophthalmologist with expertise in Lasik surgery and treatment of various eye conditions.',
    },
    {
        email: 'dr.luu@example.com',
        name: 'Dr. Jennifer Luu',
        password: 'doctor123',
        specialty: 'Gynecology',
        experience: 11,
        consultationFee: 500000,
        bio: 'Gynecologist specialized in women\'s health and reproductive medicine.',
    },
    {
        email: 'dr.dang@example.com',
        name: 'Dr. David Dang',
        password: 'doctor123',
        specialty: 'Urology',
        experience: 8,
        consultationFee: 450000,
        bio: 'Urologist specialized in treating conditions of the urinary tract in both men and women.',
    },
    {
        email: 'dr.trinh@example.com',
        name: 'Dr. Richard Trinh',
        password: 'doctor123',
        specialty: 'Psychiatry',
        experience: 14,
        consultationFee: 600000,
        bio: 'Psychiatrist specializing in mental health disorders and psychological therapy.',
    },
    {
        email: 'dr.dinh@example.com',
        name: 'Dr. Katherine Dinh',
        password: 'doctor123',
        specialty: 'Oncology',
        experience: 16,
        consultationFee: 650000,
        bio: 'Oncologist with extensive experience in cancer treatment and research.',
    },
];
async function seedDoctors() {
    console.log('Seeding doctors...');
    for (const doctor of doctorData) {
        const hashedPassword = await (0, bcryptjs_1.hash)(doctor.password, 12);
        try {
            // Create User with DOCTOR role
            const user = await prisma.user.create({
                data: {
                    email: doctor.email,
                    password: hashedPassword,
                    name: doctor.name,
                    role: 'DOCTOR',
                },
            });
            // Create Profile
            await prisma.profile.create({
                data: {
                    userId: user.id,
                    bio: doctor.bio,
                },
            });
            // Create Doctor
            const doctorRecord = await prisma.doctor.create({
                data: {
                    userId: user.id,
                    specialization: doctor.specialty,
                    license: `LIC-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                    verificationStatus: 'VERIFIED',
                    experience: doctor.experience,
                    consultationFee: doctor.consultationFee,
                    isAvailable: true,
                },
            });
            // DoctorSchedule model doesn't exist in the schema, so we skip creating schedules
            // Instead of:
            // const weekdays = [1, 2, 3, 4, 5]; // Monday to Friday
            // for (const weekday of weekdays) {
            //   await prisma.doctorSchedule.create({
            //     data: {
            //       doctorId: doctorRecord.id,
            //       weekday: weekday,
            //       startTime: '09:00',
            //       endTime: '17:00',
            //       isAvailable: true,
            //       maxAppointments: 8,
            //     },
            //   });
            // }
            console.log(`Created doctor: ${doctor.name}`);
        }
        catch (error) {
            console.error(`Error creating doctor ${doctor.name}:`, error);
        }
    }
    console.log('Doctors seeding completed.');
}
