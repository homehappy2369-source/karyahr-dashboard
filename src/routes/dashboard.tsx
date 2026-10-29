import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, CalendarCheck, Wallet, Plane, ArrowRight, Briefcase, TrendingUp } from "lucide-react";
import { useHR } from "@/lib/hr-store";
import { rupiah, weekLabel, weekStart } from "@/lib/payroll";
import { PageHeader, Stat } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Dashboard Utama — HR Dashboard" },
    { name: "description", content: "Ringkasan karyawan, absensi, gaji mingguan, cuti dan kinerja." },
    { property: "og:title", content: "Dashboard Utama — HR Dashboard" },
    { property: "og:description", content: "Ringkasan karyawan, absensi, gaji mingguan, cuti dan kinerja." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Dashboard,
});

function Dashboard() {
  const { user, employees, attendance, payslips, leaves, kpis, jobs, applicants } = useHR();
  const today = new Date().toISOString().slice(0, 10);
  const week = weekStart(new Date());
  const personal = user?.role === "karyawan";
  const staff = employees.filter((e) => !personal || e.id === user?.employeeId);
  const ids = new Set(staff.map((e) => e.id));
  const daily = attendance.filter((a) => ids.has(a.employeeId) && a.date === today);
  const slips = payslips.filter((p) => ids.has(p.employeeId) && p.week === week && p.published);
  const pending = leaves.filter((l) => ids.has(l.employeeId) && l.status === "Menunggu");
  const scores = kpis.filter((k) => ids.has(k.employeeId) && k.month === today.slice(0, 7));
  const divisions = [...new Set(staff.map((e) => e.division))];
  return <>
    <PageHeader title="Dashboard Utama" desc={new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      actions={<Button asChild><Link to="/"><Wallet className="h-4 w-4" />Penggajian<ArrowRight className="h-4 w-4" /></Link></Button>} />
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label={personal ? "Profil karyawan" : "Total karyawan"} value={staff.length} icon={Users} hint={`${divisions.length} divisi`} />
      <Stat label="Kehadiran hari ini" value={daily.filter((a) => a.status === "Hadir" || a.status === "Terlambat").length} icon={CalendarCheck} hint={`${daily.filter((a) => a.status === "Terlambat").length} terlambat`} />
      <Stat label="Gaji terbit minggu ini" value={rupiah(slips.reduce((s, p) => s + p.net, 0))} icon={Wallet} hint={`${slips.length} slip · ${weekLabel(week)}`} />
      <Stat label="Cuti & izin menunggu" value={pending.length} icon={Plane} />
    </div>
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Users className="h-5 w-5 text-primary" />Karyawan per divisi</h2>
        {divisions.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data karyawan.</p>}
        <div className="divide-y">{divisions.map((d) => <div key={d} className="flex items-center justify-between py-3"><span className="text-sm">{d}</span><Badge variant="secondary">{staff.filter((e) => e.division === d).length} karyawan</Badge></div>)}</div>
        <h2 className="mb-3 mt-8 flex items-center gap-2 text-lg font-semibold"><TrendingUp className="h-5 w-5 text-primary" />Kinerja bulan ini</h2>
        <p className="text-3xl font-bold">{scores.length ? (scores.reduce((s, k) => s + k.score, 0) / scores.length).toFixed(1) : "—"}<span className="ml-2 text-sm font-normal text-muted-foreground">/ 100 · {scores.length} penilaian</span></p>
      </section>
      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Cuti & izin menunggu</h2><Button asChild variant="ghost" size="sm"><Link to="/cuti">Lihat semua<ArrowRight className="h-4 w-4" /></Link></Button></div>
        {pending.length === 0 ? <p className="border-y py-6 text-sm text-muted-foreground">Tidak ada pengajuan menunggu.</p> : <div className="divide-y">{pending.slice(0, 5).map((l) => <div key={l.id} className="flex items-start justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{staff.find((e) => e.id === l.employeeId)?.name}</p><p className="text-xs text-muted-foreground">{l.type} · {l.start} – {l.end}</p></div><Badge variant="outline">{l.days} hari</Badge></div>)}</div>}
        {(user?.role === "admin" || user?.role === "hrd") && <div className="mt-8 border-t pt-5"><div className="mb-3 flex items-center gap-2 font-semibold"><Briefcase className="h-5 w-5 text-primary" />Rekrutmen</div><div className="flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{jobs.filter((j) => j.open).length} lowongan aktif · {applicants.length} pelamar</p><Button asChild variant="outline" size="sm"><Link to="/rekrutmen">Rekrutmen<ArrowRight className="h-4 w-4" /></Link></Button></div></div>}
      </section>
    </div>
  </>;
}