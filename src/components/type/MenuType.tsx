

export interface MenuApiResponse {
    code: string;     // "00"
    message: string;  // "Berhasil Login"
    data: ApiRoute[]; // top-level menu array
}


export interface ApiRoute {
    uuid: string;
    name: string;
    url: string | null;
    route: string;
    method: string;
    is_public: string;
};

export interface ApiMenu {
    uuid: string;
    parent_id: string | number | null;
    name: string;
    order: number;
    icon_id: string | number | null;
    route_id: string | number | null;
    active: 'y' | 'n';
    type: string;
    is_public: 'y' | 'n';
    route: ApiRoute | null;
    routes: any[];
    children: ApiMenu[];
};


export interface NavLink {
    uuid: string;
    name: string;
    href: string | null;
    number: string;
    children: NavLink[];
};
