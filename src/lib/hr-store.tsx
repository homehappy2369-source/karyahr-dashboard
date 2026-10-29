import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "admin" | "hrd" | "manajer" | "karyawan";
export type ContractStatus = "Tetap" | "Kontrak" | "Probation" | "Magang";

export interface Employee {
  id: string; name: string; email: string; phone: string; position: string; division: string;
  status: ContractStatus; joinDate: string; contractEnd?: string | undefined; baseSalary: number; allowance: number; leaveQuota: number;
}
export interface Attendance { id: string; employeeId: string; date: string; checkIn: string; checkOut: string; status: "Hadir" | "Terlambat" | "Izin" | "Alpha"; overtimeHours: number }
export interface Kpi { id: string; employeeId: string; month: string; score: number; target: string; note: string }
export interface Leave { id: string; employeeId: string; type: "Cuti Tahunan" | "Sakit" | "Izin"; start: string; end: string; days: number; reason: string; status: "Menunggu" | "Disetujui" | "Ditolak" }
export interface Job { id: string; title: string; division: string; open: boolean }
export interface Applicant { id: string; jobId: string; name: string; email: string; stage: "Screening" | "Interview" | "Tes" | "Offering" | "Diterima" | "Ditolak" }
export interface Payslip { id: string; employeeId: string; month: string; baseSalary: number; allowance: number; overtimePay: number; bpjs: number; latePenalty: number; otherDeduction: number; net: number; published: boolean }
export interface AppUser { id: string; username: string; password: string; role: Role; employeeId?: string | undefined }

interface Data { employees: Employee[]; attendance: Attendance[]; kpis: Kpi[]; leaves: Leave[]; jobs: Job[]; applicants: Applicant[]; payslips: Payslip[]; users: AppUser[] }

const uid = () => Math.random().toString(36).slice(2, 10);
export const newId = uid;

const thisMonth = new Date().toISOString().slice(0, 7);

function seed(): Data {
  const e = (id: string, name: string, position: string, division: string, status: ContractStatus, baseSalary: number, allowance: number): Employee => ({
    id, name, email: name.split(" ")[0].toLowerCase() + "@perusahaan.co.id", phone: "0812" + Math.floor(10000000 + Math.random() * 89999999),
    position, division, status, joinDate: "2023-0" + (1 + (id.charCodeAt(1) % 9)) + "-01", contractEnd: status === "Tetap" ? undefined : "2027-06-30",
    baseSalary, allowance, leaveQuota: 12,
  });
  const employees = [
    e("e1", "Andi Pratama", "Manajer Keuangan", "Keuangan", "Tetap", 12000000, 2500000),
    e("e2", "Siti Rahma", "Staf HRD", "HRD", "Tetap", 7000000, 1000000),
    e("e3", "Budi Santoso", "Software Engineer", "IT", "Kontrak", 9500000, 1500000),
    e("e4", "Dewi Lestari", "Marketing Executive", "Marketing", "Tetap", 6500000, 1200000),
    e("e5", "Rizky Hidayat", "Admin Gudang", "Operasional", "Probation", 5000000, 500000),
    e("e6", "Maya Sari", "Desainer Grafis", "Marketing", "Kontrak", 6000000, 800000),
    e("e7", "Fajar Nugroho", "Teknisi Jaringan", "IT", "Tetap", 7500000, 1000000),
    e("e8", "Lina Marlina", "Akuntan", "Keuangan", "Magang", 3500000, 300000),
  ];
  const attendance: Attendance[] = [];
  const today = new Date();
  for (let d = 0; d < 10; d++) {
    const date = new Date(today); date.setDate(today.getDate() - d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    employees.forEach((emp, i) => {
      const r = (i * 7 + d * 3) % 10;
      const status = r === 0 ? "Alpha" : r === 1 ? "Izin" : r < 4 ? "Terlambat" : "Hadir";
      attendance.push({ id: uid(), employeeId: emp.id, date: date.toISOString().slice(0, 10),
        checkIn: status === "Terlambat" ? "08:2" + r : status === "Hadir" ? "07:5" + r : "-", checkOut: status === "Hadir" || status === "Terlambat" ? "17:0" + r : "-",
        status, overtimeHours: r === 5 ? 2 : r === 6 ? 1 : 0 });
    });
  }
  const kpis: Kpi[] = employees.map((emp, i) => ({ id: uid(), employeeId: emp.id, month: thisMonth, score: 70 + ((i * 13) % 28), target: "Target bulanan divisi " + emp.division, note: i % 2 ? "Konsisten, pertahankan." : "Perlu peningkatan ketepatan waktu." }));
  const leaves: Leave[] = [
    { id: uid(), employeeId: "e3", type: "Cuti Tahunan", start: "2026-11-10", end: "2026-11-12", days: 3, reason: "Acara keluarga", status: "Menunggu" },
    { id: uid(), employeeId: "e4", type: "Sakit", start: "2026-10-20", end: "2026-10-21", days: 2, reason: "Demam", status: "Disetujui" },
    { id: uid(), employeeId: "e6", type: "Izin", start: "2026-11-03", end: "2026-11-03", days: 1, reason: "Urusan bank", status: "Menunggu" },
  ];
  const jobs: Job[] = [
    { id: "j1", title: "Frontend Developer", division: "IT", open: true },
    { id: "j2", title: "Staf Administrasi", division: "Operasional", open: true },
  ];
  const applicants: Applicant[] = [
    { id: uid(), jobId: "j1", name: "Kevin Wijaya", email: "kevin@mail.com", stage: "Interview" },
    { id: uid(), jobId: "j1", name: "Nadia Putri", email: "nadia@mail.com", stage: "Screening" },
    { id: uid(), jobId: "j2", name: "Hendra Gunawan", email: "hendra@mail.com", stage: "Tes" },
    { id: uid(), jobId: "j2", name: "Ayu Wulandari", email: "ayu@mail.com", stage: "Offering" },
  ];
  const users: AppUser[] = [
    { id: "u1", username: "admin", password: "admin123", role: "admin" },
    { id: "u2", username: "hrd", password: "hrd123", role: "hrd", employeeId: "e2" },
    { id: "u3", username: "manajer", password: "manajer123", role: "manajer", employeeId: "e1" },
    { id: "u4", username: "karyawan", password: "karyawan123", role: "karyawan", employeeId: "e3" },
  ];
  return { employees, attendance, kpis, leaves, jobs, applicants, payslips: [], users };
}

const KEY = "hrd-data-v1";
const SESSION = "hrd-session-v1";

interface Ctx extends Data {
  ready: boolean;
  user: AppUser | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  update: <K extends keyof Data>(key: K, fn: (prev: Data[K]) => Data[K]) => void;
  reset: () => void;
}
const HRContext = createContext<Ctx | null>(null);

export function HRProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(seed);
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const d = raw ? (JSON.parse(raw) as Data) : seed();
      setData(d);
      const s = localStorage.getItem(SESSION);
      if (s) setUser(d.users.find((u) => u.id === s) ?? null);
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(data)); }, [data, ready]);

  const value: Ctx = {
    ...data, ready, user,
    login: (u, p) => {
      const f = data.users.find((x) => x.username === u && x.password === p);
      if (f) { setUser(f); localStorage.setItem(SESSION, f.id); }
      return !!f;
    },
    logout: () => { setUser(null); localStorage.removeItem(SESSION); },
    update: (key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) })),
    reset: () => setData(seed()),
  };
  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export function useHR() {
  const c = useContext(HRContext);
  if (!c) throw new Error("useHR outside provider");
  return c;
}

export const can = (role: Role | undefined, area: "payroll" | "employees" | "users" | "approve" | "recruit") => {
  if (!role) return false;
  if (role === "admin") return true;
  if (role === "hrd") return area !== "users";
  if (role === "manajer") return area === "approve";
  return false;
};
