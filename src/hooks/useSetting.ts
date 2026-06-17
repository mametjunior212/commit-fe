// src/hooks/useMenus.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

// src/api/menu.ts
import Url from '@/Uri/url';
import { Parameter } from '@/components/type/Parameter';
import { SuccessResponse } from '@/components/type/response';

// Query key konsisten untuk dipakai di mana saja
export const menuQueryKey = ['setting'] as const;

export async function fetchMenu(signal?: AbortSignal): Promise<Parameter[]> {
    const res = await fetch(Url.LIST_SETTING_PARAM ?? '/landing-public-service/settingParam', { signal });
    if (!res.ok) {
        throw new Error(`Gagal mengambil menu: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as SuccessResponse<Parameter[]> | { data?: Parameter[] };
    return Array.isArray((json as any)?.data) ? ((json as any).data as Parameter[]) : [];
}


export function useParameter() {
    return useQuery<Parameter[]>({
        queryKey: menuQueryKey,
        queryFn: ({ signal }) => fetchMenu(signal),
        staleTime: Infinity,          // data dianggap selalu fresh
        gcTime: Infinity,             // tidak digarbage-collect selama sesi app
        refetchOnWindowFocus: false,  // sesuai kebutuhanmu
    });
}

// Opsional: helper untuk refresh manual dari mana saja
export function useRefreshParameter() {
    const qc = useQueryClient();
    return {
        refresh: () => qc.invalidateQueries({ queryKey: menuQueryKey }),
    };
}
// Helper aman
export const getParameterByName = (
    list: Parameter[] | undefined | null,
    nama_param?: string
): Parameter | undefined => {
    if (!Array.isArray(list) || !nama_param) return undefined;
    return list.find((p) => p?.nama_param === nama_param);
};

export const getInParameterByName = (
    list: Parameter[] | undefined | null,
    nama_param?: string[]
): Parameter[] => {
    if (!Array.isArray(list)) return [];
    if (!Array.isArray(nama_param) || nama_param.length === 0) return [];
    const wanted = new Set(nama_param);
    return list.filter((p) => p && wanted.has(p.nama_param));
};