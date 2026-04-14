import "server-only";
import { toObjectId } from "@/lib/account";
import { Group } from "@/models/Group";

export const DEFAULT_GROUP_NAMES = [
  "Abasore",
  "Gatenga",
  "Karembure",
  "Rukata",
  "Nyanza ya 1",
  "Nyanza ya 2",
  "Songa",
  "Abana"
] as const;

export async function ensureDefaultGroups(accountOwnerId: string) {
  const groups = await Group.find({ accountOwnerId: toObjectId(accountOwnerId) })
    .sort({ name: 1 })
    .lean();

  const names = new Set(groups.map((group) => String(group.name).trim().toLowerCase()));
  const missing = DEFAULT_GROUP_NAMES.filter((name) => !names.has(name.toLowerCase()));

  if (missing.length) {
    await Group.insertMany(
      missing.map((name) => ({
        accountOwnerId: toObjectId(accountOwnerId),
        name,
        leaderName: "Ntirashyirwaho"
      }))
    );
  }
}

export function sortGroupsByChurchOrder<T extends { name: string }>(groups: T[]) {
  const order = new Map(DEFAULT_GROUP_NAMES.map((name, index) => [name.toLowerCase(), index]));

  return [...groups].sort((a, b) => {
    const aIndex = order.get(a.name.toLowerCase());
    const bIndex = order.get(b.name.toLowerCase());

    if (aIndex !== undefined && bIndex !== undefined) {
      return aIndex - bIndex;
    }

    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;

    return a.name.localeCompare(b.name, "rw");
  });
}
