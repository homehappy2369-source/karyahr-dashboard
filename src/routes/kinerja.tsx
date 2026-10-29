import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useHR, newId } from "@/lib/hr-store";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/kinerja")({
  head: () => ({
    meta: [
      { title: "Penilaian Kinerja — HR Dashboard" },
      { name: "description", content: "KPI, skor bulanan dan catatan atasan untuk tiap karyawan." },
      { property: "og:title", content: "Penilaian Kinerja — HR Dashboard" },
      { property: "og:description", content: "KPI, skor bulanan dan catatan atasan untuk tiap karyawan." },
    ],
  }),
  component: Performance,
});

function Performance() {
  const { kpis, employees, update, user } = useHR();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const canEdit = user?.role !== "karyawan";
  const list = employees.filter((e) => canEdit || e.id === user?.employeeId);

  const get = (id: string) => kpis.find((k) => k.employeeId === id && k.month === month);
  const set = (id: string, patch: { score?: number; target?: string; note?: string }) => update("kpis", (prev) => {
    const ex = prev.find((k) => k.employeeId === id && k.month === month);
    if (ex) return prev.map((k) => (k === ex ? { ...k, ...patch } : k));
    return [...prev, { id: newId(), employeeId: id, month, score: 0, target: "", note: "", ...patch }];
  });
  const chart = list.map((e) => ({ name: e.name.split(" ")[0], skor: get(e.id)?.score ?? 0 }));

  return (
    <>
      <PageHeader title="Penilaian Kinerja" desc="Skor KPI 0–100 per bulan beserta catatan atasan."
        actions={<Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />} />
      {canEdit && <Card className="mb-6 p-5">
        <p className="mb-3 font-semibold">Skor bulan ini</p>
        <div className="h-56"><ResponsiveContainer><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={12} /><YAxis domain={[0, 100]} fontSize={12} /><Tooltip /><Bar dataKey="skor" fill="var(--chart-1)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </Card>}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((e) => {
          const k = get(e.id);
          return (
            <Card key={e.id} className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div><p className="font-semibold">{e.name}</p><p className="text-xs text-muted-foreground">{e.position} · {e.division}</p></div>
                {canEdit ? <Input type="number" min={0} max={100} className="h-9 w-20 text-center font-bold" value={k?.score ?? 0} onChange={(ev) => set(e.id, { score: Math.min(100, Number(ev.target.value) || 0) })} />
                  : <span className="text-2xl font-bold text-primary">{k?.score ?? "-"}</span>}
              </div>
              <Progress value={k?.score ?? 0} />
              <Input placeholder="Target KPI" disabled={!canEdit} value={k?.target ?? ""} onChange={(ev) => set(e.id, { target: ev.target.value })} />
              <Textarea placeholder="Catatan atasan" disabled={!canEdit} value={k?.note ?? ""} onChange={(ev) => set(e.id, { note: ev.target.value })} />
            </Card>
          );
        })}
      </div>
    </>
  );
}
