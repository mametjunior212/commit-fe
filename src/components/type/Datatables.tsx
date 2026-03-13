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
    close_regist?: string;
    open_regist?: string;
    active: "y" | "n";
    created_at: string;
    created_by: string | number | null;
    updated_at: string;
    updated_by: string | number | null;
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
    | "close_regist"
    | "active"
    | "";
    sortOrder?: "asc" | "desc";
};