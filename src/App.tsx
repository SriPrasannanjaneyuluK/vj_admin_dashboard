import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminHomePage } from "@/pages/admin/AdminHomePage";
import { AdminCoursesPage } from "@/pages/admin/AdminCoursesPage";
import { AdminAddCoursePage } from "@/pages/admin/AdminAddCoursePage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminContactPage } from "@/pages/admin/AdminContactPage";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path="courses" element={<AdminCoursesPage />} />
              <Route path="courses/new" element={<AdminAddCoursePage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="contact" element={<AdminContactPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
