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
