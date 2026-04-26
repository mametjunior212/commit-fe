// src/hooks/useMenus.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

// src/api/menu.ts
import Url from '@/Uri/url';
import { SuccessResponse } from '@/components/type/response';
import { Project } from '@/components/type/projectType';

// Query key konsisten untuk dipakai di mana saja
export const menuQueryKey = ['DetailEvent'] as const;

export async function fetchDetailEvent(id: string, signal?: AbortSignal): Promise<Project> {
    const res = await fetch(`${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/detail/${id ?? ""}`, { signal });
    if (!res.ok) {
        throw new Error(`Gagal mengambil Event: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as SuccessResponse | { data?: Project };
    return json.data;
}


export function useDetailEvent(id: string) {
    return useQuery<Project>({
        queryKey: menuQueryKey,
        queryFn: ({ signal }) => fetchDetailEvent(id, signal),
        staleTime: Infinity,          // data dianggap selalu fresh
        gcTime: Infinity,             // tidak digarbage-collect selama sesi app
        refetchOnWindowFocus: false,  // sesuai kebutuhanmu
    });
}

// Opsional: helper untuk refresh manual dari mana saja
export function useRefreshEvent() {
    const qc = useQueryClient();
    return {
        refresh: () => qc.invalidateQueries({ queryKey: menuQueryKey }),
    };
}