import "server-only";
import { normalizePermissions } from "@/lib/permissions";
import { ensureDefaultGroups, sortGroupsByChurchOrder } from "@/lib/default-groups";
import { getMonthSabbathReminders, monthKey } from "@/lib/utils";
import { accountFilter } from "@/lib/account";
import { connectDb } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { Attendance } from "@/models/Attendance";
import { Finance } from "@/models/Finance";
import { Group } from "@/models/Group";
import { Member } from "@/models/Member";
import { User } from "@/models/User";

type DbId = { toString(): string };

type MemberLean = {
  _id: DbId;
  names: string;
  birthDate: Date | string;
  phone: string;
  address: string;
  gender: "gabo" | "gore";
  churchRole?: string;
  baptized?: boolean;
  group?: { _id: DbId; name: string } | null;
};

type GroupLean = {
  _id: DbId;
  name: string;
  leaderName: string;
};

type AnnouncementLean = {
  _id: DbId;
  title: string;
  description: string;
  authorName: string;
  createdAt?: Date | string;
};

type FinanceLean = {
  _id: DbId;
  amount: number;
  type: string;
  giverName?: string;
  note?: string;
  recordedBy: string;
  date: Date | string;
};

type AttendanceRecord = {
  memberId?: { _id: DbId; names: string } | string | null;
  status: "present" | "absent";
};

type AttendanceLean = {
  _id: DbId;
  serviceType: "Sabbath";
  date: Date | string;
  takenBy: string;
  records: AttendanceRecord[];
};

type UserLean = {
  _id: DbId;
  names: string;
  phone: string;
  role: "super_admin" | "admin" | "assistant";
  isActive: boolean;
  permissions: Record<string, boolean>;
};

export async function getMembersData(accountOwnerId: string) {
  await connectDb();
  const members = (await Member.find(accountFilter(accountOwnerId))
    .sort({ names: 1 })
    .populate("group", "name")
    .lean()) as unknown as MemberLean[];

  return members.map((member) => ({
    _id: String(member._id),
    names: member.names,
    birthDate: new Date(member.birthDate).toISOString(),
    phone: member.phone,
    address: member.address,
    gender: member.gender,
    churchRole: member.churchRole || "",
    baptized: Boolean(member.baptized),
    groupId: member.group ? String(member.group._id) : "",
    groupName: member.group?.name || ""
  }));
}

export async function getGroupsData(accountOwnerId: string) {
  await connectDb();
  await ensureDefaultGroups(accountOwnerId);

  const [groups, counts] = await Promise.all([
    Group.find(accountFilter(accountOwnerId)).sort({ name: 1 }).lean() as unknown as Promise<
      GroupLean[]
    >,
    Member.aggregate<{ _id: DbId; totalMembers: number }>([
      { $match: { ...accountFilter(accountOwnerId), group: { $ne: null } } },
      { $group: { _id: "$group", totalMembers: { $sum: 1 } } }
    ])
  ]);

  const countMap = new Map(counts.map((item) => [String(item._id), item.totalMembers]));

  return {
    totalGroups: groups.length,
    groups: sortGroupsByChurchOrder(groups).map((group) => ({
      _id: String(group._id),
      name: group.name,
      leaderName: group.leaderName,
      totalMembers: countMap.get(String(group._id)) || 0
    }))
  };
}

export async function getAnnouncementsData(accountOwnerId: string) {
  await connectDb();
  const announcements = (await Announcement.find(accountFilter(accountOwnerId))
    .sort({ createdAt: -1 })
    .lean()) as unknown as AnnouncementLean[];

  return announcements.map((announcement) => ({
    _id: String(announcement._id),
    title: announcement.title,
    description: announcement.description,
    authorName: announcement.authorName,
    createdAt: announcement.createdAt
      ? new Date(announcement.createdAt).toISOString()
      : new Date().toISOString()
  }));
}

export async function getFinanceData(accountOwnerId: string) {
  await connectDb();
  const records = (await Finance.find(accountFilter(accountOwnerId))
    .sort({ date: -1 })
    .lean()) as unknown as FinanceLean[];

  const totalRevenue = records.reduce((sum, item) => sum + item.amount, 0);
  const currentMonth = monthKey(new Date());
  const monthTotal = records
    .filter((item) => monthKey(item.date) === currentMonth)
    .reduce((sum, item) => sum + item.amount, 0);

  const breakdownMap = records.reduce(
    (acc: Record<string, number>, item) => {
      acc[item.type] = (acc[item.type] || 0) + item.amount;
      return acc;
    },
    {}
  );

  const trendMap = new Map<string, { label: string; amount: number }>();
  for (const record of [...records].reverse()) {
    const key = monthKey(record.date);
    const saved = trendMap.get(key) || {
      label: new Intl.DateTimeFormat("rw-RW", { month: "short" }).format(new Date(record.date)),
      amount: 0
    };

    saved.amount += record.amount;
    trendMap.set(key, saved);
  }

  return {
    totalRevenue,
    monthTotal,
    records: records.map((record) => ({
      _id: String(record._id),
      amount: record.amount,
      type: record.type,
      giverName: record.giverName || "",
      note: record.note || "",
      recordedBy: record.recordedBy,
      date: new Date(record.date).toISOString()
    })),
    breakdown: Object.entries(breakdownMap).map(([name, amount]) => ({ name, amount })),
    monthlyTrend: [...trendMap.values()].slice(-6)
  };
}

export async function getAttendanceData(accountOwnerId: string) {
  await connectDb();
  await ensureDefaultGroups(accountOwnerId);

  const [members, groups, attendance] = await Promise.all([
    Member.find(accountFilter(accountOwnerId))
      .populate("group", "name")
      .lean() as unknown as Promise<MemberLean[]>,
    Group.find(accountFilter(accountOwnerId)).sort({ name: 1 }).lean() as unknown as Promise<
      GroupLean[]
    >,
    Attendance.find(accountFilter(accountOwnerId))
      .sort({ date: -1 })
      .limit(32)
      .populate("records.memberId", "names")
      .lean() as unknown as Promise<AttendanceLean[]>
  ]);

  const sabbathData = [...attendance]
    .reverse()
    .slice(-8)
    .map((item) => ({
      label: new Intl.DateTimeFormat("rw-RW", {
        day: "numeric",
        month: "short"
      }).format(new Date(item.date)),
      present: item.records.filter((record) => record.status === "present").length,
      absent: item.records.filter((record) => record.status === "absent").length
    }));

  const trendMap = new Map<string, { month: string; total: number; count: number }>();
  for (const item of [...attendance].reverse()) {
    const key = monthKey(item.date);
    const saved = trendMap.get(key) || {
      month: new Intl.DateTimeFormat("rw-RW", { month: "short" }).format(new Date(item.date)),
      total: 0,
      count: 0
    };

    saved.total += item.records.filter((record) => record.status === "present").length;
      saved.count += 1;
      trendMap.set(key, saved);
  }

  const sortedGroups = sortGroupsByChurchOrder(groups);
  const groupOrder = new Map(sortedGroups.map((group, index) => [String(group._id), index]));

  return {
    members: members
      .map((member) => ({
        _id: String(member._id),
        names: member.names,
        groupId: member.group ? String(member.group._id) : "",
        groupName: member.group?.name || "Nta tsinda"
      }))
      .sort((a, b) => {
        const aIndex = a.groupId ? (groupOrder.get(a.groupId) ?? 999) : 999;
        const bIndex = b.groupId ? (groupOrder.get(b.groupId) ?? 999) : 999;

        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }

        return a.names.localeCompare(b.names, "rw");
      }),
    groups: sortedGroups.map((group) => ({
      _id: String(group._id),
      name: group.name
    })),
    attendance: attendance.map((item) => ({
      _id: String(item._id),
      serviceType: item.serviceType,
      date: new Date(item.date).toISOString(),
      takenBy: item.takenBy,
      records: item.records.map((record) => ({
        memberId:
          record.memberId && typeof record.memberId === "object"
            ? {
                _id: String(record.memberId._id),
                names: record.memberId.names
              }
            : record.memberId
              ? String(record.memberId)
              : "",
        status: record.status
      }))
    })),
    sabbathData,
    monthlyTrend: [...trendMap.values()].slice(-6).map((item) => ({
      month: item.month,
      attendance: Math.round(item.total / Math.max(item.count, 1))
    }))
  };
}

export async function getUsersData(accountOwnerId: string) {
  await connectDb();
  const users = (await User.find(accountFilter(accountOwnerId))
    .select("-password -recoveryPassword")
    .sort({ createdAt: -1 })
    .lean()) as unknown as UserLean[];

  return users.map((user) => ({
    _id: String(user._id),
    names: user.names,
    phone: user.phone,
    role: user.role,
    isActive: Boolean(user.isActive),
    permissions: normalizePermissions(user.permissions, user.role)
  }));
}

export async function getDashboardData(accountOwnerId: string) {
  await connectDb();
  await ensureDefaultGroups(accountOwnerId);
  const [memberCount, latestAttendance, recentAnnouncements, finance, groups] = await Promise.all([
    Member.countDocuments(accountFilter(accountOwnerId)),
    Attendance.findOne(accountFilter(accountOwnerId))
      .sort({ date: -1 })
      .lean() as unknown as Promise<AttendanceLean | null>,
    Announcement.find(accountFilter(accountOwnerId))
      .sort({ createdAt: -1 })
      .limit(4)
      .lean() as unknown as Promise<AnnouncementLean[]>,
    Finance.find(accountFilter(accountOwnerId)).lean() as unknown as Promise<FinanceLean[]>,
    Group.countDocuments(accountFilter(accountOwnerId))
  ]);

  const totalRevenue = finance.reduce((sum, item) => sum + item.amount, 0);

  return {
    memberCount,
    totalGroups: groups,
    latestSabbathAttendance: latestAttendance
      ? latestAttendance.records.filter((record) => record.status === "present").length
      : 0,
    totalRevenue,
    recentAnnouncements: recentAnnouncements.map((item) => ({
      _id: String(item._id),
      title: item.title,
      description: item.description,
      authorName: item.authorName
    })),
    sabbathReminders: getMonthSabbathReminders()
  };
}
