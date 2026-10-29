import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Wallet, Users, CalendarCheck, TrendingUp, Plane, Briefcase, FileBarChart, ShieldCheck, LogOut, Building2, LayoutDashboard, Settings } from "lucide-react";
import { useHR, type Role } from "@/lib/hr-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const NAV: { to: string; label: string; icon: typeof Wallet; roles: Role[] }[] = [
  { to: "/dashboard", label: "Dashboard Utama", icon: LayoutDashboard, roles: ["admin", "hrd", "manajer", "karyawan"] },
  { to: "/", label: "Penggajian", icon: Wallet, roles: ["admin", "hrd", "manajer", "karyawan"] },
  { to: "/karyawan", label: "Data Karyawan", icon: Users, roles: ["admin", "hrd", "manajer"] },
  { to: "/absensi", label: "Absensi", icon: CalendarCheck, roles: ["admin", "hrd", "manajer", "karyawan"] },
  { to: "/kinerja", label: "Penilaian Kinerja", icon: TrendingUp, roles: ["admin", "hrd", "manajer", "karyawan"] },
  { to: "/cuti", label: "Cuti & Izin", icon: Plane, roles: ["admin", "hrd", "manajer", "karyawan"] },
  { to: "/rekrutmen", label: "Rekrutmen", icon: Briefcase, roles: ["admin", "hrd"] },
  { to: "/laporan", label: "Laporan & Ekspor", icon: FileBarChart, roles: ["admin", "hrd", "manajer"] },
  { to: "/pengguna", label: "Hak Akses", icon: ShieldCheck, roles: ["admin"] },
  { to: "/pengaturan", label: "Pengaturan", icon: Settings, roles: ["admin", "hrd", "manajer", "karyawan"] },
];

function Login() {
  const { login } = useHR();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-hero p-4">
      <Card className="w-full max-w-sm p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 className="h-6 w-6" /></div>
          <div><h1 className="text-xl font-bold">HR Dashboard</h1><p className="text-sm text-muted-foreground">Masuk untuk melanjutkan</p></div>
        </div>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!login(u, p)) setErr("Username atau password salah"); }}>
          <div className="space-y-1.5"><Label>Username</Label><Input value={u} onChange={(e) => setU(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={p} onChange={(e) => setP(e.target.value)} /></div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button className="w-full" type="submit">Masuk</Button>
        </form>
        <p className="mt-6 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Akun demo: admin/admin123 · hrd/hrd123 · manajer/manajer123 · karyawan/karyawan123
        </p>
      </Card>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, ready, logout, employees } = useHR();
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!user) return <Login />;
  const me = employees.find((e) => e.id === user.employeeId);
  const nav = NAV.filter((n) => n.roles.includes(user.role));
  const allowed = nav.some((n) => n.to === path);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-hero text-primary-foreground"><Building2 className="h-5 w-5" /></div>
          <div><p className="font-bold leading-tight">HR Dashboard</p><p className="text-xs text-muted-foreground">Kelola SDM</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = path === n.to;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <n.icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-sm font-semibold">{me?.name ?? user.username}</p>
          <p className="mb-3 text-xs capitalize text-muted-foreground">{user.role}</p>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}><LogOut className="h-4 w-4" />Keluar</Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex gap-2 overflow-x-auto border-b bg-card p-3 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${path === n.to ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{n.label}</Link>
          ))}
          <Button variant="secondary" size="sm" onClick={logout}><LogOut className="h-4 w-4" />Keluar</Button>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {allowed ? children : <Card className="p-8 text-center text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</Card>}
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ title, desc, actions }: { title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight">{title}</h1>{desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}</div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: typeof Wallet; hint?: string }) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></div>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-xl font-bold">{value}</p>{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>
    </Card>
  );
}
