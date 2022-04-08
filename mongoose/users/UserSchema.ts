import mongoose from "mongoose";
import User from "../../models/users/User";
const UserSchema = new mongoose.Schema<User>(
  {
    username: {
      type: String,
      required: true,
      default: `testusername${Date.now()}`
    },
    password: {
      type: String,
      required: true,
      default: `testpassword${Date.now()}`
    },
    firstName: String,
    lastName: String,
    email: { type: String, required: true, default: `testemail${Date.now()}` },
    profilePhoto: String,
    headerImage: String,
    biography: String,
    dateOfBirth: Date,
    accountType: {
      type: String,
      enum: ["PERSONAL", "ACADEMIC", "PROFESSIONAL"]
    },
    maritalStatus: { type: String, enum: ["MARRIED", "SINGLE", "WIDOWED"] },
    location: {
      latitude: Number,
      longitude: Number
    },
    salary: { type: Number, default: 50000 },
    avatar: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/image-d9eae.appspot.com/o/images%2Fdefault-avatar.jpeg?alt=media&token=4c5d0224-e530-4d60-b03a-f56251460ee2"
    }
  },
  { collection: "users" }
);

export default UserSchema;
