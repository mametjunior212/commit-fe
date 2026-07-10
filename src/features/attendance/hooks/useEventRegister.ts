import { useMutation, useQuery } from "@tanstack/react-query";
import { JobItem } from "@/components/type/pekerjaanType";
import { SuccessResponse } from "@/components/type/response";
import { fetchJobs } from "@/services/api.user.service";
import { saveEventRegister } from "../services/eventRegister.service";
import { EventRegisterPayload } from "../types/eventRegister.type";

export function useJobs() {
    return useQuery<JobItem[]>({
        queryKey: ["jobs"],
        queryFn: ({ signal }) => fetchJobs(signal),
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });
}

type UseEventRegisterOptions = {
    onSuccess?: (data: SuccessResponse<unknown>) => void;
    onError?: (error: Error) => void;
};

export function useEventRegister({ onSuccess, onError }: UseEventRegisterOptions = {}) {
    return useMutation<SuccessResponse<unknown>, Error, EventRegisterPayload>({
        mutationFn: (payload) => saveEventRegister(payload),
        onSuccess,
        onError,
    });
}
