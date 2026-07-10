import { Routes, Route, Navigate } from "react-router-dom";
import AboutPage from "@/features/public/pages/AboutPage";
import CalendarPage from "@/features/public/pages/CalendarPage";
import CaseStudyPage from "@/features/event/pages/CaseStudyPage";
import EventAbsenPage from "@/features/attendance/pages/EventAbsenPage";
import EventRegisterPage from "@/features/attendance/pages/EventRegisterPage";
import HomePage from "@/features/public/pages/HomePage";
import NotFoundPage from "@/features/public/pages/NotFoundPage";
import ProjectsPage from "@/features/public/pages/ProjectsPage";
import ContactPage from "@/features/public/pages/ContactPage";
import RegisterPage from "@/features/public/pages/RegisterPage";
import VerifyOtpPage from "@/features/public/pages/VerifyOtpPage";
import DashboardPage from "@/features/member/pages/DashboardPage";
import AdminLayout from "@/features/member/layouts/AdminLayout";
import ListEventPage from "@/features/member/pages/ListEventPage";
import ListVotePage from "@/features/member/pages/ListVotePage";
import RealtimeVotingPage from "@/features/public/pages/RealtimeVotingPage";
import MaintenancePage from "@/features/public/pages/MaintenancePage";
import MemberUserPage from "@/features/member/pages/UserPage";
import AttendancePage from "@/features/attendance/pages/AttendancePage";

const RoutePage = () => {

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event" element={<ProjectsPage />} />
            <Route path="/event/:id" element={<CaseStudyPage />} />
            <Route path="/event-absen/:id" element={<EventAbsenPage />} />
            <Route path="/attendance/:id" element={<AttendancePage />} />
            <Route path="/event-register/:id" element={<EventRegisterPage />} />
            <Route path="/realtime-voting/:id" element={<RealtimeVotingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<RegisterPage />} />
            <Route path="/verifikasi/:id" element={<VerifyOtpPage />} />
            <Route path="/member" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="event" element={<ListEventPage />} />
                <Route path="vote" element={<ListVotePage />} />
                <Route path="user" element={<MemberUserPage />} />
                <Route path="*" element={<MaintenancePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}

export default RoutePage;