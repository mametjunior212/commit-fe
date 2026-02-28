export type ErrorResponse = {
    code: string;
    status: string;
    message: string;
    errors: string;
    data: any; // Optional field for validation errors
};

export type SuccessResponse = {
    code: string;
    status: string;
    message: string;
    data: any; // Optional field for validation errors
};