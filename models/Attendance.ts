import "server-only";
import { Schema, model, models, Types } from "mongoose";

const AttendanceItemSchema = new Schema(
  {
    memberId: { type: Types.ObjectId, ref: "Member", required: true },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true
    }
  },
  { _id: false }
);

const AttendanceSchema = new Schema(
  {
    accountOwnerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    serviceType: {
      type: String,
      enum: ["Sabbath"],
      required: true
    },
    date: { type: Date, required: true },
    takenBy: { type: String, required: true, trim: true },
    records: { type: [AttendanceItemSchema], default: [] }
  },
  { timestamps: true }
);

AttendanceSchema.index({ accountOwnerId: 1, date: -1 });
AttendanceSchema.index({ accountOwnerId: 1, serviceType: 1, date: 1 }, { unique: true });

export const Attendance = models.Attendance || model("Attendance", AttendanceSchema);
