// src/hooks/useMenus.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

// src/api/menu.ts
import Url from '@/Uri/url';
import { SuccessResponse } from '@/components/type/response';
import { Project } from '@/components/type/projectType';

// Query key konsisten untuk dipakai di mana saja
export const menuQueryKey = ['listEvent'] as const;

export async function fetchMenu(signal?: AbortSignal): Promise<Project[]> {
    const res = await fetch(Url.LIST_EVENT_API ?? '/landing-public-service/list-event', { signal });
    if (!res.ok) {
        throw new Error(`Gagal mengambil Event: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as SuccessResponse | { data?: Project[] };
    return Array.isArray((json as any)?.data) ? ((json as any).data as Project[]) : [];
}


export function useEvent() {
    return useQuery<Project[]>({
        queryKey: menuQueryKey,
        queryFn: ({ signal }) => fetchMenu(signal),
        staleTime: Infinity,          // data dianggap selalu fresh
        gcTime: Infinity,             // tidak digarbage-collect selama sesi app
        refetchOnWindowFocus: false,  // sesuai kebutuhanmu
    }); 
}

// Opsional: helper untuk refresh manual dari mana saja
export function useRefreshMenus() {
    const qc = useQueryClient();
    return {
        refresh: () => qc.invalidateQueries({ queryKey: menuQueryKey }),
    };
}