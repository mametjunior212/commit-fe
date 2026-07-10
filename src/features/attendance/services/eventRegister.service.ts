import axios from "axios";
import Url from "@/Uri/url";
import { SuccessResponse, ErrorResponse } from "@/components/type/response";
import { EventRegisterPayload } from "../types/eventRegister.type";

export async function saveEventRegister(
    payload: EventRegisterPayload,
    signal?: AbortSignal
): Promise<SuccessResponse<unknown>> {
    try {
        const { data } = await axios.post<SuccessResponse<unknown>>(
            Url.ATTENDANCE_SAVE_API,
            payload,
            {
                headers: { "Content-Type": "application/json" },
                signal,
            }
        );

        return data;
    } catch (err) {
        if (axios.isAxiosError<ErrorResponse<unknown>>(err)) {
            const error = err.response?.data;

            const fieldErrors =
                error?.data && typeof error.data === "object"
                    ? (error.data as Record<string, unknown>)
                    : {};

            const messages = Object.entries(fieldErrors)
                .flatMap(([field, msgs]) =>
                    Array.isArray(msgs) ? msgs.map((msg) => `${field}: ${msg}`) : []
                )
                .join("\n");

            throw new Error(
                messages || error?.message || err.message || "Pendaftaran gagal"
            );
        }

        throw err;
    }
}
