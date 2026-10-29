export const LATE_PENALTY = 25000; // per keterlambatan
export const BPJS_RATE = 0.04; // potongan BPJS karyawan (kesehatan 1% + JHT 2% + JP 1%)
export const OVERTIME_DIVISOR = 173;
export const OVERTIME_MULTIPLIER = 1.5;

export interface PayInput {
  baseSalary: number;
  allowance: number;
  overtimeHours: number;
  lateCount: number;
  otherDeduction: number;
}

export function calcPay(p: PayInput) {
  const overtimePay = Math.round((p.baseSalary / OVERTIME_DIVISOR) * OVERTIME_MULTIPLIER * p.overtimeHours);
  const bpjs = Math.round(p.baseSalary * BPJS_RATE);
  const latePenalty = p.lateCount * LATE_PENALTY;
  const gross = p.baseSalary + p.allowance + overtimePay;
  const deductions = bpjs + latePenalty + p.otherDeduction;
  return { overtimePay, bpjs, latePenalty, gross, deductions, net: gross - deductions };
}

export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// Periode gaji mingguan: Senin–Sabtu. weekStart mengembalikan tanggal Senin (YYYY-MM-DD).
export function weekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Minggu, 1=Senin, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function weekEnd(week: string): string {
  const d = new Date(week + "T00:00:00");
  d.setDate(d.getDate() + 5);
  return d.toISOString().slice(0, 10);
}

export function weekLabel(week: string): string {
  const fmt = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  return `${fmt(week)} – ${fmt(weekEnd(week))}`;
}

export function shiftWeek(week: string, delta: number): string {
  const d = new Date(week + "T00:00:00");
  d.setDate(d.getDate() + delta * 7);
  return d.toISOString().slice(0, 10);
}
