"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDoctors = seedDoctors;
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
var doctorSpecialties = [
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
var doctorData = [
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
function seedDoctors() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, doctorData_1, doctor, hashedPassword, user, doctorRecord, weekdays, _a, weekdays_1, weekday, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Seeding doctors...');
                    _i = 0, doctorData_1 = doctorData;
                    _b.label = 1;
                case 1:
                    if (!(_i < doctorData_1.length)) return [3 /*break*/, 13];
                    doctor = doctorData_1[_i];
                    return [4 /*yield*/, (0, bcryptjs_1.hash)(doctor.password, 12)];
                case 2:
                    hashedPassword = _b.sent();
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 11, , 12]);
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: doctor.email,
                                password: hashedPassword,
                                name: doctor.name,
                                role: 'DOCTOR',
                            },
                        })];
                case 4:
                    user = _b.sent();
                    // Create Profile
                    return [4 /*yield*/, prisma.profile.create({
                            data: {
                                userId: user.id,
                                bio: doctor.bio,
                            },
                        })];
                case 5:
                    // Create Profile
                    _b.sent();
                    return [4 /*yield*/, prisma.doctor.create({
                            data: {
                                userId: user.id,
                                specialization: doctor.specialty,
                                license: "LIC-".concat(Math.floor(Math.random() * 10000).toString().padStart(4, '0')),
                                licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                                verificationStatus: 'VERIFIED',
                                experience: doctor.experience,
                                consultationFee: doctor.consultationFee,
                                isAvailable: true,
                            },
                        })];
                case 6:
                    doctorRecord = _b.sent();
                    weekdays = [1, 2, 3, 4, 5];
                    _a = 0, weekdays_1 = weekdays;
                    _b.label = 7;
                case 7:
                    if (!(_a < weekdays_1.length)) return [3 /*break*/, 10];
                    weekday = weekdays_1[_a];
                    return [4 /*yield*/, prisma.doctorSchedule.create({
                            data: {
                                doctorId: doctorRecord.id,
                                weekday: weekday,
                                startTime: '09:00',
                                endTime: '17:00',
                                isAvailable: true,
                                maxAppointments: 8,
                            },
                        })];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 7];
                case 10:
                    console.log("Created doctor: ".concat(doctor.name));
                    return [3 /*break*/, 12];
                case 11:
                    error_1 = _b.sent();
                    console.error("Error creating doctor ".concat(doctor.name, ":"), error_1);
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 1];
                case 13:
                    console.log('Doctors seeding completed.');
                    return [2 /*return*/];
            }
        });
    });
}
