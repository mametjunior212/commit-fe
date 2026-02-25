import { MenuApiResponse, ApiRoute } from '@/components/type/MenuType';

export async function fetchMenu(): Promise<ApiRoute[]> {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Gagal mengambil menu');
    const json = (await res.json()) as MenuApiResponse;
    return json.data ?? [];
}