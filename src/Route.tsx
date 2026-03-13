import { Routes, Route, Navigate } from "react-router-dom";
import About from "./pages/About";
import CalendarPage from "./pages/CalendarPage";
import CaseStudy from "./pages/CaseStudy";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtpSection";
import Dashboard from "./pages/MemberPages/Dashboard";
import AdminLayout from "./pages/MemberPages/Layouts/AdminLayout";
import ListEvent from "./pages/MemberPages/ListEvent";
import ListVote from "./pages/MemberPages/ListVote";
import RealtimeVotingPage from "./pages/RealtimeVoting";

const RoutePage = () => {

    return (
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/event" element={<Projects />} />
            <Route path="/event/:id" element={<CaseStudy />} />
            <Route path="/realtime-voting/:id" element={<RealtimeVotingPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Register />} />
            <Route path="/verifikasi/:id" element={<VerifyOtp />} />
            <Route path="/member" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="event" element={<ListEvent />} />
                <Route path="vote" element={<ListVote />} />
            </Route>
            {/* <Route path="/blog" element={<Blog />} /> */}
            {/* <Route path="/blog/:id" element={<BlogPost />} /> */}
            {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
            {/* <Route path="/terms-of-service" element={<TermsOfService />} /> */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default RoutePage;