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
exports.seedUsers = seedUsers;
var client_1 = require("@prisma/client");
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function seedUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var existingDoctorUser, existingPatientUser, hashedDoctorPassword, doctorUser, hashedPatientPassword, patientUser;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding users...');
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: 'admindoctor@example.com' }
                        })];
                case 1:
                    existingDoctorUser = _a.sent();
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: 'adminpatient@example.com' }
                        })];
                case 2:
                    existingPatientUser = _a.sent();
                    if (!!existingDoctorUser) return [3 /*break*/, 6];
                    return [4 /*yield*/, bcrypt.hash('0', 10)];
                case 3:
                    hashedDoctorPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'admindoctor@example.com',
                                password: hashedDoctorPassword,
                                name: 'Admin Doctor',
                                role: client_1.UserRole.DOCTOR,
                                isActive: true,
                                isEmailVerified: true,
                                phone: '+84123456789',
                            }
                        })];
                case 4:
                    doctorUser = _a.sent();
                    // Create the corresponding doctor profile
                    return [4 /*yield*/, prisma.doctor.create({
                            data: {
                                userId: doctorUser.id,
                                specialization: 'General Medicine',
                                license: 'DOC12345',
                                licenseExpiry: new Date('2030-12-31'),
                                verificationStatus: 'VERIFIED',
                                experience: 10,
                                bio: 'Experienced doctor with 10 years of practice.',
                                consultationFee: 50,
                                isAvailable: true,
                            }
                        })];
                case 5:
                    // Create the corresponding doctor profile
                    _a.sent();
                    console.log('Doctor user created:', doctorUser.email);
                    return [3 /*break*/, 7];
                case 6:
                    console.log('Doctor user already exists');
                    _a.label = 7;
                case 7:
                    if (!!existingPatientUser) return [3 /*break*/, 12];
                    return [4 /*yield*/, bcrypt.hash('0', 10)];
                case 8:
                    hashedPatientPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'adminpatient@example.com',
                                password: hashedPatientPassword,
                                name: 'Admin Patient',
                                role: client_1.UserRole.PATIENT,
                                isActive: true,
                                isEmailVerified: true,
                                phone: '+84987654321',
                            }
                        })];
                case 9:
                    patientUser = _a.sent();
                    // Create the corresponding patient profile
                    return [4 /*yield*/, prisma.patient.create({
                            data: {
                                userId: patientUser.id,
                                gender: 'MALE',
                                dateOfBirth: new Date('1990-01-01'),
                                bloodType: 'O+',
                                allergies: 'None',
                            }
                        })];
                case 10:
                    // Create the corresponding patient profile
                    _a.sent();
                    // Create basic profile
                    return [4 /*yield*/, prisma.profile.create({
                            data: {
                                userId: patientUser.id,
                                gender: 'MALE',
                                dateOfBirth: new Date('1990-01-01'),
                                address: '123 Health Street, Medical City',
                            }
                        })];
                case 11:
                    // Create basic profile
                    _a.sent();
                    console.log('Patient user created:', patientUser.email);
                    return [3 /*break*/, 13];
                case 12:
                    console.log('Patient user already exists');
                    _a.label = 13;
                case 13:
                    console.log('Users seeding completed.');
                    return [2 /*return*/];
            }
        });
    });
}
