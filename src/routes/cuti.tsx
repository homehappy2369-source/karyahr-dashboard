import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useHR, can, newId, type Leave } from "@/lib/hr-store";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/cuti")({
  head: () => ({
    meta: [
      { title: "Cuti & Izin — HR Dashboard" },
      { name: "description", content: "Pengajuan, persetujuan dan sisa jatah cuti karyawan." },
      { property: "og:title", content: "Cuti & Izin — HR Dashboard" },
      { property: "og:description", content: "Pengajuan, persetujuan dan sisa jatah cuti karyawan." },
    ],
  }),
  component: LeavePage,
});

const days = (a: string, b: string) => Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1);

function LeavePage() {
  const { leaves, employees, update, user } = useHR();
  const approver = can(user?.role, "approve");
  const [form, setForm] = useState({ employeeId: user?.employeeId ?? "", type: "Cuti Tahunan" as Leave["type"], start: "", end: "", reason: "" });
  const list = leaves.filter((l) => approver || l.employeeId === user?.employeeId);
  const used = (id: string) => leaves.filter((l) => l.employeeId === id && l.type === "Cuti Tahunan" && l.status === "Disetujui").reduce((s, l) => s + l.days, 0);
  const name = (id: string) => employees.find((e) => e.id === id)?.name ?? "-";

  const submit = () => {
    if (!form.employeeId || !form.start || !form.end) return toast.error("Lengkapi data pengajuan");
    const emp = employees.find((e) => e.id === form.employeeId)!;
    const d = days(form.start, form.end);
    if (form.type === "Cuti Tahunan" && d > emp.leaveQuota - used(emp.id)) return toast.error("Sisa jatah cuti tidak cukup");
    update("leaves", (p) => [{ id: newId(), ...form, days: d, status: "Menunggu" }, ...p]);
    setForm({ ...form, start: "", end: "", reason: "" });
    toast.success("Pengajuan dikirim");
  };
  const setStatus = (id: string, status: Leave["status"]) => update("leaves", (p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
  const myEmp = employees.find((e) => e.id === user?.employeeId);

  return (
    <>
      <PageHeader title="Cuti & Izin" desc={myEmp ? `Sisa cuti tahunan Anda: ${myEmp.leaveQuota - used(myEmp.id)} hari` : "Kelola pengajuan cuti karyawan."} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3 p-5">
          <p className="font-semibold">Ajukan cuti / izin</p>
          {approver && <div className="space-y-1.5"><Label>Karyawan</Label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select></div>}
          <div className="space-y-1.5"><Label>Jenis</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Leave["type"] })}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Cuti Tahunan", "Sakit", "Izin"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label>Mulai</Label><Input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Selesai</Label><Input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5"><Label>Alasan</Label><Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
          <Button className="w-full" onClick={submit}><Plus className="h-4 w-4" />Kirim pengajuan</Button>
        </Card>
        <Card className="overflow-x-auto lg:col-span-2">
          <Table>
            <TableHeader><TableRow><TableHead>Karyawan</TableHead><TableHead>Jenis</TableHead><TableHead>Tanggal</TableHead><TableHead>Hari</TableHead><TableHead>Sisa</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {list.map((l) => {
                const emp = employees.find((e) => e.id === l.employeeId);
                return (
                  <TableRow key={l.id}>
                    <TableCell><p className="font-medium">{name(l.employeeId)}</p><p className="text-xs text-muted-foreground">{l.reason}</p></TableCell>
                    <TableCell>{l.type}</TableCell><TableCell className="whitespace-nowrap text-sm">{l.start} → {l.end}</TableCell><TableCell>{l.days}</TableCell>
                    <TableCell>{emp ? emp.leaveQuota - used(emp.id) : "-"}</TableCell>
                    <TableCell><Badge variant={l.status === "Disetujui" ? "default" : l.status === "Ditolak" ? "destructive" : "secondary"}>{l.status}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{approver && l.status === "Menunggu" && <>
                      <Button size="icon" variant="ghost" onClick={() => setStatus(l.id, "Disetujui")}><Check className="h-4 w-4 text-success" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setStatus(l.id, "Ditolak")}><X className="h-4 w-4 text-destructive" /></Button>
                    </>}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}
