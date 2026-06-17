export type ErrorResponse<T> = {
    code: string;
    status: string;
    message: string;
    errors: string;
    data: T; // Optional field for validation errors
};

export type SuccessResponse<T> = {
    code: string;
    status: string;
    message: string;
    data: T; // Optional field for validation errors
};