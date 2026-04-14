import "server-only";
import { Schema, model, models, Types } from "mongoose";

const GroupSchema = new Schema(
  {
    accountOwnerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    leaderName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

GroupSchema.index({ accountOwnerId: 1, name: 1 });

export const Group = models.Group || model("Group", GroupSchema);
