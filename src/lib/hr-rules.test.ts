import { describe, expect, it } from "vitest";
import { passwordChangeError, removeRecruitmentSamples } from "./hr-rules";
import type { AppUser } from "./hr-store";

const user: AppUser = { id: "test", username: "test", password: "old-password", role: "karyawan" };
describe("password akun sendiri", () => {
  it("menolak password lama yang salah", () => expect(passwordChangeError(user, "wrong", "new-password", "new-password")).not.toBeNull());
  it("menolak konfirmasi berbeda", () => expect(passwordChangeError(user, "old-password", "new-password", "different")).not.toBeNull());
  it("menerima perubahan dengan password saat ini dan konfirmasi benar", () => expect(passwordChangeError(user, "old-password", "new-password", "new-password")).toBeNull());
  it("menolak password kosong atau tidak berubah", () => {
    expect(passwordChangeError(user, "old-password", " ", " ")).not.toBeNull();
    expect(passwordChangeError(user, "old-password", "old-password", "old-password")).not.toBeNull();
  });
});
describe("rekrutmen tanpa contoh", () => {
  it("menghapus contoh lowongan dan pelamar", () => {
    expect(removeRecruitmentSamples([{ id: "j1", title: "Frontend Developer", division: "IT", open: true }], [{ id: "a", jobId: "j1", name: "Kevin Wijaya", email: "kevin@mail.com", stage: "Interview" }])).toEqual({ jobs: [], applicants: [] });
  });
  it("mempertahankan data yang dimasukkan pengguna", () => {
    const jobs = [{ id: "custom", title: "Teknisi", division: "Teknik", open: true }];
    const applicants = [{ id: "custom-a", jobId: "custom", name: "Pelamar baru", email: "a@example.com", stage: "Screening" as const }];
    expect(removeRecruitmentSamples(jobs, applicants)).toEqual({ jobs, applicants });
  });
});