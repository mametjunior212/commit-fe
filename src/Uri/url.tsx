

const Url = {
    // Public
    MENU_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/menu`,
    LIST_EVENT_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/list-event`,
    LIST_PARTNER_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/list-partner`,
    LIST_SETTING_PARAM: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/settingParam`,
    Jobs_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/listpekerjaan`,
    Voting_Realtime: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/realtime-voting/`,
    Detail_Event: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service/detail-event/`,

    // Auth
    Login_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/login`,
    Register_API: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/register`,
    VERIFY_OTP_ENDPOINT: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/verify-otp`,
    RESEND_OTP_ENDPOINT: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/resend-otp`,
    VERIFY_USER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service/verify-user`,

    // Member Url
    LIST_MENU_MEMBER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-private-service/menu`,
    LIST_EVENT_MEMBER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-private-service/listevent`,
    LIST_VOTE_MEMBER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-private-service/listvote`,
    VOTE_EVENT_MEMBER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-private-service/submit/vote`,
    REGISTER_EVENT_MEMBER: `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-private-service/register/event`,
};

export default Url;