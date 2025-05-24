import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import StaffLayout from "../layouts/StaffLayout";
// import StudentLayout from "../layouts/StudentLayout";
import MainLayout from "../layouts/MainLayout";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import DepartmentList from "../pages/admin/departments/DepartmentList";
import DepartmentForm from "../pages/admin/departments/DepartmentForm";
import UserList from "../pages/admin/users/UserList";
import UserForm from "../pages/admin/users/UserForm";
import FormTemplateList from "../pages/admin/form-templates/FormTemplateList";
import FormTemplateForm from "../pages/admin/form-templates/FormTemplateForm";
import FormTemplatePreview from "../pages/admin/form-templates/FormTemplatePreview";
// Staff pages
import StaffRequests from "../components/StaffRequest";
import StaffOverview from "../components/StaffOverview";
import StaffFormTemplateList from "../components/StaffForm/FormTemplateList";
import StaffFormTemplatePreview from "../components/StaffForm/FormTemplatePreview";
import StaffFormTemplateForm from "../components/StaffForm/FormTemplateForm";
// import StaffDashboard from "../pages/staff/Dashboard";
// import SubmissionList from "../pages/staff/SubmissionList";
// import SubmissionDetail from "../pages/staff/SubmissionDetail";

// Student pages
// import StudentDashboard from "../pages/student/Dashboard";
// import FormsList from "../pages/student/FormsList";
// import SubmitForm from "../pages/student/SubmitForm";
// import MySubmissions from "../pages/student/MySubmissions";

// Public pages
import Home from "../pages/Home";
import ProcessingStatus from "../pages/ProcessingStatus";
import SubmissionDetail from "../pages/SubmissionDetail";
// import ForgotPassword from "../pages/auth/ForgotPassword";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} /> */}

      {/* Redirect root path to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Main layout routes */}
      <Route path="/home" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="xuly" element={<ProcessingStatus />} />
        <Route path="submissions/:id" element={<SubmissionDetail />} />
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="departments/new" element={<DepartmentForm />} />
          <Route path="departments/:id" element={<DepartmentForm />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/:id" element={<UserForm />} />
          <Route path="form-templates" element={<FormTemplateList />} />
          <Route path="form-templates/new" element={<FormTemplateForm />} />
          <Route path="form-templates/:id" element={<FormTemplateForm />} />
          <Route
            path="form-templates/:id/preview"
            element={<FormTemplatePreview />}
          />
        </Route>
      </Route>

      {/* Staff routes */}
      <Route element={<ProtectedRoute requiredRoles={["staff"]} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route path="requests" element={<StaffRequests />} />
          <Route path="form" element={<StaffFormTemplateList />} />
          <Route
            path="form-templates/new"
            element={<StaffFormTemplateForm />}
          />
          <Route
            path="form-templates/:id/preview"
            element={<StaffFormTemplatePreview />}
          />
          <Route
            path="form-templates/:id"
            element={<StaffFormTemplateForm />}
          />

          <Route index element={<StaffOverview />} />
        </Route>
      </Route>

      {/* Student routes */}
      {/* <Route element={<ProtectedRoute requiredRoles={["student"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="forms" element={<FormsList />} />
          <Route path="forms/:id/submit" element={<SubmitForm />} />
          <Route path="my-submissions" element={<MySubmissions />} />
        </Route>
      </Route> */}

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
