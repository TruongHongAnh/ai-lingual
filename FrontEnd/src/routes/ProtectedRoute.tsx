import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUserRole } from '../utils/auth';

// Định nghĩa rõ ràng Props truyền vào bắt buộc phải là mảng string
interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const token = getToken();
    const role = getUserRole();

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}