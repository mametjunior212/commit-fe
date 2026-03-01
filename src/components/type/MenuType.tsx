export interface ApiRoute {
    uuid: string;
    name: string;
    url: string;   // e.g. "/event"
    route: string; // e.g. "event.route"
    method: string; // "GET" | "POST" | ...
    is_public: 'y' | 'n';
}

export interface ApiMenu {
    uuid: string;
    parent_id: number | null;
    name: string;
    order: number;
    icon_id: string | null;
    route_id: number | null;
    active: 'y' | 'n';
    type: string;       // "landing" | dll
    is_public: 'y' | 'n';
    route: ApiRoute | null; // parent bisa null
    routes: unknown[];      // belum dipakai
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