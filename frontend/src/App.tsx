import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import StaffDashboard from "./pages/dashboard/StaffDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AppointmentPage from "./pages/AppointmentPage";
import ProfilePage from "./pages/ProfilePage";
import BlogPage from "./pages/BlogPage";
import GalleryPage from "./pages/GalleryPage";
import Layout from "./components/layout/Layout";
import NotFoundPage from "./pages/NotFoundPage";
import AddStaffPage from "./pages/dashboard/AddStaffPage";
import { ReactNode, useEffect } from "react";
import ServicesPage from "./pages/ServicesPage";
import axios from "axios";
import useUserData from "./hooks/useUserData";
import 'aos/dist/aos.css';
import AOS from "aos"; // <-- Import AOS
import AboutUsPage from "./pages/AboutUsPage";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const user = useUserData();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.id === 0 && token) {
    return <div>Loading...</div>;
  }

  if (user.id === -1 ) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  // Initialize AOS on mount
  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route
            path="appointments"
            element={
              <ProtectedRoute allowedRoles={["customer", "staff", "admin"]}>
                <AppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute allowedRoles={["customer", "staff", "admin"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="services" element={<ServicesPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="aboutus" element={<AboutUsPage />} />
          <Route path="gallery" element={<GalleryPage />} />

          <Route path="*" element={<NotFoundPage />} />

          <Route
            path="dashboard/add-staff"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddStaffPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}