import Header from "./components/layout/header";
import axios from "./util/axios.customize"
import { useContext, useEffect } from "react"
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";
import { Outlet } from "react-router-dom";

function App() {

const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

useEffect(() =>{
const fetchAccount = async () => {
setAppLoading(true);
const res = await axios.get('/api/auth/user/profile');
console.log("FETCH ACCOUNT RESPONSE:", res);
if (res && res.user && res.user.user) {
setAuth({
isAuthenticated: true,
user: res.user.user
})
}
setAppLoading(false);
}
fetchAccount();
}, [])
return (
  <div>
    {appLoading === true ? 
        <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        }}>
            <Spin />
            </div>
     : 
        <> 
        <Header />
        <Outlet />
        </>
    }

        
  </div>
  )
}
export default App;