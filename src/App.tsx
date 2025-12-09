import { useEffect, type JSX } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import { Loader2 } from 'lucide-react';

// Import các trang (Pages)
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import SmartQuiz from './pages/SmartQuiz';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Background from "./components/layout/Background"
import { useAuthStore } from "./stores/useAuthStore";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";

// --- CÁC COMPONENT BẢO VỆ ROUTE (Route Guards) ---

// 1. ProtectedRoute: Chỉ cho phép User đã đăng nhập vào
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuthStore();

  // Khi đang kiểm tra xem user là ai, hiện màn hình loading
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  // Nếu không có user -> Đá về trang Login
  if (!user) return <Navigate to="/" replace />;

  return children;
};

// 2. PublicRoute: Chỉ cho phép User CHƯA đăng nhập vào
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Nếu đã có user -> Đá thẳng vào Dashboard
  if (user) return <Navigate to="/dashboard" replace />; // ĐỔI TỪ /home THÀNH /dashboard

  return children;
};

// Wrapper components để truyền user prop
const QuizWrapper = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  return <Quiz user={user} />;
};

const SmartQuizWrapper = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  return <SmartQuiz user={user} />;
};

const AnalyticsWrapper = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  return <Analytics user={user} />;
};

const SettingsWrapper = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  return <Settings user={user} />;
};

export default function App() {
  const { setUser, isLoading } = useAuthStore();

  // Đồng bộ Firebase auth state với Zustand store
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Hiển thị loading khi đang kiểm tra auth state lần đầu
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Background />
        <Routes>
          {/* Route Công khai: Ai cũng xem được (kể cả user đã đăng nhập) */}
          <Route path="/" element={<LandingPage />} />

          {/* Route Auth: Đã login thì không vào được nữa */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Route Bảo vệ: Phải login mới xem được */}
          <Route path="/dashboard" element={ // ĐỔI TỪ /home THÀNH /dashboard
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/quiz" element={
            <ProtectedRoute>
              <QuizWrapper />
            </ProtectedRoute>
          } />

          <Route path="/smart-quiz" element={
            <ProtectedRoute>
              <SmartQuizWrapper />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsWrapper />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsWrapper />
            </ProtectedRoute>
          } />

          {/* Route 404: Nếu nhập linh tinh thì về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}