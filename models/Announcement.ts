import "server-only";
import { Schema, model, models, Types } from "mongoose";

const AnnouncementSchema = new Schema(
  {
    accountOwnerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

AnnouncementSchema.index({ accountOwnerId: 1, createdAt: -1 });

export const Announcement =
  models.Announcement || model("Announcement", AnnouncementSchema);
