

const Url = {
    MENU_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/menu`,
    LIST_EVENT_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/list-event`,
    Login_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/login`,
    Register_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/register`,
    VERIFY_OTP_ENDPOINT: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/verify-otp`,
    RESEND_OTP_ENDPOINT: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/resend-otp`,
    VERIFY_USER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/verify-user`,
    Jobs_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/listpekerjaan`,
    // Add more URLs as needed
};

export default Url;