import "server-only";
import { Schema, model, models, Types } from "mongoose";

const FinanceSchema = new Schema(
  {
    accountOwnerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["Icyacumi", "Amaturo y'ishimwe", "Amaturo y'itorero rikuru", "Ibirundo", "Inyubako"],
      required: true
    },
    date: { type: Date, required: true },
    giverName: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
    recordedBy: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

FinanceSchema.index({ accountOwnerId: 1, date: -1 });

export const Finance = models.Finance || model("Finance", FinanceSchema);
