import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet, Users, CheckCircle2, Clock, Printer, FileDown, Send } from "lucide-react";
import { toast } from "sonner";
import { useHR, can, newId, type Payslip } from "@/lib/hr-store";
import { calcPay, rupiah } from "@/lib/payroll";
import { exportCSV } from "@/lib/export";
import { PageHeader, Stat } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Penggajian — HR Dashboard" },
      { name: "description", content: "Hitung dan terbitkan gaji bulanan karyawan dengan cepat." },
      { property: "og:title", content: "Penggajian — HR Dashboard" },
      { property: "og:description", content: "Hitung dan terbitkan gaji bulanan karyawan dengan cepat." },
    ],
  }),
  component: Payroll,
});

function Payroll() {
  const { user, employees, attendance, payslips, update } = useHR();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [other, setOther] = useState<Record<string, number>>({});
  const [slip, setSlip] = useState<Payslip | null>(null);
  const isStaff = can(user?.role, "payroll");

  const rows = useMemo(() => employees.map((e) => {
    const att = attendance.filter((a) => a.employeeId === e.id && a.date.startsWith(month));
    const overtimeHours = att.reduce((s, a) => s + a.overtimeHours, 0);
    const lateCount = att.filter((a) => a.status === "Terlambat").length;
    const existing = payslips.find((p) => p.employeeId === e.id && p.month === month);
    const otherDeduction = other[e.id] ?? existing?.otherDeduction ?? 0;
    const c = calcPay({ baseSalary: e.baseSalary, allowance: e.allowance, overtimeHours, lateCount, otherDeduction });
    return { e, overtimeHours, lateCount, otherDeduction, existing, ...c };
  }), [employees, attendance, payslips, month, other]);

  const total = rows.reduce((s, r) => s + r.net, 0);
  const published = rows.filter((r) => r.existing?.published).length;

  const build = (r: (typeof rows)[number], publish: boolean): Payslip => ({
    id: r.existing?.id ?? newId(), employeeId: r.e.id, month, baseSalary: r.e.baseSalary, allowance: r.e.allowance,
    overtimePay: r.overtimePay, bpjs: r.bpjs, latePenalty: r.latePenalty, otherDeduction: r.otherDeduction, net: r.net, published: publish,
  });
  const processAll = () => {
    const slips = rows.map((r) => build(r, true));
    update("payslips", (prev) => [...prev.filter((p) => p.month !== month), ...slips]);
    toast.success(`${slips.length} slip gaji ${month} diterbitkan`);
  };

  if (!isStaff) {
    const mine = payslips.filter((p) => p.employeeId === user?.employeeId && p.published).sort((a, b) => b.month.localeCompare(a.month));
    return (
      <>
        <PageHeader title="Slip Gaji Saya" desc="Riwayat slip gaji yang sudah diterbitkan HRD." />
        <Card className="divide-y">
          {mine.length === 0 && <p className="p-6 text-sm text-muted-foreground">Belum ada slip gaji yang diterbitkan.</p>}
          {mine.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div><p className="font-semibold">Periode {p.month}</p><p className="text-sm text-muted-foreground">{rupiah(p.net)}</p></div>
              <Button variant="outline" size="sm" onClick={() => setSlip(p)}>Lihat slip</Button>
            </div>
          ))}
        </Card>
        <SlipDialog slip={slip} onClose={() => setSlip(null)} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Proses Gaji" desc="Lembur & keterlambatan diambil otomatis dari absensi bulan terpilih."
        actions={<>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
          <Button variant="outline" onClick={() => exportCSV(`rekap-gaji-${month}`, rows.map((r) => ({ Nama: r.e.name, Divisi: r.e.division, "Gaji Pokok": r.e.baseSalary, Tunjangan: r.e.allowance, Lembur: r.overtimePay, BPJS: r.bpjs, "Potongan Telat": r.latePenalty, "Potongan Lain": r.otherDeduction, "Gaji Bersih": r.net })))}><FileDown className="h-4 w-4" />Excel</Button>
          <Button onClick={processAll}><Send className="h-4 w-4" />Proses & Terbitkan Semua</Button>
        </>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total gaji bersih" value={rupiah(total)} icon={Wallet} />
        <Stat label="Karyawan" value={employees.length} icon={Users} />
        <Stat label="Slip terbit" value={`${published}/${employees.length}`} icon={CheckCircle2} />
        <Stat label="Total jam lembur" value={rows.reduce((s, r) => s + r.overtimeHours, 0)} icon={Clock} />
      </div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Karyawan</TableHead><TableHead className="text-right">Pokok</TableHead><TableHead className="text-right">Tunjangan</TableHead>
            <TableHead className="text-right">Lembur</TableHead><TableHead className="text-right">BPJS</TableHead><TableHead className="text-right">Telat</TableHead>
            <TableHead>Potongan lain</TableHead><TableHead className="text-right">Bersih</TableHead><TableHead>Status</TableHead><TableHead />
          </TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.e.id}>
                <TableCell><p className="font-medium">{r.e.name}</p><p className="text-xs text-muted-foreground">{r.e.position}</p></TableCell>
                <TableCell className="text-right">{rupiah(r.e.baseSalary)}</TableCell>
                <TableCell className="text-right">{rupiah(r.e.allowance)}</TableCell>
                <TableCell className="text-right">{rupiah(r.overtimePay)}<p className="text-xs text-muted-foreground">{r.overtimeHours} jam</p></TableCell>
                <TableCell className="text-right">-{rupiah(r.bpjs)}</TableCell>
                <TableCell className="text-right">-{rupiah(r.latePenalty)}<p className="text-xs text-muted-foreground">{r.lateCount}x</p></TableCell>
                <TableCell><Input type="number" className="h-8 w-28" value={r.otherDeduction} onChange={(ev) => setOther({ ...other, [r.e.id]: Number(ev.target.value) || 0 })} /></TableCell>
                <TableCell className="text-right font-bold text-primary">{rupiah(r.net)}</TableCell>
                <TableCell>{r.existing?.published ? <Badge>Terbit</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => setSlip(build(r, !!r.existing?.published))}>Slip</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">Rumus: lembur = pokok/173 × 1,5 × jam · BPJS karyawan 4% dari pokok · telat Rp25.000/kejadian. PPh 21 belum dihitung.</p>
      <SlipDialog slip={slip} onClose={() => setSlip(null)} />
    </>
  );
}

function SlipDialog({ slip, onClose }: { slip: Payslip | null; onClose: () => void }) {
  const { employees } = useHR();
  const e = employees.find((x) => x.id === slip?.employeeId);
  if (!slip || !e) return null;
  const line = (l: string, v: number, neg = false) => (
    <div className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">{l}</span><span>{neg ? "-" : ""}{rupiah(v)}</span></div>
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Slip Gaji — {slip.month}</DialogTitle></DialogHeader>
        <div className="rounded-lg bg-hero p-4 text-primary-foreground"><p className="font-bold">{e.name}</p><p className="text-sm opacity-90">{e.position} · {e.division}</p></div>
        <div>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">Pendapatan</p>
          {line("Gaji pokok", slip.baseSalary)}{line("Tunjangan", slip.allowance)}{line("Lembur", slip.overtimePay)}
          <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">Potongan</p>
          {line("BPJS", slip.bpjs, true)}{line("Keterlambatan", slip.latePenalty, true)}{line("Lain-lain", slip.otherDeduction, true)}
          <div className="mt-3 flex justify-between border-t pt-3 font-bold"><span>Gaji bersih</span><span className="text-primary">{rupiah(slip.net)}</span></div>
        </div>
        <Button variant="outline" className="no-print" onClick={() => window.print()}><Printer className="h-4 w-4" />Cetak / PDF</Button>
      </DialogContent>
    </Dialog>
  );
}
