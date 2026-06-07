import { api } from "@/lib/axios";
import { Perusahaan } from "@/types/perusahaan.type";
import { DataTableResponse } from "@/types/reponse.type";
import Url from "@/Uri/url";

interface Params {
    page?: number;
    limit?: number;
    search?: string;
}

export const getPerusahaan = async ({
    page = 1,
    limit = 10,
    search = "",
}: Params): Promise<DataTableResponse<Perusahaan>> => {
    const start = (page - 1) * limit;

    const response = await api.post<DataTableResponse<Perusahaan>>(Url.LIST_PERUSAHAAN_USER, {
        params: {
            draw: page,
            start,
            length: limit,
            search: { value: search, },
        },
    });

    return response.data;
};

export const addPerusahaan = async (
    payload: FormData
) => {
    const response = await api.post<DataTableResponse<Perusahaan>>(
        Url.ADD_PERUSAHAAN_USER,
        payload,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};