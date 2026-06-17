

export interface Project {
    uuid: string;
    title: string;
    category: string;
    year: string;
    client: string;
    heroImage: string;
    herovideo: string;
    thumbnail: string;
    description: string;
    about: string;
    results: string[];
    services: string[];
    gallery: {
        uuid: string, path: string, alt?: string, grid: string | number, type: string, hyperlink: string, show_gallery: string, [key: string]: any;
    }[] | [];
    nextProject: string;
    prevProject: string;
    template: string;
    startDate?: string;
    endDate?: string;
    color: string | "blue";
    partner: {
        img: string,
        partner?: string,
        link: string,
        nama?: string;
    }[] | [];
    media:
    {
        img: string;
        media?: string;
        link: string;
        nama?: string;
    }[] | [];
    user: {
        uuid: string;
        name: string;
        picturePath: string | null;
    } | null,
    absen: {
        uuid: string;
        user: {
            uuid: string | "",
            nama: string | "",
            pekerjaan?: string | "",
        } | {};
        nama: string | "";
        nomor: string | "";
        pekerjaan?: string | "";
        alamat: string | "";
        alamat_kantor?: string | "";
    }[] | [];
    detailnextProject?: {
        uuid: string;
        heroImage: string;
        title: string;
        year: string;
        category: string;
    }
    detailprevProject?: {
        uuid: string;
        heroImage: string;
        title: string;
        year: string;
        category: string;
    }
}