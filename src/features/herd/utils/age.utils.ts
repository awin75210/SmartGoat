export function startOfToday(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isSameCalendarDay(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatAgeVi(birthDate: Date | string | null, now = new Date()): string {
  if (!birthDate) return "—";

  const birth = typeof birthDate === "string" ? parseBirthDate(birthDate) : birthDate;
  if (!birth || birth > now) return "—";

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} năm`);
  if (months > 0) parts.push(`${months} tháng`);
  if (days > 0 || parts.length === 0) parts.push(`${Math.max(days, 0)} ngày`);

  return parts.slice(0, 2).join(" ");
}

function parseBirthDate(value: string): Date | null {
  const iso = value.includes("T") ? value.slice(0, 10) : value;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatBirthDateVi(birthDate: Date | string | null): string {
  if (!birthDate) return "—";
  const d = typeof birthDate === "string" ? parseBirthDate(birthDate) : birthDate;
  if (!d) return "—";
  return d.toLocaleDateString("vi-VN");
}
