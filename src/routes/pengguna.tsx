import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { useHR, newId, type Role } from "@/lib/hr-store";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/pengguna")({
  head: () => ({
    meta: [
      { title: "Hak Akses — HR Dashboard" },
      { name: "description", content: "Kelola akun login admin, HRD, manajer dan karyawan." },
      { property: "og:title", content: "Hak Akses — HR Dashboard" },
      { property: "og:description", content: "Kelola akun login admin, HRD, manajer dan karyawan." },
    ],
  }),
  component: Users,
});

const ROLES: Role[] = ["admin", "hrd", "manajer", "karyawan"];

function Users() {
  const { users, employees, update, reset, user } = useHR();
  const [f, setF] = useState({ username: "", password: "", role: "karyawan" as Role, employeeId: "" });

  return (
    <>
      <PageHeader title="Hak Akses Pengguna" desc="Admin: semua · HRD: semua kecuali hak akses · Manajer: lihat & setujui cuti/kinerja · Karyawan: data sendiri."
        actions={<Button variant="outline" onClick={() => confirm("Reset semua data ke contoh awal?") && reset()}><RotateCcw className="h-4 w-4" />Reset data contoh</Button>} />
      <Card className="mb-4 grid gap-2 p-4 md:grid-cols-5">
        <Input placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
        <Input placeholder="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Select value={f.role} onValueChange={(v) => setF({ ...f, role: v as Role })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
        <Select value={f.employeeId} onValueChange={(v) => setF({ ...f, employeeId: v })}><SelectTrigger><SelectValue placeholder="Tautkan karyawan" /></SelectTrigger><SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent></Select>
        <Button onClick={() => { if (f.username && f.password) { update("users", (p) => [...p, { id: newId(), ...f, employeeId: f.employeeId || undefined }]); setF({ username: "", password: "", role: "karyawan", employeeId: "" }); } }}><Plus className="h-4 w-4" />Tambah</Button>
      </Card>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Peran</TableHead><TableHead>Karyawan</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>{users.map((u) => (
            <TableRow key={u.id}>
              <TableCell className="font-medium">{u.username}</TableCell>
              <TableCell><Select value={u.role} onValueChange={(v) => update("users", (p) => p.map((x) => (x.id === u.id ? { ...x, role: v as Role } : x)))}>
                <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger><SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></TableCell>
              <TableCell>{employees.find((e) => e.id === u.employeeId)?.name ?? "-"}</TableCell>
              <TableCell>{u.id !== user?.id && <Button size="icon" variant="ghost" onClick={() => update("users", (p) => p.filter((x) => x.id !== u.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>}</TableCell>
            </TableRow>))}</TableBody>
        </Table>
      </Card>
    </>
  );
}
