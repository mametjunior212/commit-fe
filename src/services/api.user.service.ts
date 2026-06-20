import { JobItem } from "@/components/type/pekerjaanType";
import { SuccessResponse } from "@/components/type/response";
import Url from "@/Uri/url";

export async function fetcher<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(url, options);

    if (!res.ok) {
        throw new Error(`Request gagal: ${res.status}`);
    }

    return res.json();
}

export async function fetchJobs(
    signal?: AbortSignal
): Promise<JobItem[]> {
    const res = await fetch(Url.Jobs_API ?? "/api/menu", {
        signal,
    });

    if (!res.ok) {
        throw new Error(
            `Gagal mengambil pekerjaan: ${res.status}`
        );
    }

    const json =
        (await res.json()) as
        | SuccessResponse<JobItem[]>
        | { data?: JobItem[] };

    if (Array.isArray(json)) return json;

    if (Array.isArray(json?.data)) {
        return json.data;
    }

    return [];
}