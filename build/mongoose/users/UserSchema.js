"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true, default: `testusername${Date.now()}` },
    password: { type: String, required: true, default: `testpassword${Date.now()}` },
    firstName: String,
    lastName: String,
    email: { type: String, required: true, default: `testemail${Date.now()}` },
    profilePhoto: String,
    headerImage: String,
    biography: String,
    dateOfBirth: Date,
    accountType: { type: String, enum: ["PERSONAL", "ACADEMIC", "PROFESSIONAL"] },
    maritalStatus: { type: String, enum: ["MARRIED", "SINGLE", "WIDOWED"] },
    location: {
        latitude: Number,
        longitude: Number
    },
    salary: { type: Number, default: 50000 }
}, { collection: "users" });
exports.default = UserSchema;
