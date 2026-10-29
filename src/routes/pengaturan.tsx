import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LockKeyhole, Save } from "lucide-react";
import { useHR } from "@/lib/hr-store";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/pengaturan")({
  head: () => ({ meta: [
    { title: "Pengaturan Akun — HR Dashboard" },
    { name: "description", content: "Pengaturan akun dan perubahan password HR Dashboard." },
    { property: "og:title", content: "Pengaturan Akun — HR Dashboard" },
    { property: "og:description", content: "Pengaturan akun dan perubahan password HR Dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, changePassword } = useHR();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  return <>
    <PageHeader title="Pengaturan" desc="Akun saya" />
    <div className="mb-8 flex items-center gap-4 border-b pb-6">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-accent text-accent-foreground"><LockKeyhole className="h-6 w-6" /></div>
      <div><p className="font-semibold">{user?.username}</p><p className="text-sm capitalize text-muted-foreground">{user?.role}</p></div>
    </div>
    <section className="max-w-md">
      <h2 className="mb-5 text-lg font-semibold">Ubah password</h2>
      <form className="space-y-5" onChange={() => { setError(""); setSaved(false); }} onSubmit={(e) => {
        e.preventDefault();
        const message = changePassword(current, next, confirm);
        if (message) { setError(message); setSaved(false); return; }
        setCurrent(""); setNext(""); setConfirm(""); setError(""); setSaved(true);
      }}>
        <div className="space-y-2"><Label htmlFor="current-password">Password saat ini</Label><Input id="current-password" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="new-password">Password baru</Label><Input id="new-password" type="password" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Konfirmasi password baru</Label><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {saved && <p role="status" className="text-sm text-success">Password berhasil diubah.</p>}
        <Button type="submit"><Save className="h-4 w-4" />Simpan password</Button>
      </form>
    </section>
  </>;
}