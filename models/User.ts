import { Schema, type HydratedDocument, models, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: 80,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    select: false, // never returned by default queries
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Prevent model overwrite errors during Next.js hot reload
export default models.User || model<IUser>("User", UserSchema);
