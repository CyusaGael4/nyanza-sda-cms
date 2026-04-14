import "server-only";
import { Types } from "mongoose";
import { Announcement } from "@/models/Announcement";
import { Attendance } from "@/models/Attendance";
import { Finance } from "@/models/Finance";
import { Group } from "@/models/Group";
import { Member } from "@/models/Member";
import { User } from "@/models/User";

type IdLike =
  | string
  | { toString(): string }
  | Types.ObjectId
  | null
  | undefined;

type UserOwnershipLike = {
  _id: IdLike;
  role: "super_admin" | "admin" | "assistant";
  accountOwnerId?: IdLike;
};

type SuperAdminOwnershipLike = {
  _id: IdLike;
  accountOwnerId?: IdLike;
};

const migratedAccounts = new Set<string>();

export function readObjectId(value: IdLike) {
  if (!value) return "";
  return String(value);
}

export function toObjectId(value: string) {
  return new Types.ObjectId(value);
}

export function isValidId(value: string) {
  return Types.ObjectId.isValid(value);
}

export function accountFilter(accountOwnerId: string) {
  return { accountOwnerId: toObjectId(accountOwnerId) };
}

export async function ensureUserAccountOwner(user: UserOwnershipLike) {
  const savedOwnerId = readObjectId(user.accountOwnerId);
  if (savedOwnerId) {
    return savedOwnerId;
  }

  const selfId = readObjectId(user._id);
  if (!selfId) {
    return null;
  }

  if (user.role === "super_admin") {
    await User.updateOne(
      { _id: user._id, $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: user._id } }
    );
    return selfId;
  }

  const superAdmins = (await User.find({ role: "super_admin" })
    .select("_id accountOwnerId")
    .lean()) as SuperAdminOwnershipLike[];
  if (superAdmins.length !== 1) {
    return null;
  }

  const ownerId = readObjectId(superAdmins[0].accountOwnerId) || readObjectId(superAdmins[0]._id);
  if (!ownerId) {
    return null;
  }

  await User.updateOne(
    { _id: user._id, $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
    { $set: { accountOwnerId: toObjectId(ownerId) } }
  );

  return ownerId;
}

export async function migrateLegacyAccountData(accountOwnerId: string) {
  if (!accountOwnerId || migratedAccounts.has(accountOwnerId)) {
    return;
  }

  const superAdminCount = await User.countDocuments({ role: "super_admin" });
  if (superAdminCount !== 1) {
    return;
  }

  const ownerObjectId = toObjectId(accountOwnerId);
  await Promise.all([
    User.updateMany(
      { $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: ownerObjectId } }
    ),
    Member.updateMany(
      { $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: ownerObjectId } }
    ),
    Group.updateMany(
      { $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: ownerObjectId } }
    ),
    Announcement.updateMany(
      { $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: ownerObjectId } }
    ),
    Finance.updateMany(
      { $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: ownerObjectId } }
    ),
    Attendance.updateMany(
      { $or: [{ accountOwnerId: { $exists: false } }, { accountOwnerId: null }] },
      { $set: { accountOwnerId: ownerObjectId } }
    )
  ]);

  migratedAccounts.add(accountOwnerId);
}
