import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/Courses/CourseDetail";
import { Subjects } from "./pages/Subjects";
import { Enrollments } from "./pages/Enrollments";
import { Students, StudentDetail } from "./pages/Students";
import { TeacherSubjects, TeacherSubjectDetail } from "./pages/TeacherSubjects";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes with Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Directivo routes */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={["DIRECTIVO"]}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Secretario & Directivo routes */}
          <Route
            path="/cursos"
            element={
              <ProtectedRoute
                allowedRoles={["DIRECTIVO", "SECRETARIO", "PRECEPTOR"]}
              >
                <Layout>
                  <Courses />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cursos/:id"
            element={
              <ProtectedRoute
                allowedRoles={["DIRECTIVO", "SECRETARIO", "PRECEPTOR"]}
              >
                <Layout>
                  <CourseDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/materias"
            element={
              <ProtectedRoute allowedRoles={["DIRECTIVO", "SECRETARIO"]}>
                <Layout>
                  <Subjects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inscripciones"
            element={
              <ProtectedRoute allowedRoles={["DIRECTIVO", "SECRETARIO"]}>
                <Layout>
                  <Enrollments />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Search students - Secretario & Preceptor */}
          <Route
            path="/alumnos"
            element={
              <ProtectedRoute
                allowedRoles={["DIRECTIVO", "SECRETARIO", "PRECEPTOR"]}
              >
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumnos/:id"
            element={
              <ProtectedRoute
                allowedRoles={["DIRECTIVO", "SECRETARIO", "PRECEPTOR"]}
              >
                <Layout>
                  <StudentDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Docente routes */}
          <Route
            path="/mis-materias"
            element={
              <ProtectedRoute allowedRoles={["DOCENTE"]}>
                <Layout>
                  <TeacherSubjects />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mis-materias/:id"
            element={
              <ProtectedRoute allowedRoles={["DOCENTE"]}>
                <Layout>
                  <TeacherSubjectDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Alumno routes */}
          <Route
            path="/mis-calificaciones"
            element={
              <ProtectedRoute allowedRoles={["ALUMNO"]}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
