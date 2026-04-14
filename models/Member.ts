import "server-only";
import { Schema, model, models, Types } from "mongoose";

const MemberSchema = new Schema(
  {
    names: { type: String, required: true, trim: true },
    accountOwnerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    birthDate: { type: Date, required: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["gabo", "gore"], required: true },
    churchRole: { type: String, default: "", trim: true },
    group: { type: Types.ObjectId, ref: "Group", default: null },
    baptized: { type: Boolean, default: false }
  },
  { timestamps: true }
);

MemberSchema.index({ accountOwnerId: 1, names: 1 });

export const Member = models.Member || model("Member", MemberSchema);
