export function formatMoney(value: number) {
  return `RWF ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value)}`;
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("rw-RW", {
    dateStyle: "medium"
  }).format(new Date(date));
}

export function monthKey(date: string | Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").trim();
}

export const MIN_PASSWORD_LENGTH = 8;

export function hasValidPasswordLength(password: string) {
  return password.trim().length >= MIN_PASSWORD_LENGTH;
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat("rw-RW", {
    day: "numeric",
    month: "short"
  }).format(new Date(date));
}

export function getMonthSabbathReminders(referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const labels = [
    "I Sabato y'ubutabazi",
    "I Sabato y'umuryango",
    "I Sabato ya Jiya",
    "I Sabato ya MIFEM",
    "I Sabato y'Abana"
  ];

  const sabbaths: Date[] = [];
  const cursor = new Date(year, month, 1);

  while (cursor.getMonth() === month) {
    if (cursor.getDay() === 6) {
      sabbaths.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return sabbaths.map((date, index) => ({
    label: labels[index],
    date,
    dateText: formatDate(date),
    isToday:
      date.getDate() === referenceDate.getDate() &&
      date.getMonth() === referenceDate.getMonth() &&
      date.getFullYear() === referenceDate.getFullYear()
  }));
}
