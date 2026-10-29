import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown, Printer } from "lucide-react";
import { useHR } from "@/lib/hr-store";
import { rupiah } from "@/lib/payroll";
import { exportCSV } from "@/lib/export";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/laporan")({
  head: () => ({
    meta: [
      { title: "Laporan & Ekspor — HR Dashboard" },
      { name: "description", content: "Rekap gaji, absensi dan kinerja ke Excel atau PDF." },
      { property: "og:title", content: "Laporan & Ekspor — HR Dashboard" },
      { property: "og:description", content: "Rekap gaji, absensi dan kinerja ke Excel atau PDF." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { employees, attendance, kpis, payslips } = useHR();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const rows = employees.map((e) => {
    const att = attendance.filter((a) => a.employeeId === e.id && a.date.startsWith(month));
    return {
      Nama: e.name, Divisi: e.division,
      Hadir: att.filter((a) => a.status === "Hadir").length, Terlambat: att.filter((a) => a.status === "Terlambat").length,
      "Izin/Alpha": att.filter((a) => a.status === "Izin" || a.status === "Alpha").length, "Jam Lembur": att.reduce((s, a) => s + a.overtimeHours, 0),
      "Skor KPI": kpis.find((k) => k.employeeId === e.id && k.month === month)?.score ?? 0,
      "Gaji Bersih": payslips.find((p) => p.employeeId === e.id && p.month === month)?.net ?? 0,
    };
  });
  const cols = Object.keys(rows[0] ?? {}) as (keyof (typeof rows)[number])[];

  return (
    <>
      <PageHeader title={`Laporan ${month}`} desc="Gaji bersih muncul setelah gaji bulan ini diproses."
        actions={<>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />
          <Button variant="outline" onClick={() => exportCSV(`laporan-hrd-${month}`, rows)}><FileDown className="h-4 w-4" />Excel</Button>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" />PDF</Button>
        </>} />
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow>{cols.map((c) => <TableHead key={c}>{c}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{rows.map((r) => (
            <TableRow key={r.Nama}>{cols.map((c) => <TableCell key={c}>{c === "Gaji Bersih" ? rupiah(r[c] as number) : r[c]}</TableCell>)}</TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </>
  );
}
