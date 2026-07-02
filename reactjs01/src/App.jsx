import axios from "./util/axios.customize";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { Outlet } from "react-router-dom"; 
import { useDispatch,   useSelector
 } from "react-redux";
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
        const base64Url = token.split('.')[1];
        const payload = JSON.parse(window.atob(base64Url));
        const role = payload.role; 

        console.log(">>> Role extracted from token:", role);

        const apiEndpoint = role === 'admin' ? '/api/auth/admin/profile' : '/api/auth/user/profile';
        const res = await axios.get(apiEndpoint);
        
        console.log("FETCH ACCOUNT RESPONSE:", res);

        if (res && res.user) {
          dispatch(loginSuccess(res.user));
        }
      } catch (error) {
        console.log("Account fetch error:", error);
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
      
        <Outlet />
      )}
    </div>
  );
}

export default App;