import { AttendanceColumn } from "@/components/type/Datatables";
import { FallbackKey } from "../types/attendance.type";

export const PAGE_SIZES = [5, 10, 20, 50, 100] as const;

export const COLUMN_CONFIG: { key: AttendanceColumn; label: string }[] = [
    { key: "nama", label: "Nama" },
    { key: "nomor", label: "Nomor HP" },
    { key: "alamat", label: "Alamat" },
    { key: "alamat_kantor", label: "Alamat Kantor" },
    { key: "community", label: "Community" },
    { key: "perusahaan", label: "Perusahaan" },
    { key: "nama_pekerjaan2", label: "Pekerjaan" },
    { key: "email", label: "Email" },
    { key: "hadir", label: "Hadir" },
    { key: "hall", label: "Hall" },
    { key: "tabletop", label: "Tabletop" },
    { key: "booth", label: "Booth" },
    { key: "created_at", label: "Waktu Daftar" },
];

export const COLUMNS: AttendanceColumn[] = COLUMN_CONFIG.map((c) => c.key);

export const FLAG_COLUMNS: AttendanceColumn[] = ["hadir", "hall", "tabletop", "booth"];

/** Kolom "tamu" jatuh balik ke data profil user/perusahaan saat kosong/null. */
export const FALLBACK_SOURCE: Partial<Record<AttendanceColumn, FallbackKey>> = {
    nama: "nama_user",
    nomor: "nomor_hp",
    email: "email_pribadi",
    nama_pekerjaan2: "nama_pekerjaan1",
    alamat: "alamat_lengkap",
    alamat_kantor: "alamat_perusahaan",
    perusahaan: "nama_perusahaan",
};

/** Field yang boleh dipakai backend untuk pencarian global (DataTables columns[].searchable). */
export const SEARCHABLE_FIELDS = new Set<AttendanceColumn | "title">([
    "title",
    "nama",
    "nomor",
    "alamat",
    "email",
    "email_perusahaan",
    "community",
    "perusahaan",
    "nama_pekerjaan2",
]);

export const QUERY_COLUMNS: (AttendanceColumn | "title")[] = [...COLUMNS, "title"];
