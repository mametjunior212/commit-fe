

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
        uuid: string, path: string, alt?: string, grid: string | number, orderBy: number, type: string,show_gallery:string
    }[] | [];
    nextProject: string;
    prevProject: string;
    template: string;
    startDate: string;
    endDate: string;
    color: string | "blue";
    partner: {
        img: string,
        partner: string,
        link: string,
    }[] | [];
    media:
    {
        img: string;
        media: string;
        link: string;
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
}