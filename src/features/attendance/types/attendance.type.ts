import { AttendanceItem } from "@/components/type/Datatables";

/** Kolom profil user/perusahaan yang dipakai saat kolom "tamu" kosong. */
export type FallbackKey =
    | "nama_user"
    | "nomor_hp"
    | "email_pribadi"
    | "nama_pekerjaan1"
    | "alamat_lengkap"
    | "alamat_perusahaan"
    | "nama_perusahaan";

export type AttendanceMeta = {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number;
    to: number;
};

export type AttendancePageData = {
    rows: AttendanceItem[];
    meta: AttendanceMeta;
};

export type AttendanceCellValue = AttendanceItem[keyof AttendanceItem];
