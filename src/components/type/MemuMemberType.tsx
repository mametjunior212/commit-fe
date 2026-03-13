import { LucideIcon } from "lucide-react";

/* =========================
 * 1) Types
 * ========================= */
export type ApiRoute = {
    uuid: string;
    name: string;
    url: string;
    route?: string;
    method: string;
};

export type ApiNode = {
    uuid: string;
    name: string;
    order?: number;
    action?: string;
    route?: ApiRoute | null;
    routes?: ApiRoute[];
    icon?: string | null;
    children?: ApiNode[];
};

export type ApiMenuResponse = {
    code: string;
    status: string;
    message: string;
    data: ApiNode[];
};

export type MenuItem = {
    uuid: string; // uuid
    label: string; // name
    icon?: LucideIcon;
    to?: string | null; // route.url
    actions?: string[]; // action string -> array
    method?: string | null; // route.method
    routesExtra?: {
        name: string;
        url: string | null;
        method: string;
    }[];
    children?: MenuItem[];
    order?: number;
};