
const baseURLAuth = `${import.meta.env.VITE_PUBLIC_GATEWAY}/auth-service`;
const baseURLLanding = `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-public-service`;
const baseURLMemberPage = `${import.meta.env.VITE_PUBLIC_GATEWAY}/landing-private-service`;

const Url = {
    // Base Url
    // Public
    MENU_API: `${baseURLLanding}/menu`,
    LIST_EVENT_API: `${baseURLLanding}/list-event`,
    LIST_DETAIL_EVENT_API: `${baseURLLanding}/detail/`,
    LIST_PARTNER_API: `${baseURLLanding}/list-partner`,
    LIST_SETTING_PARAM: `${baseURLLanding}/settingParam`,
    Jobs_API: `${baseURLLanding}/listpekerjaan`,
    Voting_Realtime: `${baseURLLanding}/realtime-voting/`,
    Detail_Event: `${baseURLLanding}/detail-event/`,

    // Auth
    Login_API: `${baseURLAuth}/login`,
    Register_API: `${baseURLAuth}/register`,
    VERIFY_OTP_ENDPOINT: `${baseURLAuth}/verify-otp`,
    RESEND_OTP_ENDPOINT: `${baseURLAuth}/resend-otp`,
    VERIFY_USER: `${baseURLAuth}/verify-user`,

    // Member Url
    LIST_MENU_MEMBER: `${baseURLMemberPage}/menu`,
    LIST_EVENT_MEMBER: `${baseURLMemberPage}/listevent`,
    LIST_VOTE_MEMBER: `${baseURLMemberPage}/listvote`,
    VOTE_EVENT_MEMBER: `${baseURLMemberPage}/submit/vote`,
    REGISTER_EVENT_MEMBER: `${baseURLMemberPage}/register/event`,
    DETAIL_USER: `${baseURLMemberPage}/users/detail`,
    EVENT_ABSEN_API: `${baseURLLanding}/event-absen/`,
    UPDATE_USER: `${baseURLMemberPage}/users/update`,
    RESET_PASSWORD: `${baseURLMemberPage}/users/resetPassword`,
    LIST_PERUSAHAAN_USER: `${baseURLMemberPage}/users/listPerusahaan`,
    SET_PERUSAHAAN_USER: `${baseURLMemberPage}/users/setPerusahaan`,
    ADD_PERUSAHAAN_USER: `${baseURLMemberPage}/users/addPerusahaan`,
};

export default Url;