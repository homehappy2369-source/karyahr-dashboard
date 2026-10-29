import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Clock, AlertTriangle, UserX, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useHR, can, newId, type Attendance } from "@/lib/hr-store";
import { PageHeader, Stat } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/absensi")({
  head: () => ({
    meta: [
      { title: "Absensi — HR Dashboard" },
      { name: "description", content: "Kehadiran harian, keterlambatan dan lembur karyawan." },
      { property: "og:title", content: "Absensi — HR Dashboard" },
      { property: "og:description", content: "Kehadiran harian, keterlambatan dan lembur karyawan." },
    ],
  }),
  component: AttendancePage,
});

const STATUS: Attendance["status"][] = ["Hadir", "Terlambat", "Izin", "Alpha"];

function AttendancePage() {
  const { attendance, employees, update, user } = useHR();
  const staff = can(user?.role, "employees") || user?.role === "manajer";
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const day = attendance.filter((a) => a.date === date && (staff || a.employeeId === user?.employeeId));
  const name = (id: string) => employees.find((e) => e.id === id)?.name ?? "-";

  const setRow = (empId: string, patch: Partial<Attendance>) => update("attendance", (prev) => {
    const ex = prev.find((a) => a.employeeId === empId && a.date === date);
    if (ex) return prev.map((a) => (a === ex ? { ...a, ...patch } : a));
    return [...prev, { id: newId(), employeeId: empId, date, checkIn: "-", checkOut: "-", status: "Hadir", overtimeHours: 0, ...patch }];
  });

  const checkIn = () => {
    const now = new Date(); const t = now.toTimeString().slice(0, 5);
    setRow(user!.employeeId!, { checkIn: t, status: t > "08:00" ? "Terlambat" : "Hadir", date: now.toISOString().slice(0, 10) });
    toast.success("Absen masuk tercatat " + t);
  };

  const rows = staff ? employees.map((e) => ({ e, a: day.find((x) => x.employeeId === e.id) })) : day.map((a) => ({ e: employees.find((x) => x.id === a.employeeId)!, a }));

  return (
    <>
      <PageHeader title="Absensi" desc="Jam masuk lebih dari 08:00 dihitung terlambat."
        actions={<>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          {user?.employeeId && <Button onClick={checkIn}><LogIn className="h-4 w-4" />Absen masuk</Button>}
        </>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Hadir" value={day.filter((a) => a.status === "Hadir").length} icon={CalendarCheck} />
        <Stat label="Terlambat" value={day.filter((a) => a.status === "Terlambat").length} icon={AlertTriangle} />
        <Stat label="Izin / Alpha" value={day.filter((a) => a.status === "Izin" || a.status === "Alpha").length} icon={UserX} />
        <Stat label="Jam lembur" value={day.reduce((s, a) => s + a.overtimeHours, 0)} icon={Clock} />
      </div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Karyawan</TableHead><TableHead>Masuk</TableHead><TableHead>Pulang</TableHead><TableHead>Status</TableHead><TableHead>Lembur (jam)</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Belum ada data.</TableCell></TableRow>}
            {rows.map(({ e, a }) => (
              <TableRow key={e?.id}>
                <TableCell className="font-medium">{e?.name ?? name(a!.employeeId)}</TableCell>
                <TableCell>{staff ? <Input className="h-8 w-24" value={a?.checkIn ?? "-"} onChange={(ev) => setRow(e.id, { checkIn: ev.target.value })} /> : a?.checkIn}</TableCell>
                <TableCell>{staff ? <Input className="h-8 w-24" value={a?.checkOut ?? "-"} onChange={(ev) => setRow(e.id, { checkOut: ev.target.value })} /> : a?.checkOut}</TableCell>
                <TableCell>{staff ? (
                  <Select value={a?.status ?? ""} onValueChange={(v) => setRow(e.id, { status: v as Attendance["status"] })}>
                    <SelectTrigger className="h-8 w-32"><SelectValue placeholder="Belum" /></SelectTrigger>
                    <SelectContent>{STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>) : <Badge variant={a?.status === "Hadir" ? "default" : "secondary"}>{a?.status}</Badge>}</TableCell>
                <TableCell>{staff ? <Input type="number" className="h-8 w-20" value={a?.overtimeHours ?? 0} onChange={(ev) => setRow(e.id, { overtimeHours: Number(ev.target.value) || 0 })} /> : a?.overtimeHours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
