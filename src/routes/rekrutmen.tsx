import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useHR, newId, type Applicant } from "@/lib/hr-store";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/rekrutmen")({
  head: () => ({
    meta: [
      { title: "Rekrutmen — HR Dashboard" },
      { name: "description", content: "Lowongan, data pelamar dan tahap seleksi." },
      { property: "og:title", content: "Rekrutmen — HR Dashboard" },
      { property: "og:description", content: "Lowongan, data pelamar dan tahap seleksi." },
    ],
  }),
  component: Recruitment,
});

const STAGES: Applicant["stage"][] = ["Screening", "Interview", "Tes", "Offering", "Diterima", "Ditolak"];

function Recruitment() {
  const { jobs, applicants, update } = useHR();
  const [job, setJob] = useState({ title: "", division: "" });
  const [app, setApp] = useState({ name: "", email: "", jobId: "" });

  return (
    <>
      <PageHeader title="Rekrutmen" desc={`${jobs.filter((j) => j.open).length} lowongan aktif · ${applicants.length} pelamar`} />
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-3 font-semibold">Lowongan</p>
          <div className="mb-4 flex gap-2">
            <Input placeholder="Posisi" value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} />
            <Input placeholder="Divisi" value={job.division} onChange={(e) => setJob({ ...job, division: e.target.value })} />
            <Button size="icon" onClick={() => { if (job.title) { update("jobs", (p) => [...p, { id: newId(), ...job, open: true }]); setJob({ title: "", division: "" }); } }}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-2">{jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-medium">{j.title}</p><p className="text-xs text-muted-foreground">{j.division} · {applicants.filter((a) => a.jobId === j.id).length} pelamar</p></div>
              <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{j.open ? "Buka" : "Tutup"}</span>
                <Switch checked={j.open} onCheckedChange={(v) => update("jobs", (p) => p.map((x) => (x.id === j.id ? { ...x, open: v } : x)))} /></div>
            </div>))}</div>
        </Card>
        <Card className="p-5">
          <p className="mb-3 font-semibold">Tambah pelamar</p>
          <div className="space-y-2">
            <Input placeholder="Nama" value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} />
            <Input placeholder="Email" value={app.email} onChange={(e) => setApp({ ...app, email: e.target.value })} />
            <Select value={app.jobId} onValueChange={(v) => setApp({ ...app, jobId: v })}><SelectTrigger><SelectValue placeholder="Pilih lowongan" /></SelectTrigger>
              <SelectContent>{jobs.filter((j) => j.open).map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent></Select>
            <Button className="w-full" onClick={() => { if (app.name && app.jobId) { update("applicants", (p) => [...p, { id: newId(), ...app, stage: "Screening" }]); setApp({ name: "", email: "", jobId: "" }); } }}>Simpan pelamar</Button>
          </div>
        </Card>
      </div>
      <div className="grid gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((s) => (
          <div key={s} className="rounded-xl bg-secondary p-3">
            <p className="mb-2 flex justify-between text-sm font-semibold">{s}<Badge variant="outline">{applicants.filter((a) => a.stage === s).length}</Badge></p>
            <div className="space-y-2">{applicants.filter((a) => a.stage === s).map((a) => (
              <Card key={a.id} className="space-y-2 p-3">
                <div className="flex justify-between"><p className="text-sm font-medium">{a.name}</p>
                  <button onClick={() => update("applicants", (p) => p.filter((x) => x.id !== a.id))}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></button></div>
                <p className="text-xs text-muted-foreground">{jobs.find((j) => j.id === a.jobId)?.title}</p>
                <Select value={a.stage} onValueChange={(v) => update("applicants", (p) => p.map((x) => (x.id === a.id ? { ...x, stage: v as Applicant["stage"] } : x)))}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{STAGES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
              </Card>))}</div>
          </div>
        ))}
      </div>
    </>
  );
}
