import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import FilmGrain from "./components/FilmGrain";
import ThemeSwitcher from "./components/ThemeSwitcher";
import ChatBot from "./components/chatbot/ChatBot";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import FaceSwap from "./pages/FaceSwap";
import VoiceChanger from "./pages/VoiceChanger";
import Booking from "./pages/Booking";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import VideoTemplates from "./pages/VideoTemplates";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminModeration from "./pages/admin/AdminModeration";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="relative min-h-screen bg-background">
            <FilmGrain />
            <ThemeSwitcher />
            <ChatBot />
            <Routes>
              {/* Admin routes (no Navbar, own sidebar layout) */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="moderation" element={<AdminModeration />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Public routes with Navbar */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/face-swap" element={<FaceSwap />} />
                    <Route path="/voice-changer" element={<VoiceChanger />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/video-templates" element={<VideoTemplates />} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
