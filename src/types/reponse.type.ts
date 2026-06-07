export interface DataTableResponse<T> {
    code: string;
    status: string;
    message: string;
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: T[];
}