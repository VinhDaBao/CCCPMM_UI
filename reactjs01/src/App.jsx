import Header from "./components/layout/header";
import axios from "./util/axios.customize";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // --- GIẢI MÃ TOKEN ĐỂ BIẾT ROLE ---
        // Token JWT gồm 3 phần, phần thứ 2 là payload chứa dữ liệu
        const base64Url = token.split('.')[1];
        const payload = JSON.parse(window.atob(base64Url));
        const role = payload.role; // Giả sử trong token của bạn có lưu role

        console.log(">>> Role lấy từ token:", role);

        // --- GỌI API THEO ĐÚNG ĐƯỜNG DẪN ---
        const apiEndpoint = role === 'admin' ? '/api/auth/admin/profile' : '/api/auth/user/profile';
        const res = await axios.get(apiEndpoint);
        
        console.log("FETCH ACCOUNT RESPONSE:", res);

        if (res && res.user) {
          dispatch(loginSuccess(res.user));
        }
      } catch (error) {
        console.log("Lỗi fetch account:", error);
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccount();
  }, [dispatch]);

  return (
    <div>
      {isLoading ? (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Header />
          <Outlet />
        </>
      )}
    </div>
  );
}

export default App;