import { describe, it, expect } from "vitest";
import { calcPay, weekStart, weekEnd, shiftWeek } from "./payroll";

describe("calcPay", () => {
  it("menghitung gaji bersih", () => {
    const r = calcPay({ baseSalary: 8650000, allowance: 1000000, overtimeHours: 2, lateCount: 2, otherDeduction: 0 });
    expect(r.overtimePay).toBe(150000);
    expect(r.bpjs).toBe(346000);
    expect(r.latePenalty).toBe(50000);
    expect(r.net).toBe(8650000 + 1000000 + 150000 - 346000 - 50000);
  });
});
