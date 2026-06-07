import { useQuery } from "@tanstack/react-query";

import { getPerusahaan } from "@/api/perusahaan.api";

interface Props {
    page: number;
    limit: number;
    search: string;
}

export const usePerusahaan = ({
    page,
    limit,
    search,
}: Props) => {
    return useQuery({
        queryKey: ["Listperusahaan", page, limit, search],
        queryFn: () =>
            getPerusahaan({
                page,
                limit,
                search,
            }),
        placeholderData: (previousData) => previousData,
    });
};