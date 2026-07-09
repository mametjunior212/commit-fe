export type EventItem = {
    uuid: string;
    title: string;
    category: number;
    year: string;
    client: string | null | "";
    heroImage: number | null;
    thumbnail: number | null;
    herovideo: number | null;
    description: string;
    about: string;
    results: string;
    services: string;
    template: number;
    link: string | null;
    start_date: string;
    end_date: string;
    open_regist?: string;
    close_regist?: string;
    close_voting?: string;
    open_voting?: string;
    active: "y" | "n";
    created_at: string;
    created_by: string | number | null;
    updated_at: string;
    updated_by: string | number | null;
    limitUser: number;
    TotalRegist: number;
    DT_RowIndex: number;
    absen_personal?: {
        uuid: string;
        nama: string;
        nomor: string;
        alamat: string;
        alamat_kantor: string;
        hadir: string;
        user_name: string;
    }[];
    voting_personal?: {
        uuid?: string;
        nama?: string;
        nomor?: string;
        alamat?: string;
        alamat_kantor?: string;
        hadir?: string;
        user_name?: string;
    }[];
    voting_option?: {
        uuid: string;
        name: string;
        path: string;
        filename: string;
    }[];
};

export type DataTablesEnvelope<T> = {
    code: string;
    status: "success" | "error" | string;
    message: string;
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: T[];
    input: [];
};

export type EventsParam = {
    page?: number; // 1-based
    perPage?: number;
    search?: string;
    sortBy?:
    | "title"
    | "year"
    | "category"
    | "start_date"
    | "end_date"
    | "open_regist"
    | "close_regist"
    | "close_voting"
    | "open_voting"
    | "active"
    | "";
    sortOrder?: "asc" | "desc";
};

export type AttendanceFlag = "y" | "n" | null;

export type AttendanceColumn =
    | "nama"
    | "nomor"
    | "alamat"
    | "alamat_kantor"
    | "community"
    | "perusahaan"
    | "nama_pekerjaan1"
    | "nama_pekerjaan2"
    | "nama_user"
    | "email"
    | "email_pribadi"
    | "email_perusahaan"
    | "nomor_hp"
    | "hadir"
    | "hall"
    | "tabletop"
    | "booth"
    | "created_at";

export type AttendanceItem = {
    title: string;
    uuid: string;
    nama: string | null;
    nomor: string | null;
    alamat: string | null;
    alamat_kantor: string | null;
    community: string | null;
    perusahaan: string | null;
    nama_pekerjaan1: string | null;
    nama_pekerjaan2: string | null;
    nama_user: string | null;
    email: string | null;
    email_pribadi: string | null;
    email_perusahaan: string | null;
    nomor_hp: string | null;
    hadir: AttendanceFlag;
    hall: AttendanceFlag;
    tabletop: AttendanceFlag;
    booth: AttendanceFlag;
    created_at: string | null;
    DT_RowIndex: number;
};

export type AttendanceParams = {
    page?: number; // 1-based
    perPage?: number;
    search?: string;
    sortBy?: AttendanceColumn | "";
    sortOrder?: "asc" | "desc";
    columnFilters?: Partial<Record<AttendanceColumn, string>>;
};