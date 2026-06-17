// src/hooks/useMenus.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

// src/api/menu.ts
import Url from '@/Uri/url';
import { ErrorResponse, SuccessResponse } from '@/components/type/response';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { ApiMenuResponse, MenuItem } from '@/components/type/MemuMemberType';

// Query key konsisten untuk dipakai di mana saja
export const menuQueryKey = ['menuMember'] as const;

type TokenExpiredError = Error & { code?: 'TOKEN_EXPIRED' };

export async function fetchMenuMember(signal?: AbortSignal): Promise<ApiMenuResponse> {
    const token = `Bearer ${atob(localStorage.getItem('access_token'))}`;
    const res = await fetch(Url.LIST_MENU_MEMBER ?? '', { signal, headers: { "Authorization": token }, method: "POST" });

    // BACA JSON SEKALI SAJA
    let json: any = null;
    try {
        json = await res.json();
    } catch {
        // abaikan jika body kosong
    }

    if (!res.ok) {
        const isExpired =
            res.status === 401 ||
            (json && (json as ErrorResponse<{}>)?.errors === 'Expired token');

        if (isExpired) {
            const err: TokenExpiredError = new Error('Token expired');
            err.code = 'TOKEN_EXPIRED';
            throw err;
        }

        throw new Error(
            `Gagal mengambil Event: ${res.status} ${res.statusText}`
        );

    }
    json = json as ApiMenuResponse ;
    // return Array.isArray((json as any)?.data) ? ((json as any).data as MenuItem[]) : [];
    return json;
}


export function useMenuMember() {
    const navigate = useNavigate();
    const query = useQuery<ApiMenuResponse>({
        queryKey: menuQueryKey,
        queryFn: ({ signal }) => fetchMenuMember(signal),
        staleTime: Infinity,          // data dianggap selalu fresh
        gcTime: Infinity,             // tidak digarbage-collect selama sesi app
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
            // Stop retry kalau token expired
            if (error?.message === 'Token expired') return false;
            return failureCount < 1; // retry sekali untuk error lain
        },
        // sesuai kebutuhanmu
    });

    useEffect(() => {
        if (query.isError && query.error?.message === 'Token expired') {
            // Bersihkan credential di sisi UI agar pasti logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('data_user');
            toast({
                title: 'Token Expired!',
                description: `Silahkan Login Kembali Untuk Memasuki Member Page.`,
            });
            navigate('/login', { replace: true });
        }
    }, [query.isError, query.error, navigate]);


    return query;
}

// Opsional: helper untuk refresh manual dari mana saja
export function useRefreshEvent() {
    const qc = useQueryClient();
    return {
        refresh: () => qc.invalidateQueries({ queryKey: menuQueryKey }),
    };
}