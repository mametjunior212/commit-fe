import { useQuery, useQueryClient } from '@tanstack/react-query';
import Url from '@/Uri/url';
import { SuccessResponse } from '@/components/type/response';
import { Project } from '@/components/type/projectType';

export async function fetchDetailEvent(id: string, signal?: AbortSignal): Promise<Project> {
    const res = await fetch(`${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/detail/${id ?? ''}`, { signal });
    if (!res.ok) {
        throw new Error(`Gagal mengambil Event: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as SuccessResponse<Project> | { data?: Project };
    return json.data;
}

export function useDetailEvent(id: string) {
    return useQuery<Project>({
        queryKey: ['DetailEvent', id],
        queryFn: ({ signal }) => fetchDetailEvent(id, signal),
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });
}

export function useRefreshEvent(id: string) {
    const qc = useQueryClient();
    return {
        refresh: () => qc.invalidateQueries({ queryKey: ['DetailEvent', id] }),
    };
}
