import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Pencil, X, Briefcase } from "lucide-react";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recruitment,
});

const STAGES: Applicant["stage"][] = ["Screening", "Interview", "Tes", "Offering", "Diterima", "Ditolak"];

function Recruitment() {
  const { jobs, applicants, update } = useHR();
  const [job, setJob] = useState({ title: "", division: "" });
  const [app, setApp] = useState({ name: "", email: "", jobId: "" });
  const [jobEdit, setJobEdit] = useState<string | null>(null);
  const [appEdit, setAppEdit] = useState<string | null>(null);

  return (
    <>
      <PageHeader title="Rekrutmen" desc={`${jobs.filter((j) => j.open).length} lowongan aktif · ${applicants.length} pelamar`} />
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <section>
          <p className="mb-3 font-semibold">Lowongan</p>
          <form className="mb-4 grid grid-cols-2 gap-2" onSubmit={(e) => {
            e.preventDefault();
            if (!job.title.trim()) return;
            update("jobs", (p) => jobEdit ? p.map((j) => j.id === jobEdit ? { ...j, title: job.title.trim(), division: job.division.trim() } : j) : [...p, { id: newId(), title: job.title.trim(), division: job.division.trim(), open: true }]);
            setJob({ title: "", division: "" }); setJobEdit(null);
          }}>
            <Input aria-label="Posisi lowongan" placeholder="Posisi" required value={job.title} onChange={(e) => setJob({ ...job, title: e.target.value })} />
            <Input aria-label="Divisi lowongan" placeholder="Divisi" value={job.division} onChange={(e) => setJob({ ...job, division: e.target.value })} />
            <div className="col-span-2 flex gap-2"><Button type="submit" size="sm"><Plus className="h-4 w-4" />{jobEdit ? "Simpan lowongan" : "Tambah lowongan"}</Button>{jobEdit && <Button type="button" variant="ghost" size="sm" onClick={() => { setJobEdit(null); setJob({ title: "", division: "" }); }}><X className="h-4 w-4" />Batal</Button>}</div>
          </form>
          {jobs.length === 0 && <div className="flex items-center gap-3 border-y py-6 text-sm text-muted-foreground"><Briefcase className="h-5 w-5" />Belum ada lowongan.</div>}
          <div className="space-y-2">{jobs.map((j) => (
            <div key={j.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0"><p className="break-words font-medium">{j.title}</p><p className="text-xs text-muted-foreground">{j.division} · {applicants.filter((a) => a.jobId === j.id).length} pelamar</p></div>
              <div className="flex shrink-0 flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">{j.open ? "Buka" : "Tutup"}</span>
                <Switch aria-label={`Status lowongan ${j.title}`} checked={j.open} onCheckedChange={(v) => update("jobs", (p) => p.map((x) => (x.id === j.id ? { ...x, open: v } : x)))} />
                <Button size="icon" variant="ghost" title="Ubah lowongan" aria-label={`Ubah lowongan ${j.title}`} onClick={() => { setJobEdit(j.id); setJob({ title: j.title, division: j.division }); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" title="Hapus lowongan" aria-label={`Hapus lowongan ${j.title}`} onClick={() => {
                  if (!window.confirm("Hapus lowongan beserta semua pelamarnya?")) return;
                  update("jobs", (p) => p.filter((x) => x.id !== j.id)); update("applicants", (p) => p.filter((a) => a.jobId !== j.id));
                  if (jobEdit === j.id) { setJobEdit(null); setJob({ title: "", division: "" }); }
                  if (app.jobId === j.id) { setAppEdit(null); setApp({ name: "", email: "", jobId: "" }); }
                }}><Trash2 className="h-4 w-4" /></Button></div>
            </div>))}</div>
        </section>
        <section>
          <p className="mb-3 font-semibold">{appEdit ? "Ubah pelamar" : "Tambah pelamar"}</p>
          <form className="space-y-2" onSubmit={(e) => {
            e.preventDefault();
            if (!app.name.trim() || !jobs.some((j) => j.id === app.jobId)) return;
            const fields = { ...app, name: app.name.trim(), email: app.email.trim() };
            update("applicants", (p) => appEdit ? p.map((a) => a.id === appEdit ? { ...a, ...fields } : a) : [...p, { id: newId(), ...fields, stage: "Screening" }]);
            setApp({ name: "", email: "", jobId: "" }); setAppEdit(null);
          }}>
            <Input aria-label="Nama pelamar" placeholder="Nama" required value={app.name} onChange={(e) => setApp({ ...app, name: e.target.value })} />
            <Input aria-label="Email pelamar" placeholder="Email" type="email" value={app.email} onChange={(e) => setApp({ ...app, email: e.target.value })} />
            <Select value={app.jobId} onValueChange={(v) => setApp({ ...app, jobId: v })}><SelectTrigger><SelectValue placeholder="Pilih lowongan" /></SelectTrigger>
              <SelectContent>{jobs.filter((j) => j.open || j.id === app.jobId).map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent></Select>
            <Button className="w-full" type="submit" disabled={!app.jobId || !app.name.trim()}>Simpan pelamar</Button>
            {appEdit && <Button type="button" variant="ghost" onClick={() => { setAppEdit(null); setApp({ name: "", email: "", jobId: "" }); }}><X className="h-4 w-4" />Batal</Button>}
          </form>
        </section>
      </div>
      <div className="grid gap-3 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((s) => (
          <section key={s} className="min-w-0 border-t bg-secondary p-3">
            <p className="mb-2 flex justify-between text-sm font-semibold">{s}<Badge variant="outline">{applicants.filter((a) => a.stage === s).length}</Badge></p>
            <div className="space-y-2">{applicants.filter((a) => a.stage === s).map((a) => (
              <Card key={a.id} className="space-y-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-1"><p className="break-words text-sm font-medium">{a.name}</p>
                  <div className="flex"><Button size="icon" variant="ghost" title="Ubah pelamar" aria-label={`Ubah pelamar ${a.name}`} onClick={() => { setAppEdit(a.id); setApp({ name: a.name, email: a.email, jobId: a.jobId }); }}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" title="Hapus pelamar" aria-label={`Hapus pelamar ${a.name}`} onClick={() => { if (window.confirm("Hapus pelamar ini?")) { update("applicants", (p) => p.filter((x) => x.id !== a.id)); if (appEdit === a.id) { setAppEdit(null); setApp({ name: "", email: "", jobId: "" }); } } }}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>
                <p className="break-all text-xs text-muted-foreground">{a.email}</p>
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
