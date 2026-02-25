import { useQuery } from '@tanstack/react-query';
import { fetchMenu } from '../api/menu';
import { ApiRoute } from '@/components/type/MenuType';

export function useMenu() {
    return useQuery<ApiRoute[]>({
        queryKey: ['menu'],
        queryFn: fetchMenu,
        staleTime: Infinity,   // data dianggap selalu fresh → fetch 1x saja
        gcTime: 24 * 60 * 60 * 1000,   // simpan selamanya selama sesi browser
        refetchOnWindowFocus: false,
    });
}