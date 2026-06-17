export interface ApiRoute {
    uuid: string;
    name: string;
    url: string;   // e.g. "/event"
    route: string; // e.g. "event.route"
    method: string; // "GET" | "POST" | ...
}

export interface ApiMenu {
    uuid: string;
    parent_id?: number | null;
    name: string;
    order: number;
    active?: 'y' | 'n';
    type?: string;       // "landing" | dll
    route: ApiRoute | null; // parent bisa null
    children: ApiMenu[];    // nested
}

export interface MenuApiResponse {
    code: string;
    message: string;
    data: ApiMenu[];
}

export type NavItem = {
    uuid: string;
    name: string;
    href: string | null;
    number: string;    // "01", "02", ...
    children: NavItem[];
};