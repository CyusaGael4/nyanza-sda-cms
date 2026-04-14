import "server-only";
import { Schema, model, models, Types } from "mongoose";

const UserSchema = new Schema(
  {
    names: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    recoveryPassword: { type: String, default: "" },
    accountOwnerId: { type: Types.ObjectId, ref: "User", index: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "assistant"],
      default: "assistant"
    },
    permissions: {
      dashboard: { type: Boolean, default: true },
      members: { type: Boolean, default: false },
      attendance: { type: Boolean, default: false },
      announcements: { type: Boolean, default: false },
      groups: { type: Boolean, default: false },
      finance: { type: Boolean, default: false },
      users: { type: Boolean, default: false }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

UserSchema.index({ accountOwnerId: 1, createdAt: -1 });

export const User = models.User || model("User", UserSchema);
