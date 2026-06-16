import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const user = useSelector(state => state.auth.user);

    // Nếu chưa đăng nhập -> Đá về Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu đã đăng nhập nhưng KHÔNG PHẢI Admin -> Đá về Dashboard
    if (user.role !== 'admin') {
        return <Navigate to="/workspace/dashboard" replace />;
    }

    // Nếu chuẩn Admin -> Cho phép hiển thị giao diện bên trong
    return children;
};

export default AdminRoute;