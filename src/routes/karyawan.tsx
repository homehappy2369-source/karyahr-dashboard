import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useHR, can, newId, type Employee, type ContractStatus } from "@/lib/hr-store";
import { rupiah } from "@/lib/payroll";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/karyawan")({
  head: () => ({
    meta: [
      { title: "Data Karyawan — HR Dashboard" },
      { name: "description", content: "Profil, jabatan, divisi dan status kontrak karyawan." },
      { property: "og:title", content: "Data Karyawan — HR Dashboard" },
      { property: "og:description", content: "Profil, jabatan, divisi dan status kontrak karyawan." },
    ],
  }),
  component: Employees,
});

const STATUSES: ContractStatus[] = ["Tetap", "Kontrak", "Probation", "Magang"];
const empty: Employee = { id: "", name: "", email: "", phone: "", position: "", division: "", status: "Tetap", joinDate: new Date().toISOString().slice(0, 10), baseSalary: 0, allowance: 0, leaveQuota: 12 };

function Employees() {
  const { employees, update, user } = useHR();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Employee | null>(null);
  const editable = can(user?.role, "employees");
  const list = employees.filter((e) => (e.name + e.division + e.position).toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    if (!edit || !edit.name) return;
    update("employees", (prev) => edit.id ? prev.map((e) => (e.id === edit.id ? edit : e)) : [...prev, { ...edit, id: newId() }]);
    setEdit(null);
  };
  const f = (k: keyof Employee, type = "text") => (
    <div className="space-y-1.5"><Label className="capitalize">{labels[k] ?? k}</Label>
      <Input type={type} value={(edit?.[k] as string | number) ?? ""} onChange={(e) => setEdit({ ...edit!, [k]: type === "number" ? Number(e.target.value) : e.target.value })} /></div>
  );

  return (
    <>
      <PageHeader title="Data Karyawan" desc={`${employees.length} karyawan terdaftar`}
        actions={editable && <Button onClick={() => setEdit({ ...empty })}><Plus className="h-4 w-4" />Tambah</Button>} />
      <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Cari nama, divisi, jabatan…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Jabatan</TableHead><TableHead>Divisi</TableHead><TableHead>Status</TableHead><TableHead>Akhir kontrak</TableHead><TableHead className="text-right">Gaji pokok</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {list.map((e) => (
              <TableRow key={e.id}>
                <TableCell><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.email}</p></TableCell>
                <TableCell>{e.position}</TableCell><TableCell>{e.division}</TableCell>
                <TableCell><Badge variant={e.status === "Tetap" ? "default" : "secondary"}>{e.status}</Badge></TableCell>
                <TableCell>{e.contractEnd ?? "-"}</TableCell>
                <TableCell className="text-right">{rupiah(e.baseSalary)}</TableCell>
                <TableCell className="whitespace-nowrap">{editable && <>
                  <Button size="icon" variant="ghost" onClick={() => setEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => confirm(`Hapus ${e.name}?`) && update("employees", (p) => p.filter((x) => x.id !== e.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{edit?.id ? "Ubah" : "Tambah"} Karyawan</DialogTitle></DialogHeader>
          {edit && <div className="grid gap-4 sm:grid-cols-2">
            {f("name")}{f("email")}{f("phone")}{f("position")}{f("division")}
            <div className="space-y-1.5"><Label>Status kontrak</Label>
              <Select value={edit.status} onValueChange={(v) => setEdit({ ...edit, status: v as ContractStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select></div>
            {f("joinDate", "date")}{f("contractEnd", "date")}{f("baseSalary", "number")}{f("allowance", "number")}{f("leaveQuota", "number")}
          </div>}
          <DialogFooter><Button onClick={save}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const labels: Partial<Record<keyof Employee, string>> = { name: "Nama", phone: "No. HP", position: "Jabatan", division: "Divisi", joinDate: "Tanggal masuk", contractEnd: "Akhir kontrak", baseSalary: "Gaji pokok", allowance: "Tunjangan", leaveQuota: "Jatah cuti / tahun" };
