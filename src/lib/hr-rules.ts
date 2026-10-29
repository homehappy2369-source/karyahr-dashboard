import type { AppUser, Applicant, Job } from "./hr-store";

export function removeRecruitmentSamples(jobs: Job[], applicants: Applicant[]) {
  const sampleIds = new Set(jobs.filter((j) =>
    (j.id === "j1" && j.title === "Frontend Developer") ||
    (j.id === "j2" && j.title === "Staf Administrasi")
  ).map((j) => j.id));
  const sampleNames = new Set(["Kevin Wijaya", "Nadia Putri", "Hendra Gunawan", "Ayu Wulandari"]);
  const keptApplicants = applicants.filter((a) => !(sampleIds.has(a.jobId) && sampleNames.has(a.name)));
  return {
    jobs: jobs.filter((j) => !sampleIds.has(j.id) || keptApplicants.some((a) => a.jobId === j.id)),
    applicants: keptApplicants,
  };
}

export function passwordChangeError(user: AppUser | undefined, current: string, next: string, confirm: string): string | null {
  if (!user || user.password !== current) return "Password saat ini salah.";
  if (!next.trim()) return "Password baru wajib diisi.";
  if (next === current) return "Password baru harus berbeda dari password saat ini.";
  if (next !== confirm) return "Konfirmasi password tidak cocok.";
  return null;
}