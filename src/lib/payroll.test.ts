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

describe("periode mingguan", () => {
  it("weekStart mengembalikan hari Senin", () => {
    expect(weekStart(new Date("2026-10-29T00:00:00"))).toBe("2026-10-26"); // Kamis → Senin
    expect(weekStart(new Date("2026-11-01T00:00:00"))).toBe("2026-10-26"); // Minggu → Senin minggu itu
    expect(weekStart(new Date("2026-10-26T00:00:00"))).toBe("2026-10-26"); // Senin tetap
  });
  it("weekEnd mengembalikan hari Sabtu", () => {
    expect(weekEnd("2026-10-26")).toBe("2026-10-31");
  });
  it("shiftWeek menggeser 7 hari", () => {
    expect(shiftWeek("2026-10-26", 1)).toBe("2026-11-02");
    expect(shiftWeek("2026-10-26", -1)).toBe("2026-10-19");
  });
});
